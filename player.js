/**
 * player.js
 * State machine, keyboard navigation, and step rendering orchestration.
 * Depends on (load order): scenario-data.js → stages.js → player.js
 * Globals consumed: SCENARIOS (scenario-data.js), renderStage(), escapeHtml() (stages.js)
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Alizerin Labs — https://alizerinlabs.com
 */

// Player: state machine + keyboard + rendering wiring

const STATE = {
  view: "landing",  // "landing" | "player"
  scenarioId: null,
  stepIndex: 0,
  traceCleanup: null,
};

const $ = (id) => document.getElementById(id);

function show(viewName) {
  STATE.view = viewName;
  $("view-landing").style.display = viewName === "landing" ? "flex" : "none";
  $("view-player").style.display  = viewName === "player"  ? "flex" : "none";
}

function startScenario(id) {
  STATE.scenarioId = id;
  STATE.stepIndex = 0;
  const sc = SCENARIOS[id];
  $("scenario-title").textContent = sc.title;
  show("player");
  renderStep();
}

function goLanding() {
  cancelTrace();
  show("landing");
}

function cancelTrace() {
  if (STATE.traceCleanup) { try { STATE.traceCleanup(); } catch(e){} STATE.traceCleanup = null; }
}

function renderStep() {
  cancelTrace();
  const sc = SCENARIOS[STATE.scenarioId];
  const step = sc.steps[STATE.stepIndex];
  const total = sc.steps.length;

  // step counter + dots
  $("step-counter").textContent = `STEP ${STATE.stepIndex + 1} / ${total}`;
  const dots = $("dots");
  dots.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const d = document.createElement("div");
    d.className = "dot";
    if (i < STATE.stepIndex) d.classList.add("done");
    else if (i === STATE.stepIndex) d.classList.add("current");
    dots.appendChild(d);
  }

  // prev/next buttons
  $("btn-prev").disabled = STATE.stepIndex === 0;
  const nextBtn = $("btn-next");
  if (STATE.stepIndex === total - 1) {
    nextBtn.innerHTML = (step.finalLabel || "Finish ✓");
  } else {
    nextBtn.innerHTML = `Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>`;
  }

  // stages
  const left = $("stage-left");
  const right = $("stage-right");
  const leftInner = $("stage-left-inner");
  const rightInner = $("stage-right-inner");
  const stageWrap = $("stage-wrap");
  const captionArea = $("caption-area");

  left.classList.toggle("dim", !!step.dimLeft);
  right.classList.toggle("dim", !!step.dimRight);

  // Replace contents
  leftInner.innerHTML = "";
  rightInner.innerHTML = "";

  // Step 3 (index 2) is the reveal step in both scenarios — animate injection block
  const animInjection = STATE.stepIndex === 2;
  const leftNode  = renderStage(step.left,  { animateInjection: animInjection });
  const rightNode = renderStage(step.right, {
    animateInjection: animInjection,
    onCleanup: (fn) => { STATE.traceCleanup = fn; }
  });
  leftInner.appendChild(leftNode);
  rightInner.appendChild(rightNode);

  // Trigger step-in transition animation
  [leftInner, rightInner].forEach(inner => {
    inner.classList.remove("entering");
    void inner.offsetWidth; // force reflow — without this, removing+re-adding a class doesn't restart a CSS animation
    inner.classList.add("entering");
  });

  // caption vs callout (takeaway)
  if (step.kind === "takeaway" && step.callout) {
    stageWrap.classList.add("takeaway");
    captionArea.innerHTML = "";
    const callout = document.createElement("div");
    callout.className = "callout";
    callout.innerHTML = step.callout.paras
      .map(p => `<p><span class="lead">${escapeHtml(p.lead)}</span>${escapeHtml(p.body)}</p>`)
      .join("");
    captionArea.appendChild(callout);
    captionArea.style.minHeight = "auto";
    captionArea.style.padding = "24px 48px";
  } else {
    stageWrap.classList.remove("takeaway");
    captionArea.style.minHeight = "";
    captionArea.style.padding = "";
    captionArea.innerHTML = '<div class="caption"></div>';
    captionArea.querySelector(".caption").textContent = step.caption || "";
  }

  // "Two weeks later" divider (scenario 2 step 5)
  if (step.divider) {
    const existing = document.querySelector(".time-divider");
    if (existing) existing.remove();
    const div = document.createElement("div");
    div.className = "time-divider";
    div.innerHTML = `<div class="line"></div><div class="label">${escapeHtml(step.divider)}</div><div class="line"></div>`;
    div.style.opacity = "0";
    div.style.transform = "translateY(-50%) scale(0.96)";
    div.style.transition = "opacity 300ms var(--ease-out), transform 300ms var(--ease-out)";
    $("stages").style.position = "relative";
    $("stages").appendChild(div);
    requestAnimationFrame(() => {
      div.style.opacity = "1";
      div.style.transform = "translateY(-50%) scale(1)";
    });
    setTimeout(() => {
      div.style.opacity = "0";
      setTimeout(() => div.remove(), 320);
    }, 1400);
  }
}

// ---------- navigation ----------
function next() {
  const sc = SCENARIOS[STATE.scenarioId];
  if (!sc) return;
  const step = sc.steps[STATE.stepIndex];
  if (STATE.stepIndex === sc.steps.length - 1) {
    if (step.finalGoTo === "landing") goLanding();
    else if (step.finalGoTo) startScenario(step.finalGoTo);
    return;
  }
  STATE.stepIndex++;
  renderStep();
}
function prev() {
  if (STATE.stepIndex === 0) return;
  STATE.stepIndex--;
  renderStep();
}
function restart() {
  STATE.stepIndex = 0;
  renderStep();
}

// ---------- events ----------
document.querySelectorAll(".scenario-card").forEach(card => {
  card.addEventListener("click", () => startScenario(card.dataset.scenario));
});
$("btn-back-scenarios").addEventListener("click", goLanding);
$("btn-restart").addEventListener("click", restart);
$("btn-prev").addEventListener("click", prev);
$("btn-next").addEventListener("click", next);

document.addEventListener("keydown", (e) => {
  if (STATE.view !== "player") {
    if (e.key === "Escape") goLanding();
    return;
  }
  if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  else if (e.key === "r" || e.key === "R") { e.preventDefault(); restart(); }
  else if (e.key === "Escape") { e.preventDefault(); goLanding(); }
});

// persist position across reloads
const LS_KEY = "hijack-demo-state";
function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      view: STATE.view, scenarioId: STATE.scenarioId, stepIndex: STATE.stepIndex
    }));
  } catch (e) {}
}
const _origRender = renderStep;
renderStep = function() { _origRender.apply(this, arguments); persist(); };
const _origShow = show;
show = function(v) { _origShow(v); persist(); };

// rehydrate saved position
(function init() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (saved && saved.view === "player" && SCENARIOS[saved.scenarioId]) {
      STATE.scenarioId = saved.scenarioId;
      STATE.stepIndex = Math.min(saved.stepIndex || 0, SCENARIOS[saved.scenarioId].steps.length - 1);
      $("scenario-title").textContent = SCENARIOS[saved.scenarioId].title;
      show("player");
      renderStep();
      return;
    }
  } catch (e) {}
  show("landing");
})();
