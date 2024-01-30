export type Vertex = string | number;
export type VertexData = [Vertex, Vertex[]];
export type Edge = [Vertex, Vertex];

// For simple undirected graphs with distinguished top and bottom vertices and vertices have ordered neighbours
class PlanarGraph {
  edges: Map<Vertex, Vertex[]>;
  top: Vertex[];
  bot: Vertex[];

  /*
  Constructor for graphs
  Args:
  - top, bot = lists of vertices on the "top and bottom" of the web
  - vertices = list of vertices and their 3 neighbours, in clockwise order of planar embedding
 */
  constructor(top: Vertex[], bot: Vertex[], vData: VertexData[]) {
    // Clean up the input: remove duplicates
    const topS = new Set(top);
    const botS = new Set(bot);
    vData = vData.map((e) => [e[0], [...new Set(e[1])]]); // Set preserves order

    this.top = [...topS];
    this.bot = [...botS];
    this.edges = new Map(vData);

    // Check: top and bot are disjoint sets and degree 1 vertices
    if ([...topS].some((v) => botS.has(v))) {
      throw new Error("Error in graph constructor: top and bot overlap");
    }
    if ([...topS, ...botS].some((v) => PlanarGraph.degree(v, vData) !== 1)) {
      throw new Error(
        "Error in graph constructor: vertices in top and bot are not degree 1"
      );
    }

    // Check: other vertices of degree 3
    if (
      vData.some((v) => !topS.has(v[0]) && !botS.has(v[0]) && v[1].length !== 3)
    ) {
      throw new Error(
        "Error in graph constructor: non-top/bottom vertices are not degree 3"
      );
    }

    // Check: both direction of vertices exist
    vData.forEach((v) => {
      v[1].forEach((w) => {
        if (!this.edges.get(w)?.includes(v[0])) {
          throw new Error(
            `Error in graph constructor: edge from "${v[0]}" to "${w}" does not have other direction`
          );
        }
      });
    });
  }

  static compareEdges(e1: Edge, e2: Edge): boolean {
    return (
      (e1[0] == e2[0] && e1[1] == e2[1]) || (e1[0] == e2[1] && e1[1] == e2[0])
    );
  }

  static neighbours(v: Vertex, vData: VertexData[]): Vertex[] {
    const foundVertices = vData.filter((e) => e[0] === v);
    return foundVertices.length > 0 ? foundVertices[0][1] : [];
  }

  static degree(v: Vertex, vData: VertexData[]): number {
    return PlanarGraph.neighbours(v, vData).length;
  }

  static nVertices(vData: VertexData[]): number {
    return vData.length;
  }

  static flatten(g: PlanarGraph): PlanarGraph {
    return new PlanarGraph(
      [],
      [...g.bot, ...g.top.reverse()],
      [...g.edges.entries()]
    );
  }

  neighbours(v: Vertex): Vertex[] {
    const neighbours = this.edges.get(v);
    return neighbours !== undefined ? neighbours : [];
  }

  degree(v: Vertex): number {
    return this.neighbours(v).length;
  }

  nVertices(): number {
    return this.edges.size;
  }

  flatten(): PlanarGraph {
    return PlanarGraph.flatten(this);
  }
}

export default PlanarGraph;
