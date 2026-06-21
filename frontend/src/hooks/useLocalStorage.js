import { useEffect, useState } from "react";

function readStored(key, initialValue) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return initialValue;
    try {
      return JSON.parse(stored);
    } catch {
      return stored;
    }
  } catch {
    return initialValue;
  }
}

function writeStored(key, value) {
  if (typeof value === "string") {
    localStorage.setItem(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStored(key, initialValue));

  useEffect(() => {
    writeStored(key, value);
  }, [key, value]);

  return [value, setValue];
}
