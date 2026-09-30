(() => {
  const config = window.CW26_CONFIG || {};
  const scriptUrl = (config.SCRIPT_URL || "").trim();
  const form = document.querySelector("#surveyForm");
  const submitButton = document.querySelector("#submitButton");
  const statusEl = document.querySelector("#formStatus");
  const notice = document.querySelector("#connectionNotice");
  const thanks = document.querySelector("#thanks");
  let submitting = false;

  const setStatus = (message, type = "") => {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`.trim();
  };

  const isConfigured = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(scriptUrl);

  if (!isConfigured) {
    notice.style.display = "block";
    submitButton.disabled = true;
  }

  document.querySelectorAll(".photo-strip").forEach((strip) => {
    const track = strip.querySelector(".photo-grid");
    const prev = strip.querySelector(".strip-arrow.prev");
    const next = strip.querySelector(".strip-arrow.next");
    const updateArrows = () => {
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -track.clientWidth }));
    next.addEventListener("click", () => track.scrollBy({ left: track.clientWidth }));
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();
  });

  const getRadioValue = (data, name) => data.get(name) || "";

  const payloadFromForm = () => {
    const data = new FormData(form);
    return {
      name: (data.get("name") || "").trim(),
      fridayDeparture: getRadioValue(data, "fridayDeparture"),
      weekendEnergy: getRadioValue(data, "weekendEnergy"),
      rhythm: getRadioValue(data, "rhythm"),
      formatPreference: getRadioValue(data, "formatPreference"),
      formatChange: (data.get("formatChange") || "").trim(),
      activities: data.getAll("activities"),
      otherActivities: (data.get("otherActivities") || "").trim(),
      structure: getRadioValue(data, "structure"),
      vachanPreference: getRadioValue(data, "vachanPreference"),
      accessNeeds: (data.get("accessNeeds") || "").trim(),
      openIdeas: (data.get("openIdeas") || "").trim(),
      website: (data.get("website") || "").trim(),
      submittedAt: new Date().toISOString()
    };
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isConfigured) return;
    if (submitting) return;

    if (!form.reportValidity()) {
      setStatus("Please finish the required questions, then try again.", "error");
      return;
    }

    const payload = payloadFromForm();
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";
    setStatus("Saving your private response...");

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
        throw new Error("The server returned an unreadable response. Please retry.");
      }

      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Your response could not be saved. Please retry.");
      }

      setStatus("Saved. Thank you!", "success");
      form.style.display = "none";
      submitButton.style.display = "none";
      thanks.classList.add("visible");
      thanks.focus({ preventScroll: true });
      thanks.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "Retry private response";
      setStatus(`${error.message} Your answers are still on this page.`, "error");
    }
  });
})();
