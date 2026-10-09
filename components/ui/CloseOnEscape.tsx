"use client";

import { useEffect } from "react";

/** Render inside an open dialog: Escape calls onClose. Renders nothing. */
export default function CloseOnEscape({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return null;
}
