import { BMU_GRADE_SCALE, RELATIVE_PRESETS } from './curriculum.js';
import { solveEndSemMarks } from './endsem-solver.js';

export class BMUAIAdvisor {
  constructor(geminiApiKey = null) {
    this.geminiApiKey = geminiApiKey;
    this.conversationHistory = [];
  }

  setApiKey(key) {
    this.geminiApiKey = key ? key.trim() : null;
  }

  // Generate deterministic deep academic analysis using the BMU curriculum and grading engine
  generateComprehensiveAnalysis(data) {
    const {
      currentCGPA,
      completedCredits,
      targetCGPA,
      semester,
      courses,
      cutoffs,
      presetId = "moderate"
    } = data;

    const totalSemCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
    const solverResult = solveEndSemMarks({
      currentCGPA,
      completedCredits,
      targetCGPA,
      courses,
      cutoffs,
      strategy: "credit_priority"
    });

    const reqSGPA = solverResult.requiredSGPA;
    const maxPossible = solverResult.maxAttainableCGPA;
    const isFeasible = reqSGPA <= 10.0;

    // Identify high impact courses (4-credit)
    const highCreditCourses = courses.filter(c => Number(c.credits) >= 4);
    const lowCreditCourses = courses.filter(c => Number(c.credits) <= 2);

    // Identify top vulnerability
    const highestRiskSubject = [...solverResult.subjectPlans].sort((a, b) => {
      const riskWeight = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1, SAFE: 0 };
      return (riskWeight[b.riskLevel] || 0) - (riskWeight[a.riskLevel] || 0) || (b.requiredEndSem - a.requiredEndSem);
    })[0];

    // Determine advice tone and action steps
    let assessmentSummary = "";
    if (reqSGPA > 10.0) {
      assessmentSummary = `⚠️ **Goal Math Check:** Reaching a ${targetCGPA.toFixed(2)} CGPA in this semester alone is mathematically unreachable because it requires an SGPA of **${reqSGPA.toFixed(2)}** (maximum possible is 10.00). If you score straight A+ (10.0 SGPA) in every single course this term, your maximum possible CGPA will rise to **${maxPossible.toFixed(2)}**. Plan for a 2-semester progression to cross ${targetCGPA.toFixed(2)}!`;
    } else if (reqSGPA >= 9.0) {
      assessmentSummary = `🎯 **High Ambition Target:** You need an SGPA of **${reqSGPA.toFixed(2)}** this semester. This leaves zero room for B-tier grades in your 4-credit courses. Focus on locking in minimum 40+/50 in your End-Sems for core theory courses.`;
    } else if (reqSGPA >= 8.0) {
      assessmentSummary = `✅ **Realistic & Highly Achievable:** You need an SGPA of **${reqSGPA.toFixed(2)}**. Consistent B+ and A grades in your core subjects will comfortably bring your cumulative CGPA up to **${targetCGPA.toFixed(2)}**.`;
    } else {
      assessmentSummary = `✨ **Comfortable Target:** You need an SGPA of **${reqSGPA.toFixed(2)}**. Maintain solid fundamentals and avoid unforced errors in submissions.`;
    }

    const recommendations = [
      `**Prioritize 4-Credit Powerhouses:** Subjects like ${highCreditCourses.map(c => `\`${c.name}\` (${c.credits}cr)`).join(', ')} carry **${Math.round((highCreditCourses.reduce((s, c) => s + c.credits, 0) / totalSemCredits) * 100)}%** of your total semester weight. Getting an A+ here gives 4x the impact of a 1-credit lab.`,
  return { assessmentSummary, recommendations };
}
}
