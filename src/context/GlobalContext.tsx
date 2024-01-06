import React from "react";

import type { Alert } from "../components/Alerts";

export type Store = {
  AlertQueue: [Alert[], React.Dispatch<React.SetStateAction<Alert[]>>];
  showError: (msg: Alert["msg"]) => void;
  showSuccess: (msg: Alert["msg"]) => void;
};

export const GlobalContext = React.createContext<Store>({} as Store);
// From https://stackoverflow.com/questions/63080452/react-createcontextnull-not-allowed-with-typescript

function GlobalProvider({ children }: React.PropsWithChildren) {
  const aq = React.useState<Alert[]>([]);
  const [alertQueue, setAlertQueue] = aq;

  const store = {
    AlertQueue: aq,
    showError: (msg: Alert["msg"]) => {
      setAlertQueue((q) => [
        ...q,
        {
          type: "error",
          msg,
        },
      ]);
    },
    showSuccess: (msg: Alert["msg"]) => {
      setAlertQueue((q) => [
        ...q,
        {
          type: "success",
          msg,
        },
      ]);
    },
  };

  return (
    <GlobalContext.Provider value={store}>{children}</GlobalContext.Provider>
  );
}

export const emptyStore = () => {
  return {
    AlertQueue: [[], (a) => {}] as Store["AlertQueue"],
    showError: (msg: Alert["msg"]) => {},
    showSuccess: (msg: Alert["msg"]) => {},
  };
};

export default GlobalProvider;
