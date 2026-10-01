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
    [...track.children].forEach((child) => {
      if (!child.matches("img, picture")) return;
      const photo = child.matches("img") ? child : child.querySelector("img");
      const button = document.createElement("button");
      button.className = "photo-item";
      button.type = "button";
      button.setAttribute("aria-label", photo.alt);
      child.replaceWith(button);
      button.append(child);
    });
    const items = [...track.querySelectorAll(".photo-item")];
    const photos = items.map((item) => item.querySelector("img"));
    const itemLeft = (item) => item.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    const snapToNearest = () => {
      const nearest = items.reduce((best, item) => {
        const distance = Math.abs(itemLeft(item) - track.scrollLeft);
        return distance < best.distance ? { item, distance } : best;
      }, { item: items[0], distance: Infinity }).item;
      if (nearest) track.scrollTo({ left: itemLeft(nearest), behavior: "smooth" });
    };
    const updateArrows = () => {
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      const index = items.findIndex((item) => itemLeft(item) >= track.scrollLeft - 4);
      const shown = index === -1 ? photos.length : index + 1;
      count.textContent = `${shown} / ${photos.length}`;
    };
    const step = () => (items[1] ? itemLeft(items[1]) - itemLeft(items[0]) : track.clientWidth);
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

    let drag = null;
    let suppressClick = false;
    track.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || photos.length < 2) return;
      const item = event.target.closest(".photo-item");
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, scrollLeft: track.scrollLeft, moved: false, cancelled: false, item };
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        drag.cancelled = true;
      }
      if (!drag.moved && !drag.cancelled && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        drag.moved = true;
        track.classList.add("dragging");
      }
      if (!drag.moved) return;
      event.preventDefault();
      track.scrollLeft = drag.scrollLeft - dx;
    });
    const endDrag = (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      if (Math.abs(track.scrollLeft - drag.scrollLeft) > 4) drag.moved = true;
      if (drag.moved) {
        suppressClick = true;
        snapToNearest();
        setTimeout(() => { suppressClick = false; }, 250);
      } else if (!drag.cancelled && drag.item) {
        const index = items.indexOf(drag.item);
        if (index !== -1) {
          suppressClick = true;
          openPhoto(photos, index);
          setTimeout(() => { suppressClick = false; }, 250);
        }
      }
      track.classList.remove("dragging");
      drag = null;
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("click", (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);

    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    photos.forEach((photo, index) => {
      const item = items[index];
      photo.addEventListener("dragstart", (event) => event.preventDefault());
      item.addEventListener("click", (event) => {
        if (!suppressClick && event.detail === 0) openPhoto(photos, index);
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
