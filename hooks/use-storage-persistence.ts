"use client";

import { useEffect, useState } from "react";

type PersistenceState = "checking" | "persistent" | "best-effort" | "unsupported";

export function useStoragePersistence() {
  const [state, setState] = useState<PersistenceState>("checking");
  useEffect(() => {
    let active = true;
    if (!navigator.storage?.persisted) {
      queueMicrotask(() => { if (active) setState("unsupported"); });
      return () => { active = false; };
    }
    navigator.storage.persisted()
      .then((persisted) => { if (active) setState(persisted ? "persistent" : "best-effort"); })
      .catch(() => { if (active) setState("best-effort"); });
    return () => { active = false; };
  }, []);
  return state;
}
