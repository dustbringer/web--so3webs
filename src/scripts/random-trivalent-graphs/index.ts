/*********** Generate random graphs **************/
function rand3Graph(
  n: number,
  tryLoopless: boolean = false
  // ): Array<[[number, number], [number, number]]> {
): Array<[number, number]> {
  if (n % 2 !== 0) return []; // n needs to be even

  type Vertex = [number, number];
  type Edge = [Vertex, Vertex];

  const vEq = (x: Vertex, y: Vertex) => x[0] === y[0] && x[1] === y[1];

  // 3 vertices for each
  let vs = [...Array(n).keys()]
    .map(
      (n) =>
        [
          [n, 1],
          [n, 2],
          [n, 3],
        ] as Array<Vertex>
    )
    .flat();
  const es: Array<Edge> = [];
  const realEdges: Array<[number, number]> = [];

  while (vs.length > 0) {
    // Pick a pair
    let fst: Vertex = vs[0];
    let snd: Vertex;
    const otherVs = vs.filter((v) => v[0] !== fst[0]);
    if (tryLoopless && otherVs.length !== 0) {
      snd = randElem(otherVs);
    } else snd = randElem(vs.filter((v) => !vEq(v, fst)));
    vs = vs.filter((v) => !vEq(v, fst) && !vEq(v, snd)); // remove first and second

    // Insert pair
    es.push([fst, snd]);
    realEdges.push([fst[0], snd[0]]);
  }

  // return es;
  return realEdges;
}

/**************** Evaluate graphs *****************/

// can take non-planar graphs
function evaluateGraph(g: Array<[number, number]>): number {
  let value = 1;
  // Connected components
  const components = getConnectedComponents(g);
  for (let i = 0; i < components.length; i++) {
    value *= evaluateGraphConnected(components[i]);
    if (value === 0) return 0;
  }
  return value;
}

// Function for connected graphs
function evaluateGraphConnected(g: Array<[number, number]>): number {
  // if (isZero(g)) return 0; // checking this takes a lot of time!

  // Pick the smallest cycle and look at not-in-cycle neighbours
  const cycle = getShortestCycle(g);
  const vs = getOtherNbrs(cycle, g).flat();

  if (cycle.length === 1) {
    return 0;
  } else if (cycle.length === 2) {
    // Bigon
    if (vs.length === 0) {
      // Triple multiedge (vs.length === 0)
      return 2 * 3;
    } else {
      // Double multiedge (vs.length === 2)
      const g1 = seq(g, [removeVs(cycle), connectV(vs[0], vs[1])]);
      // return 2 * evaluateGraph(g1);
      return 2 * evaluateGraphConnected(g1);
    }
  } else if (cycle.length === 3) {
    // Triangle
    const g1 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], cycle[0]),
      connectV(vs[1], cycle[0]),
      connectV(vs[2], cycle[0]),
    ]);
    // return evaluateGraph(g1);
    return evaluateGraphConnected(g1);
  } else if (cycle.length === 4) {
    // Square (vs.length === 4)
    const g1 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], vs[1]),
      connectV(vs[2], vs[3]),
    ]);
    const g2 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], vs[3]),
      connectV(vs[1], vs[2]),
    ]);
    return evaluateGraph(g1) + evaluateGraph(g2);
  } else if (cycle.length === 5) {
    // Pentagon (vs.length === 5)
    const g1 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], vs[4]),
      connectV(vs[1], cycle[2]),
      connectV(vs[2], cycle[2]),
      connectV(vs[3], cycle[2]),
      // connectV(vs[4], vs[0]),
    ]);
    const g2 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], vs[1]),
      // connectV(vs[1], vs[0]),
      connectV(vs[2], cycle[3]),
      connectV(vs[3], cycle[3]),
      connectV(vs[4], cycle[3]),
    ]);
    const g3 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], cycle[0]),
      connectV(vs[1], cycle[0]),
      connectV(vs[2], vs[3]),
      // connectV(vs[3], vs[2]),
      connectV(vs[4], cycle[0]),
    ]);
    const g4 = seq(g, [
      removeVs([2, 3].map((i) => cycle[i])),
      connectV(vs[2], cycle[1]),
      connectV(vs[3], cycle[4]),
    ]);
    return (
      evaluateGraph(g1) +
      evaluateGraph(g2) +
      evaluateGraph(g3) -
      evaluateGraph(g4)
    );
  } else {
    // Larger than pentagon (vs.length >= 6)
    // use I=H relation
    // Note: the I=H relation reduces the face given by `cycle`.
    //       The next iteration won't undo it, as it is applied on the smallest face

    // We just use cycle[1] and cycle[2]
    const g1 = seq(g, [
      removeVs([cycle[1], cycle[2]]),
      connectV(cycle[1], cycle[0]),
      connectV(cycle[1], cycle[3]),
      connectV(cycle[1], cycle[2]),
      connectV(cycle[2], vs[1]),
      connectV(cycle[2], vs[2]),
    ]);
    const g2 = seq(g, [
      removeVs([cycle[1], cycle[2]]),
      connectV(cycle[0], cycle[3]),
      connectV(vs[1], vs[2]),
    ]);
    const g3 = seq(g, [
      removeVs([cycle[1], cycle[2]]),
      connectV(cycle[0], vs[1]),
      connectV(cycle[3], vs[2]),
    ]);
    return evaluateGraph(g1) + evaluateGraph(g2) - evaluateGraph(g3);
  }
}

