export function sparklinePoints(data: number[], width = 120, height = 48, padding = 3) {
  const clean = data.map(Number).filter(Number.isFinite);
  if (!clean.length) return "";
  if (clean.length === 1) clean.push(clean[0]);
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min || 1;
  const usableWidth = Math.max(1, width - padding * 2);
  const usableHeight = Math.max(1, height - padding * 2);
  return clean.map((value, index) => {
    const x = padding + usableWidth * (index / Math.max(1, clean.length - 1));
    const normalized = max === min ? 0.5 : (value - min) / range;
    const y = padding + usableHeight * (1 - normalized);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}
