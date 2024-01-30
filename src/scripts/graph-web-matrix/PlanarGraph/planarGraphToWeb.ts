import * as G from ".";
import PlanarGraph from ".";
import * as W from "../Web";
import Web from "../Web";
import { WebGenerator as WG } from "../Web";

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
          g.bot[i],
          false
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

  // Check if the remaining bot is useless

  return [new PlanarGraph(g.top, newBot, newEdges), retRow];
};

// Follow one edge from "top" to construct first level of web
const graphToWebTop = (g: PlanarGraph): [PlanarGraph, WG[]] => {
  let newTop: G.Vertex[] = [];
  let newEdges: G.VertexData[] = [...g.edges.entries()];
  const retRow: WG[] = [];

  // Follow one edge from top (neighbours should be size 1 arrays, as top has deg=1)
  let i = 0;
  while (i < g.top.length) {
    const topNext = g.top.map((v) => g.neighbours(v));
    // Neighbours of the cur and next vertices in top
    let curN = g.neighbours(g.top[i])[0];
    let nxtN = i + 1 < g.top.length ? g.neighbours(g.top[i + 1])[0] : undefined;

    console.log(curN, g.top[i + 1]);
    // Cases
    switch (true) {
      case curN === g.top[i + 1]:
        // Cup

        retRow.push(WG.Cup);

        // no new top vertices are added

        newEdges = removeEdge(newEdges, [g.top[i], g.top[i + 1]]);

        i = i + 2;
        break;
      case curN === nxtN:
        // Split

        retRow.push(WG.Split);

        newTop.push(curN);

        newEdges = removeEdge(newEdges, [g.top[i], curN]);
        newEdges = removeEdge(newEdges, [g.top[i + 1], curN]);

        i = i + 2;
        break;
      case !g.bot.includes(curN) &&
        !topNext
          .filter((_, j) => j != i)
          .flat()
          .includes(curN) &&
        !g.top.includes(curN):
        // Merge

        retRow.push(WG.Merge);

        // Prefix names with "_" to avoid name clashes with new vertices
        g = new PlanarGraph(
          ...prefixVertices(g.top, g.bot, [...g.edges.entries()])
        );
        [, newTop, newEdges] = prefixVertices([], newTop, newEdges);
        curN = `_${curN}`;
        nxtN = nxtN && `_${nxtN}`;
        // Remove old edges/vertices, add two edges for new top's
        const otherNbrs = cycleFrom(
          PlanarGraph.neighbours(curN, newEdges),
          g.top[i],
          true
        );
        const [_edges, _vertices] = splitVertex(
          removeEdge(newEdges, [g.top[i], curN]),
          curN,
          otherNbrs
        );
        newTop = newTop.concat(_vertices);
        newEdges = _edges;

        i = i + 1;
        break;
      default:
        // Strand to bot,
        // or merges with 3-vertex following top-vertex not right after it,
        // or connected to top-vertex not right after it
        //   - "connected to top-vertex right after it" is checked in first case
        //   - we just postpone until the connected top-vertex is next to it (by putting Id)
        newTop.push(g.top[i]);

        retRow.push(WG.Id);

        // no changes to edges

        i = i + 1;
        break;
    }
  }

  return [new PlanarGraph(newTop, g.bot, newEdges), retRow];
};

const graphToWeb = (g: PlanarGraph): Web => {
  const web: WG[][] = [];
  let prefixId = 0;

  // while (g.nVertices() > 0) {
  //   console.log(web);
  //   if (g.bot.length > 0) {
  //     const [newG, botRow] = graphToWebBot(g);
  //     if (botRow.every((g) => g === WG.Id)) {
  //       // Bot is only connected to top
  //       continue;
  //     }
  //     g = newG;
  //     web.push(botRow);
  //   } else if (g.top.length > 0) {
  //     const [newG, topRow] = graphToWebTop(g);
  //     g = newG;
  //     web.unshift(topRow);
  //   }
  // }

  // "Only bottom" algorithm
  while (true) {
    const [newG, row] = graphToWebBot(g);
    console.log(newG);

    if (row.length === 0 || row.every((g) => g === WG.Id)) break;

    g = newG;
    web.push(row);
  }

  // "Only top" algorithm
  while (true) {
    const [newG, row] = graphToWebTop(g);
    console.log(newG);

    if (row.length === 0 || row.every((g) => g === WG.Id)) break;

    g = newG;
    web.unshift(row);
  }

  // (Bot and top are only connected to each other)

  /*
  Floating diagrams are difficult - will skip
  // // Remove the top and bot, but remember prefix (to deal with floating diagrams)
  // prefixId = g.bot.length;
  // g = new PlanarGraph(
  //   [],
  //   [],
  //   [...g.edges.entries()].filter((v) => v[1].length > 1)
  //   // Since top is only connected to bot, and vice versa, we only need to remove entries without 3 neighbours
  // );

  // Do floating diagrams (using bot algorithm)
  // while (g.nVertices() > 0) {
  //   g.edges.entries().next();
  // }
  // !!!!!! Seems like this is not possible without an embedding (some "boundary" vertices)
  //        since warping the graph will change the orientation of vertices
  // Maybe there is a smart way of doing this, but I'm not seeing it currently
  */

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

// Positive modulo
const mod = (n: number, m: number): number => ((n % m) + m) % m;

// Removes element and preserves cyclic order of list
const cycleFrom = <T>(arr: T[], e: T, reverse: boolean = false): T[] => {
  if (!arr.includes(e)) return arr;

  const ret = [];
  const start = arr.findIndex((v) => v === e);
  const direction = reverse ? -1 : 1;
  let i = mod(start + direction, arr.length);
  while (i !== start) {
    ret.push(arr[i]);
    i = mod(i + direction, arr.length);
  }
  return ret;
};

export default graphToWeb;
