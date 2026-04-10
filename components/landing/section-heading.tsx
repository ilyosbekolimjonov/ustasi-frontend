type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-title mt-5 text-4xl leading-tight text-[var(--navy)] sm:text-5xl">
        {title}
      </h2>
      <p className="muted-text mt-4 text-base leading-8 sm:text-lg">
        {description}
      </p>
    </div>
  );
}
