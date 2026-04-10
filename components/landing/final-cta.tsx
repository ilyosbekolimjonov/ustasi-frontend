import Image from "next/image";
import Link from "next/link";

export function FinalCta() {
  return (
    <section className="section-shell py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-[rgba(23,32,51,0.08)] bg-[var(--navy)] px-6 py-10 text-white shadow-[0_28px_80px_rgba(23,32,51,0.24)] sm:px-10 sm:py-14">
        <div className="absolute inset-0">
          <Image
            src="/background.png"
            alt=""
            fill
            className="object-cover opacity-[0.15] mix-blend-screen"
            sizes="100vw"
          />
        </div>
        <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[rgba(243,166,35,0.24)] blur-3xl" />
        <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-[rgba(45,143,139,0.18)] blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow border-white/15 bg-white/10 text-white/90">
              Yopuvchi CTA
            </span>
            <h2 className="section-title mt-5 text-4xl leading-tight text-white sm:text-5xl">
              Kerakli ustani topish yoki xizmatlaringizni namoyish qilishni bugunoq boshlang
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
              Ustasi odamlarni ishonchli xizmat bilan, ustalarni esa yangi mijozlar bilan
              tezroq uchrashtirish uchun yaratilgan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-[var(--amber)] px-6 py-4 text-sm font-bold text-[var(--navy)] transition hover:bg-[#ffc25c]"
            >
              Hoziroq boshlash
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Kirish
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
