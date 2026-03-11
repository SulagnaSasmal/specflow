import type { SpecFlowConfig } from "@/types/config";
import { DEFAULT_CONFIG } from "@/types/config";

/**
 * Deep-merges config with defaults.
 * Works in both browser (from uploaded text) and Node (from file path).
 */
export function mergeConfig(partial: Partial<SpecFlowConfig>): Required<SpecFlowConfig> {
  return {
    branding: { ...DEFAULT_CONFIG.branding, ...partial.branding },
    features: { ...DEFAULT_CONFIG.features, ...partial.features },
    compliance: { ...DEFAULT_CONFIG.compliance, ...partial.compliance },
    ai: { ...DEFAULT_CONFIG.ai, ...partial.ai },
    export: { ...DEFAULT_CONFIG.export, ...partial.export },
  };
}

/**
 * Parse a YAML or JSON config string into a validated SpecFlowConfig.
 * Returns merged-with-defaults config.
 */
export async function parseConfig(
  text: string
): Promise<{ config: Required<SpecFlowConfig>; error: string | null }> {
  try {
    let raw: unknown;
    const trimmed = text.trim();

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      raw = JSON.parse(trimmed);
    } else {
      const yaml = (await import("js-yaml")).default;
      raw = yaml.load(trimmed);
    }

    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return {
        config: mergeConfig({}),
        error: "Config must be a YAML or JSON object.",
      };
    }

    return { config: mergeConfig(raw as Partial<SpecFlowConfig>), error: null };
  } catch (err) {
    return {
      config: mergeConfig({}),
      error: err instanceof Error ? err.message : "Failed to parse config",
    };
  }
}

/**
 * Apply branding config: inject CSS variable overrides and favicon updates.
 * Safe to call multiple times; only runs in browser.
 */
export function applyBranding(config: Required<SpecFlowConfig>) {
  if (typeof document === "undefined") return;

  const { accent, favicon } = config.branding;

  if (accent) {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-hover", accent);
  }

  if (favicon) {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }
}
