import * as math from "mathjs";

import * as W from "./Web";
import Web from "./Web";
import { WebGenerator as WG } from "./Web";

// Matrices
// - indexed with [row][col]
const idM = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const cupM = [[1], [0], [0], [0], [1], [0], [0], [0], [1]];
const capM = [[1, 0, 0, 0, 1, 0, 0, 0, 1]];
const mergeM = [
  [0, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0],
];
const splitM = [
  [0, 0, 0],
  [0, 0, 1],
  [0, 1, 0],
  [0, 0, 1],
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, 0],
];

export const genToMatrix = (w: WG) => {
  switch (w) {
    case WG.Id:
      return idM;
    case WG.Cup:
      return cupM;
    case WG.Cap:
      return capM;
    case WG.Merge:
      return mergeM;
    case WG.Split:
      return splitM;
  }
};

export const webRowToMatrix = (w: WG[]): number[][] => {
  return w.reduce(
    (acc, cur) => math.kron(acc, genToMatrix(cur)) as unknown as number[][],
    [[1]]
  );
};

const webToMatrix = (w: Web): number[][] => {
  // console.log(w.web.map(webRowToMatrix));
  const matrices = w.web.map(webRowToMatrix);
  if (matrices.length === 0) return [[1]];
  else return matrices.reduce((acc, cur) => math.multiply(cur, acc)); // compose rows
};

export default webToMatrix;
