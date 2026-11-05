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
