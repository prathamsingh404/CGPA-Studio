import { computeGradeCutoffs, evaluateGrade, calculateCohortStats } from '../relative-engine.js';

console.log('Testing Relative Engine...');
const cutoffs = computeGradeCutoffs(62, 14);
if (cutoffs[0].grade !== 'A+') throw new Error('First grade must be A+');
const grade = evaluateGrade(85, cutoffs);
if (grade.grade !== 'A+' && grade.grade !== 'A') throw new Error('Score 85 should be A or A+');
const stats = calculateCohortStats([70, 80, 90]);
if (stats.mean !== 80) throw new Error('Mean calculation mismatch');
console.log('✓ Relative Engine Tests Passed');
