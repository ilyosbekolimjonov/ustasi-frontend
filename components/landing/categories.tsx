import type { ReactNode } from "react";

import { SectionHeading } from "./section-heading";

const categories: Array<{
  title: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    title: "Elektrik",
    description: "Elektr tarmoqlari, montaj va nosozliklarni tez bartaraf etish.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 2 6 13h5l-1 9 8-12h-5l1-8Z" />
      </svg>
    ),
  },
  {
    title: "Santexnik",
    description: "Quvur, suv bosimi va sanitariya tizimlari bo'yicha yordam.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3v6a5 5 0 0 0 10 0V3" />
        <path d="M12 14v7" />
      </svg>
    ),
  },
  {
    title: "Konditsioner",
    description: "O'rnatish, servis va mavsumiy texnik ko'rik xizmatlari.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="6" rx="2" />
        <path d="M7 15c.5 1.5 1.5 2.5 3 3" />
        <path d="M12 15v5" />
        <path d="M17 15c-.5 1.5-1.5 2.5-3 3" />
      </svg>
    ),
  },
  {
    title: "Maishiy texnika",
    description: "Kir yuvish mashinasi, muzlatkich va boshqa texnika ta'miri.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M5 8h14" />
        <circle cx="9" cy="5.5" r=".8" fill="currentColor" stroke="none" />
        <circle cx="12" cy="14" r="3.5" />
      </svg>
    ),
  },
  {
    title: "Ta'mirlash",
    description: "Uy va ofis uchun mayda hamda katta ta'mirlash ishlari.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 4a4 4 0 0 0 5.66 5.66L11 18.32 6.68 14 14 4Z" />
        <path d="m5 15 4 4-2 2a2 2 0 0 1-2.83 0L3 19.83A2 2 0 0 1 3 17l2-2Z" />
      </svg>
    ),
  },
  {
    title: "Boshqa xizmatlar",
    description: "Platformaga yangi yo'nalishlar va mahalliy mutaxassislar qo'shiladi.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

export function Categories() {
  return (
    <section className="section-shell py-20 sm:py-24">
      <SectionHeading
        eyebrow="Yo'nalishlar"
        title="Eng ko'p kerak bo'ladigan xizmatlar bir joyda"
        description="MVP bosqichida foydalanuvchiga eng tanish va tez talab qilinadigan servis toifalarini ko'rsatadigan sahifa."
        align="center"
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category.title}
            className="section-card group rounded-[1.8rem] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/80 hover:bg-white/80"
          >
            <div className="icon-badge">{category.icon}</div>
            <h3 className="mt-5 text-2xl font-bold tracking-tight text-[var(--navy)]">
              {category.title}
            </h3>
            <p className="muted-text mt-3 text-sm leading-7 sm:text-base">
              {category.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
