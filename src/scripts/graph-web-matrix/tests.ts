import * as math from "mathjs";

import * as W from "./Web";
import Web from "./Web";
import { WebGenerator as WG } from "./Web";
import webToMatrix from "./webToMatrix";

// Examples
export const wCircle = new Web([[WG.Cup], [WG.Cap]]);
export const wNeedle = new Web([[WG.Split], [WG.Cap]]);
export const wZigZag = new Web([
  [WG.Cup, WG.Id],
  [WG.Id, WG.Cap],
]);
export const wZagZig = new Web([
  [WG.Id, WG.Cup],
  [WG.Cap, WG.Id],
]);
export const w2Gon = new Web([[WG.Split], [WG.Merge]]);
export const w3Gon = new Web([
  [WG.Split, WG.Split],
  [WG.Id, WG.Cap, WG.Id],
  [WG.Merge],
]);
export const wI = new Web([[WG.Merge], [WG.Split]]);
export const wH = new Web([
  [WG.Id, WG.Split],
  [WG.Merge, WG.Id],
]);

// Tests

export type TestResult = {
  result: boolean | math.MathType;
  name: string;
};

// Isotopy relations
export const testZigZag = (): TestResult => {
  const zigzag = webToMatrix(wZigZag);
  const zagzig = webToMatrix(wZagZig);
  const id = webToMatrix(new Web([[WG.Id]]));
  return {
    result: math.deepEqual(zigzag, id) && math.deepEqual(zagzig, id),
    name: "zigzag-zagzig",
  };
};

export const testCupSlide1 = (): TestResult => {
  const lhs = webToMatrix(
    new Web([[WG.Split, WG.Id, WG.Id], [WG.Id, WG.Cap, WG.Id], [WG.Cap]])
  );
  const rhs = webToMatrix(new Web([[WG.Id, WG.Merge], [WG.Cap]]));
  return {
    result: math.deepEqual(lhs, rhs),
    name: "cup slide clockwise",
  };
};

export const testCupSlide2 = (): TestResult => {
  const lhs = webToMatrix(
    new Web([[WG.Id, WG.Id, WG.Split], [WG.Id, WG.Cap, WG.Id], [WG.Cap]])
  );
  const rhs = webToMatrix(new Web([[WG.Merge, WG.Id], [WG.Cap]]));
  return {
    result: math.deepEqual(lhs, rhs),
    name: "cup slide anticlockwise",
  };
};

// Generating relations
export const testCircle = (): TestResult => {
  const lhs = webToMatrix(wCircle);
  return {
    result: math.deepEqual(lhs, [[3]]),
    name: "circle",
  };
};

export const testNeedle = (): TestResult => {
  const lhs = webToMatrix(wNeedle);
  return {
    result: math.deepEqual(lhs, [[0, 0, 0]]),
    name: "needle",
  };
};

export const testIH = (): TestResult => {
  const lhs = math.add(
    webToMatrix(wI),
    webToMatrix(new Web([[WG.Cap], [WG.Cup]]))
  );
  const rhs = math.add(webToMatrix(wH), webToMatrix(new Web([[WG.Id, WG.Id]])));
  return {
    result: math.deepEqual(lhs, rhs),
    name: "I=H",
  };
};

export const runTests = () => {
  return [
    {
      name: "Isotopy relations",
      tests: [testZigZag(), testCupSlide1(), testCupSlide2()],
    },
    {
      name: "Generating relations",
      tests: [testCircle(), testNeedle(), testIH()],
    },
  ];
};
