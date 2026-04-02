export type FitResult = {
  predictProba: (x: number[]) => number;
};

function sigmoid(z: number) {
  if (z > 35) return 1;
  if (z < -35) return 0;
  return 1 / (1 + Math.exp(-z));
}

/**
 * Binary logistic regression via batch gradient descent (no external CJS/ESM quirks).
 */
export function fitLogisticRegression(X: number[][], y: number[]): FitResult | null {
  if (X.length < 10) return null;
  if (X.length !== y.length) return null;
  const nFeatures = X[0]?.length ?? 0;
  if (nFeatures === 0) return null;

  const n = X.length;
  const maxIter = 1500;
  const lr = 0.15;

  const w = new Array(nFeatures).fill(0);
  let b = 0;

  for (let iter = 0; iter < maxIter; iter++) {
    const gradW = new Array(nFeatures).fill(0);
    let gradB = 0;

    for (let i = 0; i < n; i++) {
      let z = b;
      const row = X[i];
      for (let j = 0; j < nFeatures; j++) z += w[j] * (row[j] ?? 0);
      const p = sigmoid(z);
      const err = p - (y[i] ? 1 : 0);
      gradB += err;
      for (let j = 0; j < nFeatures; j++) gradW[j] += err * (row[j] ?? 0);
    }

    const scale = lr / n;
    b -= scale * gradB;
    for (let j = 0; j < nFeatures; j++) w[j] -= scale * gradW[j];
  }

  return {
    predictProba: (x: number[]) => {
      let z = b;
      for (let j = 0; j < nFeatures; j++) z += w[j] * (x[j] ?? 0);
      return sigmoid(z);
    },
  };
}
