import * as React from "react";

const useLocalStorage = (
  key: string,
  defaultValue: string
): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const [value, setValue] = React.useState<string>(() => {
    let currentValue;
    try {
      currentValue = localStorage.getItem(key) || String(defaultValue);
    } catch (error) {
      currentValue = defaultValue;
    }
    return currentValue;
  });

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

export default useLocalStorage;
