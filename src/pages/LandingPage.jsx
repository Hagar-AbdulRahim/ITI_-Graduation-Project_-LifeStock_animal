import React from 'react'
import Navbar from '../components/ui/Navbar'
import HeroSection from '../components/ui/HeroSection'
import FeaturesGrid from '../components/ui/FeaturesGrid'
import TestimonialSection from '../components/ui/TestimonialSection'
import CTASection from '../components/ui/CTASection'
import Footer from '../components/ui/Footer'

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
