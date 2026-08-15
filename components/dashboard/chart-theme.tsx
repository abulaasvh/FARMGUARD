/**
 * Shared Recharts axis and tooltip styling that matches the FarmGuard design tokens.
 * Import `axis` as spread props on XAxis/YAxis and `tooltipStyle` on Tooltip.
 */
export const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export const tooltipStyle: React.CSSProperties = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  color: "var(--color-foreground)",
  fontSize: "12px",
};