function isZero(g: Array<[number, number]>): boolean {
  if (hasLoop(g)) return true; // easy check first
  return getConnectedComponents(g).some((g) => g.some((e) => isCutEdge(e, g)));
}

/**************************************************/
// Random functions

function randElem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**************************************************/
// Graph functions

function eEq(e1: [number, number], e2: [number, number]) {
  return (
    (e1[0] === e2[0] && e1[1] === e2[1]) || (e1[0] === e2[1] && e1[1] === e2[0])
  );
}

function getVs(g: Array<[number, number]>) {
  return [...new Set(g.flat())];
}

function getNbrs(
  v: number,
  g: Array<[number, number]>,
  unique: boolean = false
) {
  const n = g
    .filter((e) => e[0] === v || e[1] === v)
    .map((e) => (e[0] === v ? e[1] : e[0]));
  return !unique ? n : [...new Set(n)];
}

function getOtherNbrs(vs: Array<number>, g: Array<[number, number]>) {
  return vs.map((v) => getNbrs(v, g).filter((w) => !vs.includes(w)));
}

const removeV =
  (v: number) =>
  (g: Array<[number, number]>): Array<[number, number]> =>
    g.filter((e) => e[0] !== v && e[1] !== v);

const removeVs =
  (vs: Array<number>) =>
  (g: Array<[number, number]>): Array<[number, number]> =>
    g.filter((e) => !vs.includes(e[0]) && !vs.includes(e[1]));

const connectV =
  (v1: number, v2: number) =>
  (g: Array<[number, number]>): Array<[number, number]> =>
    [...g, [v1, v2]];

function hasLoop(g: Array<[number, number]>): boolean {
  return g.some((e) => e[0] === e[1]);
}

// Graph g must be connected for this to make sense
function isCutEdge(e: [number, number], g: Array<[number, number]>): boolean {
  // parallel edges can't be cut edges (remove parallel edges before running for better results)
  if (g.filter((f) => f[0] === e[0] && f[1] === e[1]).length >= 2) return false;
  return !isConnected(g.filter((f) => f[0] !== e[0] || f[1] !== e[1]));
}

function getConnectedComponents(
  g: Array<[number, number]>
): Array<Array<[number, number]>> {
  if (g.length === 0) return [];

  // BFS to find all reachable from one vertex
  const v = g[0][0]; // pick a vertex to start from
  const visited: { [vertex: number]: boolean } = { [v]: true };
  const queue: Array<number> = [v];
  while (queue.length > 0) {
    const cur = queue.shift() as number; // definitely not undefined
    getNbrs(cur, g, true).forEach((w) => {
      if (!visited[w]) {
        visited[w] = true;
        queue.push(w);
      }
    });
  }
  // Split off component (all edges must have both ends visited or not)
  const [component, rest] = bifilter(g, ([u, _]) => visited[u]);
  return [component, ...getConnectedComponents(rest)];
}

