import { HotelConfig } from "@/types/hotel";
import { readFileSync } from "fs";
import { join } from "path";

export async function getHotelConfig(
  slug: string
): Promise<HotelConfig | null> {
  try {
    const configPath = join(process.cwd(), "config", `${slug}.json`);
    const configFile = readFileSync(configPath, "utf8");
    return JSON.parse(configFile) as HotelConfig;
  } catch {
    console.error(`Configuration non trouvée pour l'hôtel: ${slug}`);
    return null;
  }
}

export function validateHotelSlug(slug: string): boolean {
  // Validation simple du slug (lettres, chiffres, tirets)
  return /^[a-z0-9-]+$/.test(slug);
}
