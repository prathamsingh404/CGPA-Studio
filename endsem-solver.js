import { BMU_GRADE_SCALE } from './curriculum.js';

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
