import * as React from "react";
import "./global.css";
import "katex/dist/katex.min.css";

import { createHashRouter, RouterProvider } from "react-router-dom";
import { createTheme, ThemeOptions, ThemeProvider } from "@mui/material/styles";
import themeLight from "./theme/theme";
import { MathJaxContext } from "better-react-mathjax";
import { HelmetProvider } from "react-helmet-async";

import GlobalProvider from "./context/GlobalContext";
import ErrorPage from "./error-page";
import Root from "./routes/Root";
import TranslatorPage from "./routes/Translator";
import RandomPage from "./routes/Random";

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/translator",
    element: <TranslatorPage />,
  },
  {
    path: "/random",
    element: <RandomPage />,
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
    <GlobalProvider>
      <ThemeProvider theme={theme}>
        <HelmetProvider>
          <MathJaxContext config={config}>
            <RouterProvider router={router} />
          </MathJaxContext>
        </HelmetProvider>
      </ThemeProvider>
    </GlobalProvider>
  );
}

export default App;
