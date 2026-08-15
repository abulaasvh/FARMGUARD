// src/lib/lovable-error-reporting.ts
// Minimal placeholder for Lovable error reporting.
// In production this would send errors to the Lovable monitoring service.
// For now it simply logs to the console.

export interface ReportOptions {
  boundary?: string;
}

export function reportLovableError(error: Error, options?: ReportOptions): void {
  console.error("[Lovable] Error reported", { error, ...options });
}
