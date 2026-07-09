"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-neutral-200 bg-white py-8">
      <div className="mx-auto max-w-2xl px-6 text-sm text-neutral-500">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
