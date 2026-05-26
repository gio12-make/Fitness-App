/**
 * Food macro estimator.
 *
 * Priority order:
 *  1. Local USDA-sourced database  — accurate, offline, no rate limits
 *  2. Open Food Facts API          — free, no key, good for branded/packaged foods
 *  3. Rough fallback               — flagged as low-confidence
 *
 * All per-100g values sourced from USDA FoodData Central (Foundation / SR Legacy).
 */

import type { Macros } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Confidence = 'usda' | 'api' | 'estimated';

export interface EstimateResult {
  description: string;
  macros: Macros;
  estimatedBy: Confidence;
  items: { name: string; macros: Macros }[];
}

// ─── USDA database (per 100 g unless noted) ───────────────────────────────────

interface LocalEntry {
  keywords: string[];
  /** grams per single item — for count-based inputs like "3 eggs" */
  itemWeightG?: number;
  /** macros per 100 g */
  per100g: Macros;
}

const LOCAL_DB: LocalEntry[] = [
  // ── Eggs ──────────────────────────────────────────────────────────────────
  {
    keywords: ['egg white', 'egg whites'],
    itemWeightG: 33,
    per100g: { calories: 52, proteinG: 10.9, carbsG: 0.7, fatG: 0.2 },
  },
  {
    keywords: ['egg', 'eggs', 'whole egg', 'large egg'],
    itemWeightG: 50,
    // USDA #748967 — egg whole raw large
    per100g: { calories: 143, proteinG: 12.6, carbsG: 0.7, fatG: 9.5 },
  },
  {
    keywords: ['scrambled eggs', 'fried egg', 'boiled egg', 'poached egg'],
    itemWeightG: 60,
    per100g: { calories: 149, proteinG: 10.6, carbsG: 1.6, fatG: 11.0 },
  },

  // ── Chicken ───────────────────────────────────────────────────────────────
  {
    keywords: ['chicken breast', 'chicken fillet', 'chicken breasts'],
    itemWeightG: 174,
    // USDA #331960 — chicken breast raw
    per100g: { calories: 110, proteinG: 23.1, carbsG: 0, fatG: 1.2 },
  },
  {
    keywords: ['chicken thigh', 'chicken thighs'],
    itemWeightG: 113,
    per100g: { calories: 153, proteinG: 16.7, carbsG: 0, fatG: 9.4 },
  },
  {
    keywords: ['chicken drumstick', 'chicken leg'],
    itemWeightG: 110,
    per100g: { calories: 172, proteinG: 18.2, carbsG: 0, fatG: 10.8 },
  },
  {
    keywords: ['chicken mince', 'minced chicken', 'ground chicken'],
    per100g: { calories: 143, proteinG: 17.4, carbsG: 0, fatG: 8.1 },
  },
  {
    keywords: ['chicken', 'cooked chicken', 'grilled chicken', 'roast chicken'],
    per100g: { calories: 165, proteinG: 31.0, carbsG: 0, fatG: 3.6 },
  },

  // ── Turkey ────────────────────────────────────────────────────────────────
  {
    keywords: ['turkey breast', 'turkey mince', 'minced turkey', 'ground turkey'],
    per100g: { calories: 104, proteinG: 21.8, carbsG: 0, fatG: 1.7 },
  },
  {
    keywords: ['turkey'],
    per100g: { calories: 135, proteinG: 20.4, carbsG: 0, fatG: 5.5 },
  },

  // ── Beef ──────────────────────────────────────────────────────────────────
  {
    keywords: ['beef mince', 'mince beef', 'minced beef', 'ground beef', 'mince', '5% fat mince', '10% fat mince', '20% fat mince'],
    // 80% lean ground beef — USDA #174036
    per100g: { calories: 254, proteinG: 17.2, carbsG: 0, fatG: 20.0 },
  },
  {
    keywords: ['steak', 'sirloin', 'rump steak', 'ribeye', 'fillet steak'],
    per100g: { calories: 208, proteinG: 21.4, carbsG: 0, fatG: 13.0 },
  },
  {
    keywords: ['beef', 'lean beef'],
    per100g: { calories: 250, proteinG: 26.1, carbsG: 0, fatG: 15.4 },
  },

  // ── Pork ──────────────────────────────────────────────────────────────────
  {
    keywords: ['bacon rasher', 'streaky bacon', 'back bacon', 'bacon'],
    itemWeightG: 25,
    per100g: { calories: 458, proteinG: 12.5, carbsG: 0.7, fatG: 45.0 },
  },
  {
    keywords: ['pork loin', 'pork fillet', 'pork chop'],
    per100g: { calories: 133, proteinG: 22.3, carbsG: 0, fatG: 4.4 },
  },
  {
    keywords: ['sausage', 'pork sausage'],
    itemWeightG: 50,
    per100g: { calories: 301, proteinG: 11.7, carbsG: 3.2, fatG: 26.5 },
  },
  {
    keywords: ['chorizo'],
    per100g: { calories: 455, proteinG: 24.1, carbsG: 1.9, fatG: 38.6 },
  },
  {
    keywords: ['ham', 'cooked ham'],
    per100g: { calories: 145, proteinG: 20.9, carbsG: 1.5, fatG: 6.1 },
  },

  // ── Fish & Seafood ────────────────────────────────────────────────────────
  {
    keywords: ['salmon fillet', 'salmon steak', 'salmon'],
    // USDA #175167 — salmon Atlantic raw
    per100g: { calories: 142, proteinG: 19.8, carbsG: 0, fatG: 6.3 },
  },
  {
    keywords: ['tuna can', 'tuna tin', 'tinned tuna', 'canned tuna', 'tuna'],
    per100g: { calories: 116, proteinG: 25.5, carbsG: 0, fatG: 0.8 },
  },
  {
    keywords: ['cod', 'white fish', 'haddock', 'tilapia', 'pollock'],
    per100g: { calories: 82, proteinG: 17.8, carbsG: 0, fatG: 0.7 },
  },
  {
    keywords: ['prawn', 'prawns', 'shrimp'],
    per100g: { calories: 85, proteinG: 20.1, carbsG: 0.2, fatG: 0.5 },
  },
  {
    keywords: ['mackerel'],
    per100g: { calories: 205, proteinG: 18.6, carbsG: 0, fatG: 13.9 },
  },

  // ── Dairy & Eggs ──────────────────────────────────────────────────────────
  {
    keywords: ['greek yogurt', 'greek yoghurt', 'fat free greek yogurt'],
    per100g: { calories: 59, proteinG: 10.2, carbsG: 3.6, fatG: 0.4 },
  },
  {
    keywords: ['yogurt', 'yoghurt', 'natural yogurt', 'plain yogurt'],
    per100g: { calories: 61, proteinG: 3.5, carbsG: 4.7, fatG: 3.3 },
  },
  {
    keywords: ['cottage cheese'],
    per100g: { calories: 72, proteinG: 12.4, carbsG: 2.7, fatG: 1.0 },
  },
  {
    keywords: ['cheddar', 'cheddar cheese'],
    per100g: { calories: 403, proteinG: 24.9, carbsG: 1.3, fatG: 33.1 },
  },
  {
    keywords: ['mozzarella'],
    per100g: { calories: 280, proteinG: 28.0, carbsG: 3.1, fatG: 17.1 },
  },
  {
    keywords: ['cheese'],
    per100g: { calories: 371, proteinG: 23.2, carbsG: 1.2, fatG: 30.0 },
  },
  {
    keywords: ['whole milk', 'full fat milk'],
    per100g: { calories: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3 },
  },
  {
    keywords: ['semi skimmed milk', 'semi-skimmed milk'],
    per100g: { calories: 46, proteinG: 3.3, carbsG: 4.8, fatG: 1.6 },
  },
  {
    keywords: ['skimmed milk', 'skim milk'],
    per100g: { calories: 35, proteinG: 3.4, carbsG: 4.9, fatG: 0.1 },
  },
  {
    keywords: ['milk'],
    per100g: { calories: 46, proteinG: 3.3, carbsG: 4.8, fatG: 1.6 },
  },
  {
    keywords: ['oat milk'],
    per100g: { calories: 45, proteinG: 1.0, carbsG: 6.6, fatG: 1.5 },
  },
  {
    keywords: ['almond milk'],
    per100g: { calories: 15, proteinG: 0.5, carbsG: 1.3, fatG: 1.1 },
  },
  {
    keywords: ['whey protein', 'protein powder', 'protein shake'],
    itemWeightG: 30,
    per100g: { calories: 400, proteinG: 80.0, carbsG: 7.0, fatG: 5.0 },
  },

  // ── Grains & Carbs ────────────────────────────────────────────────────────
  {
    keywords: ['white rice', 'basmati rice', 'jasmine rice', 'cooked rice', 'rice'],
    // per 100g cooked — USDA
    per100g: { calories: 130, proteinG: 2.7, carbsG: 28.2, fatG: 0.3 },
  },
  {
    keywords: ['brown rice'],
    per100g: { calories: 112, proteinG: 2.6, carbsG: 23.5, fatG: 0.9 },
  },
  {
    keywords: ['pasta', 'spaghetti', 'penne', 'fusilli', 'tagliatelle'],
    // per 100g cooked
    per100g: { calories: 158, proteinG: 5.8, carbsG: 30.9, fatG: 0.9 },
  },
  {
    keywords: ['oats', 'rolled oats', 'porridge oats', 'oatmeal', 'porridge'],
    // per 100g dry oats
    per100g: { calories: 389, proteinG: 16.9, carbsG: 66.3, fatG: 6.9 },
  },
  {
    keywords: ['white bread', 'wholemeal bread', 'brown bread', 'bread slice', 'bread'],
    itemWeightG: 35,
    per100g: { calories: 265, proteinG: 9.0, carbsG: 49.0, fatG: 3.2 },
  },
  {
    keywords: ['wrap', 'tortilla', 'flatbread'],
    itemWeightG: 50,
    per100g: { calories: 300, proteinG: 8.0, carbsG: 55.0, fatG: 5.0 },
  },
  {
    keywords: ['pitta', 'pita bread'],
    itemWeightG: 60,
    per100g: { calories: 275, proteinG: 9.1, carbsG: 55.7, fatG: 1.2 },
  },
  {
    keywords: ['bagel'],
    itemWeightG: 100,
    per100g: { calories: 272, proteinG: 10.5, carbsG: 52.1, fatG: 1.7 },
  },
  {
    keywords: ['sweet potato', 'sweet potatoes'],
    per100g: { calories: 86, proteinG: 1.6, carbsG: 20.1, fatG: 0.1 },
  },
  {
    keywords: ['potato', 'potatoes', 'jacket potato', 'boiled potato', 'mashed potato'],
    per100g: { calories: 77, proteinG: 2.0, carbsG: 17.5, fatG: 0.1 },
  },
  {
    keywords: ['chips', 'french fries', 'fries'],
    per100g: { calories: 312, proteinG: 3.4, carbsG: 41.4, fatG: 15.0 },
  },

  // ── Fruits ────────────────────────────────────────────────────────────────
  {
    keywords: ['banana'],
    itemWeightG: 118,
    per100g: { calories: 89, proteinG: 1.1, carbsG: 22.8, fatG: 0.3 },
  },
  {
    keywords: ['apple'],
    itemWeightG: 182,
    per100g: { calories: 52, proteinG: 0.3, carbsG: 13.8, fatG: 0.2 },
  },
  {
    keywords: ['orange'],
    itemWeightG: 131,
    per100g: { calories: 47, proteinG: 0.9, carbsG: 11.8, fatG: 0.1 },
  },
  {
    keywords: ['blueberry', 'blueberries'],
    per100g: { calories: 57, proteinG: 0.7, carbsG: 14.5, fatG: 0.3 },
  },
  {
    keywords: ['strawberry', 'strawberries'],
    per100g: { calories: 32, proteinG: 0.7, carbsG: 7.7, fatG: 0.3 },
  },
  {
    keywords: ['mango'],
    per100g: { calories: 60, proteinG: 0.8, carbsG: 15.0, fatG: 0.4 },
  },
  {
    keywords: ['grapes'],
    per100g: { calories: 69, proteinG: 0.7, carbsG: 18.0, fatG: 0.2 },
  },

  // ── Vegetables ────────────────────────────────────────────────────────────
  {
    keywords: ['broccoli'],
    per100g: { calories: 34, proteinG: 2.8, carbsG: 7.0, fatG: 0.4 },
  },
  {
    keywords: ['spinach', 'kale'],
    per100g: { calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4 },
  },
  {
    keywords: ['tomato', 'tomatoes', 'cherry tomato'],
    per100g: { calories: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.2 },
  },
  {
    keywords: ['cucumber'],
    per100g: { calories: 15, proteinG: 0.6, carbsG: 3.6, fatG: 0.1 },
  },
  {
    keywords: ['carrot', 'carrots'],
    itemWeightG: 80,
    per100g: { calories: 41, proteinG: 0.9, carbsG: 9.6, fatG: 0.2 },
  },
  {
    keywords: ['bell pepper', 'pepper', 'capsicum'],
    itemWeightG: 120,
    per100g: { calories: 31, proteinG: 1.0, carbsG: 7.2, fatG: 0.3 },
  },
  {
    keywords: ['mushroom', 'mushrooms'],
    per100g: { calories: 22, proteinG: 3.1, carbsG: 3.3, fatG: 0.3 },
  },
  {
    keywords: ['onion', 'onions'],
    itemWeightG: 100,
    per100g: { calories: 40, proteinG: 1.1, carbsG: 9.3, fatG: 0.1 },
  },
  {
    keywords: ['courgette', 'zucchini'],
    per100g: { calories: 17, proteinG: 1.2, carbsG: 3.1, fatG: 0.3 },
  },
  {
    keywords: ['avocado', 'avo'],
    itemWeightG: 150,
    per100g: { calories: 160, proteinG: 2.0, carbsG: 8.5, fatG: 14.7 },
  },

  // ── Fats & Oils ───────────────────────────────────────────────────────────
  {
    keywords: ['olive oil'],
    per100g: { calories: 884, proteinG: 0, carbsG: 0, fatG: 100 },
  },
  {
    keywords: ['butter'],
    per100g: { calories: 717, proteinG: 0.9, carbsG: 0.1, fatG: 81.1 },
  },
  {
    keywords: ['peanut butter'],
    per100g: { calories: 588, proteinG: 25.1, carbsG: 20.1, fatG: 50.4 },
  },
  {
    keywords: ['almonds', 'almond', 'cashews', 'nuts', 'mixed nuts'],
    per100g: { calories: 579, proteinG: 21.2, carbsG: 21.7, fatG: 49.9 },
  },

  // ── Legumes ───────────────────────────────────────────────────────────────
  {
    keywords: ['lentils', 'red lentils', 'green lentils'],
    per100g: { calories: 116, proteinG: 9.0, carbsG: 20.1, fatG: 0.4 },
  },
  {
    keywords: ['chickpeas', 'chickpea'],
    per100g: { calories: 164, proteinG: 8.9, carbsG: 27.4, fatG: 2.6 },
  },
  {
    keywords: ['kidney beans', 'black beans', 'baked beans', 'beans'],
    per100g: { calories: 127, proteinG: 8.7, carbsG: 22.8, fatG: 0.5 },
  },
];

