import React from 'react'
import Navbar from '@/components/homeComponent/Navbar'
import HeroSection from '@/components/homeComponent/HeroSection'
import FeaturesGrid from '@/components/homeComponent/FeaturesGrid'
import TestimonialSection from '@/components/homeComponent/TestimonialSection'
import CTASection from '@/components/homeComponent/CTASection'
import Footer from '@/components/homeComponent/Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bg-cream">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage
