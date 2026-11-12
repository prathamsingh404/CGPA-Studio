import { BMU_PROGRAMS, BMU_GRADE_SCALE, RELATIVE_PRESETS } from '../public/curriculum.js';

console.log('Testing Curriculum...');
if (!BMU_PROGRAMS.cse) throw new Error('CSE Program missing');
if (BMU_GRADE_SCALE.length !== 8) throw new Error('BMU 10-point scale must have 8 grades');
if (!RELATIVE_PRESETS.moderate) throw new Error('Moderate preset missing');
console.log('✓ Curriculum Tests Passed');
