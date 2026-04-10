import Image from "next/image";

import { Categories } from "@/components/landing/categories";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Navbar } from "@/components/landing/navbar";
import { TrustStrip } from "@/components/landing/trust-strip";
import { ValueSplit } from "@/components/landing/value-split";

export default function Home() {
  return (
    <div className="page-shell min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[38rem] overflow-hidden">
        <Image
          src="/background.png"
          alt=""
          fill
          className="object-cover object-top opacity-[0.16]"
          sizes="100vw"
          priority
        />
      </div>

      <Navbar />

      <main className="relative z-10 pb-4">
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Categories />
        <ValueSplit />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}
