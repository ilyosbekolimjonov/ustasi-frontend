import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  sideTitle: string;
  sideText: string;
  highlights: string[];
  children: ReactNode;
  bottomText: string;
  bottomLinkLabel: string;
  bottomLinkHref: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  sideTitle,
  sideText,
  highlights,
  children,
  bottomText,
  bottomLinkLabel,
  bottomLinkHref,
}: AuthShellProps) {
  return (
    <main className="page-shell relative min-h-screen px-3 py-5 sm:px-5">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <Image
          src="/background.png"
          alt=""
          fill
          className="object-cover opacity-[0.16]"
          sizes="100vw"
          priority
        />
      </div>

      <div className="section-shell flex min-h-[calc(100vh-2rem)] flex-col">
        <div className="section-card flex items-center justify-between rounded-[1.75rem] px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
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
          <Link href="/" className="button-secondary px-5 py-3 text-sm">
            Bosh sahifa
          </Link>
        </div>

        <div className="mt-5 grid flex-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="soft-gradient relative overflow-hidden rounded-[2rem] border border-white/50 p-6 shadow-[0_24px_60px_rgba(23,32,51,0.12)] sm:p-8">
            <div className="absolute inset-0">
              <Image
                src="/hero.png"
                alt=""
                fill
                className="object-cover opacity-[0.12]"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <span className="eyebrow">{eyebrow}</span>
                <h1 className="section-title mt-6 max-w-md text-5xl leading-none text-[var(--navy)] sm:text-6xl">
                  {sideTitle}
                </h1>
                <p className="muted-text mt-5 max-w-lg text-base leading-8 sm:text-lg">
                  {sideText}
                </p>
              </div>

              <div className="grid gap-3">
                {highlights.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-white/70 bg-white/72 px-4 py-4 shadow-[0_12px_30px_rgba(23,32,51,0.08)]"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--amber-deep)]">
                      {`0${index + 1}`}
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-7 text-[var(--navy-soft)] sm:text-base">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section-card rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="section-title mt-5 text-4xl leading-tight text-[var(--navy)] sm:text-5xl">
              {title}
            </h2>
            <p className="muted-text mt-4 max-w-2xl text-base leading-8 sm:text-lg">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            <p className="muted-text mt-6 text-sm">
              {bottomText}{" "}
              <Link href={bottomLinkHref} className="font-bold text-[var(--navy)]">
                {bottomLinkLabel}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
