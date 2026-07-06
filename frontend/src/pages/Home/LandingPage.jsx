import React, { useEffect } from 'react'
import AOS from 'aos'
import Navbar from '@/components/homeComponent/Navbar'
import HeroSection from '@/components/homeComponent/HeroSection'
import AboutSection from '@/components/homeComponent/AboutSection'
import FeaturesGrid from '@/components/homeComponent/FeaturesGrid'
import StatsBar from '@/components/homeComponent/StatsBar'
import TestimonialSection from '@/components/homeComponent/TestimonialSection'
import CTASection from '@/components/homeComponent/CTASection'
import Footer from '@/components/homeComponent/Footer'

const LandingPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    })
    AOS.refresh()
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f8f5]">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturesGrid />
      <StatsBar />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage
