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
