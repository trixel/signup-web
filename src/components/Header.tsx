"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-2xl items-center px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Trixel
        </Link>
      </div>
    </header>
  );
}
