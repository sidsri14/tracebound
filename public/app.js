const button = document.querySelector("#run-button");
const result = document.querySelector("#result");

button.addEventListener("click", async () => {
  button.disabled = true;
  button.textContent = "Investigating…";
  result.classList.add("hidden");
  try {
    const mode = document.querySelector("#live-mode").checked ? "live" : "sample";
    const response = await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message ?? "Investigation failed");
    render(body);
  } catch (error) {
    window.alert(error.message);
  } finally {
    button.disabled = false;
    button.innerHTML = "Investigate synthetic incident <span>→</span>";
  }
});

function render(run) {
  document.querySelector("#conclusion").textContent = run.conclusion;
  document.querySelector("#confidence").textContent = `${Math.round(run.confidence * 100)}%`;
  document.querySelector("#action").textContent = run.recommendedAction;
  document.querySelector("#hypotheses").innerHTML = run.assessments.map((item) => `
    <div class="hypothesis"><b>${escapeHtml(item.label)}</b><span>${Math.round(item.confidence * 100)}%</span><small>${item.supportingEvidenceIds.length} support · ${item.contradictingEvidenceIds.length} contradict</small></div>
  `).join("");
  document.querySelector("#trace").innerHTML = run.trace.map((item) => `
    <li data-step="${item.step}"><b>${escapeHtml(item.agent)}</b> — ${escapeHtml(item.action)} · ${item.evidenceIds.length} cited</li>
  `).join("");
  document.querySelector("#evidence").innerHTML = run.evidence.map((item) => `
    <div class="evidence-row"><code>${escapeHtml(item.id)}</code><div><p>${escapeHtml(item.summary)}</p><small>${escapeHtml(item.sourceKind)} · ${escapeHtml(item.sourceName)} · ${escapeHtml(item.locator)}</small></div></div>
  `).join("");
  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}
