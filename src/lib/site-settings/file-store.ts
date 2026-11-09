import { promises as fs } from "fs";
import path from "path";

import { DEFAULT_SITE_SETTINGS } from "./defaults";
import type { SiteSettings } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "site-settings.json");

export async function readFileSettings(): Promise<SiteSettings> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
      teachers: parsed.teachers?.length
        ? parsed.teachers
        : DEFAULT_SITE_SETTINGS.teachers,
      socialLinks: {
        ...DEFAULT_SITE_SETTINGS.socialLinks,
        ...parsed.socialLinks,
      },
    };
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function writeFileSettings(settings: SiteSettings): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(settings, null, 2), "utf8");
}
