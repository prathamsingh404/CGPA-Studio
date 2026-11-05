// BMU CGPA Studio - Core Reactive Application Controller

import { BMU_PROGRAMS, BMU_GRADE_SCALE, RELATIVE_PRESETS } from './curriculum.js';
import {
  computeGradeCutoffs,
  evaluateGrade,
  generateBellCurveData,
  calculateCohortStats
} from './relative-engine.js';
import {
  calculateSGPA,
  calculateUpdatedCGPA,
  calculateRequiredSGPA,
  solveEndSemMarks
} from './endsem-solver.js';
import { BMUAIAdvisor } from './ai-advisor.js';

// Application State
const STATE = {
  currentCGPA: 7.82,
  completedCredits: 42,
  targetCGPA: 8.50,
  programId: "cse",
  semester: 3,
  relativePreset: "moderate",
  isAbsolute: false,
  mean: 62,
  sd: 14,
  courses: [],
  cutoffs: [],
  activeTab: "courses",
  selectedInspectCourseIndex: 0,
  solverStrategy: "credit_priority",
  wizardStep: 1,
  modalWizardStep: 1,
  theme: "light",
  geminiApiKey: ""
};

const aiAdvisor = new BMUAIAdvisor();

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initCurriculumCourses();
  updateCutoffs();
  setupEventListeners();
  renderAll();
  initWizardStep(1);
  initModalWizardStep(1);
  renderBellCurve();
});

// Load state from localStorage if available
function loadSavedState() {
  try {
    const saved = localStorage.getItem("bmu_cgpa_studio_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.currentCGPA !== undefined) STATE.currentCGPA = Number(parsed.currentCGPA);
      if (parsed.completedCredits !== undefined) STATE.completedCredits = Number(parsed.completedCredits);
      if (parsed.targetCGPA !== undefined) STATE.targetCGPA = Number(parsed.targetCGPA);
      if (parsed.semester !== undefined) STATE.semester = Number(parsed.semester);
      if (parsed.programId !== undefined) STATE.programId = parsed.programId;
      if (parsed.relativePreset !== undefined) STATE.relativePreset = parsed.relativePreset;
      if (parsed.mean !== undefined) STATE.mean = Number(parsed.mean);
      if (parsed.sd !== undefined) STATE.sd = Number(parsed.sd);
      if (parsed.geminiApiKey) {
        STATE.geminiApiKey = parsed.geminiApiKey;
        aiAdvisor.setApiKey(parsed.geminiApiKey);
      }
    }
    const savedTheme = localStorage.getItem("bmu_theme") || "light";
    STATE.theme = savedTheme;
    document.documentElement.setAttribute("data-theme", savedTheme);
  } catch (e) {
    console.warn("Could not load state:", e);
  }
}

function saveState() {
  try {
    localStorage.setItem("bmu_cgpa_studio_state", JSON.stringify({
      currentCGPA: STATE.currentCGPA,
      completedCredits: STATE.completedCredits,
      targetCGPA: STATE.targetCGPA,
      programId: STATE.programId,
      semester: STATE.semester,
      relativePreset: STATE.relativePreset,
      mean: STATE.mean,
      sd: STATE.sd,
      geminiApiKey: STATE.geminiApiKey
    }));
  } catch (e) {
    console.warn("Could not save state:", e);
  }
}

// Initialize Curriculum Courses for current program & semester
function initCurriculumCourses() {
  const prog = BMU_PROGRAMS[STATE.programId] || BMU_PROGRAMS.cse;
  const semData = prog.semesters[STATE.semester] || prog.semesters[3] || prog.semesters[1];

  STATE.courses = semData.courses.map(c => {
    // Default reasonable sample internal marks (approx 70-80% of max internal)
    const defInternal = Math.round(c.maxInternal * 0.74);
    const defEndSem = Math.round(c.maxEndSem * 0.78);
    return {
      code: c.code,
      name: c.name,
      credits: c.credits,
      type: c.type,
      maxInternal: c.maxInternal,
      maxEndSem: c.maxEndSem,
      internalMarks: defInternal,
      endSemMarks: defEndSem,
      gradeObj: null
    };
  });
}

// Compute Cutoffs from current Mean and SD
function updateCutoffs() {
  STATE.cutoffs = computeGradeCutoffs(STATE.mean, STATE.sd, STATE.isAbsolute);
  // Re-evaluate grades for all courses
  STATE.courses.forEach(c => {
    const total = Number(c.internalMarks || 0) + Number(c.endSemMarks || 0);
    c.gradeObj = evaluateGrade(total, STATE.cutoffs);
  });
}

// Setup Event Listeners for inputs, controls, etc.
function setupEventListeners() {
  // Global config inputs
  const currentCGPAInput = document.getElementById("inputCurrentCGPA");
  const compCreditsInput = document.getElementById("inputCompletedCredits");
  const targetCGPAInput = document.getElementById("inputTargetCGPA");
  const programSemSelect = document.getElementById("selectProgramSemester");

  if (currentCGPAInput) {
    currentCGPAInput.value = STATE.currentCGPA;
    currentCGPAInput.addEventListener("input", (e) => {
      STATE.currentCGPA = Math.max(0, Math.min(10, parseFloat(e.target.value) || 0));
      saveState();
      renderAll();
    });
  }

  if (compCreditsInput) {
    compCreditsInput.value = STATE.completedCredits;
    compCreditsInput.addEventListener("input", (e) => {
      STATE.completedCredits = Math.max(0, parseInt(e.target.value) || 0);
      saveState();
      renderAll();
    });
  }

  if (targetCGPAInput) {
    targetCGPAInput.value = STATE.targetCGPA;
    targetCGPAInput.addEventListener("input", (e) => {
      STATE.targetCGPA = Math.max(0, Math.min(10, parseFloat(e.target.value) || 0));
      saveState();
      renderAll();
    });
  }

  if (programSemSelect) {
    programSemSelect.value = `${STATE.programId}-${STATE.semester}`;
    programSemSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "custom") {
        // Keep current courses as custom
        renderAll();
        return;
      }
      const [prog, sem] = val.split("-");
      STATE.programId = prog;
      STATE.semester = parseInt(sem);
      initCurriculumCourses();
      updateCutoffs();
      saveState();
      renderAll();
      renderBellCurve();
    });
  }

  // Curve Mean & SD sliders
  const curveMeanRange = document.getElementById("curveMeanRange");
  const curveMeanInput = document.getElementById("curveMeanInput");
  const curveSDRange = document.getElementById("curveSDRange");
  const curveSDInput = document.getElementById("curveSDInput");

  if (curveMeanRange && curveMeanInput) {
    curveMeanRange.value = STATE.mean;
    curveMeanInput.value = STATE.mean;

    const onMeanChange = (val) => {
      STATE.mean = Math.max(30, Math.min(95, parseFloat(val) || 60));
      curveMeanRange.value = STATE.mean;
      curveMeanInput.value = STATE.mean;
      STATE.relativePreset = "custom";
      updatePresetButtons();
      updateCutoffs();
      renderAll();
      renderBellCurve();
    };
    curveMeanRange.addEventListener("input", (e) => onMeanChange(e.target.value));
    curveMeanInput.addEventListener("input", (e) => onMeanChange(e.target.value));
  }

  if (curveSDRange && curveSDInput) {
    curveSDRange.value = STATE.sd;
    curveSDInput.value = STATE.sd;

    const onSDChange = (val) => {
      STATE.sd = Math.max(4, Math.min(30, parseFloat(val) || 14));
      curveSDRange.value = STATE.sd;
      curveSDInput.value = STATE.sd;
      STATE.relativePreset = "custom";
      updatePresetButtons();
      updateCutoffs();
      renderAll();
      renderBellCurve();
    };
    curveSDRange.addEventListener("input", (e) => onSDChange(e.target.value));
    curveSDInput.addEventListener("input", (e) => onSDChange(e.target.value));
  }

  // Theme toggle
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      STATE.theme = STATE.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", STATE.theme);
      localStorage.setItem("bmu_theme", STATE.theme);
      renderBellCurve();
    });
  }

  // Export Plan / Print
  const exportBtn = document.getElementById("exportPlanBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Open Wizard modal
  const openWizBtn = document.getElementById("openWizardBtn");
  if (openWizBtn) {
    openWizBtn.addEventListener("click", () => {
      openWizardModal();
    });
  }

  // Window resize re-render bell curve
  window.addEventListener("resize", () => {
    renderBellCurve();
  });
}

