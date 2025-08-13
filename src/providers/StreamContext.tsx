"use client";

import { createContext, useContext } from "react";

// Using a broad type to avoid circular type dependencies with the provider implementation.
// The hook remains runtime-safe by validating the presence of the context value.
export type StreamContextType = any;

export const StreamContext = createContext<StreamContextType | undefined>(
  undefined,
);

export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;
