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

import { GlobalContext } from "../context/GlobalContext";
import Layout from "../components/layout/Layout";
import useSessionStorage from "../hooks/useSessionStorage";
import {
  webGenTextToText,
  parseInputWeb,
  parseInputGraph,
} from "../scripts/graph-web-matrix/checkinput";
import graphToWeb from "../scripts/graph-web-matrix/planarGraphToWeb";
import { WebGenerator as WG } from "../scripts/graph-web-matrix/Web";
import webToMatrix from "../scripts/graph-web-matrix/webToMatrix";

type Mode = "g->w" | "g->m" | "w->m";

const matrixArrayToLatex = <T extends unknown>(matrix: T[][]): string =>
  `\\begin{pmatrix} ${matrix
    .map((r) => r.join(" & "))
    .join("\\\\")} \\end{pmatrix}`;

const ToggleButtonLowercase = (
  props: React.PropsWithChildren<{ value: string; disableRipple: boolean }>
) => (
  <ToggleButton sx={{ textTransform: "none" }} {...props}>
    {props.children}
  </ToggleButton>
);

function TranslatorPage() {
  const context = React.useContext(GlobalContext);
  const { showError, showSuccess } = context || {
    // Default values if context is null
    showError: () => {},
    showSuccess: () => {},
  };

  const [mode, setMode] = React.useState<Mode>("g->m");
  const [displayMode, setDisplayMode] = React.useState<Mode>("g->m");

  const [input, setInput] = useSessionStorage(
    "so3web-translator-input",
    `{
  "top": [],
  "bot": [],
  "vertices": []
}`
  );
  const [output, setOutput] = React.useState<string>("");

  const parseInput = async () => {
    try {
      // const output = JSON.parse(input);
      // setJson(output);
      if (mode.charAt(0) === "g") {
        const graph = parseInputGraph(JSON.parse(input));
        switch (mode) {
          case "g->w":
            setOutput(
              graphToWeb(graph)
                .web.map((r) =>
                  r
                    .map(
                      (e) =>
                        webGenTextToText[WG[e] as keyof typeof webGenTextToText]
                    )
                    .join("")
                )
                .reverse()
                .join("\n")
            );
            break;
          case "g->m":
            const matrix = webToMatrix(graphToWeb(graph));
            setOutput(matrixArrayToLatex(matrix));
            break;
        }
      } else if (mode.charAt(0) === "w") {
        const web = parseInputWeb(input);
        switch (mode) {
          case "w->m":
            const matrix = webToMatrix(web);
            setOutput(matrixArrayToLatex(matrix));
            break;
        }
      }

      setDisplayMode(mode);
      showSuccess && showSuccess("Successfully parsed");
    } catch (error) {
      if (error instanceof Error) {
        showError && showError(error.message);
      }
    }
  };

  const onClick = () => {
    parseInput().then((r) => console.log("DONE!"));
  };

  // input
  // planar graph -> web
  // planar graph -> matrix
  // web -> matrix
  //
  // option: all-domain

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: Mode
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <>
      <Helmet>
        <title>Translator | SO(3) Webs</title>
      </Helmet>
      <Layout>
        <Typography variant="h5" gutterBottom>
          Translator
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
          }}
        >
          <TextField
            label="Input"
            rows={6}
            multiline
            margin="dense"
            size="small"
            fullWidth
            autoFocus
            variant="outlined"
            inputProps={{
              style: {
                fontFamily: "Roboto Mono",
              },
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            variant="contained"
            disableRipple
            sx={{ margin: "8px", marginRight: 0 }}
            onClick={onClick}
            title="Run"
          >
            <DirectionsRunIcon />
          </Button>
        </Box>
        <ToggleButtonGroup
          size="small"
          value={mode}
          onChange={handleChange}
          exclusive
          sx={{ margin: "0 auto" }}
        >
          <ToggleButtonLowercase value="g->w" disableRipple>
            <InlineMath>{`\\text{graph} \\to \\text{web}`}</InlineMath>
          </ToggleButtonLowercase>
          <ToggleButtonLowercase value="g->m" disableRipple>
            <InlineMath>{`\\text{graph} \\to \\text{matrix}`}</InlineMath>
          </ToggleButtonLowercase>
          <ToggleButtonLowercase value="w->m" disableRipple>
            <InlineMath>{`\\text{web} \\to \\text{matrix}`}</InlineMath>
          </ToggleButtonLowercase>
        </ToggleButtonGroup>
        {displayMode === "g->w" ? (
          <>
            CODOMAIN
            <pre>{output}</pre>
            DOMAIN
          </>
        ) : displayMode === "g->m" || displayMode === "w->m" ? (
          <>
            <MathJax>{output}</MathJax>
          </>
        ) : (
          output
        )}
      </Layout>
    </>
  );
}

export default TranslatorPage;
