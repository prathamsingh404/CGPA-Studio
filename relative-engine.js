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