// Master Render Function
function renderAll() {
  updateCutoffs();
  renderKPIs();
  renderCoursesTable();
  renderCutoffsList();
  renderSolverTab();
  populateInspectDropdown();
  updateCurveInspection();
}

// Render Top KPI Cards
function renderKPIs() {
  const currentC = STATE.currentCGPA;
  const compCr = STATE.completedCredits;
  const targetC = STATE.targetCGPA;
  const totalSemCredits = STATE.courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

  const reqResult = calculateRequiredSGPA(currentC, compCr, targetC, totalSemCredits);
  const semSGPA = calculateSGPA(STATE.courses);
  const projCGPA = calculateUpdatedCGPA(currentC, compCr, semSGPA, totalSemCredits);
  const delta = targetC - currentC;

  // DOM Elements
  const elCurCGPA = document.getElementById("kpiCurrentCGPA");
  const elCompCrBadge = document.getElementById("kpiCompletedCreditsBadge");
  const elCompCrText = document.getElementById("kpiCompletedCreditsText");
  const elTargetCGPA = document.getElementById("kpiTargetCGPA");
  const elDelta = document.getElementById("kpiDeltaCGPA");
  const elReqSGPA = document.getElementById("kpiRequiredSGPA");
  const elFeasBadge = document.getElementById("kpiFeasibilityBadge");
  const elFeasDesc = document.getElementById("kpiFeasibilityDesc");
  const elProjCGPA = document.getElementById("kpiProjectedCGPA");
  const elCurSemSGPA = document.getElementById("kpiCurrentSemSGPA");
  const elPercentage = document.getElementById("kpiPercentage");
  const elDegreeProg = document.getElementById("kpiDegreeProgress");

  if (elCurCGPA) elCurCGPA.textContent = currentC.toFixed(2);
  if (elCompCrBadge) elCompCrBadge.textContent = `${compCr} Credits`;
  if (elCompCrText) elCompCrText.textContent = `${compCr} / 172 Credits`;
  if (elTargetCGPA) elTargetCGPA.textContent = targetC.toFixed(2);

  if (elDelta) {
    if (delta > 0) {
      elDelta.textContent = `+${delta.toFixed(2)} needed`;
      elDelta.style.color = "var(--accent-pink)";
    } else if (delta < 0) {
      elDelta.textContent = `${delta.toFixed(2)} (Safe)`;
      elDelta.style.color = "var(--accent-mint)";
    } else {
      elDelta.textContent = "Maintain current";
      elDelta.style.color = "var(--text-main)";
    }
  }

  if (elReqSGPA) elReqSGPA.textContent = reqResult.requiredSGPA.toFixed(2);

  if (elFeasBadge && elFeasDesc) {
    elFeasBadge.textContent = reqResult.feasibility;
    elFeasDesc.textContent = reqResult.statusMessage;

    elFeasBadge.className = "badge-tag";
    if (reqResult.feasibility === "ACHIEVABLE") {
      elFeasBadge.classList.add("badge-mint");
    } else if (reqResult.feasibility === "CHALLENGING") {
      elFeasBadge.classList.add("badge-yellow");
    } else if (reqResult.feasibility === "EXTREME") {
      elFeasBadge.classList.add("badge-pink");
    } else if (reqResult.feasibility === "GUARANTEED") {
      elFeasBadge.classList.add("badge-cyan");
    } else {
      elFeasBadge.classList.add("badge-red");
    }
  }

  if (elProjCGPA) elProjCGPA.textContent = projCGPA.toFixed(2);
  if (elCurSemSGPA) elCurSemSGPA.textContent = semSGPA.toFixed(2);

  // Percentage conversion as per BMU formula: Percentage = CGPA * 10
  if (elPercentage) elPercentage.textContent = `${(projCGPA * 10).toFixed(1)}%`;
  const degreeTotalCredits = 172;
  const progressPct = Math.min(100, Math.round(((compCr + totalSemCredits) / degreeTotalCredits) * 100));
  if (elDegreeProg) elDegreeProg.textContent = `${progressPct}%`;

  // Simulation displays in Tab 1
  const simSemSGPA = document.getElementById("simSemSGPADisplay");
  const simCGPA = document.getElementById("simCGPADisplay");
  const semCrBadge = document.getElementById("currentSemCreditsBadge");

  if (simSemSGPA) simSemSGPA.textContent = semSGPA.toFixed(2);
  if (simCGPA) simCGPA.textContent = projCGPA.toFixed(2);
  if (semCrBadge) semCrBadge.textContent = `${totalSemCredits} Credits Total`;
}

