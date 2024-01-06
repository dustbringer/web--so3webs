import React from "react";
import { styled } from "@mui/material/styles";
import { Link as ReactRouterLink } from "react-router-dom";

const StyledLink = styled(ReactRouterLink)`
  font-weight: 600;
  color: ${(props) => props.theme.palette.primary.main};
  text-decoration: none;
  transition: all 0.25s ease-in-out;
  &:hover {
    text-decoration: underline;
  }
`;

function Link(props: React.PropsWithChildren<{ to: string }>) {
  return <StyledLink {...props} />;
}

const NoStyleLink = styled(ReactRouterLink)`
  font-weight: normal;
  color: ${(props) =>
    props.theme.palette.mode === "dark"
      ? props.theme.palette.text.primary
      : props.theme.palette.secondary.main};
  text-decoration: none;
  transition: all 0.25s ease-in-out;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:hover,
  &:active {
    text-decoration: none;
  }
`;

export function LinkBare(props: React.PropsWithChildren<{ to: string }>) {
  return <NoStyleLink {...props}></NoStyleLink>;
}

export default Link;
