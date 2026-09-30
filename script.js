(() => {
  const config = window.CW26_CONFIG || {};
  const scriptUrl = (config.SCRIPT_URL || "").trim();
  const form = document.querySelector("#surveyForm");
  const submitButton = document.querySelector("#submitButton");
  const statusEl = document.querySelector("#formStatus");
  const thanks = document.querySelector("#thanks");
  const progress = document.querySelector(".progress");
  const progressFill = document.querySelector("#progressFill");
  const progressText = document.querySelector("#progressText");
  let submitting = false;

  const setStatus = (message, type = "") => {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`.trim();
  };

  const isConfigured = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(scriptUrl);
  if (!isConfigured) submitButton.disabled = true;

  // Photo strips: arrows, counter, and a full-screen viewer.
  const lightbox = document.querySelector("#lightbox");
  const lbImg = lightbox.querySelector(".lb-img");
  const lbCount = lightbox.querySelector(".lb-count");
  let lbPhotos = [];
  let lbIndex = 0;

  const showPhoto = (index) => {
    lbIndex = (index + lbPhotos.length) % lbPhotos.length;
    const photo = lbPhotos[lbIndex];
    lbImg.src = photo.src;
    lbImg.alt = photo.alt;
    lbCount.textContent = `${lbIndex + 1} / ${lbPhotos.length}`;
  };

  const openPhoto = (photos, index) => {
    lbPhotos = photos;
    showPhoto(index);
    if (!lightbox.open) lightbox.showModal();
  };

  lightbox.querySelector(".lb-close").addEventListener("click", () => lightbox.close());
  lightbox.querySelector(".lb-prev").addEventListener("click", () => showPhoto(lbIndex - 1));
  lightbox.querySelector(".lb-next").addEventListener("click", () => showPhoto(lbIndex + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showPhoto(lbIndex - 1);
    if (event.key === "ArrowRight") showPhoto(lbIndex + 1);
  });

  document.querySelectorAll(".photo-strip").forEach((strip) => {
    const track = strip.querySelector(".photo-grid");
    const prev = strip.querySelector(".strip-arrow.prev");
    const next = strip.querySelector(".strip-arrow.next");
    const count = strip.querySelector(".strip-count");
    const photos = [...track.querySelectorAll("img")];
    const updateArrows = () => {
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      const index = photos.findIndex((photo) => photo.offsetLeft - track.offsetLeft >= track.scrollLeft - 4);
      const shown = index === -1 ? photos.length : index + 1;
      count.textContent = `${shown} / ${photos.length}`;
    };
    const step = () => (photos[1] ? photos[1].offsetLeft - photos[0].offsetLeft : track.clientWidth);
    prev.addEventListener("click", () => track.scrollBy({ left: -step() }));
    next.addEventListener("click", () => track.scrollBy({ left: step() }));
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    photos.forEach((photo, index) => {
      photo.tabIndex = 0;
      photo.setAttribute("role", "button");
      photo.addEventListener("click", () => openPhoto(photos, index));
      photo.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPhoto(photos, index); }
      });
    });
    updateArrows();
  });

  // Survey progress: how many of the required questions are answered.
  const requiredFields = ["name", "fridayDeparture", "weekendEnergy", "rhythm", "structure"];

  // Sliders start unanswered; they count once the person touches them.
  const touched = new Set();
  form.querySelectorAll(".slider").forEach((slider) => {
    const input = slider.querySelector("input");
    const out = slider.querySelector("output");
    const text = JSON.parse(slider.dataset.text);
    const mark = () => {
      touched.add(input.name);
      slider.classList.add("touched");
      out.textContent = text[Number(input.value) - 1];
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    input.addEventListener("input", (event) => { if (event.isTrusted) mark(); });
    input.addEventListener("pointerdown", () => setTimeout(mark, 0));
    input.addEventListener("keydown", (event) => { if (event.key.startsWith("Arrow") || event.key === "Home" || event.key === "End") setTimeout(mark, 0); });
  });

  const sliderValue = (field) => {
    const slider = form.querySelector(`input[name="${field}"]`).closest(".slider");
    return touched.has(field) ? JSON.parse(slider.dataset.labels)[Number(form.elements[field].value) - 1] : "";
  };

  const missingFields = () => {
    const data = new FormData(form);
    return requiredFields.filter((field) => {
      if (field === "name") return !(data.get("name") || "").trim();
      if (field === "weekendEnergy" || field === "structure") return !touched.has(field);
      return !data.get(field);
    });
  };

  const updateProgress = () => {
    const left = missingFields().length;
    const done = requiredFields.length - left;
    progressFill.style.width = `${(done / requiredFields.length) * 100}%`;
    progressText.textContent = left === 0 ? "All done!" : `${done} of ${requiredFields.length} done`;
    progress.classList.toggle("done", left === 0);
  };

  form.addEventListener("input", () => {
    updateProgress();
    const missing = missingFields();
    form.querySelectorAll(".q.missing").forEach((card) => {
      if (!missing.includes(card.dataset.q)) card.classList.remove("missing");
    });
    if (statusEl.classList.contains("error")) setStatus("");
  });
  updateProgress();

  const payloadFromForm = () => {
    const data = new FormData(form);
    const text = (key) => (data.get(key) || "").trim();
    return {
      name: text("name"),
      fridayDeparture: data.get("fridayDeparture") || "",
      weekendEnergy: sliderValue("weekendEnergy"),
      rhythm: data.get("rhythm") || "",
      activities: data.getAll("activities"),
      otherActivities: text("otherActivities"),
      structure: sliderValue("structure"),
      openIdeas: text("openIdeas"),
      website: text("website")
    };
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isConfigured || submitting) return;

    const missing = missingFields();
    if (missing.length) {
      form.querySelectorAll(".q.missing").forEach((card) => card.classList.remove("missing"));
      missing.forEach((field) => form.querySelector(`.q[data-q="${field}"]`).classList.add("missing"));
      form.querySelector(".q.missing").scrollIntoView({ behavior: "smooth", block: "center" });
      setStatus(missing.length === 1 ? "One more to go." : `${missing.length} more to go.`, "error");
      return;
    }

    const payload = payloadFromForm();
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    setStatus("");

    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        throw new Error("Something went wrong. Please try again.");
      }

      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Something went wrong. Please try again.");
      }

      form.hidden = true;
      progress.hidden = true;
      document.querySelector(".form-actions").hidden = true;
      thanks.classList.add("visible");
      thanks.focus({ preventScroll: true });
      thanks.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "Try again";
      setStatus(`${error.message} Your answers are still here.`, "error");
    }
  });
})();
