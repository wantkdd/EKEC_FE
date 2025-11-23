import { useCallback, useRef } from "react";

export function useInternalSetters() {
  const flagRef = useRef(false);
  const mark = useCallback(() => {
    flagRef.current = true;
  }, []);

  const wrap =
    <T>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (updater: React.SetStateAction<T>) => {
      mark();
      setter(updater);
    };

  return { flagRef, mark, wrap };
}
