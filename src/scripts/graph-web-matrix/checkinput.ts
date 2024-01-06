import PlanarGraph from "./PlanarGraph";
import { WebGenerator as WG } from "./Web";
import Web from "./Web";

export const textToWebGen = Object.freeze({
  i: WG.Id,
  u: WG.Cup,
  n: WG.Cap,
  s: WG.Split,
  m: WG.Merge,
});

export const webGenTextToText = Object.freeze({
  Id: "i",
  Cup: "u",
  Cap: "n",
  Split: "s",
  Merge: "m",
});

export const checkInputWeb = (input: string): boolean => {
  return /^([iunsmIUNSM]*\s*)*$/.test(input.trim());
};

export const parseInputWeb = (input: string, reverse: boolean = false): Web => {
  if (!checkInputWeb(input))
    throw new Error("Error in parseInputWeb: Invalid input");
  let split = input
    .trim()
    .split(/[\r\n]+/)
    .filter((s) => !/^\s*$/.test(s)) // ignores multiple new lines
    .map((s) => s.split("")) as ("i" | "u" | "n" | "s" | "m")[][];
  if (!reverse) split = split.reverse();
  return new Web(split.map((split2) => split2.map((s) => textToWebGen[s])));
};

export const checkInputGraph = (input: any): boolean =>
  // Is an object
  typeof input === "object" &&
  !Array.isArray(input) &&
  input !== null &&
  // Has top bot and vertices
  input.hasOwnProperty("top") &&
  input.hasOwnProperty("bot") &&
  input.hasOwnProperty("vertices") &&
  // Top and bot are arrays
  Array.isArray(input["top"]) &&
  Array.isArray(input["bot"]) &&
  // Vertices is an array of pairs
  input["vertices"].every(
    (v: any) => Array.isArray(v) && v.length === 2 && Array.isArray(v[1])
  );

export const parseInputGraph = (input: any): PlanarGraph => {
  if (!checkInputGraph(input))
    throw new Error("Error in parseInputGraph: Invalid input");
  return new PlanarGraph(input.top, input.bot, input.vertices);
};
