import React from "react";
import { styled } from "@mui/material/styles";
// import { useMediaQuery } from "react-responsive";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MathJax } from "better-react-mathjax";
import { InlineMath, BlockMath } from "react-katex";

import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { themePicker } from "../../theme/theme";
import { DivRowSpaceBetween } from "../styled/Divs";
import FullList from "./FullList";
import DropdownList from "./DropdownList";

import navLinks from "../../data/navLinks";

const RESPONSIVE_WIDTH = "700px";

const StyledToolbar = styled(Toolbar)`
  max-height: 100px;
  min-height: 50px;
`;

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid
    ${(props) => (props.theme.palette.mode === "dark" ? "#222" : "#EEE")};
  transition: all 0.25s ease-in-out;
`;

const TitleTypography = styled(Typography)`
  margin: auto 0;
  font-weight: bold;
  color: ${(props) =>
    props.theme.palette.mode === "dark"
      ? props.theme.palette.primary.main
      : "#424242"};
  color: ${(props) => props.theme.palette.primary.main};
  transition: all 0.25s ease-in-out;
  &:hover {
    opacity: 0.85;
  }
  @media (max-width: 600px) {
    font-size: 1.2em;
  }
  @media (max-width: 350px) {
    font-size: 0.8em;
  }
`;

const MyLink = styled(Link)`
  text-decoration: none;
  color: white;
  font-family: "Open Sans";

  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:hover,
  &:active {
    text-decoration: none;
  }
`;

const StyledDivRowSpaceBetween = styled(DivRowSpaceBetween)`
  height: 100%;
`;

const ResponsiveFullList = styled(FullList)`
  @media (max-width: ${RESPONSIVE_WIDTH}) {
    display: none;
  }
`;

const ResponsiveDropdownList = styled(DropdownList)`
  display: none;
  @media (max-width: ${RESPONSIVE_WIDTH}) {
    display: block;
  }
`;

const InlineMathSmall = (props: React.PropsWithChildren) => (
  <Box
    sx={{ fontSize: "0.9em", "& .katex, & .base": { lineHeight: 0 } }}
    component="span"
  >
    <InlineMath>{props.children}</InlineMath>
  </Box>
);

function Navbar() {
  const theme = useTheme();

  return (
    <div>
      <AppBar position="static" color="transparent" elevation={0}>
        <StyledToolbar variant="dense">
          <StyledContainer maxWidth="md">
            <MyLink to="/">
              <StyledDivRowSpaceBetween>
                <TitleTypography variant="h5" theme={theme}>
                  <InlineMathSmall>{"SO(3)"}</InlineMathSmall> Webs
                </TitleTypography>
              </StyledDivRowSpaceBetween>
            </MyLink>

            <DivRowSpaceBetween>
              {/* Nav links */}
              <ResponsiveFullList links={navLinks} />
              <ResponsiveDropdownList links={navLinks} />
            </DivRowSpaceBetween>
          </StyledContainer>
        </StyledToolbar>
      </AppBar>
    </div>
  );
}

export default Navbar;
