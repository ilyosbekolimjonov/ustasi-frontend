import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { href: "#home", label: "Home" },
  { href: "#qanday-ishlaydi", label: "Qanday ishlaydi" },
  { href: "#mijozlar", label: "Mijozlar uchun" },
  { href: "#ustalar", label: "Ustalar uchun" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="section-shell pb-10 pt-6">
      <div className="section-card rounded-[2rem] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white/80 p-1.5">
                <Image
                  src="/logo-ustasi.png"
                  alt="Ustasi logosi"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="text-xl font-extrabold tracking-tight text-[var(--navy)]">
                  Ustasi
                </p>
                <p className="text-sm text-[var(--muted)]">Muammo bormi? Ustasi bor.</p>
              </div>
            </div>
            <p className="muted-text mt-4 text-sm leading-7 sm:text-base">
              Mahalliy xizmatlar uchun ishonchli, zamonaviy va insoniy marketplace.
              Mijoz va usta o&apos;rtasidagi eng qulay ko&apos;prik bo&apos;lishga
              intilamiz.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm font-semibold text-[var(--navy-soft)] sm:flex-row sm:flex-wrap sm:justify-end sm:gap-6">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[var(--navy)]">
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="transition hover:text-[var(--navy)]">
              Log in
            </Link>
            <Link href="/signup" className="transition hover:text-[var(--navy)]">
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
          © 2026 Ustasi. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