// Render Courses Table (Tab 1)
function renderCoursesTable() {
  const tbody = document.getElementById("coursesTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  STATE.courses.forEach((c, idx) => {
    const total = Number(c.internalMarks || 0) + Number(c.endSemMarks || 0);
    const grade = c.gradeObj || evaluateGrade(total, STATE.cutoffs);
    const gradeClass = getGradeBadgeClass(grade.grade);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <strong style="font-family: var(--font-mono); font-size: 0.85rem;">${c.code}</strong>
      </td>
      <td>
        <div style="font-weight: 700;">${c.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${c.type}</div>
      </td>
      <td>
        <span class="badge-tag badge-gray" style="font-size: 0.8rem; font-weight: 800;">${c.credits} Cr</span>
      </td>
      <td>
        <div class="slider-container">
          <input type="range" class="custom-range" min="0" max="${c.maxInternal}" value="${c.internalMarks}" 
            oninput="updateCourseInternal(${idx}, this.value)" />
          <span style="font-family: var(--font-mono); font-weight: 800; min-width: 38px; text-align: right;">${c.internalMarks}</span>
        </div>
      </td>
      <td>
        <div class="slider-container">
          <input type="range" class="custom-range" min="0" max="${c.maxEndSem}" value="${c.endSemMarks}" 
            oninput="updateCourseEndSem(${idx}, this.value)" />
          <span style="font-family: var(--font-mono); font-weight: 800; min-width: 38px; text-align: right;">${c.endSemMarks}</span>
        </div>
      </td>
      <td>
        <strong style="font-size: 1.05rem; font-family: var(--font-mono);">${total}</strong>
        <span style="font-size: 0.75rem; color: var(--text-muted);">/100</span>
      </td>
      <td>
        <span class="grade-pill ${gradeClass}">
          ${grade.grade}
        </span>
        <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted); margin-left: 0.25rem;">
          (${grade.points} pts)
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-icon" style="color: var(--accent-red); border-color: var(--border-color);" onclick="deleteCourse(${idx})" title="Delete Course">
          🗑️
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Helpers for inline course updates
window.updateCourseInternal = function(idx, val) {
  if (!STATE.courses[idx]) return;
  STATE.courses[idx].internalMarks = Math.min(STATE.courses[idx].maxInternal, Math.max(0, parseFloat(val) || 0));
  renderAll();
  renderBellCurve();
};

window.updateCourseEndSem = function(idx, val) {
  if (!STATE.courses[idx]) return;
  STATE.courses[idx].endSemMarks = Math.min(STATE.courses[idx].maxEndSem, Math.max(0, parseFloat(val) || 0));
  renderAll();
  renderBellCurve();
};

window.deleteCourse = function(idx) {
  if (STATE.courses.length <= 1) {
    alert("You must keep at least 1 course in the semester!");
    return;
  }
  STATE.courses.splice(idx, 1);
  renderAll();
  renderBellCurve();
};

window.addCustomSubject = function() {
  const code = prompt("Enter Course Code (e.g., CSE310):", `CSE${STATE.courses.length + 1}01`);
  if (!code) return;
  const name = prompt("Enter Course Name:", "Advanced Computing Elective");
  if (!name) return;
  const creditsStr = prompt("Enter Credits (1-8):", "4");
  const credits = Math.max(1, Math.min(12, parseInt(creditsStr) || 3));

  STATE.courses.push({
    code: code.toUpperCase().trim(),
    name: name.trim(),
    credits: credits,
    type: "Elective / Custom",
    maxInternal: 50,
    maxEndSem: 50,
    internalMarks: 36,
    endSemMarks: 38,
    gradeObj: null
  });

  renderAll();
  renderBellCurve();
};

window.resetToCurriculumDefault = function() {
  initCurriculumCourses();
  renderAll();
  renderBellCurve();
};

window.fillSampleScores = function() {
  STATE.courses.forEach(c => {
    c.internalMarks = Math.round(c.maxInternal * 0.88);
    c.endSemMarks = Math.round(c.maxEndSem * 0.86);
  });
  renderAll();
  renderBellCurve();
};

// Render Cutoff List Sidebar
function renderCutoffsList() {
  const container = document.getElementById("cutoffTableContainer");
  if (!container) return;

  container.innerHTML = "";
  STATE.cutoffs.forEach(item => {
    const gradeClass = getGradeBadgeClass(item.grade);
    const div = document.createElement("div");
    div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0; border-bottom: 1px solid var(--surface-alt); font-size: 0.85rem;";
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span class="grade-pill ${gradeClass}" style="min-width: 32px; font-size: 0.78rem; padding: 0.1rem 0.4rem;">${item.grade}</span>
        <strong>${item.points} pts</strong>
      </div>
      <div>
        <span style="font-family: var(--font-mono); font-weight: 700;">${item.displayRange}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// Preset button handlers
window.setRelativePreset = function(presetKey) {
  STATE.relativePreset = presetKey;
  if (presetKey === "absolute") {
    STATE.isAbsolute = true;
    const badge = document.getElementById("activeCurveModeBadge");
    if (badge) {
      badge.textContent = "Absolute Grading Scale (< 30 Students)";
      badge.className = "badge-tag badge-pink";
    }
  } else {
    STATE.isAbsolute = false;
    const p = RELATIVE_PRESETS[presetKey] || RELATIVE_PRESETS.moderate;
    STATE.mean = p.mean;
    STATE.sd = p.sd;
    const badge = document.getElementById("activeCurveModeBadge");
    if (badge) {
      badge.textContent = `${p.label}`;
      badge.className = "badge-tag badge-mint";
    }

    const meanRange = document.getElementById("curveMeanRange");
    const meanInput = document.getElementById("curveMeanInput");
    const sdRange = document.getElementById("curveSDRange");
    const sdInput = document.getElementById("curveSDInput");
    if (meanRange) meanRange.value = STATE.mean;
    if (meanInput) meanInput.value = STATE.mean;
    if (sdRange) sdRange.value = STATE.sd;
    if (sdInput) sdInput.value = STATE.sd;
  }

  updatePresetButtons();
  renderAll();
  renderBellCurve();
};

function updatePresetButtons() {
  document.querySelectorAll(".preset-btn").forEach(btn => {
    if (btn.getAttribute("data-preset") === STATE.relativePreset) {
      btn.classList.add("active", "btn-accent");
    } else {
      btn.classList.remove("active", "btn-accent");
    }
  });
}

// Inspection Dropdown
function populateInspectDropdown() {
  const select = document.getElementById("inspectCourseSelect");
  if (!select) return;

  const prevVal = select.value;
  select.innerHTML = "";

  STATE.courses.forEach((c, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = `${c.code}: ${c.name} (${c.credits} Cr)`;
    select.appendChild(opt);
  });

  if (prevVal !== "" && STATE.courses[prevVal]) {
    select.value = prevVal;
    STATE.selectedInspectCourseIndex = parseInt(prevVal);
  } else {
    select.value = 0;
    STATE.selectedInspectCourseIndex = 0;
  }
}

window.updateCurveInspection = function() {
  const select = document.getElementById("inspectCourseSelect");
  const details = document.getElementById("inspectedScoreDetails");
  if (!select || !details) return;

  const idx = parseInt(select.value) || 0;
  STATE.selectedInspectCourseIndex = idx;
  const c = STATE.courses[idx];
  if (!c) return;

  const total = Number(c.internalMarks || 0) + Number(c.endSemMarks || 0);
  const grade = c.gradeObj || evaluateGrade(total, STATE.cutoffs);
  const gradeClass = getGradeBadgeClass(grade.grade);

  let percentile = "50th";
  if (!STATE.isAbsolute && STATE.sd > 0) {
    const z = (total - STATE.mean) / STATE.sd;
    const p = Math.round(normalCDF(z) * 100);
    percentile = `${p}th Percentile`;
  }

  details.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
      <span>Total: <strong>${total}/100</strong> (${percentile})</span>
      <span class="grade-pill ${gradeClass}">${grade.grade} (${grade.points} pts)</span>
    </div>
  `;

  renderBellCurve();
};

function normalCDF(z) {
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2.0);
  const prob = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1.0 - prob : prob;
}

// Cohort Input Processors
window.processCohortInput = function() {
  const input = document.getElementById("cohortRawInput");
  if (!input || !input.value.trim()) {
    alert("Please enter or paste at least 5 student marks separated by commas or spaces!");
    return;
  }

  const raw = input.value.split(/[\s,]+/);
  const stats = calculateCohortStats(raw);

  if (stats.count < 3) {
    alert("Please enter at least 3 valid numeric scores between 0 and 100.");
    return;
  }

  STATE.mean = stats.mean;
  STATE.sd = stats.sd;
  STATE.relativePreset = "custom";

  const meanRange = document.getElementById("curveMeanRange");
  const meanInput = document.getElementById("curveMeanInput");
  const sdRange = document.getElementById("curveSDRange");
  const sdInput = document.getElementById("curveSDInput");
  if (meanRange) meanRange.value = stats.mean;
  if (meanInput) meanInput.value = stats.mean;
  if (sdRange) sdRange.value = stats.sd;
  if (sdInput) sdInput.value = stats.sd;

  updatePresetButtons();
  renderAll();
  renderBellCurve();

  alert(`Cohort Processed! N = ${stats.count} students.\nComputed Mean: ${stats.mean}\nComputed Std Dev: ${stats.sd}\nMedian: ${stats.median} | Range: ${stats.min} - ${stats.max}`);
};

window.generateSimulatedCohort = function() {
  // Generate 60 realistic normal random scores centered at ~64 with SD ~13
  const marks = [];
  for (let i = 0; i < 60; i++) {
    // Box-Muller transform
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const score = Math.min(99, Math.max(28, Math.round(63 + z * 13.5)));
    marks.push(score);
  }
  const input = document.getElementById("cohortRawInput");
  if (input) {
    input.value = marks.join(", ");
    processCohortInput();
  }
};

// Render Gaussian Bell Curve on Canvas
function renderBellCurve() {
  const canvas = document.getElementById("bellCurveCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 340;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const isDark = STATE.theme === "dark";
  const textColor = isDark ? "#f4f4f5" : "#0a0a0a";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(10,10,10,0.07)";

  ctx.clearRect(0, 0, width, height);

  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 45;
  const graphW = width - paddingLeft - paddingRight;
  const graphH = height - paddingTop - paddingBottom;

  const mean = STATE.mean;
  const sd = STATE.sd;

  // Domain x: 0 to 100
  const minX = 0;
  const maxX = 100;

  function toScreenX(x) {
    return paddingLeft + ((x - minX) / (maxX - minX)) * graphW;
  }

  // Peak of normal PDF at mean
  const peakY = 1 / (sd * Math.sqrt(2 * Math.PI));
  function toScreenY(pdfVal) {
    return paddingTop + graphH - (pdfVal / (peakY * 1.15)) * graphH;
  }

  // Draw background grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let x = 10; x <= 90; x += 10) {
    const sx = toScreenX(x);
    ctx.beginPath();
    ctx.moveTo(sx, paddingTop);
    ctx.lineTo(sx, paddingTop + graphH);
    ctx.stroke();

    ctx.fillStyle = isDark ? "#a1a1aa" : "#71717a";
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${x}`, sx, paddingTop + graphH + 16);
  }

  // Color shaded regions for each Grade Cutoff
  const gradeColors = {
    "A+": "rgba(0, 229, 153, 0.45)",
    "A":  "rgba(56, 189, 248, 0.40)",
    "B+": "rgba(129, 140, 248, 0.35)",
    "B":  "rgba(255, 230, 0, 0.45)",
    "C+": "rgba(251, 146, 60, 0.35)",
    "C":  "rgba(248, 113, 113, 0.35)",
    "D":  "rgba(203, 213, 225, 0.45)",
    "F":  "rgba(255, 51, 75, 0.35)"
  };

  // Draw grade zones from cutoffs
  for (const c of STATE.cutoffs) {
    const startX = Math.max(0, c.minMarks);
    const endX = Math.min(100, c.maxMarks + 0.99);

    if (startX >= endX) continue;

    ctx.beginPath();
    ctx.fillStyle = gradeColors[c.grade] || "rgba(100,100,100,0.2)";

    const step = 0.5;
    let first = true;
    for (let x = startX; x <= endX; x += step) {
      const sx = toScreenX(x);
      const pdf = 1 / (sd * Math.sqrt(2 * Math.PI)) * Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(sd, 2)));
      const sy = toScreenY(pdf);

      if (first) {
        ctx.moveTo(sx, paddingTop + graphH);
        ctx.lineTo(sx, sy);
        first = false;
      } else {
        ctx.lineTo(sx, sy);
      }
    }

    const endScreenX = toScreenX(endX);
    ctx.lineTo(endScreenX, paddingTop + graphH);
    ctx.closePath();
    ctx.fill();

    // Dotted vertical divider line
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(toScreenX(startX), paddingTop + 10);
    ctx.lineTo(toScreenX(startX), paddingTop + graphH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Grade label above region
    const midX = (startX + endX) / 2;
    if (midX >= 5 && midX <= 95) {
      ctx.fillStyle = textColor;
      ctx.font = "bold 11px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(c.grade, toScreenX(midX), paddingTop + 18);
    }
  }

  // Draw main Gaussian Curve stroke
  ctx.beginPath();
  ctx.strokeStyle = isDark ? "#ffffff" : "#0a0a0a";
  ctx.lineWidth = 2.5;

  let firstPoint = true;
  for (let x = minX; x <= maxX; x += 0.5) {
    const sx = toScreenX(x);
    const pdf = 1 / (sd * Math.sqrt(2 * Math.PI)) * Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(sd, 2)));
    const sy = toScreenY(pdf);

    if (firstPoint) {
      ctx.moveTo(sx, sy);
      firstPoint = false;
    } else {
      ctx.lineTo(sx, sy);
    }
  }
  ctx.stroke();

  // Baseline axis
  ctx.strokeStyle = isDark ? "#ffffff" : "#0a0a0a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop + graphH);
  ctx.lineTo(paddingLeft + graphW, paddingTop + graphH);
  ctx.stroke();

  // Draw Mean line (mu)
  const meanScreenX = toScreenX(mean);
  ctx.strokeStyle = isDark ? "#ffe600" : "#d97706";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(meanScreenX, paddingTop);
  ctx.lineTo(meanScreenX, paddingTop + graphH);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = isDark ? "#ffe600" : "#b45309";
  ctx.font = "bold 10px JetBrains Mono, monospace";
  ctx.textAlign = "center";
  ctx.fillText(`μ = ${mean}`, meanScreenX, paddingTop + 8);

  // Draw Current Inspected Course Pointer
  const inspectedCourse = STATE.courses[STATE.selectedInspectCourseIndex];
  if (inspectedCourse) {
    const studentScore = Number(inspectedCourse.internalMarks || 0) + Number(inspectedCourse.endSemMarks || 0);
    const studentScreenX = toScreenX(studentScore);
    const pdfAtScore = 1 / (sd * Math.sqrt(2 * Math.PI)) * Math.exp(-Math.pow(studentScore - mean, 2) / (2 * Math.pow(sd, 2)));
    const studentScreenY = toScreenY(pdfAtScore);

    // Indicator Line
    ctx.strokeStyle = "#ff5ca8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(studentScreenX, studentScreenY - 25);
    ctx.lineTo(studentScreenX, paddingTop + graphH);
    ctx.stroke();

    // Pin Head
    ctx.fillStyle = "#ff5ca8";
    ctx.beginPath();
    ctx.arc(studentScreenX, studentScreenY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Callout Box
    const calloutText = `${inspectedCourse.code}: ${studentScore}/100`;
    ctx.font = "bold 11px JetBrains Mono, monospace";
    const textW = ctx.measureText(calloutText).width + 16;
    const boxX = Math.min(width - textW - 10, Math.max(10, studentScreenX - textW / 2));
    const boxY = Math.max(paddingTop + 5, studentScreenY - 36);

    ctx.fillStyle = "#ff5ca8";
    ctx.fillRect(boxX, boxY, textW, 22);
    ctx.strokeStyle = isDark ? "#ffffff" : "#000000";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, textW, 22);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(calloutText, boxX + 8, boxY + 15);
  }
}

