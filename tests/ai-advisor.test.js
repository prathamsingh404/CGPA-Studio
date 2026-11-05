import { BMUAIAdvisor } from '../ai-advisor.js';
import { computeGradeCutoffs } from '../relative-engine.js';

console.log('Testing AI Advisor...');
const advisor = new BMUAIAdvisor();
const analysis = advisor.generateComprehensiveAnalysis({
  currentCGPA: 7.5,
  completedCredits: 40,
  targetCGPA: 8.5,
  semester: 3,
  courses: [{ name: 'DSA', credits: 4, maxInternal: 50, maxEndSem: 50, internalMarks: 35 }],
  cutoffs: computeGradeCutoffs(62, 14)
});
if (!analysis.assessmentSummary) throw new Error('Analysis missing summary');
console.log('✓ AI Advisor Tests Passed');
