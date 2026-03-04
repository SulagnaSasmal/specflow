"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ParsedSpec, ParsedOperation, OpenAPIServer } from "@/types/openapi";
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
  authToken: string | undefined;
  selectedServer: OpenAPIServer | null;
  corsProxyUrl: string | undefined;
  loadSpec: (input: string | object) => Promise<void>;
  setActiveOperation: (op: ParsedOperation | null) => void;
  setAuthToken: (token: string | undefined) => void;
  setSelectedServer: (server: OpenAPIServer | null) => void;
  setCorsProxyUrl: (url: string | undefined) => void;
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
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const [selectedServer, setSelectedServer] = useState<OpenAPIServer | null>(null);
  const [corsProxyUrl, setCorsProxyUrl] = useState<string | undefined>(undefined);

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
      // Auto-select first server
      if (parsed.servers && parsed.servers.length > 0) {
        setSelectedServer(parsed.servers[0]);
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
    setAuthToken(undefined);
    setSelectedServer(null);
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
        authToken,
        selectedServer,
        corsProxyUrl,
        loadSpec,
        setActiveOperation,
        setAuthToken,
        setSelectedServer,
        setCorsProxyUrl,
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
