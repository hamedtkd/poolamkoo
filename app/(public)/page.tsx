import type { Metadata } from "next";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingSections } from "@/components/landing/landing-sections";
import { StandaloneLandingRedirect } from "@/components/landing/standalone-landing-redirect";
import { DEFAULT_SITE_URL, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "پولم‌کو | برنامه‌ریزی مالی Local-first" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "پولم‌کو | برای هر پول جدید، قبل از خرج شدن تصمیم بگیر",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "fa_IR",
    url: DEFAULT_SITE_URL,
    siteName: "پولم‌کو",
  },
  twitter: {
    card: "summary",
    title: "پولم‌کو",
    description: SITE_DESCRIPTION,
  },
};

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-8 sm:space-y-24">
      <StandaloneLandingRedirect />
      <LandingHero />
      <LandingSections />
    </div>
  );
}