// Render Reverse Solver Tab (Tab 3)
function renderSolverTab() {
  const targetC = STATE.targetCGPA;
  const currentC = STATE.currentCGPA;
  const compCr = STATE.completedCredits;
  const strategy = document.getElementById("solverStrategySelect")?.value || STATE.solverStrategy;

  const targetText = document.getElementById("solverTargetCGPAText");
  if (targetText) targetText.textContent = targetC.toFixed(2);

  const result = solveEndSemMarks({
    currentCGPA: currentC,
    completedCredits: compCr,
    targetCGPA: targetC,
    courses: STATE.courses,
    cutoffs: STATE.cutoffs,
    strategy: strategy
  });

  // Render Alert Box
  const alertBox = document.getElementById("solverAlertBox");
  if (alertBox) {
    let alertHtml = "";
    if (result.feasibility === "IMPOSSIBLE_THIS_SEM") {
      alertHtml = `
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <span style="font-size: 1.5rem;">⚠️</span>
          <div>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--accent-red); margin-bottom: 0.25rem;">
              Mathematically Unreachable This Semester
            </h4>
            <p style="font-size: 0.88rem; line-height: 1.5;">
              To hit <strong>${targetC.toFixed(2)} CGPA</strong> right now requires an SGPA of <strong>${result.requiredSGPA.toFixed(2)}</strong> (higher than BMU's maximum possible 10.00).<br>
              With straight <strong>A+ (10.0 SGPA)</strong> in all current courses, your highest possible CGPA this semester is <strong>${result.maxAttainableCGPA.toFixed(2)}</strong>.<br>
              <em>Strategy: Target 9.5+ SGPA this term to build your launchpad for next semester!</em>
            </p>
          </div>
        </div>
      `;
    } else {
      const isExtreme = result.feasibility === "EXTREME";
      const isChallenging = result.feasibility === "CHALLENGING";
      const badgeColor = isExtreme ? "badge-pink" : (isChallenging ? "badge-yellow" : "badge-mint");

      alertHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span class="badge-tag ${badgeColor}" style="margin-bottom: 0.35rem;">${result.feasibility}</span>
            <div style="font-size: 1.25rem; font-weight: 800;">
              You need a Semester SGPA of <span class="highlight-pink" style="font-size: 1.5rem;">${result.requiredSGPA.toFixed(2)}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
              ${result.statusMessage}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted);">Semester Load</div>
            <div style="font-size: 1.3rem; font-weight: 800;">${result.totalSemCredits} Credits</div>
          </div>
        </div>
      `;
    }
    alertBox.innerHTML = alertHtml;
  }

  // Render Table of Solved Courses
  const tbody = document.getElementById("solverTableBody");
  if (tbody) {
    tbody.innerHTML = "";
    result.subjectPlans.forEach(s => {
      const gradeClass = getGradeBadgeClass(s.targetGrade);
      const riskClass = getRiskBadgeClass(s.riskLevel);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight: 800;">${s.name}</div>
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${s.code} • ${s.type}</div>
        </td>
        <td>
          <span class="badge-tag badge-gray" style="font-weight: 800;">${s.credits} Cr</span>
        </td>
        <td>
          <strong style="font-family: var(--font-mono);">${s.internal}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">/${s.maxInternal}</span>
        </td>
        <td>
          <span class="grade-pill ${gradeClass}">${s.targetGrade}</span>
        </td>
        <td>
          <strong style="font-family: var(--font-mono);">${s.targetGP} pts</strong>
        </td>
        <td>
          <div style="font-size: 1.15rem; font-weight: 900; font-family: var(--font-mono);" class="${s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL' ? 'highlight-pink' : ''}">
            ${s.requiredEndSem} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">/${s.maxEndSem}</span>
          </div>
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-weight: 700; color: ${s.safetyBuffer >= 5 ? 'var(--accent-mint)' : 'var(--text-muted)'};">
            +${s.safetyBuffer} pts
          </span>
        </td>
        <td>
          <span class="badge-tag ${riskClass}" style="font-size: 0.7rem; padding: 0.2rem 0.45rem;">${s.riskLevel}</span>
        </td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">
          ${s.note || 'Consistent revision recommended.'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Render Recommendations List
  const recList = document.getElementById("solverRecommendationsList");
  if (recList) {
    const analysis = aiAdvisor.generateComprehensiveAnalysis({
      currentCGPA: currentC,
      completedCredits: compCr,
      targetCGPA: targetC,
      semester: STATE.semester,
      courses: STATE.courses,
      cutoffs: STATE.cutoffs,
      presetId: STATE.relativePreset
    });

    recList.innerHTML = analysis.recommendations.map(r => `<li>${formatMarkdown(r)}</li>`).join("");

    const aiSummary = document.getElementById("aiSummaryBox");
    if (aiSummary) {
      aiSummary.innerHTML = `
        <div style="margin-bottom: 0.75rem;">${formatMarkdown(analysis.assessmentSummary)}</div>
        <div style="font-size: 0.88rem; line-height: 1.6;">${analysis.recommendations.map(r => `• ${formatMarkdown(r)}<br>`).join('')}</div>
      `;
    }
  }
}

window.recalculateSolver = function() {
  const sel = document.getElementById("solverStrategySelect");
  if (sel) {
    STATE.solverStrategy = sel.value;
  }
  renderSolverTab();
};

// Wizard Flow Controller (Matches the screenshot prompt!)
function initWizardStep(step) {
  STATE.wizardStep = step;
  updateWizardDots("wizardIndicators", step);

  const container = document.getElementById("wizardStepContent");
  if (!container) return;

  if (step === 1) {
    container.innerHTML = `
      <div class="badge-tag badge-yellow" style="margin-bottom: 0.75rem;">Step 1 of 5 • Current Status</div>
      <h3 class="wizard-question-title">What is your current CGPA and credits completed so far?</h3>
      <p class="wizard-question-desc">We use these to calculate exact mathematical leverage for this semester.</p>
      
      <div class="form-row">
        <div>
          <label class="input-label">Current CGPA (0.00 - 10.00)</label>
          <input type="number" id="wizCurrentCGPA" class="input-field" step="0.01" min="0" max="10" value="${STATE.currentCGPA}" />
        </div>
        <div>
          <label class="input-label">Total Credits Earned So Far</label>
          <input type="number" id="wizCompletedCredits" class="input-field" step="1" min="0" max="172" value="${STATE.completedCredits}" />
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
        <button class="btn btn-primary" onclick="nextWizardStep(2)">Next: Set Target CGPA &rarr;</button>
      </div>
    `;
  } else if (step === 2) {
    container.innerHTML = `
      <div class="badge-tag badge-pink" style="margin-bottom: 0.75rem;">Step 2 of 5 • Ambition Goal</div>
      <h3 class="wizard-question-title">What is your Target CGPA goal after this semester?</h3>
      <p class="wizard-question-desc">Where do you want your cumulative standing to be when results release?</p>
      
      <div style="max-width: 320px; margin-bottom: 1rem;">
        <label class="input-label">Desired Target CGPA</label>
        <input type="number" id="wizTargetCGPA" class="input-field" step="0.01" min="0" max="10" value="${STATE.targetCGPA}" />
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
        <button class="btn" onclick="nextWizardStep(1)">&larr; Back</button>
        <button class="btn btn-primary" onclick="nextWizardStep(3)">Next: Select Semester Courses &rarr;</button>
      </div>
    `;
  } else if (step === 3) {
    container.innerHTML = `
      <div class="badge-tag badge-mint" style="margin-bottom: 0.75rem;">Step 3 of 5 • Semester Curriculum</div>
      <h3 class="wizard-question-title">Confirm this semester's subjects and credit distribution</h3>
      <p class="wizard-question-desc">Preloaded from BMU B.Tech CSE official curriculum. You can verify or edit.</p>
      
      <div style="max-height: 220px; overflow-y: auto; border: 2px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 1rem; padding: 0.5rem 0.75rem; background: var(--surface-alt);">
        ${STATE.courses.map(c => `
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">
            <span><strong>${c.code}</strong>: ${c.name}</span>
            <span class="badge-tag badge-gray">${c.credits} Credits</span>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
        <button class="btn" onclick="nextWizardStep(2)">&larr; Back</button>
        <button class="btn btn-primary" onclick="nextWizardStep(4)">Next: Enter Internal Marks &rarr;</button>
      </div>
    `;
  } else if (step === 4) {
    container.innerHTML = `
      <div class="badge-tag badge-cyan" style="margin-bottom: 0.75rem;">Step 4 of 5 • Internal Assessment</div>
      <h3 class="wizard-question-title">Enter your internal marks scored in each subject (out of 50)</h3>
      <p class="wizard-question-desc">Your continuous evaluation / quiz / mid-sem marks so far.</p>
      
      <div style="max-height: 260px; overflow-y: auto; padding-right: 0.5rem; margin-bottom: 1rem;">
        ${STATE.courses.map((c, i) => `
          <div style="margin-bottom: 0.75rem; padding: 0.5rem; border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); background: var(--surface);">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">
              <span>${c.code} • ${c.name} (${c.credits} Cr)</span>
              <span>${c.internalMarks} / ${c.maxInternal}</span>
            </div>
            <input type="range" class="custom-range" min="0" max="${c.maxInternal}" value="${c.internalMarks}" 
              oninput="STATE.courses[${i}].internalMarks = Number(this.value); this.previousElementSibling.lastElementChild.textContent = this.value + ' / ' + ${c.maxInternal};" />
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
        <button class="btn" onclick="nextWizardStep(3)">&larr; Back</button>
        <button class="btn btn-primary" onclick="nextWizardStep(5)">Next: University Grading Calibration &rarr;</button>
      </div>
    `;
  } else if (step === 5) {
    container.innerHTML = `
      <div class="badge-tag badge-yellow" style="margin-bottom: 0.75rem;">Step 5 of 5 • Grading Moderation</div>
      <h3 class="wizard-question-title">Calibrate BMU Relative Grading Scale</h3>
      <p class="wizard-question-desc">How difficult do you anticipate the end-sem papers will be for your section?</p>
      
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
        <button class="btn btn-sm ${STATE.relativePreset === 'moderate' ? 'btn-accent' : ''}" onclick="setRelativePreset('moderate'); initWizardStep(5);">
          Moderate (Class Mean ~62)
        </button>
        <button class="btn btn-sm ${STATE.relativePreset === 'tough' ? 'btn-accent' : ''}" onclick="setRelativePreset('tough'); initWizardStep(5);">
          Tough (Class Mean ~48)
        </button>
        <button class="btn btn-sm ${STATE.relativePreset === 'easy' ? 'btn-accent' : ''}" onclick="setRelativePreset('easy'); initWizardStep(5);">
          Easy / High Scoring (~75)
        </button>
      </div>

      <div style="padding: 1rem; border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--surface-alt); margin-bottom: 1.5rem;">
        <div style="font-size: 0.85rem; font-weight: 700;">BMU 10-Point Scale Active:</div>
        <div style="font-size: 0.78rem; font-family: var(--font-mono); margin-top: 0.25rem; color: var(--text-muted);">
          A+ (10 pts) &ge; ${STATE.cutoffs.find(c => c.grade === 'A+')?.minMarks || 83} | 
          A (9 pts) &ge; ${STATE.cutoffs.find(c => c.grade === 'A')?.minMarks || 76} | 
          B+ (8 pts) &ge; ${STATE.cutoffs.find(c => c.grade === 'B+')?.minMarks || 69} | 
          B (7 pts) &ge; ${STATE.cutoffs.find(c => c.grade === 'B')?.minMarks || 59}
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
        <button class="btn" onclick="nextWizardStep(4)">&larr; Back</button>
        <button class="btn btn-primary" onclick="finishWizard()">
          🚀 Generate My End-Sem Victory Plan &rarr;
        </button>
      </div>
    `;
  }
}

window.nextWizardStep = function(step) {
  // Read inputs from previous step
  if (STATE.wizardStep === 1) {
    const cgpa = parseFloat(document.getElementById("wizCurrentCGPA")?.value);
    const cr = parseInt(document.getElementById("wizCompletedCredits")?.value);
    if (!isNaN(cgpa)) STATE.currentCGPA = cgpa;
    if (!isNaN(cr)) STATE.completedCredits = cr;
    const curInp = document.getElementById("inputCurrentCGPA");
    const crInp = document.getElementById("inputCompletedCredits");
    if (curInp) curInp.value = STATE.currentCGPA;
    if (crInp) crInp.value = STATE.completedCredits;
  } else if (STATE.wizardStep === 2) {
    const t = parseFloat(document.getElementById("wizTargetCGPA")?.value);
    if (!isNaN(t)) STATE.targetCGPA = t;
    const tInp = document.getElementById("inputTargetCGPA");
    if (tInp) tInp.value = STATE.targetCGPA;
  }

  saveState();
  renderAll();
  initWizardStep(step);
};

window.finishWizard = function() {
  saveState();
  renderAll();
  renderBellCurve();
  switchTab("solver");
  alert("🎉 Your personalized BMU End-Sem marks plan has been generated and optimized!");
};

// Modal Wizard Flow
function initModalWizardStep(step) {
  STATE.modalWizardStep = step;
  updateWizardDots("modalWizardIndicators", step);

  const container = document.getElementById("modalStepContent");
  if (!container) return;

  if (step === 1) {
    container.innerHTML = `
      <div class="badge-tag badge-yellow" style="margin-bottom: 0.75rem;">Question 1 of 5</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">What is your current CGPA and credits so far?</h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem;">Let's establish your cumulative baseline at BMU.</p>
      
      <div class="form-row">
        <div>
          <label class="input-label">Current CGPA</label>
          <input type="number" id="mWizCurCGPA" class="input-field" step="0.01" value="${STATE.currentCGPA}" />
        </div>
        <div>
          <label class="input-label">Completed Credits</label>
          <input type="number" id="mWizCompCr" class="input-field" step="1" value="${STATE.completedCredits}" />
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
        <button class="btn btn-primary" onclick="nextModalStep(2)">Next &rarr;</button>
      </div>
    `;
  } else if (step === 2) {
    container.innerHTML = `
      <div class="badge-tag badge-pink" style="margin-bottom: 0.75rem;">Question 2 of 5</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">What is your target CGPA after this semester?</h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem;">Target for placements, scholarships, or academic honors.</p>
      
      <div>
        <label class="input-label">Target CGPA</label>
        <input type="number" id="mWizTargetCGPA" class="input-field" step="0.01" value="${STATE.targetCGPA}" style="max-width: 250px;" />
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
        <button class="btn" onclick="nextModalStep(1)">&larr; Back</button>
        <button class="btn btn-primary" onclick="nextModalStep(3)">Next &rarr;</button>
      </div>
    `;
  } else if (step === 3) {
    container.innerHTML = `
      <div class="badge-tag badge-mint" style="margin-bottom: 0.75rem;">Question 3 of 5</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">Confirm this semester's courses and credits</h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem;">Selected: BMU CSE Semester ${STATE.semester}.</p>
      
      <div style="max-height: 220px; overflow-y: auto; padding: 0.5rem; background: var(--surface-alt); border: 2px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 1rem;">
        ${STATE.courses.map(c => `
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.35rem 0; border-bottom: 1px solid var(--border-color);">
            <span><strong>${c.code}</strong>: ${c.name}</span>
            <span class="badge-tag badge-gray">${c.credits} Cr</span>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
        <button class="btn" onclick="nextModalStep(2)">&larr; Back</button>
        <button class="btn btn-primary" onclick="nextModalStep(4)">Next &rarr;</button>
      </div>
    `;
  } else if (step === 4) {
    container.innerHTML = `
      <div class="badge-tag badge-cyan" style="margin-bottom: 0.75rem;">Question 4 of 5</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">What are your internal marks in each course?</h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem;">Continuous internal assessment marks (out of 50).</p>
      
      <div style="max-height: 240px; overflow-y: auto; padding-right: 0.5rem; margin-bottom: 1rem;">
        ${STATE.courses.map((c, i) => `
          <div style="margin-bottom: 0.65rem; padding: 0.5rem; border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); background: var(--surface);">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">
              <span>${c.code} • ${c.name}</span>
              <span>${c.internalMarks} / ${c.maxInternal}</span>
            </div>
            <input type="range" class="custom-range" min="0" max="${c.maxInternal}" value="${c.internalMarks}" 
              oninput="STATE.courses[${i}].internalMarks = Number(this.value); this.previousElementSibling.lastElementChild.textContent = this.value + ' / ' + ${c.maxInternal};" />
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
        <button class="btn" onclick="nextModalStep(3)">&larr; Back</button>
        <button class="btn btn-primary" onclick="nextModalStep(5)">Next &rarr;</button>
      </div>
    `;
  } else if (step === 5) {
    container.innerHTML = `
      <div class="badge-tag badge-yellow" style="margin-bottom: 0.75rem;">Question 5 of 5</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">Confirm BMU Relative Grading Scale</h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem;">Grade-to-Point mapping and class difficulty parameters.</p>
      
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <button class="btn btn-sm ${STATE.relativePreset === 'moderate' ? 'btn-accent' : ''}" onclick="setRelativePreset('moderate'); initModalWizardStep(5);">
          Moderate Paper
        </button>
        <button class="btn btn-sm ${STATE.relativePreset === 'tough' ? 'btn-accent' : ''}" onclick="setRelativePreset('tough'); initModalWizardStep(5);">
          Tough Paper
        </button>
      </div>

      <div style="padding: 0.85rem; border: 2px solid var(--border-color); border-radius: var(--radius-sm); background: var(--surface-alt); font-size: 0.82rem; margin-bottom: 1.5rem;">
        BMU Grade Points: A+ (10), A (9), B+ (8), B (7), C+ (6), C (5), D (4 Pass), F (0 Fail).
      </div>

      <div style="display: flex; justify-content: space-between;">
        <button class="btn" onclick="nextModalStep(4)">&larr; Back</button>
        <button class="btn btn-primary" onclick="closeWizardModal(); finishWizard();">
          🎯 Reveal Minimum Grades &amp; Marks Needed
        </button>
      </div>
    `;
  }
}

window.nextModalStep = function(step) {
  if (STATE.modalWizardStep === 1) {
    const cg = parseFloat(document.getElementById("mWizCurCGPA")?.value);
    const cr = parseInt(document.getElementById("mWizCompCr")?.value);
    if (!isNaN(cg)) STATE.currentCGPA = cg;
    if (!isNaN(cr)) STATE.completedCredits = cr;
    const curInp = document.getElementById("inputCurrentCGPA");
    const crInp = document.getElementById("inputCompletedCredits");
    if (curInp) curInp.value = STATE.currentCGPA;
    if (crInp) crInp.value = STATE.completedCredits;
  } else if (STATE.modalWizardStep === 2) {
    const t = parseFloat(document.getElementById("mWizTargetCGPA")?.value);
    if (!isNaN(t)) STATE.targetCGPA = t;
    const tInp = document.getElementById("inputTargetCGPA");
    if (tInp) tInp.value = STATE.targetCGPA;
  }

  saveState();
  renderAll();
  initModalWizardStep(step);
};

window.openWizardModal = function() {
  const modal = document.getElementById("wizardModal");
  if (modal) {
    modal.classList.add("open");
    initModalWizardStep(1);
  }
};

window.closeWizardModal = function() {
  const modal = document.getElementById("wizardModal");
  if (modal) modal.classList.remove("open");
};

function updateWizardDots(containerId, activeStep) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const dots = container.querySelectorAll(".step-dot");
  dots.forEach((dot, idx) => {
    const stepNum = idx + 1;
    dot.className = "step-dot";
    if (stepNum < activeStep) {
      dot.classList.add("completed");
    } else if (stepNum === activeStep) {
      dot.classList.add("active");
    }
  });
}

// Tab Switching
window.switchTab = function(tabKey) {
  STATE.activeTab = tabKey;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    if (btn.getAttribute("data-tab") === tabKey) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.querySelectorAll(".tab-content").forEach(content => {
    if (content.id === `tab-${tabKey}`) {
      content.style.display = "block";
      content.classList.add("active");
    } else {
      content.style.display = "none";
      content.classList.remove("active");
    }
  });

  if (tabKey === "curve") {
    setTimeout(renderBellCurve, 30);
  } else if (tabKey === "solver") {
    renderSolverTab();
  }
};

// Conversational Chatbot
window.handleChatSubmit = async function(e) {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;

  const query = input.value.trim();
  input.value = "";

  appendChatMessage("user", query);

  const loadingBubble = appendChatMessage("ai", "<em>Consulting BMU Academic Engine...</em>");

  try {
    const reply = await aiAdvisor.askAdvisor(query, {
      currentCGPA: STATE.currentCGPA,
      completedCredits: STATE.completedCredits,
      targetCGPA: STATE.targetCGPA,
      semester: STATE.semester,
      courses: STATE.courses,
      cutoffs: STATE.cutoffs,
      presetId: STATE.relativePreset
    });
    loadingBubble.innerHTML = formatMarkdown(reply);
  } catch (err) {
    loadingBubble.innerHTML = `⚠️ <em>Sorry, an error occurred: ${err.message}</em>`;
  }
};

window.sendQuickPrompt = function(promptText) {
  const input = document.getElementById("chatInput");
  if (input) {
    input.value = promptText;
    document.getElementById("chatForm")?.dispatchEvent(new Event("submit"));
  }
};

function appendChatMessage(sender, text) {
  const container = document.getElementById("chatMessages");
  if (!container) return null;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${sender === "user" ? "message-user" : "message-ai"}`;
  bubble.innerHTML = sender === "user" ? escapeHtml(text) : text;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

window.configureApiKey = function() {
  const key = prompt("Enter your Google Gemini API Key for direct GenAI reasoning (Optional):", STATE.geminiApiKey || "");
  if (key !== null) {
    STATE.geminiApiKey = key.trim();
    aiAdvisor.setApiKey(STATE.geminiApiKey);
    saveState();
    alert(STATE.geminiApiKey ? "Gemini API Key configured successfully!" : "Gemini API Key removed. Using local BMU Academic Engine.");
  }
};

// Helpers
function getGradeBadgeClass(grade) {
  const map = {
    "A+": "grade-A_plus",
    "A": "grade-A",
    "B+": "grade-B_plus",
    "B": "grade-B",
    "C+": "grade-C_plus",
    "C": "grade-C",
    "D": "grade-D",
    "F": "grade-F"
  };
  return map[grade] || "grade-D";
}

function getRiskBadgeClass(level) {
  const map = {
    "CRITICAL": "badge-red",
    "HIGH": "badge-pink",
    "MODERATE": "badge-yellow",
    "LOW": "badge-mint",
    "SAFE": "badge-cyan"
  };
  return map[level] || "badge-gray";
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatMarkdown(text) {
  if (!text) return "";
  let formatted = text
    .replace(/^### (.*$)/gim, '<h3 style="font-size:1.05rem;font-weight:800;margin:0.5rem 0 0.25rem;">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 style="font-size:0.95rem;font-weight:800;margin:0.4rem 0 0.2rem;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:var(--surface);padding:0.1rem 0.35rem;border:1px solid var(--border-color);border-radius:3px;font-family:var(--font-mono);font-size:0.8rem;">$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
  return formatted;
}

