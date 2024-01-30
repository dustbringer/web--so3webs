export enum WebGenerator {
  Id, // 0
  Cup, // 1
  Cap, // 2
  Merge, // 3
  Split, // 4
}

export function inputSize(webGrid: WebGenerator[]): number {
  return webGrid.reduce((acc, cur) => {
    switch (cur) {
      case WebGenerator.Id:
        return acc + 1;
      case WebGenerator.Cup:
        return acc + 0;
      case WebGenerator.Cap:
        return acc + 2;
      case WebGenerator.Merge:
        return acc + 2;
      case WebGenerator.Split:
        return acc + 1;
      default:
        return acc;
    }
  }, 0);
}

export const outputSize = (webGrid: WebGenerator[]): number =>
  webGrid.reduce((acc, cur) => {
    switch (cur) {
      case WebGenerator.Id:
        return acc + 1;
      case WebGenerator.Cup:
        return acc + 2;
      case WebGenerator.Cap:
        return acc + 0;
      case WebGenerator.Merge:
        return acc + 1;
      case WebGenerator.Split:
        return acc + 2;
      default:
        return acc;
    }
  }, 0);

class Web {
  // first is input, last is output
  web: WebGenerator[][];

  constructor(w?: WebGenerator[][]) {
    if (w === undefined) {
      this.web = [];
    } else {
      // Check that the inputted web is valid
      for (let i = 0; i < w.length - 1; i++) {
        if (outputSize(w[i]) !== inputSize(w[i + 1]))
          throw new Error(
            `Web constructor Error: output of row ${i} does not match input of row ${
              i + 1
            }.`
          );
      }
      this.web = w;
    }
  }

  get height() {
    return this.web.length;
  }

  // Number of strands in input
  get input() {
    if (this.web.length > 0) return inputSize(this.web[0]);
    else return 0;
  }

  // Number of strands in output
  get output() {
    if (this.web.length > 0) return outputSize(this.web[this.web.length - 1]);
    else return 0;
  }

  // // Vertical concatenation
  // concatV(w: Web) {
  //   if (this.output === w.input) return new Web(this.web.concat(w.web));
  // }

  // // Horizontal concatenation (on the right)
  // concatH(w: Web) {
  //   const maxW = this.height > w.height ? this : w;
  //   const minW = this.height > w.height ? w : this;

  //   maxW.web.map((r, i) =>
  //     // Pad the smaller one's output with id
  //     r.concat(minW.height > i ? minW.web[i] : createIds(minW.output))
  //   );
  // }

  flatten(): Web {
    const topWidth = this.output;
    let web = this.web.map((r) => [...r]); // copy the web
    if (this.output === 0) return new Web(web);

    // Pad everything with id on the right
    web = web.map((r) => [...r, ...createIds(topWidth)]);
    for (let i = 1; i <= topWidth; i++) {
      const nIds = topWidth - i;
      web.push([...createIds(nIds), WebGenerator.Cap, ...createIds(nIds)]);
    }
    return new Web(web);
  }
}

// Creates list of Id's
export const createIds = (n: number): WebGenerator[] =>
  Array<WebGenerator>(n).fill(WebGenerator.Id);

export default Web;
