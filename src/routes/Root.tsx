import * as React from "react";
import { Helmet } from "react-helmet-async";

import Layout from "../components/layout/Layout";

function RootPage() {
  return (
    <>
      <Helmet>
        <title>SO(3) Webs</title>
      </Helmet>
      <Layout>Root</Layout>
    </>
  );
}

export default RootPage;
