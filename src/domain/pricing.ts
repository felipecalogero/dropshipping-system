import { contributionCents } from "./money";

export type Category = "bed" | "travel" | "feeding" | "grooming" | "home";

const BANDS: Record<Category, { min: number; max: number }> = {
  bed: { min: 3500, max: 6900 },
  travel: { min: 3000, max: 6500 },
  feeding: { min: 1500, max: 2800 },
  grooming: { min: 2900, max: 6900 },
  home: { min: 2000, max: 4900 },
};

export type PriceSettings = {
  minContributionCents: number;
  adContributionCents: number;
};

export const BAND_REFERENCE: Record<Category, string> = {
  bed: "Beautyrest, US$ 69,99",
  travel: "varejo típico, US$ 65",
  feeding: "comedouro lento, US$ 28",
  grooming: "kit caseiro, US$ 69",
  home: "acessório de casa, US$ 49",
};

export function bandFor(category: Category): { min: number; max: number } {
  return BANDS[category];
}

export function pricePlace(
  category: Category,
  priceCents: number,
  shippingCents: number,
): "meio" | "minimo" {
  const band = BANDS[category];
  const total = priceCents + shippingCents;
  const mid = Math.round((band.min + band.max) / 2);
  return Math.abs(total - band.min) < Math.abs(total - mid) ? "minimo" : "meio";
}

export function proposePriceCents(
  category: Category,
  supplierCostCents: number,
  shippingCents: number,
  settings: PriceSettings,
): number | null {
  const band = BANDS[category];
  const midTotal = Math.round((band.min + band.max) / 2);
  const candidates = [midTotal - shippingCents, band.min - shippingCents];
  for (const priceCents of candidates) {
    if (priceCents <= 0) continue;
    const total = priceCents + shippingCents;
    if (total < band.min || total > band.max) continue;
    const contribution = contributionCents({
      priceCents,
      shippingCents,
      supplierCostCents,
    });
    if (contribution >= settings.minContributionCents) return priceCents;
  }
  return null;
}

type GateInput = {
  category: Category;
  priceCents: number;
  shippingCents: number;
  supplierCostCents: number;
  usStock: number;
  photoConfirmed: boolean;
  hasQuote: boolean;
  settings: PriceSettings;
};

function inBand(input: GateInput): boolean {
  const total = input.priceCents + input.shippingCents;
  const band = BANDS[input.category];
  return total >= band.min && total <= band.max;
}

export function canActivate(input: GateInput): boolean {
  if (input.usStock <= 0 || !input.photoConfirmed || !input.hasQuote) return false;
  if (!inBand(input)) return false;
  return contributionCents(input) >= input.settings.minContributionCents;
}

export function adEligible(input: GateInput): boolean {
  if (!canActivate(input)) return false;
  return contributionCents(input) >= input.settings.adContributionCents;
}
