import { useEffect, useRef } from "react";

export function useAutoScroll(dependencies) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
