import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import { GlobalContext } from "../context/GlobalContext";

export type Alert = { type: "error" | "success"; msg: string };

function Outer() {
  const context = React.useContext(GlobalContext);
  const { AlertQueue } = context;
  return AlertQueue === undefined ? null : <Alerts queue={AlertQueue} />;
}

function Alerts(props: {
  queue: [Alert[], React.Dispatch<React.SetStateAction<Alert[]>>];
}) {
  const [alertQueue, setAlertQueue] = props.queue;
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState("No message!");
  const [alertType, setAlertType] = React.useState<
    "error" | "info" | "success" | "warning"
  >("error");

  const setAlert = (alert: Alert) => {
    setAlertType(alert.type);
    setAlertMsg(alert.msg);
  };

  React.useEffect(() => {
    if (alertQueue && alertQueue.length !== 0) {
      setAlert(alertQueue[0]);
      setAlertOpen(true);
    }
  }, [alertQueue]);

  const handleClose = (event: Event | React.SyntheticEvent<Element, Event>) => {
    setAlertOpen(() => false);
    setAlertQueue((q) => q.slice(1));
  };

  return (
    <>
      <Snackbar
        open={alertOpen}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={handleClose}
      >
        <MuiAlert
          elevation={5}
          variant="filled"
          onClose={handleClose}
          severity={alertType}
        >
          {alertMsg}
        </MuiAlert>
      </Snackbar>
    </>
  );
}

export default Outer;