function isConnected(g: Array<[number, number]>): boolean {
  // Just a BFS from one vertex
  const v = g[0][0]; // pick a vertex to start from
  const visited: { [vertex: number]: boolean } = { [v]: true };
  const queue: Array<number> = [v];
  while (queue.length > 0) {
    const cur = queue.shift() as number; // definitely not undefined
    getNbrs(cur, g, true).forEach((w) => {
      if (!visited[w]) {
        visited[w] = true;
        queue.push(w);
      }
    });
  }
  // Check if connected component of edge is same as whole graph
  return Object.keys(visited).length === getVs(g).length;
}

// Shortest cycle for "looped multigraphs", can return loops or bigons from multiedges
function getShortestCycle(g: Array<[number, number]>): Array<number> {
  if (g.length === 0) return [];

  // loops
  const loops = g.filter((e) => e[0] === e[1]);
  if (loops.length > 0) return [loops[0][0]];

  // multiedges
  const multiedges = g.filter((e) => g.filter((f) => eEq(e, f)).length >= 2);
  if (multiedges.length > 0) return multiedges[0];

  // other cycles
  const vs = getVs(g);
  const cycles: Array<Array<number>> = [];
  vs.forEach((v) => {
    // BFS until you see self
    // (basically modified unweighted Dijkstra, https://stackoverflow.com/questions/8379785/how-does-a-breadth-first-search-work-when-looking-for-shortest-path#comment27820665_8379892)
    const visited: { [vertex: number]: boolean } = {};
    const parent: { [vertex: number]: number } = { [v]: NaN };
    const queue: Array<number> = [v];

    const getPath = (u: number): Array<number> => {
      const path: Array<number> = [];
      let cur = u;
      while (cur !== v) {
        path.push(cur);
        cur = parent[cur];
      }
      return path;
    };

    let minCycle: Array<number> | undefined = undefined;
    while (queue.length > 0) {
      const cur = queue.shift() as number; // definitely not undefined
      visited[cur] = true;
      getNbrs(cur, g, true).forEach((w) => {
        if (w === parent[cur]) return;
        if (!visited[w]) {
          queue.push(w);
          parent[w] = cur;
        } else {
          // Found a cycle
          const cycle = [v, ...getPath(cur).reverse(), ...getPath(w)];
          if (minCycle === undefined || cycle.length < minCycle.length)
            minCycle = cycle;
        }
      });
    }
    if (minCycle !== undefined) cycles.push(minCycle);
  });

  return cycles.reduce((min, a) => (min.length > a.length ? a : min));
}

/**************************************************/
// Helper

// Split array into pieces via function
// https://stackoverflow.com/questions/38860643/split-array-into-two-different-arrays-using-functional-javascript
const collateBy =
  <T, K, V>(f: (x: T) => K) =>
  (g: (acc: V, x: T) => V) =>
  (xs: Array<T>) => {
    return xs.reduce((m, x) => {
      let v = f(x);
      return m.set(v, g(m.get(v), x));
    }, new Map());
  };
const bifilter = <T>(
  xs: Array<T>,
  f: (x: T, i?: number, arr?: Array<T>) => boolean
) => {
  return xs.reduce(
    ([T, F], x, i, arr): [Array<T>, Array<T>] => {
      if (f(x, i, arr) === true) return [[...T, x], F];
      else return [T, [...F, x]];
    },
    [[], []] as [Array<T>, Array<T>]
  );
};

const seq = <T>(x: T, fs: Array<(x: T) => T>) => {
  fs.forEach((f) => (x = f(x)));
  return x;
};
const replaceFirst = <T>(
  arr: Array<T>,
  match: (x: T) => boolean,
  replace: T
): Array<T> =>
  arr.reduce(
    ([b, acc], x: T) =>
      b
        ? ([true, [...acc, x]] as [boolean, Array<T>])
        : match(x)
        ? ([true, [...acc, replace]] as [boolean, Array<T>])
        : ([false, [...acc, x]] as [boolean, Array<T>]),
    [false, []] as [boolean, Array<T>]
  )[1];
const removeFirst = <T>(arr: Array<T>, match: (x: T) => boolean): Array<T> =>
  arr.reduce(
    ([b, acc], x: T) =>
      b
        ? ([true, [...acc, x]] as [boolean, Array<T>])
        : match(x)
        ? ([true, acc] as [boolean, Array<T>])
        : ([false, [...acc, x]] as [boolean, Array<T>]),
    [false, []] as [boolean, Array<T>]
  )[1];

/**************************************************/

export { rand3Graph };
export { evaluateGraph };
