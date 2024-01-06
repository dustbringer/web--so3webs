import * as React from "react";
import { Helmet } from "react-helmet-async";

import Layout from "../components/layout/Layout";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

function TranslatorPage() {
  const [input, setInput] = React.useState<string>("");

  return (
    <>
      <Helmet>
        <title>Translator | SO(3) Webs</title>
      </Helmet>
      <Layout>
        <Typography variant="h5" gutterBottom>
          Translator
        </Typography>
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
      </Layout>
      ;
    </>
  );
}

export default TranslatorPage;
