"use client";

import Header from '../components/Header'
import VideoHero from '../components/VideoHero'
import TrustBadges from '../components/TrustBadges'
import LogoBar from '../components/LogoBar'
import PainPoints from '../components/PainPoints'
import VideoFeatures from '../components/VideoFeatures'
import Comparison from '../components/Comparison'
import HowItWorks from '../components/HowItWorks'
import ROICalculator from '../components/ROICalculator'
import Pricing from '../components/Pricing'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <VideoHero />
        <TrustBadges />
        <LogoBar />
        <PainPoints />
        <VideoFeatures />
        <Comparison />
        <HowItWorks />
        <ROICalculator />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
