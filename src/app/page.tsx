import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { EarningsCalculator } from "@/components/marketing/earnings-calculator";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { Footer } from "@/components/marketing/footer";
import { ReferralCapture } from "@/components/marketing/referral-capture";

export default function HomePage() {
  return (
    <>
      <ReferralCapture />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <EarningsCalculator />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
