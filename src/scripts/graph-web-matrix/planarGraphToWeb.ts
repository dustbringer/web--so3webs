import * as G from "./PlanarGraph";
import PlanarGraph from "./PlanarGraph";
import * as W from "./Web";
import Web from "./Web";
import { WebGenerator as WG } from "./Web";

// // TODO: Do I even need to order the top? Distances mean nothing...

// const orderTop = (top: G.Vertex[], edges: G.Edge[]): G.Vertex[] => {
//   // Measure the distance between top[0] to the others
//   // Pick the furthest one
// };

// // Dijkstra's algorithm
// const distances = (
//   v: G.Vertex,
//   edges: G.Edge[]
// ): { dest: G.Vertex; dist: number }[] => {
//   return []; // TODO:
// };

// -------------------------------------------------------------------

// Follow one edge from "bot" to construct first level of web
const graphToWebBot = (g: PlanarGraph): [PlanarGraph, WG[]] => {
  let newBot: G.Vertex[] = [];
  let newEdges: G.VertexData[] = [...g.edges.entries()];
  const retRow: WG[] = [];

  // Follow one edge from bot (neighbours should be size 1 arrays, as bot has deg=1)
  let i = 0;
  while (i < g.bot.length) {
    const botNext = g.bot.map((v) => g.neighbours(v));
    // Neighbours of the cur and next vertices in bot
    let curN = g.neighbours(g.bot[i])[0];
    let nxtN = i + 1 < g.bot.length ? g.neighbours(g.bot[i + 1])[0] : undefined;

    // Cases
    switch (true) {
      case curN === g.bot[i + 1]:
        // Cap

        retRow.push(WG.Cap);

        // no new bot vertices are added

        newEdges = removeEdge(newEdges, [g.bot[i], g.bot[i + 1]]);

        i = i + 2;
        break;
      case curN === nxtN:
        // Merge

        retRow.push(WG.Merge);

        newBot.push(curN);

        newEdges = removeEdge(newEdges, [g.bot[i], curN]);
        newEdges = removeEdge(newEdges, [g.bot[i + 1], curN]);

        i = i + 2;
        break;
      case !g.top.includes(curN) &&
        !botNext
          .filter((_, j) => j != i)
          .flat()
          .includes(curN) &&
        !g.bot.includes(curN):
        // Split

        retRow.push(WG.Split);

        // Prefix names with "_" to avoid name clashes with new vertices
        g = new PlanarGraph(
          ...prefixVertices(g.top, g.bot, [...g.edges.entries()])
        );
        [, newBot, newEdges] = prefixVertices([], newBot, newEdges);
        curN = `_${curN}`;
        nxtN = nxtN && `_${nxtN}`;
        // Remove old edges/vertices, add two edges for new bot's
        const otherNbrs = cycleFrom(
          PlanarGraph.neighbours(curN, newEdges),
          g.bot[i]
        );
        const [_edges, _vertices] = splitVertex(
          removeEdge(newEdges, [g.bot[i], curN]),
          curN,
          otherNbrs
        );
        newBot = newBot.concat(_vertices);
        newEdges = _edges;

        i = i + 1;
        break;
      default:
        // Strand to top,
        // or merges with 3-vertex following bot-vertex not right after it,
        // or connected to bot-vertex not right after it
        //   - "connected to bot-vertex right after it" is checked in first case
        //   - we just postpone until the connected bot-vertex is next to it (by putting Id)
        newBot.push(g.bot[i]);

        retRow.push(WG.Id);

        // no changes to edges

        i = i + 1;
        break;
    }
  }

  return [new PlanarGraph(g.top, newBot, newEdges), retRow];
};
// TODO: Something that create inputs quickly
// TODO: Maybe make this faster


const graphToWeb = (g: PlanarGraph): Web => {
  const web: WG[][] = [];

  // "Only bottom" algorithm
  while (true) {
    const [newG, row] = graphToWebBot(g);
    console.log(newG);

    if (row.length === 0 || row.every((g) => g === WG.Id)) break;

    g = newG;
    web.push(row);
  }

  return new Web(web);
};

// ------------------------- Helper -------------------------

const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

const partition2 = <T>(arr: T[], c1: T[], c2: T[]): [T[], T[], T[]] => {
  const partc1: T[] = [];
  const partc2: T[] = [];
  const partother: T[] = [];

  arr.forEach((e) => {
    if (c1.includes(e)) {
      partc1.push(e);
    }
    if (c2.includes(e)) {
      partc2.push(e);
    }
    if (!c1.includes(e) && !c2.includes(e)) {
      partother.push(e);
    }
  });

  return [partc1, partc2, partother];
};

const removeEdge = (
  edges: G.VertexData[],
  toRemove: G.Edge
): G.VertexData[] => {
  let ret = edges.map((e) =>
    toRemove.includes(e[0])
      ? ([
          e[0],
          e[1].filter((v) => v !== toRemove[0] && v !== toRemove[1]),
        ] as G.VertexData)
      : e
  );
  return ret.filter((e) => e[1].length > 0);
};

const removeEdges = (
  edges: G.VertexData[],
  toRemove: G.Edge[]
): G.VertexData[] => {
  toRemove.forEach((e) => (edges = removeEdge(edges, e)));
  return edges;
};

const prefixVertices = (
  top: G.Vertex[],
  bot: G.Vertex[],
  edges: G.VertexData[],
  prefix: string = "_"
): [G.Vertex[], G.Vertex[], G.VertexData[]] => [
  top.map((v) => `${prefix}${v}`),
  bot.map((v) => `${prefix}${v}`),
  edges.map((e) => [`${prefix}${e[0]}`, e[1].map((v) => `${prefix}${v}`)]),
];

// Does not guarantee no name clashes
// Please run prefixVertices beforehand to avoid this problem
// const addVertices = (
//   edges: G.VertexData[],
//   neighbours: G.Vertex[][]
// ): [G.VertexData[], G.Vertex[]] => {
//   const newVertices: G.Vertex[] = new Array(neighbours.length).map(
//     (_, i) => `v${i}`
//   );
//   const newVertexData = neighbours.map(
//     (ns, i) => [newVertices[i], ns] as G.VertexData
//   );

//   const edgesMap = new Map(edges);
//   newVertexData.forEach((vd) => {
//     vd[1].forEach((n) => {
//       const cur = edgesMap.get(n);
//     });
//   });
//   return [edges, newVertices];
// };

// Does not guarantee no name clashes
// Please run prefixVertices beforehand to avoid this problem
const splitVertex = (
  edges: G.VertexData[],
  src: G.Vertex,
  neighbours: G.Vertex[]
): [G.VertexData[], G.Vertex[]] => {
  const newVertices: G.Vertex[] = [...new Array(neighbours.length)].map(
    (_, i) => `v${i}`
  );
  const newVertexData = neighbours.map(
    (ns, i) => [newVertices[i], [ns]] as G.VertexData
  );

  neighbours.forEach((n, i) => {
    edges = edges.map((e) =>
      e[0] === n ? [e[0], e[1].map((v) => (v === src ? newVertices[i] : v))] : e
    );
  });

  // Remove src
  edges = edges.concat(newVertexData).filter((e) => e[0] !== src);

  return [edges, newVertices];
};

// Removes element and preserves cyclic order of list
const cycleFrom = <T>(arr: T[], e: T): T[] => {
  if (!arr.includes(e)) return arr;

  const ret = [];
  const start = arr.findIndex((v) => v === e);
  let i = (start + 1) % arr.length;
  while (i !== start) {
    ret.push(arr[i]);
    i = (i + 1) % arr.length;
  }
  return ret;
};

export default graphToWeb;
