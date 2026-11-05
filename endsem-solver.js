import { BMU_GRADE_SCALE } from './curriculum.js';
import { evaluateGrade } from './relative-engine.js';

// Calculate SGPA for a given list of courses with grade points
export function calculateSGPA(courses) {
  let totalWeightedPoints = 0;
  let totalCredits = 0;

  for (const c of courses) {
    const credits = Number(c.credits) || 0;
    const gp = Number(c.gradePoints ?? c.targetGP ?? (c.gradeObj ? c.gradeObj.points : 0)) || 0;
    totalWeightedPoints += credits * gp;
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;
  return Math.round((totalWeightedPoints / totalCredits) * 100) / 100;
}

// Calculate Updated CGPA after semester completion
export function calculateUpdatedCGPA(currentCGPA, completedCredits, semSGPA, semCredits) {
  const curC = Number(currentCGPA) || 0;
  const compCr = Number(completedCredits) || 0;
  const sgpa = Number(semSGPA) || 0;
  const sCr = Number(semCredits) || 0;

  const totalCredits = compCr + sCr;
  if (totalCredits === 0) return curC;

  const totalPoints = (curC * compCr) + (sgpa * sCr);
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

// Calculate Required SGPA to hit Target CGPA
export function calculateRequiredSGPA(currentCGPA, completedCredits, targetCGPA, semCredits) {
  const curC = Number(currentCGPA) || 0;
  const compCr = Number(completedCredits) || 0;
  const target = Number(targetCGPA) || 0;
  const sCr = Number(semCredits) || 0;

  if (sCr <= 0) return { requiredSGPA: target, status: "NO_CREDITS" };

  const totalCredits = compCr + sCr;
  const totalPointsNeeded = target * totalCredits;
  const currentPoints = curC * compCr;
  const semPointsNeeded = totalPointsNeeded - currentPoints;
  const reqSGPA = semPointsNeeded / sCr;

  const maxAttainable = ((curC * compCr) + (10.0 * sCr)) / totalCredits;
  const minAttainable = ((curC * compCr) + (4.0 * sCr)) / totalCredits;

  let feasibility = "ACHIEVABLE";
  let statusMessage = "Target is well within reach!";

  if (reqSGPA > 10.0) {
    feasibility = "IMPOSSIBLE_THIS_SEM";
    statusMessage = `Mathematically unreachable in 1 semester. Max possible CGPA this sem is ${maxAttainable.toFixed(2)} (with straight 10.0 SGPA).`;
  } else if (reqSGPA > 9.3) {
    feasibility = "EXTREME";
    statusMessage = "Requires top-tier outstanding performance (mostly A+ / 10s) across all subjects.";
  } else if (reqSGPA > 8.5) {
    feasibility = "CHALLENGING";
    statusMessage = "Demands high consistency. Target A / A+ in 4-credit subjects.";
  } else if (reqSGPA <= 4.0) {
    feasibility = "GUARANTEED";
    statusMessage = "Guaranteed as long as you pass all registered subjects (SGPA >= 4.0).";
  }

  return {
    requiredSGPA: Math.round(reqSGPA * 100) / 100,
    maxAttainableCGPA: Math.round(maxAttainable * 100) / 100,
    minAttainableCGPA: Math.round(minAttainable * 100) / 100,
    feasibility,
    statusMessage
  };
}

// Reverse solve required end-semester marks for individual subjects
export function solveEndSemMarks({
  currentCGPA,
  completedCredits,
  targetCGPA,
  courses,
  cutoffs,
  strategy = "credit_priority" // 'balanced', 'credit_priority', 'internal_strength'
}) {
  const totalSemCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const reqResult = calculateRequiredSGPA(currentCGPA, completedCredits, targetCGPA, totalSemCredits);
  const targetSGPA = Math.min(10.0, Math.max(4.0, reqResult.requiredSGPA));

  // Clone courses and calculate internal percentage
  const subjectPlans = courses.map((c, index) => {
    const credits = Number(c.credits) || 3;
    const maxInternal = Number(c.maxInternal) || 50;
    const maxEndSem = Number(c.maxEndSem) || 50;
    const internal = Math.min(maxInternal, Math.max(0, Number(c.internalMarks) || 0));

    // Internal score as percentage of 50 or total
    const internalPct = (internal / maxInternal) * 100;

    return {
      id: c.code || `course_${index}`,
      index,
      code: c.code || `CSE${index + 1}`,
      name: c.name || `Subject ${index + 1}`,
      credits,
      type: c.type || "Core",
      maxInternal,
      maxEndSem,
      internal,
      internalPct,
      // Default placeholder targets
      targetGrade: "B+",
      targetGP: 8,
      requiredEndSem: 0,
      safetyBuffer: 0,
      riskLevel: "MODERATE"
    };
  });

  // Sort helper based on strategy
  if (strategy === "credit_priority") {
    // Highest credits get highest priority for high grades (A+, A)
    subjectPlans.sort((a, b) => b.credits - a.credits || b.internalPct - a.internalPct);
  } else if (strategy === "internal_strength") {
    // Best internal marks get pushed for A+, struggling ones for safe passing
    subjectPlans.sort((a, b) => b.internalPct - a.internalPct);
  }

  // Target points needed across semester: TargetSGPA * totalCredits
  const totalPointsNeeded = targetSGPA * totalSemCredits;

  // Available grade point options (10 down to 4)
  const availablePoints = [10, 9, 8, 7, 6, 5, 4];

  // Helper to find cutoff for given points
  function getCutoffForPoints(pts) {
    return cutoffs.find(c => c.points === pts) || cutoffs[cutoffs.length - 1];
  }

  // Check what max possible grade is for a subject given its internal marks
  function getMaxAchievableGP(subj) {
    // Max total marks possible = internal + maxEndSem
    const maxPossibleTotal = subj.internal + subj.maxEndSem;
    for (const pts of availablePoints) {
      const cut = getCutoffForPoints(pts);
      if (maxPossibleTotal >= cut.minMarks) {
        return pts;
      }
    }
    return 4; // At least D
  }

  // Initial allocation: try to give each subject a baseline grade point
  // Start with closest integer to targetSGPA
  const baseGP = Math.min(10, Math.max(4, Math.round(targetSGPA)));
  subjectPlans.forEach(s => {
    const maxGP = getMaxAchievableGP(s);
  return { targetSGPA, subjectPlans };
}
