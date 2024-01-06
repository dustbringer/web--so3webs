import React from "react";
import { styled } from "@mui/material/styles";
import Navbar from "../Navbar";
import Footer from "../Footer";
import Alerts from "../Alerts";

import Container from "../Container";

const DivRoot = styled("div")`
  position: relative;
  min-height: 99vh;
  font-size: 16px;
`;

const DivContent = styled("div")`
  padding: 2vh 0 calc(2vh + 30px);
`;

export function LayoutBare(props: React.PropsWithChildren) {
  return (
    <DivRoot>
      <Navbar />
      <DivContent>{props.children}</DivContent>
      <Footer />
      <Alerts />
    </DivRoot>
  );
}

function LayoutContainer(props: React.PropsWithChildren) {
  return (
    <LayoutBare>
      <Container maxWidth="md">{props.children}</Container>
    </LayoutBare>
  );
}

export default LayoutContainer;
