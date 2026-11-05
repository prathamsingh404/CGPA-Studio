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

  return { assessmentSummary };
}
}
