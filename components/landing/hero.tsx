import Image from "next/image";
import Link from "next/link";

const proofPoints = [
  "Tekshirilgan usta profillari",
  "Tez aloqa va buyurtma jarayoni",
  "Mahalliy xizmatlar uchun qulay platforma",
];

export function Hero() {
  return (
    <section id="home" className="section-shell relative pt-6 pb-14 sm:pb-20">
      <div className="absolute inset-x-10 top-14 -z-10 h-60 rounded-full bg-[radial-gradient(circle,_rgba(243,166,35,0.2),_transparent_65%)] blur-3xl" />
      <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(145deg,rgba(255,250,242,0.95),rgba(255,255,255,0.72))] px-6 py-8 shadow-[0_24px_60px_rgba(23,32,51,0.12)] sm:px-10 sm:py-12">
          <div className="absolute -top-10 right-4 h-28 w-28 rounded-full bg-[rgba(45,143,139,0.14)] blur-3xl" />
          <span className="eyebrow">Muammo bormi? Ustasi bor.</span>
          <h1 className="section-title mt-6 max-w-xl text-5xl leading-none text-[var(--navy)] sm:text-6xl lg:text-7xl">
            Ishonchli ustani tez toping
          </h1>
          <p className="muted-text mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
            Uyingiz, ofisingiz yoki texnikangiz uchun kerakli ustani qulay toping va
            tez bog&apos;laning.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="button-primary">
              Usta topish
            </Link>
            <Link href="/signup" className="button-secondary">
              Usta bo&apos;lib qo&apos;shilish
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="rounded-[1.4rem] border border-white/70 bg-white/70 px-4 py-4 text-sm font-semibold text-[var(--navy-soft)] shadow-[0_12px_30px_rgba(23,32,51,0.08)]"
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-[rgba(243,166,35,0.16)] blur-3xl sm:block" />
          <div className="absolute -right-4 bottom-6 h-28 w-28 rounded-full bg-[rgba(45,143,139,0.18)] blur-3xl" />
          <div className="soft-gradient relative overflow-hidden rounded-[2.25rem] border border-white/50 p-4 shadow-[0_28px_70px_rgba(23,32,51,0.16)] sm:p-6">
            <div className="absolute inset-0">
              <Image
                src="/background.png"
                alt=""
                fill
                className="object-cover opacity-[0.14]"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
            <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(23,32,51,0.08),rgba(255,255,255,0.08))] p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/60">
                <Image
                  src="/hero.png"
                  alt="Ustasi platformasidan foydalanayotgan servis mutaxassislari"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  priority
                />
              </div>
            </div>
            <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-[var(--navy)] px-5 py-4 text-white shadow-lg">
                <p className="text-sm text-white/70">Platforma hissi</p>
                <p className="mt-2 text-lg font-semibold">Ishonchli, tez va insoniy</p>
              </div>
              <div className="rounded-[1.4rem] bg-white/80 px-5 py-4 text-[var(--navy)] shadow-lg">
                <p className="text-sm text-[var(--muted)]">Mos keladi</p>
                <p className="mt-2 text-lg font-semibold">Uy xizmati va ustalar uchun</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
