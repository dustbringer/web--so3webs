import * as React from "react";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";

function RootPage() {
  return (
    <>
      {/* Redirect to translator */}
      <Navigate to="/translator" replace={true} />

      <Helmet>
        <title>SO(3) Webs</title>
      </Helmet>
      <Layout>Root</Layout>
    </>
  );
}

export default RootPage;
