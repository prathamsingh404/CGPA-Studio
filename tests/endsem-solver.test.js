import { calculateSGPA, calculateUpdatedCGPA, calculateRequiredSGPA, solveEndSemMarks } from '../endsem-solver.js';
import { computeGradeCutoffs } from '../relative-engine.js';

console.log('Testing End-Sem Solver...');
const sgpa = calculateSGPA([{ credits: 4, gradePoints: 9 }, { credits: 4, gradePoints: 8 }]);
if (sgpa !== 8.5) throw new Error('SGPA calculation error');
const req = calculateRequiredSGPA(7.5, 40, 8.0, 20);
if (req.requiredSGPA <= 0) throw new Error('Required SGPA error');
console.log('✓ Solver Tests Passed');
