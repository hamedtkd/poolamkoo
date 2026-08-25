export function premiumToNavPercent(priceToman: number, navToman?: number) {
  if (!(priceToman > 0) || !(navToman && navToman > 0)) return null;
  return ((priceToman - navToman) / navToman) * 100;
}
