export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-8">
      <div className="mx-auto max-w-2xl px-6 text-sm text-neutral-500">
        © {new Date().getFullYear()} Trixel
      </div>
    </footer>
  );
}
