import en from "./en.json";
import ko from "./ko.json";

export type Locale = "en" | "ko";

const dictionaries = { en, ko };

export async function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}
