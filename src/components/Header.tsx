"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          {t("header.brand")}
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
