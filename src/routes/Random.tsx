import * as React from "react";
import { Helmet } from "react-helmet-async";
import { InlineMath } from "react-katex";
import { MathJax } from "better-react-mathjax";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";

import { GlobalContext } from "../context/GlobalContext";
import Layout from "../components/layout/Layout";

import { rand3Graph, evaluateGraph } from "../scripts/random-trivalent-graphs";

const scaleNormal = (r: { [k: number]: number }) => {
  const total = Object.values(r).reduce((a, b) => a + b, 0);
  const res: { [k: number]: number } = {};
  Object.keys(r).forEach((k) => {
    res[Number(k)] = r[Number(k)] / total;
  });
  return res;
};
const dict2Points = (r: { [k: number]: number }): Array<[number, number]> =>
  Object.entries(r).map(([k, v]) => [Number(k), v]);
const removeZero = (r: { [k: number]: number }) => {
  const res = { ...r };
  delete res[0];
  return res;
};
const getMean = (r: { [k: number]: number }) =>
  Object.entries(r).reduce((a, [k, v]) => Number(k) * v + a, 0) /
  Object.values(r).reduce((a, b) => a + b, 0);
const getMedian = (r: { [k: number]: number }) => {
  // Note: values of r must be strictly positive

  let [cumulative, total] = Object.entries(r).reduce(
    (acc, [k, v]) =>
      [[...acc[0], [Number(k), acc[1] + v]], acc[1] + v] as [
        Array<[number, number]>,
        number
      ],
    [[], 0] as [Array<[number, number]>, number]
  );
  cumulative.sort((a, b) => a[0] - b[0]); // ascending order sort

  // Find the middle
  for (let i = 0; i < cumulative.length; i++) {
    if (cumulative[i][1] === total / 2) {
      // total must be even
      console.log(i, cumulative[i]);
      console.log(i, cumulative[i - 1]);
      return (cumulative[i + 1][0] + cumulative[i][0]) / 2;
    } else if (cumulative[i][1] > total / 2) {
      return cumulative[i][0];
    }
  }
  return 0;
};

function RandomPage() {
  const context = React.useContext(GlobalContext);
  const { showError, showSuccess } = context || {
    // Default values if context is null
    showError: () => {},
    showSuccess: () => {},
  };

  const [chbxIgnoreZero, setChbxIgnoreZero] = React.useState(false);
  const [loops, setLoops] = React.useState(5000);
  const [vertices, setVertices] = React.useState(10);

  const [results, setResults] = React.useState<{ [v: number]: number }>({});
  const [mean, setMean] = React.useState(0);
  const [median, setMedian] = React.useState(0);

  React.useEffect(() => {
    setMean(getMean(chbxIgnoreZero ? removeZero(results) : results));
    setMedian(getMedian(chbxIgnoreZero ? removeZero(results) : results));
  }, [results, chbxIgnoreZero]);

  const run = () => {
    console.log(`Loops: ${loops}`);
    const output = { ...results };
    for (let i = 0; i < loops; i++) {
      // console.log("============", i);
      const resG = rand3Graph(vertices * 2);
      // console.log(resG);
      const resN = evaluateGraph(resG);
      // console.log(resN);
      if (!output[resN]) output[resN] = 0;
      output[resN] += 1;
    }
    console.log(`Results: `, output);
    setResults(output);
  };

  return (
    <>
      <Helmet>
        <title>Random | SO(3) Webs</title>
      </Helmet>
      <Layout>
        <Typography variant="h5" gutterBottom>
          Random
        </Typography>
        <Box>
          <Button onClick={() => run()} variant="contained" sx={{ mx: "5px" }}>
            Run
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={chbxIgnoreZero}
                onClick={() => setChbxIgnoreZero((b) => !b)}
              />
            }
            label="Ignore Zero"
          />
          <TextField
            label="Loops"
            type="number"
            value={loops}
            onChange={(e) =>
              Number(e.target.value) > 0 && setLoops(Number(e.target.value))
            }
          />
          <TextField
            label="Vertices / 2"
            type="number"
            value={vertices}
            onChange={(e) =>
              Number(e.target.value) > 0 && setVertices(Number(e.target.value))
            }
          />
          <ScatterChart
            width={600}
            height={300}
            xAxis={[
              {
                colorMap: {
                  type: "piecewise",
                  thresholds: [mean],
                  colors: ["#d01c8b", "#4b017f"],
                },
              },
            ]}
            // "#fdb462"
            // slotProps={{ legend: { hidden: true } }}
            series={[
              {
                data: dict2Points(
                  scaleNormal(chbxIgnoreZero ? removeZero(results) : results)
                )
                  .filter((p) => p[0] !== median)
                  .map(([x, y]) => ({
                    x,
                    y,
                    id: `${x},${y}`,
                  })),
              },
            ]}
          >
            <ChartsReferenceLine
              x={mean}
              lineStyle={{ strokeDasharray: "10 5" }}
              labelStyle={{ fontSize: "10" }}
              label={`Mean ${mean}`}
              labelAlign="start"
            />
            <ChartsReferenceLine
              x={median}
              lineStyle={{ strokeDasharray: "10 5" }}
              labelStyle={{ fontSize: "10" }}
              label={`Median ${median}`}
              labelAlign="start"
              spacing={{ x: 5, y: 20 }}
            />
          </ScatterChart>

          <ScatterChart
            width={600}
            height={300}
            xAxis={[
              {
                scaleType: "log",
                colorMap: {
                  type: "piecewise",
                  thresholds: [mean],
                  colors: ["#d01c8b", "#4b017f"],
                },
              },
            ]}
            series={[
              {
                data: dict2Points(
                  scaleNormal(chbxIgnoreZero ? removeZero(results) : results)
                ).map(([x, y]) => ({
                  x: x + 0.1,
                  y: y,
                  id: `${x},${y}`,
                })),
              },
            ]}
          >
            <ChartsReferenceLine
              x={mean}
              lineStyle={{ strokeDasharray: "10 5" }}
              labelStyle={{ fontSize: "10" }}
              label={`Mean ${mean}`}
              labelAlign="start"
            />
            <ChartsReferenceLine
              x={median}
              lineStyle={{ strokeDasharray: "10 5" }}
              labelStyle={{ fontSize: "10" }}
              label={`Median ${median}`}
              labelAlign="start"
              spacing={{ x: 5, y: 20 }}
            />
          </ScatterChart>
          <Typography>Mean: {mean}</Typography>
          <Typography>Median: {median}</Typography>
        </Box>
      </Layout>
    </>
  );
}

export default RandomPage;
