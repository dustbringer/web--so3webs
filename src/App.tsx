import * as React from "react";
import "./global.css";

import { createHashRouter, RouterProvider } from "react-router-dom";
import { createTheme, ThemeOptions, ThemeProvider } from "@mui/material/styles";
import themeLight from "./theme/theme";
import { MathJaxContext } from "better-react-mathjax";
import { HelmetProvider } from "react-helmet-async";

import ErrorPage from "./error-page";
import Root from "./routes/Root";
import Translator from "./routes/Translator";

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/translator",
    element: <Translator />,
  },
]);

const theme = createTheme(themeLight as ThemeOptions);

//  Mathjax config
const config = {
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <HelmetProvider>
        <MathJaxContext config={config}>
          <RouterProvider router={router} />;
        </MathJaxContext>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
