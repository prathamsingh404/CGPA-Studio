// Relative Grading Statistical Engine for BMU
import { BMU_GRADE_SCALE } from './curriculum.js';

// Standard normal cumulative distribution function (CDF) approximation (Abramowitz and Stegun)
export function standardNormalCDF(x) {
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-x * x / 2.0);
  const prob = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1.0 - prob : prob;
}

// Gaussian probability density function (PDF)
export function normalPDF(x, mean, sd) {
  if (sd <= 0) return 0;
  const factor = 1 / (sd * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(sd, 2));
  return factor * Math.exp(exponent);
}

// Calculate empirical Mean and Sample Standard Deviation from raw marks array
export function calculateCohortStats(marksArray) {
  const validMarks = marksArray
    .map(Number)
    .filter(n => !isNaN(n) && n >= 0 && n <= 100);

  if (validMarks.length === 0) {
    return { count: 0, mean: 60, sd: 14, min: 0, max: 100, median: 60 };
  }

  const n = validMarks.length;
  const sum = validMarks.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  let variance = 0;
  if (n > 1) {
    variance = validMarks.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1);
  }
  const sd = Math.sqrt(variance) || 12;

  const sorted = [...validMarks].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  return {
    count: n,
    mean: Math.round(mean * 10) / 10,
    sd: Math.round(sd * 10) / 10,
    min: sorted[0],
    max: sorted[n - 1],
    median: Math.round(median * 10) / 10
  };
}

// Compute Grade Boundaries (Cutoffs) for given Mean and Standard Deviation
export function computeGradeCutoffs(mean, sd, isAbsolute = false) {
  if (isAbsolute) {
    return BMU_GRADE_SCALE.map((item, idx, arr) => {
      const min = item.absoluteMin;
      const nextItem = arr[idx - 1];
      const max = nextItem ? nextItem.absoluteMin - 1 : 100;
      return {
        ...item,
        minMarks: min,
        maxMarks: max,
        displayRange: `${min} - ${max}`,
        method: "Absolute (Cohort < 30)"
      };
    });
  }

  // Statistical Relative Grading cutoffs based on BMU Grade Moderation guidelines
  // Cutoff marks: Mean + (Z * SD), bounded between 0 and 100
  // Pass threshold D is capped at a sensible absolute floor (usually 35-40)
  const cutoffs = [];
  const minPassThreshold = 35; // Minimum passing total score at BMU

  // Order from top grade (A+) to F
  for (let i = 0; i < BMU_GRADE_SCALE.length; i++) {
    const scale = BMU_GRADE_SCALE[i];
    let minMarks;

    if (scale.grade === "A+") {
      minMarks = Math.min(98, Math.max(82, Math.round(mean + 1.5 * sd)));
    } else if (scale.grade === "A") {
      minMarks = Math.min(90, Math.max(72, Math.round(mean + 1.0 * sd)));
    } else if (scale.grade === "B+") {
      minMarks = Math.min(82, Math.max(62, Math.round(mean + 0.5 * sd)));
    } else if (scale.grade === "B") {
      minMarks = Math.min(74, Math.max(52, Math.round(mean - 0.2 * sd)));
    } else if (scale.grade === "C+") {
      minMarks = Math.min(65, Math.max(45, Math.round(mean - 0.8 * sd)));
    } else if (scale.grade === "C") {
      minMarks = Math.min(55, Math.max(40, Math.round(mean - 1.4 * sd)));
    } else if (scale.grade === "D") {
      minMarks = Math.max(minPassThreshold, Math.round(mean - 2.0 * sd));
    } else {
      // F Grade
      minMarks = 0;
    }

    cutoffs.push({
      ...scale,
      rawMin: minMarks
    });
  }

  // Ensure strict monotonicity (higher grade must have strictly higher cutoff)
  for (let i = cutoffs.length - 2; i >= 0; i--) {
    if (cutoffs[i].rawMin <= cutoffs[i + 1].rawMin) {
      cutoffs[i].rawMin = cutoffs[i + 1].rawMin + 2;
    }
  }

  // Final formatted list with min and max
  return cutoffs.map((item, idx, arr) => {
    const minMarks = Math.min(100, Math.max(0, item.rawMin));
    const nextItem = arr[idx - 1];
    const maxMarks = nextItem ? Math.max(minMarks, nextItem.rawMin - 1) : 100;

    return {
      ...item,
      minMarks: minMarks,
      maxMarks: maxMarks,
      displayRange: item.grade === "F" ? `< ${arr[idx - 1].rawMin}` : `${minMarks} - ${maxMarks}`,
      method: "Statistical Normal Distribution"
    };
  });
}

// Determine Grade from Total Marks
export function evaluateGrade(totalMarks, cutoffs) {
  const rounded = Math.round(totalMarks * 10) / 10;
  for (const cutoff of cutoffs) {
    if (rounded >= cutoff.minMarks && cutoff.grade !== "F") {
      return cutoff;
    }
  }
  // If not meeting D cutoff, it's F
  return cutoffs.find(c => c.grade === "F") || { grade: "F", points: 0, label: "Fail / Repeat" };
}

// Generate data points for Bell Curve Visualization
export function generateBellCurveData(mean, sd, studentScore = null, numPoints = 120) {
  const startX = Math.max(0, Math.floor(mean - 3.5 * sd));
  const endX = Math.min(100, Math.ceil(mean + 3.5 * sd));
  const step = (endX - startX) / (numPoints - 1);

  const points = [];
  let maxY = 0;

  for (let i = 0; i < numPoints; i++) {
    const x = startX + i * step;
    const y = normalPDF(x, mean, sd);
    if (y > maxY) maxY = y;
    points.push({ x: Math.round(x * 10) / 10, y });
  }

  // Student percentile
  let studentPercentile = null;
  if (studentScore !== null && sd > 0) {
    const z = (studentScore - mean) / sd;
    studentPercentile = Math.round(standardNormalCDF(z) * 1000) / 10;
  }

  return {
    startX,
    endX,
    points,
    maxY,
    studentPercentile
  };
}