// Sort longest keyword match first
const SORTED_DB = [...LOCAL_DB].sort(
  (a, b) => Math.max(...b.keywords.map(k => k.length)) - Math.max(...a.keywords.map(k => k.length))
);

// ─── UK → US + query normalisation ───────────────────────────────────────────
const NORMALISATIONS: [RegExp, string][] = [
  [/\bmince beef\b/i,         'beef mince'],
  [/\bminced beef\b/i,        'beef mince'],
  [/\bcourgette\b/i,          'courgette'],
  [/\baubergine\b/i,          'eggplant'],
  [/\bprawns?\b/i,            'prawn'],
  [/\bporridge\b/i,           'oats'],
  [/\byoghurt\b/i,            'yogurt'],
  [/\bwholemeal\b/i,          'wholemeal'],
  [/\bskimmed milk\b/i,       'skimmed milk'],
  [/\bsemi.skimmed milk\b/i,  'semi skimmed milk'],
];

function normalise(q: string): string {
  let s = q.toLowerCase().trim();
  for (const [re, rep] of NORMALISATIONS) s = s.replace(re, rep);
  return s;
}

// ─── Input parser ─────────────────────────────────────────────────────────────
interface Parsed { query: string; grams?: number; count?: number }

function parseInput(raw: string): Parsed {
  const s = raw.trim();

  // "275g mince beef" / "275 g chicken"
  const wStart = s.match(/^(\d+(?:\.\d+)?)\s*g(?:rams?)?\s+(.+)/i);
  if (wStart) return { query: wStart[2].trim(), grams: parseFloat(wStart[1]) };

  // "mince beef 275g"
  const wEnd = s.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*g(?:rams?)?$/i);
  if (wEnd) return { query: wEnd[1].trim(), grams: parseFloat(wEnd[2]) };

  // "3 eggs" / "2 chicken breasts"
  const cnt = s.match(/^(\d+(?:\.\d+)?)\s+(.+)/);
  if (cnt) return { query: cnt[2].trim(), count: parseFloat(cnt[1]) };

  return { query: s };
}

