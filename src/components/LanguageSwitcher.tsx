"use client";

import { LOCALES, type Locale } from "@/i18n/types";
import { useLanguage } from "@/i18n/LanguageProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{t("lang.switch")}</span>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code as Locale)}
          className={`px-2 py-1 text-xs font-medium uppercase tracking-wide transition ${
            locale === code
              ? "text-white"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
          aria-current={locale === code ? "true" : undefined}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
