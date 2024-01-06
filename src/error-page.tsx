import { useRouteError } from "react-router-dom";
import Layout from "./components/layout/Layout";

import Typography from "@mui/material/Typography";

type Error = {
  statusText?: string;
  message: string;
};

function ErrorPage() {
  const error = useRouteError() as Error;

  return (
    <Layout>
      <Typography gutterBottom variant="h6">
        Oops! An unexpected error has occurred:
      </Typography>
      <Typography>
        <i>{error.statusText || error.message}</i>
      </Typography>
    </Layout>
  );
}

export default ErrorPage;
