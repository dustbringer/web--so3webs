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

import { GlobalContext } from "../context/GlobalContext";
import Layout from "../components/layout/Layout";
import useSessionStorage from "../hooks/useSessionStorage";
import {
  webGenTextToText,
  parseInputWeb,
  parseInputGraph,
  webToOutput,
} from "../scripts/graph-web-matrix/checkinput";
import graphToWeb from "../scripts/graph-web-matrix/PlanarGraph/planarGraphToWeb";
import { WebGenerator as WG } from "../scripts/graph-web-matrix/Web";
import webToMatrix from "../scripts/graph-web-matrix/Web/webToMatrix";

type Mode = "g->w" | "g->m" | "w" | "w->m";

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

  const [mode, setMode] = React.useState<Mode>("g->w");
  const [displayMode, setDisplayMode] = React.useState<Mode>("g->w");
  const [flatten, setFlatten] = React.useState<boolean>(true);
  const [webComputerOutput, setWebComputerOutput] =
    React.useState<boolean>(false);

  const [infoOpen, setInfoOpen] = React.useState<boolean>(false);

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
      switch (mode) {
        case "g->w": {
          let graph = parseInputGraph(JSON.parse(input));
          if (flatten) graph = graph.flatten();

          const output = webToOutput(graphToWeb(graph), webComputerOutput);
          setOutput(output);
          break;
        }
        case "g->m": {
          let graph = parseInputGraph(JSON.parse(input));
          if (flatten) graph = graph.flatten();

          const matrix = webToMatrix(graphToWeb(graph));
          setOutput(matrixArrayToLatex(matrix));
          break;
        }
        case "w": {
          let web = flatten
            ? parseInputWeb(input).flatten()
            : parseInputWeb(input);

          const output = webToOutput(web, webComputerOutput);
          setOutput(output);
          break;
        }
        case "w->m": {
          let web = flatten
            ? parseInputWeb(input).flatten()
            : parseInputWeb(input);

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
  const onRun = () => {
    parseInput();
  };

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
            onClick={onRun}
            title="Run"
          >
            <DirectionsRunIcon />
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box>
            <IconButton
              sx={{ margin: "0 5px" }}
              size="small"
              onClick={() => setInfoOpen(true)}
            >
              <InfoIcon />
            </IconButton>
            <ToggleButtonGroup
              size="small"
              value={mode}
              onChange={handleChange}
              exclusive
            >
              <ToggleButtonLowercase value="g->w" disableRipple>
                <InlineMath>{`\\text{graph} \\to \\text{web}`}</InlineMath>
              </ToggleButtonLowercase>
              <ToggleButtonLowercase value="g->m" disableRipple>
                <InlineMath>{`\\text{graph} \\to \\text{matrix}`}</InlineMath>
              </ToggleButtonLowercase>
              <ToggleButtonLowercase value="w" disableRipple>
                <InlineMath>{`\\text{web}`}</InlineMath>
              </ToggleButtonLowercase>
              <ToggleButtonLowercase value="w->m" disableRipple>
                <InlineMath>{`\\text{web} \\to \\text{matrix}`}</InlineMath>
              </ToggleButtonLowercase>
            </ToggleButtonGroup>
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={flatten}
                  onClick={() => setFlatten((b) => !b)}
                />
              }
              label="Flatten"
              sx={{ margin: "0 5px" }}
            />
            {mode.slice(-1) === "w" && (
              // Display if output is a web
              <FormControlLabel
                control={
                  <Checkbox
                    checked={webComputerOutput}
                    onClick={() => setWebComputerOutput((b) => !b)}
                  />
                }
                label="Computer Output"
                sx={{ margin: "0 5px" }}
              />
            )}
          </Box>
        </Box>
        {displayMode === "g->w" || displayMode === "w" ? (
          <>
            <pre style={{ whiteSpace: "pre-wrap" }}>{output}</pre>
          </>
        ) : displayMode === "g->m" || displayMode === "w->m" ? (
          <>
            <MathJax>{output}</MathJax>
          </>
        ) : (
          output
        )}
      </Layout>

      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        {info[mode]}
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const info = {
  "g->w": (
    <>
      <DialogTitle>{"Graph to Web"}</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          Translates a "web" in graph form to web form.
        </DialogContentText>
        <DialogContentText gutterBottom>
          Input is JSON with entries:
          <ul>
            <li>
              <code>"top"</code>: vertex[]
            </li>
            <li>
              <code>"bot"</code>: vertex[]
            </li>
            <li>
              <code>"vertices"</code>: [vertex, vertex[]]
            </li>
          </ul>
          where vertex is either a string or an integer. The entry "vertices" is
          a pair of a vertex and its neighbours. The program expects this to be
          a planar embedding such that "top" and "bot" are order left to right,
          and neighbours of vertices are in clockwise order. Furthermore, the
          vertices must be of degree 3 except those in "top" and "bot" which
          have degree 1. Other inputs will either error or give undefined.
        </DialogContentText>
        <DialogContentText gutterBottom>
          Output is a human readable web, displayed as if drawn out (albeit not
          nicely); the bottom is the domain and the top is the codomain. More
          specifically, each new line is a string of generators: i,u,n,m,s,
          these are tensored together. Each new line stacks below the previous
          ones. Select "Computer Output" for output to use in other programs; in
          this case it is a list of rows (from bottom to top) where each row is
          a list of generators in the order you would expect.
        </DialogContentText>
        <hr />
        <DialogContentText gutterBottom>
          Corresponding web symbols:
          <ul>
            <li>
              <code>i</code>: identity
            </li>
            <li>
              <code>u</code>: cup
            </li>
            <li>
              <code>n</code>: cap
            </li>
            <li>
              <code>m</code>: merge
            </li>
            <li>
              <code>s</code>: split
            </li>
          </ul>
        </DialogContentText>
        <DialogContentText>
          <em>Flatten</em>: bend the output of the web into inputs using cups
          and caps
        </DialogContentText>
      </DialogContent>
    </>
  ),
  "g->m": (
    <>
      <DialogTitle>{"Graph to Matrix"}</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          Translates a "web" in graph form to its corresponding matrix.
        </DialogContentText>
        <DialogContentText gutterBottom>
          Input is JSON with entries:
          <ul>
            <li>
              <code>"top"</code>: vertex[]
            </li>
            <li>
              <code>"bot"</code>: vertex[]
            </li>
            <li>
              <code>"vertices"</code>: [vertex, vertex[]]
            </li>
          </ul>
          where vertex is either a string or an integer. The entry "vertices" is
          a pair of a vertex and its neighbours. The program expects this to be
          a planar embedding such that "top" and "bot" are order left to right,
          and neighbours of vertices are in clockwise order. Furthermore, the
          vertices must be of degree 3 except those in "top" and "bot" which
          have degree 1. Other inputs will either error or give undefined.
        </DialogContentText>
        <DialogContentText gutterBottom>
          Output is a matrix. (You may need to fiddle around a bit for MathJax
          to display it properly.)
        </DialogContentText>
        <hr />
        <DialogContentText>
          <em>Flatten</em>: bend the output of the web into inputs using cups
          and caps
        </DialogContentText>
      </DialogContent>
    </>
  ),
  w: (
    <>
      <DialogTitle>{"Web"}</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          Input is a human readable web, displayed as if drawn out (albeit not
          nicely); the bottom is the domain and the top is the codomain. More
          specifically, each new line is a string of generators: i,u,n,m,s,
          these are tensored together. Each new line stacks below the previous
          ones.
        </DialogContentText>
        <DialogContentText gutterBottom>
          Output is human readable web as with input. Select "Computer Output"
          for output to use in other programs; in this case it is a list of rows
          (from bottom to top) where each row is a list of generators in the
          order you would expect.
        </DialogContentText>
        <hr />
        <DialogContentText gutterBottom>
          Corresponding symbols:
          <ul>
            <li>
              <code>i</code>: identity
            </li>
            <li>
              <code>u</code>: cup
            </li>
            <li>
              <code>n</code>: cap
            </li>
            <li>
              <code>m</code>: merge
            </li>
            <li>
              <code>s</code>: split
            </li>
          </ul>
        </DialogContentText>
        <DialogContentText>
          <em>Flatten</em>: bend the output of the web into inputs using cups
          and caps
        </DialogContentText>
      </DialogContent>
    </>
  ),
  "w->m": (
    <>
      <DialogTitle>{"Web to Matrix"}</DialogTitle>
      <DialogContent>
        <DialogContentText gutterBottom>
          Input is a human readable web, displayed as if drawn out (albeit not
          nicely); the bottom is the domain and the top is the codomain. More
          specifically, each new line is a string of generators: i,u,n,m,s,
          these are tensored together. Each new line stacks below the previous
          ones.
        </DialogContentText>
        <DialogContentText gutterBottom>
          Output is a matrix. (You may need to fiddle around a bit for MathJax
          to display it properly.)
        </DialogContentText>
        <hr />
        <DialogContentText gutterBottom>
          Corresponding web symbols:
          <ul>
            <li>
              <code>i</code>: identity
            </li>
            <li>
              <code>u</code>: cup
            </li>
            <li>
              <code>n</code>: cap
            </li>
            <li>
              <code>m</code>: merge
            </li>
            <li>
              <code>s</code>: split
            </li>
          </ul>
        </DialogContentText>
        <DialogContentText>
          <em>Flatten</em>: bend the output of the web into inputs using cups
          and caps
        </DialogContentText>
      </DialogContent>
    </>
  ),
};

export default TranslatorPage;
