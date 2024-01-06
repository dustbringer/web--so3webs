import * as React from "react";

const useSessionStorage = (
  key: string,
  defaultValue: string
): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const [value, setValue] = React.useState<string>(() => {
    let currentValue;
    try {
      currentValue = sessionStorage.getItem(key) || String(defaultValue);
    } catch (error) {
      currentValue = defaultValue;
    }
    return currentValue;
  });

  React.useEffect(() => {
    sessionStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

export default useSessionStorage;
