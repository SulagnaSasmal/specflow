// SpecFlow configuration file types
// Supports: specflow.config.yaml | specflow.config.json

export interface SpecFlowConfig {
  /** Branding & visual overrides */
  branding?: {
    /** Override the API title shown in the nav (falls back to spec info.title) */
    title?: string;
    /** URL to a logo image shown in the nav panel */
    logoUrl?: string;
    /** Primary accent colour — any CSS colour value */
    accent?: string;
    /** Page favicon URL */
    favicon?: string;
    /** Footer text */
    footerText?: string;
  };

  /** Feature flags — all default to true */
  features?: {
    tryIt?: boolean;
    complianceBadges?: boolean;
    aiEnrichment?: boolean;
    qualityScore?: boolean;
    search?: boolean;
    darkMode?: boolean;
    webhooks?: boolean;
  };

  /** Compliance layer config */
  compliance?: {
    enabled?: boolean;
    /** Extra regulations beyond the built-in PCI/GDPR/HIPAA/etc set */
    customRegulations?: Record<
      string,
      { label: string; color: string }
    >;
  };

  /** AI enrichment settings */
  ai?: {
    /** Prompt prefix injected before every enrichment request */
    systemPrompt?: string;
    /** Model to use — defaults to gpt-4o-mini */
    model?: string;
  };

  /** Export / build settings */
  export?: {
    /** Output directory for static build — defaults to ./out */
    outDir?: string;
    /** Base URL prefix for GitHub Pages sub-path deployments */
    baseUrl?: string;
  };
}

export const DEFAULT_CONFIG: Required<SpecFlowConfig> = {
  branding: {},
  features: {
    tryIt: true,
    complianceBadges: true,
    aiEnrichment: true,
    qualityScore: true,
    search: true,
    darkMode: true,
    webhooks: true,
  },
  compliance: { enabled: true, customRegulations: {} },
  ai: { systemPrompt: "", model: "gpt-4o-mini" },
  export: { outDir: "./out", baseUrl: "/" },
};
