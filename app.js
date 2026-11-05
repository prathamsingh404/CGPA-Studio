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

