const trustPoints = [
  {
    title: "Tez topish",
    text: "Bir necha qadamda kerakli yo'nalishdagi ustani toping.",
  },
  {
    title: "Ishonchli aloqa",
    text: "Mijoz va usta o'rtasida sodda va tez bog'lanish imkoniyati.",
  },
  {
    title: "Qulay buyurtma",
    text: "Talabni yuborish va kelishish jarayoni tartibli bo'ladi.",
  },
  {
    title: "Yangi imkoniyat",
    text: "Ustalar uchun ko'rinish va yangi mijozlar oqimi paydo bo'ladi.",
  },
];

export function TrustStrip() {
  return (
    <section className="section-shell pb-20">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {trustPoints.map((item, index) => (
          <article
            key={item.title}
            className="section-card rounded-[1.8rem] p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="icon-badge text-lg font-bold">{`0${index + 1}`}</div>
              <div>
                <h3 className="text-lg font-bold text-[var(--navy)]">{item.title}</h3>
                <p className="muted-text mt-2 text-sm leading-7">{item.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
