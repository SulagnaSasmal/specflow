"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ParsedSpec, ParsedOperation } from "@/types/openapi";
import { parseSpec } from "@/parser";
import { buildSearchIndex, createFuseInstance } from "@/search";
import Fuse from "fuse.js";
import type { SearchIndexItem } from "@/types/openapi";

interface SpecContextValue {
  spec: ParsedSpec | null;
  isLoading: boolean;
  error: string | null;
  activeOperation: ParsedOperation | null;
  searchIndex: SearchIndexItem[];
  fuse: Fuse<SearchIndexItem> | null;
  loadSpec: (input: string | object) => Promise<void>;
  setActiveOperation: (op: ParsedOperation | null) => void;
  clearSpec: () => void;
}

const SpecContext = createContext<SpecContextValue | null>(null);

export function SpecProvider({ children }: { children: React.ReactNode }) {
  const [spec, setSpec] = useState<ParsedSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOperation, setActiveOperation] = useState<ParsedOperation | null>(null);
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchIndexItem> | null>(null);

  const loadSpec = useCallback(async (input: string | object) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsed = await parseSpec(input);
      setSpec(parsed);
      const index = buildSearchIndex(parsed);
      setSearchIndex(index);
      setFuse(createFuseInstance(index));
      // Auto-select first operation
      if (parsed.operations.length > 0) {
        setActiveOperation(parsed.operations[0]);
      }
      // Persist to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("specflow-spec", typeof input === "string" ? input : JSON.stringify(input));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse spec");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSpec = useCallback(() => {
    setSpec(null);
    setActiveOperation(null);
    setSearchIndex([]);
    setFuse(null);
    setError(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("specflow-spec");
    }
  }, []);

  return (
    <SpecContext.Provider
      value={{
        spec,
        isLoading,
        error,
        activeOperation,
        searchIndex,
        fuse,
        loadSpec,
        setActiveOperation,
        clearSpec,
      }}
    >
      {children}
    </SpecContext.Provider>
  );
}

export function useSpec() {
  const ctx = useContext(SpecContext);
  if (!ctx) throw new Error("useSpec must be used within SpecProvider");
  return ctx;
}
