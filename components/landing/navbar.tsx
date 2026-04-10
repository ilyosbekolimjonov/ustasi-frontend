import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#qanday-ishlaydi", label: "Qanday ishlaydi" },
  { href: "#ustalar", label: "Ustalar uchun" },
  { href: "#mijozlar", label: "Mijozlar uchun" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-3 py-3 sm:px-5">
      <div className="section-shell">
        <div className="section-card flex items-center justify-between rounded-[1.75rem] px-4 py-3 sm:px-6">
          <Link href="#home" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white/80 p-1.5">
              <Image
                src="/logo-ustasi.png"
                alt="Ustasi logosi"
                fill
                className="object-contain"
                sizes="44px"
                priority
              />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-[var(--navy)]">
                Ustasi
              </p>
              <p className="text-xs text-[var(--muted)]">Muammo bormi? Ustasi bor.</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link text-sm font-semibold">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="button-secondary px-5 py-3 text-sm">
              Log in
            </Link>
            <Link href="/signup" className="button-primary px-5 py-3 text-sm">
              Sign up
            </Link>
          </div>

          <details className="relative lg:hidden">
            <summary className="list-none rounded-full border border-[var(--border)] bg-white/75 px-4 py-2 text-sm font-semibold text-[var(--navy)] shadow-sm">
              Menu
            </summary>
            <div className="section-card absolute right-0 mt-3 w-72 rounded-[1.5rem] p-4">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--navy-soft)] transition hover:bg-white/80"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/login" className="button-secondary text-sm">
                  Log in
                </Link>
                <Link href="/signup" className="button-primary text-sm">
                  Sign up
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
