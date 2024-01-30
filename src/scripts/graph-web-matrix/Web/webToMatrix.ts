import * as math from "mathjs";

import * as W from ".";
import Web from ".";
import { WebGenerator as WG } from ".";

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

// Note: this is extremely inefficient on ram
// Need to manually fix: store as sparse matrix and use "sparse kronecker product"
//   which mathjs doesnt have
export const webRowToMatrix = (w: WG[]): number[][] => {
  return w.reduce(
    (acc, cur) => math.kron(acc, genToMatrix(cur)) as unknown as number[][],
    [[1]]
  );
};

const webToMatrix = (w: Web): number[][] => {
  // console.log(w.web.map(webRowToMatrix));
  return w.web
    .map(webRowToMatrix)
    .reduce((acc, cur) => math.multiply(cur, acc)); // compose rows
};

export default webToMatrix;
