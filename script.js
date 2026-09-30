(() => {
  const config = window.CW26_CONFIG || {};
  const scriptUrl = (config.SCRIPT_URL || "").trim();
  const form = document.querySelector("#surveyForm");
  const submitButton = document.querySelector("#submitButton");
  const nextButton = document.querySelector("#nextButton");
  const backButton = document.querySelector("#backButton");
  const statusEl = document.querySelector("#formStatus");
  const thanks = document.querySelector("#thanks");
  const progress = document.querySelector(".progress");
  const progressFill = document.querySelector("#progressFill");
  const progressText = document.querySelector("#progressText");
  const card = document.querySelector(".form-card");
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
    lbImg.src = photo.currentSrc || photo.src;
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

  // Survey: one question at a time.
  const steps = [...form.querySelectorAll(".q")];
  const requiredFields = ["name", "fridayDeparture", "weekendEnergy", "rhythm", "formatPreference", "structure", "vachanPreference"];
  let current = 0;

  const isAnswered = (field) => {
    const data = new FormData(form);
    return field === "name" ? (data.get("name") || "").trim() !== "" : Boolean(data.get(field));
  };

  const stepAnswered = (step) => !requiredFields.includes(step.dataset.q) || isAnswered(step.dataset.q);

  const render = (focus = true) => {
    steps.forEach((step, index) => { step.hidden = index !== current; });
    const last = current === steps.length - 1;
    progressText.textContent = `Question ${current + 1} of ${steps.length}`;
    progressFill.style.width = `${((current + 1) / steps.length) * 100}%`;
    backButton.hidden = current === 0;
    nextButton.hidden = last;
    submitButton.hidden = !last;
    const optional = !requiredFields.includes(steps[current].dataset.q);
    nextButton.textContent = optional && !stepAnswered(steps[current]) ? "Skip" : "Next";
    nextButton.disabled = !stepAnswered(steps[current]);
    if (optional) nextButton.disabled = false;
    if (focus) {
      const target = steps[current].querySelector("legend, label");
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      const top = card.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goTo = (index) => {
    current = Math.max(0, Math.min(steps.length - 1, index));
    setStatus("");
    render();
  };

  nextButton.addEventListener("click", () => goTo(current + 1));
  backButton.addEventListener("click", () => goTo(current - 1));

  form.addEventListener("change", (event) => {
    render(false);
    const input = event.target;
    const step = steps[current];
    // A single tap on a choice moves on, unless the question also has a note box.
    if (input.type === "radio" && !step.querySelector("textarea") && current < steps.length - 1) {
      setTimeout(() => { if (steps[current] === step) goTo(current + 1); }, 280);
    }
  });
  form.addEventListener("input", () => { render(false); if (statusEl.classList.contains("error")) setStatus(""); });
  form.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.matches('input[type="text"]')) {
      event.preventDefault();
      if (!nextButton.hidden && !nextButton.disabled) goTo(current + 1);
    }
  });
  render(false);

  const payloadFromForm = () => {
    const data = new FormData(form);
    const text = (key) => (data.get(key) || "").trim();
    return {
      name: text("name"),
      fridayDeparture: data.get("fridayDeparture") || "",
      weekendEnergy: data.get("weekendEnergy") || "",
      rhythm: data.get("rhythm") || "",
      formatPreference: data.get("formatPreference") || "",
      formatChange: text("formatChange"),
      activities: data.getAll("activities"),
      otherActivities: text("otherActivities"),
      structure: data.get("structure") || "",
      vachanPreference: data.get("vachanPreference") || "",
      accessNeeds: text("accessNeeds"),
      openIdeas: text("openIdeas"),
      website: text("website")
    };
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isConfigured || submitting) return;

    const firstMissing = steps.findIndex((step) => !stepAnswered(step));
    if (firstMissing !== -1) {
      goTo(firstMissing);
      setStatus("Please answer this one first.", "error");
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
