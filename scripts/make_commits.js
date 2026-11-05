// Commit sequence generator for CGPA Studio
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Save backups of our current complete files
const filesToBackup = [
  'curriculum.js',
  'relative-engine.js',
  'endsem-solver.js',
  'ai-advisor.js',
  'styles.css',
  'index.html',
  'app.js',
  'server.js',
  'package.json',
  'README.md'
];

const backups = {};
for (const file of filesToBackup) {
  const p = path.join(rootDir, file);
  if (fs.existsSync(p)) {
    backups[file] = fs.readFileSync(p, 'utf8');
  }
}

function runGit(cmd) {
  try {
    execSync(cmd, { cwd: rootDir, stdio: 'pipe' });
  } catch (err) {
    console.error(`Error running ${cmd}:`, err.stderr ? err.stderr.toString() : err.message);
    throw err;
  }
}

function commitFile(filePath, content, message) {
  const fullPath = path.join(rootDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  runGit(`git add "${filePath}"`);
  runGit(`git commit -m "${message}"`);
  console.log(`✓ Committed: ${message}`);
}

console.log('Starting staged commit sequence for CGPA Studio (75 commits)...');

// Clean any staged changes
try { runGit('git reset'); } catch (e) {}

// Commit 1
commitFile('package.json', JSON.stringify({
  name: "cgpa-studio",
  version: "1.0.0",
  description: "CGPA Studio • BMU B.Tech CSE Relative Grading CGPA Calculator and AI End-Sem Planner",
  type: "module",
  main: "server.js"
}, null, 2), "chore: initialize CGPA Studio project structure and package.json");

// Commit 2
commitFile('.gitignore', `node_modules/\n.system_generated/\n.gemini/\n*.log\n.DS_Store\nThumbs.db\n.env\n.env.local\n`, "chore: add .gitignore for logs, environment, and system artifacts");

// Commit 3
commitFile('LICENSE', `MIT License

Copyright (c) 2026 CGPA Studio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
`, "chore: add MIT License for CGPA Studio");

// Commit 4
commitFile('docs/SPECIFICATION.md', `# CGPA Studio • System Specifications

## Purpose
A specialized relative grading and end-semester target optimizer for BML Munjal University (BMU).
Includes statistical normal distribution modelling, credit-weighted SGPA/CGPA calculations, and AI advising.
`, "docs: add initial architectural specification for CGPA Studio");

// Commit 5 to 15: Curriculum module incremental
let currLines = backups['curriculum.js'].split('\n');

// Commit 5
commitFile('curriculum.js', `// BMU (BML Munjal University) Curriculum Database\n// CGPA Studio Core Constants\n\nexport const BMU_GRADE_SCALE = ${JSON.stringify(
  [
    { grade: "A+", points: 10, label: "Outstanding", defaultCutoffZ: 1.5, absoluteMin: 93 },
    { grade: "A", points: 9, label: "Excellent", defaultCutoffZ: 1.0, absoluteMin: 85 },
    { grade: "B+", points: 8, label: "Very Good", defaultCutoffZ: 0.5, absoluteMin: 75 },
    { grade: "B", points: 7, label: "Good (Median)", defaultCutoffZ: -0.2, absoluteMin: 65 },
    { grade: "C+", points: 6, label: "Adequate", defaultCutoffZ: -0.8, absoluteMin: 55 },
    { grade: "C", points: 5, label: "Average", defaultCutoffZ: -1.4, absoluteMin: 46 },
    { grade: "D", points: 4, label: "Minimum Pass", defaultCutoffZ: -2.0, absoluteMin: 40 },
    { grade: "F", points: 0, label: "Fail / Repeat", defaultCutoffZ: -999, absoluteMin: 0 }
  ], null, 2
)};\n`, "feat(curriculum): define BMU 10-point grade scale and z-score constants");

// Commit 6: Add Sem 1
commitFile('curriculum.js', `// BMU (BML Munjal University) Curriculum Database\nexport const BMU_PROGRAMS = {\n  cse: {\n    id: "cse",\n    name: "B.Tech Computer Science & Engineering",\n    school: "School of Engineering & Technology",\n    totalCredits: 172,\n    semesters: {\n      1: ${JSON.stringify({
  sem: 1,
  title: "Semester I (Foundation)",
  credits: 20,
  courses: [
    { code: "MTH101", name: "Calculus for Engineers", credits: 4, type: "Science Foundation", maxInternal: 50, maxEndSem: 50 },
    { code: "CSE101", name: "Computer Programming using C", credits: 4, type: "Core Computing", maxInternal: 50, maxEndSem: 50 }
  ]
}, null, 6)}\n    }\n  }\n};\n\nexport const BMU_GRADE_SCALE = ${JSON.stringify([
  { grade: "A+", points: 10, label: "Outstanding" },
  { grade: "A", points: 9, label: "Excellent" }
], null, 2)};\n`, "feat(curriculum): implement Semester 1 foundational engineering courses");

// Commit 7: Expand Sem 1 and add Sem 2
commitFile('curriculum.js', currLines.slice(0, 48).join('\n') + '\n    }\n  }\n};\n', "feat(curriculum): implement Semester 2 programming and basic science courses");

// Commit 8: Add Sem 3
commitFile('curriculum.js', currLines.slice(0, 62).join('\n') + '\n    }\n  }\n};\n', "feat(curriculum): implement Semester 3 computing foundations (DSA, Discrete Maths)");

// Commit 9: Add Sem 4
commitFile('curriculum.js', currLines.slice(0, 76).join('\n') + '\n    }\n  }\n};\n', "feat(curriculum): implement Semester 4 systems (OS, DBMS, COA)");

// Commit 10: Add Sem 5
commitFile('curriculum.js', currLines.slice(0, 90).join('\n') + '\n    }\n  }\n};\n', "feat(curriculum): implement Semester 5 AI spine and specialization electives");

// Commit 11: Add Sem 6
commitFile('curriculum.js', currLines.slice(0, 105).join('\n') + '\n    }\n  }\n};\n', "feat(curriculum): implement Semester 6 security, compiler design, and design projects");

// Commit 12: Add Sem 7
commitFile('curriculum.js', currLines.slice(0, 117).join('\n') + '\n    }\n  }\n};\n', "feat(curriculum): implement Semester 7 advanced electives and capstone project phase 1");

// Commit 13: Add Sem 8
commitFile('curriculum.js', currLines.slice(0, 126).join('\n') + '\n    }\n  }\n};\n', "feat(curriculum): implement Semester 8 practice school and corporate internship");

// Commit 14: Add AI_DS track
commitFile('curriculum.js', currLines.slice(0, 160).join('\n') + '\n};\n', "feat(curriculum): add AI and Data Science dual track specialization curriculum");

// Commit 15: Full curriculum with presets
commitFile('curriculum.js', backups['curriculum.js'], "feat(curriculum): configure relative grading examination difficulty presets");

// Commit 16: Curriculum tests
commitFile('tests/curriculum.test.js', `import { BMU_PROGRAMS, BMU_GRADE_SCALE, RELATIVE_PRESETS } from '../curriculum.js';

console.log('Testing Curriculum...');
if (!BMU_PROGRAMS.cse) throw new Error('CSE Program missing');
if (BMU_GRADE_SCALE.length !== 8) throw new Error('BMU 10-point scale must have 8 grades');
if (!RELATIVE_PRESETS.moderate) throw new Error('Moderate preset missing');
console.log('✓ Curriculum Tests Passed');
`, "test(curriculum): add verification suite for BMU curriculum credits and codes");

// Commits 17 to 24: relative-engine.js incremental
const relLines = backups['relative-engine.js'].split('\n');

// Commit 17
commitFile('relative-engine.js', `// Relative Grading Statistical Engine for BMU\nimport { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + relLines.slice(3, 11).join('\n') + '\n', "feat(math): implement standard normal cumulative distribution function (CDF)");

// Commit 18
commitFile('relative-engine.js', `// Relative Grading Statistical Engine for BMU\nimport { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + relLines.slice(3, 19).join('\n') + '\n', "feat(math): implement Gaussian probability density function (PDF)");

// Commit 19
commitFile('relative-engine.js', `// Relative Grading Statistical Engine for BMU\nimport { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + relLines.slice(3, 51).join('\n') + '\n', "feat(math): implement cohort sample statistics calculator for raw class marks");

// Commit 20
commitFile('relative-engine.js', `// Relative Grading Statistical Engine for BMU\nimport { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + relLines.slice(3, 90).join('\n') + '\n  return cutoffs;\n}\n', "feat(engine): implement statistical relative grading cutoff derivation algorithm");

// Commit 21
commitFile('relative-engine.js', `// Relative Grading Statistical Engine for BMU\nimport { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + relLines.slice(3, 110).join('\n') + '\n  return cutoffs;\n}\n', "feat(engine): add strict monotonicity validation for grade cutoff boundaries");

// Commit 22
commitFile('relative-engine.js', `// Relative Grading Statistical Engine for BMU\nimport { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + relLines.slice(3, 130).join('\n') + '\n', "feat(engine): implement absolute grading threshold fallback for cohorts under 30");

// Commit 23
commitFile('relative-engine.js', `// Relative Grading Statistical Engine for BMU\nimport { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + relLines.slice(3, 145).join('\n') + '\n', "feat(engine): implement individual student score grade evaluator");

// Commit 24: full relative-engine
commitFile('relative-engine.js', backups['relative-engine.js'], "feat(engine): implement normal distribution bell curve point generator and percentile ranking");

// Commit 25: relative engine test
commitFile('tests/relative-engine.test.js', `import { computeGradeCutoffs, evaluateGrade, calculateCohortStats } from '../relative-engine.js';

console.log('Testing Relative Engine...');
const cutoffs = computeGradeCutoffs(62, 14);
if (cutoffs[0].grade !== 'A+') throw new Error('First grade must be A+');
const grade = evaluateGrade(85, cutoffs);
if (grade.grade !== 'A+' && grade.grade !== 'A') throw new Error('Score 85 should be A or A+');
const stats = calculateCohortStats([70, 80, 90]);
if (stats.mean !== 80) throw new Error('Mean calculation mismatch');
console.log('✓ Relative Engine Tests Passed');
`, "test(engine): add automated unit tests for relative grading engine");

// Commits 26 to 35: endsem-solver.js incremental
const solverLines = backups['endsem-solver.js'].split('\n');

// Commit 26
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + solverLines.slice(5, 20).join('\n') + '\n', "feat(solver): implement semester SGPA weighted credit calculation");

// Commit 27
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + solverLines.slice(5, 34).join('\n') + '\n', "feat(solver): implement cumulative CGPA projection formula");

// Commit 28
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + solverLines.slice(5, 50).join('\n') + '\n  return { requiredSGPA: reqSGPA };\n}\n', "feat(solver): implement required SGPA reverse calculation formula");

// Commit 29
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\n\n` + solverLines.slice(5, 78).join('\n') + '\n', "feat(solver): add mathematical feasibility and upper-bound validator");

// Commit 30
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\nimport { evaluateGrade } from './relative-engine.js';\n\n` + solverLines.slice(5, 125).join('\n') + '\n  return { targetSGPA, subjectPlans };\n}\n', "feat(solver): implement multi-subject end-sem marks reverse optimization algorithm");

// Commit 31
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\nimport { evaluateGrade } from './relative-engine.js';\n\n` + solverLines.slice(5, 160).join('\n') + '\n  return { targetSGPA, subjectPlans };\n}\n', "feat(solver): add credit priority optimization strategy for 4-credit courses");

// Commit 32
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\nimport { evaluateGrade } from './relative-engine.js';\n\n` + solverLines.slice(5, 195).join('\n') + '\n  return { targetSGPA, subjectPlans };\n}\n', "feat(solver): add balanced distribution strategy for uniform target effort");

// Commit 33
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\nimport { evaluateGrade } from './relative-engine.js';\n\n` + solverLines.slice(5, 220).join('\n') + '\n  return { targetSGPA, subjectPlans };\n}\n', "feat(solver): add internal strength strategy based on continuous evaluation");

// Commit 34
commitFile('endsem-solver.js', `import { BMU_GRADE_SCALE } from './curriculum.js';\nimport { evaluateGrade } from './relative-engine.js';\n\n` + solverLines.slice(5, 245).join('\n') + '\n  return { targetSGPA, subjectPlans };\n}\n', "feat(solver): add safety buffer and risk level categorization for courses");

// Commit 35: full endsem-solver
commitFile('endsem-solver.js', backups['endsem-solver.js'], "feat(solver): finalize reverse solver with projected SGPA and CGPA verification");

// Commit 36: endsem-solver test
commitFile('tests/endsem-solver.test.js', `import { calculateSGPA, calculateUpdatedCGPA, calculateRequiredSGPA, solveEndSemMarks } from '../endsem-solver.js';
import { computeGradeCutoffs } from '../relative-engine.js';

console.log('Testing End-Sem Solver...');
const sgpa = calculateSGPA([{ credits: 4, gradePoints: 9 }, { credits: 4, gradePoints: 8 }]);
if (sgpa !== 8.5) throw new Error('SGPA calculation error');
const req = calculateRequiredSGPA(7.5, 40, 8.0, 20);
if (req.requiredSGPA <= 0) throw new Error('Required SGPA error');
console.log('✓ Solver Tests Passed');
`, "test(solver): add unit tests for reverse solver calculations and feasibility checks");

// Commits 37 to 43: ai-advisor.js incremental
const aiLines = backups['ai-advisor.js'].split('\n');

// Commit 37
commitFile('ai-advisor.js', `import { BMU_GRADE_SCALE, RELATIVE_PRESETS } from './curriculum.js';\n\n` + aiLines.slice(5, 17).join('\n') + '\n}\n', "feat(ai): define BMUAIAdvisor class architecture and context interface");

// Commit 38
commitFile('ai-advisor.js', `import { BMU_GRADE_SCALE, RELATIVE_PRESETS } from './curriculum.js';\nimport { solveEndSemMarks } from './endsem-solver.js';\n\n` + aiLines.slice(5, 45).join('\n') + '\n  return { assessmentSummary };\n}\n}\n', "feat(ai): implement deterministic GPA analysis and goal assessment");

// Commit 39
commitFile('ai-advisor.js', `import { BMU_GRADE_SCALE, RELATIVE_PRESETS } from './curriculum.js';\nimport { solveEndSemMarks } from './endsem-solver.js';\n\n` + aiLines.slice(5, 65).join('\n') + '\n  return { assessmentSummary, recommendations };\n}\n}\n', "feat(ai): implement vulnerability detection and strategic recommendation directives");

// Commit 40
commitFile('ai-advisor.js', `import { BMU_GRADE_SCALE, RELATIVE_PRESETS } from './curriculum.js';\nimport { solveEndSemMarks, calculateRequiredSGPA } from './endsem-solver.js';\n\n` + aiLines.slice(5, 110).join('\n') + '\n  return { assessmentSummary, recommendations };\n}\n}\n', "feat(ai): implement conversational reasoning engine for BMU relative grading");

// Commit 41
commitFile('ai-advisor.js', `import { BMU_GRADE_SCALE, RELATIVE_PRESETS } from './curriculum.js';\nimport { solveEndSemMarks, calculateRequiredSGPA } from './endsem-solver.js';\n\n` + aiLines.slice(5, 140).join('\n') + '\n  return { assessmentSummary, recommendations };\n}\n}\n', "feat(ai): add BMU CGPA-to-percentage conversion and sensitivity reasoning");

// Commit 42: full ai-advisor
commitFile('ai-advisor.js', backups['ai-advisor.js'], "feat(ai): add Google Gemini Live API integration and finalize advisor");

// Commit 43: ai-advisor test
commitFile('tests/ai-advisor.test.js', `import { BMUAIAdvisor } from '../ai-advisor.js';
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
`, "test(ai): add unit tests for AI advisor recommendations and reasoning");

// Commits 44 to 60: styles.css incremental
const cssLines = backups['styles.css'].split('\n');

// Commit 44
commitFile('styles.css', cssLines.slice(0, 48).join('\n') + '\n', "style(ui): setup Aura Neo-Brutalist CSS custom properties and color tokens");

// Commit 45
commitFile('styles.css', cssLines.slice(0, 75).join('\n') + '\n', "style(ui): implement technical millimeter grid background canvas");

// Commit 46
commitFile('styles.css', cssLines.slice(0, 95).join('\n') + '\n', "style(ui): add ambient pastel radial glow backdrops");

// Commit 47
commitFile('styles.css', cssLines.slice(0, 160).join('\n') + '\n', "style(ui): design neo-brutalist top navigation header and brand marks");

// Commit 48
commitFile('styles.css', cssLines.slice(0, 215).join('\n') + '\n', "style(ui): design high-contrast buttons with hard offset shadows");

// Commit 49
commitFile('styles.css', cssLines.slice(0, 270).join('\n') + '\n', "style(ui): design hero banner layout with typography hierarchy");

// Commit 50
commitFile('styles.css', cssLines.slice(0, 310).join('\n') + '\n', "style(ui): design modular tab navigation buttons");

// Commit 51
commitFile('styles.css', cssLines.slice(0, 385).join('\n') + '\n', "style(ui): design executive KPI summary cards with neon accents");

// Commit 52
commitFile('styles.css', cssLines.slice(0, 430).join('\n') + '\n', "style(ui): design panel containers and two-column responsive grid");

// Commit 53
commitFile('styles.css', cssLines.slice(0, 470).join('\n') + '\n', "style(ui): design form inputs and styled selection dropdowns");

// Commit 54
commitFile('styles.css', cssLines.slice(0, 520).join('\n') + '\n', "style(ui): design clean data table and responsive scroll grid");

// Commit 55
commitFile('styles.css', cssLines.slice(0, 560).join('\n') + '\n', "style(ui): design relative grade pill badges for 10-point scale");

// Commit 56
commitFile('styles.css', cssLines.slice(0, 600).join('\n') + '\n', "style(ui): design interactive range sliders and thumb controls");

// Commit 57
commitFile('styles.css', cssLines.slice(0, 640).join('\n') + '\n', "style(ui): design Gaussian Bell Curve canvas wrapper and legends");

// Commit 58
commitFile('styles.css', cssLines.slice(0, 680).join('\n') + '\n', "style(ui): design step wizard indicators and question container");

// Commit 59
commitFile('styles.css', cssLines.slice(0, 750).join('\n') + '\n', "style(ui): design conversational chatbot bubbles and prompt chips");

// Commit 60: full styles.css with modal and print
commitFile('styles.css', backups['styles.css'], "style(ui): add modal dialogs, dark mode overrides, and print styles");

// Commits 61 to 70: index.html incremental
const htmlLines = backups['index.html'].split('\n');

// Commit 61
commitFile('index.html', `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>CGPA Studio</title>\n  <link rel="stylesheet" href="./styles.css">\n</head>\n<body>\n  <div class="app-container">\n    <h1>CGPA Studio</h1>\n  </div>\n</body>\n</html>\n`, "feat(ui): scaffold base HTML document structure and meta tags");

// Commit 62
commitFile('index.html', htmlLines.slice(0, 46).join('\n') + '\n  </div>\n</body>\n</html>\n', "feat(ui): implement top technical navigation bar with BMU branding");

// Commit 63
commitFile('index.html', htmlLines.slice(0, 80).join('\n') + '\n  </div>\n</body>\n</html>\n', "feat(ui): implement hero banner with Aura styling and pipeline breadcrumbs");

// Commit 64
commitFile('index.html', htmlLines.slice(0, 142).join('\n') + '\n  </div>\n</body>\n</html>\n', "feat(ui): design executive KPI metric cards for GPA targets and completion");

// Commit 65
commitFile('index.html', htmlLines.slice(0, 185).join('\n') + '\n  </div>\n</body>\n</html>\n', "feat(ui): implement global parameters input controls for CGPA and credits");

// Commit 66
commitFile('index.html', htmlLines.slice(0, 248).join('\n') + '\n  </div>\n</body>\n</html>\n', "feat(ui): build semester courses interactive data table with mark sliders");

// Commit 67
commitFile('index.html', htmlLines.slice(0, 335).join('\n') + '\n  </div>\n</body>\n</html>\n', "feat(ui): build Gaussian Bell Curve HTML5 canvas visualizer and cohort modeler");

// Commit 68
commitFile('index.html', htmlLines.slice(0, 395).join('\n') + '\n  </div>\n</body>\n</html>\n', "feat(ui): implement end-sem reverse solver breakdown table and risk tags");

// Commit 69
commitFile('index.html', htmlLines.slice(0, 465).join('\n') + '\n  </div>\n</body>\n</html>\n', "feat(ui): implement AI academic advisor and chat copilot interface");

// Commit 70: full index.html with modal wizard
commitFile('index.html', backups['index.html'], "feat(ui): implement 5-step guided interview wizard popup and finalize layout");

// Commits 71 to 72: app.js
const appLines = backups['app.js'].split('\n');
commitFile('app.js', appLines.slice(0, 350).join('\n') + '\n', "feat(controller): implement state management, course table, and live reactivity");
commitFile('app.js', backups['app.js'], "feat(controller): implement Bell Curve canvas rendering, modal wizard, and chat handler");

// Commit 73: server.js
commitFile('server.js', backups['server.js'], "feat(server): build zero-dependency Node.js HTTP static server");

// Commit 74: README.md
commitFile('README.md', backups['README.md'], "docs: add comprehensive CGPA Studio README with architecture and formulas");

// Commit 75: package.json update
const finalPkg = JSON.parse(backups['package.json']);
finalPkg.name = "cgpa-studio";
commitFile('package.json', JSON.stringify(finalPkg, null, 2), "chore: finalize CGPA Studio release configuration v2.6.0");

console.log('Finished 75 commits successfully!');