// ─── Macro helpers ────────────────────────────────────────────────────────────
function scale(m: Macros, f: number): Macros {
  return {
    calories:  Math.round(m.calories  * f),
    proteinG:  +(m.proteinG  * f).toFixed(1),
    carbsG:    +(m.carbsG    * f).toFixed(1),
    fatG:      +(m.fatG      * f).toFixed(1),
  };
}

/** Validate that calories roughly match macro math (±25%). Returns true if sane. */
function macrosConsistent(m: Macros): boolean {
  if (m.calories === 0) return true;
  const expected = m.proteinG * 4 + m.carbsG * 4 + m.fatG * 9;
  const ratio = expected / m.calories;
  return ratio >= 0.65 && ratio <= 1.35;
}

// ─── Local database lookup ────────────────────────────────────────────────────
function localLookup(parsed: Parsed): { macros: Macros; name: string } | null {
  const q = normalise(parsed.query);

  for (const entry of SORTED_DB) {
    if (!entry.keywords.some(kw => q.includes(kw) || kw.includes(q.replace(/s$/, '')))) continue;

    let factor: number;
    if (parsed.grams !== undefined) {
      // Weight specified: scale from per-100g
      factor = parsed.grams / 100;
    } else if (parsed.count !== undefined && entry.itemWeightG) {
      // Count specified and we know item weight: e.g. 3 eggs × 50g/egg ÷ 100
      factor = (parsed.count * entry.itemWeightG) / 100;
    } else if (parsed.count !== undefined) {
      // Count specified but no known item weight: treat each as 100g
      factor = parsed.count;
    } else {
      // No quantity: assume 100g
      factor = 1;
    }

    const macros = scale(entry.per100g, factor);
    return { macros, name: entry.keywords[0] };
  }

  return null;
}

// ─── Open Food Facts API fallback ────────────────────────────────────────────
async function openFoodFactsSearch(
  query: string
): Promise<{ name: string; per100g: Macros } | null> {
  try {
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl` +
      `?search_terms=${encodeURIComponent(query)}` +
      `&action=process&json=1&page_size=5&sort_by=unique_scans_n` +
      `&fields=product_name,nutriments`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const json = await res.json();
    const products = json.products ?? [];

    for (const p of products) {
      const n = p.nutriments ?? {};
      const kcal = n['energy-kcal_100g'] ?? n['energy_100g'] ?? 0;
      const protein = n['proteins_100g'] ?? 0;
      const carbs = n['carbohydrates_100g'] ?? 0;
      const fat = n['fat_100g'] ?? 0;

      if (kcal === 0 || !p.product_name) continue;

      const per100g: Macros = {
        calories: Math.round(kcal > 900 ? kcal / 4.184 : kcal), // convert kJ if needed
        proteinG: +protein.toFixed(1),
        carbsG: +carbs.toFixed(1),
        fatG: +fat.toFixed(1),
      };

      if (!macrosConsistent(per100g)) continue;

      return { name: p.product_name as string, per100g };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function estimateFood(input: string): Promise<EstimateResult> {
  const parsed = parseInput(input.trim());
  const description =
    input.trim().charAt(0).toUpperCase() + input.trim().slice(1);

  // 1. Local USDA database
  const local = localLookup(parsed);
  if (local) {
    if (!macrosConsistent(local.macros)) {
      // Shouldn't happen with our DB but guard anyway
    }
    return {
      description,
      macros: local.macros,
      estimatedBy: 'usda',
      items: [{ name: local.name, macros: local.macros }],
    };
  }

  // 2. Open Food Facts (branded / packaged foods)
  const off = await openFoodFactsSearch(normalise(parsed.query));
  if (off) {
    const factor =
      parsed.grams !== undefined
        ? parsed.grams / 100
        : parsed.count !== undefined
        ? parsed.count
        : 1;
    const macros = scale(off.per100g, factor);
    return {
      description,
      macros,
      estimatedBy: 'api',
      items: [{ name: off.name, macros }],
    };
  }

  // 3. Low-confidence fallback
  const factor =
    parsed.grams !== undefined
      ? parsed.grams / 100
      : parsed.count ?? 1;
  const macros = scale({ calories: 150, proteinG: 10, carbsG: 15, fatG: 5 }, factor);
  return {
    description,
    macros,
    estimatedBy: 'estimated',
    items: [{ name: parsed.query, macros }],
  };
}
