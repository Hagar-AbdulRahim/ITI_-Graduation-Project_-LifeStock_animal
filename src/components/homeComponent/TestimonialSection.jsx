import React from 'react'
import { useSelector } from 'react-redux'
import { selectTestimonials } from '../../features/HomeDashboard/dashboardSlice'
import farmImg from '@/assets/images/farm.jpg'
import cowImg from '@/assets/images/cow.jpg'
import testimonialUser from '@/assets/images/testimonial-user.jpg'

const TestimonialSection = () => {
  const testimonials = useSelector(selectTestimonials)
  const testimonial = testimonials[0]

  return (
    <section className="bg-bg-cream py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-text-dark">موثوق به من قبل كبار الزراعيين في العالم</h2>
        </div>

        <div className="grid grid-cols-3 gap-5 items-center">
          {/* Left: Farm image */}
          <div className="rounded-2xl overflow-hidden h-72">
            <img src={farmImg} alt="مزرعة" className="w-full h-full object-cover" />
          </div>

          {/* Center: Cow image */}
          <div className="rounded-2xl overflow-hidden h-80">
            <img src={cowImg} alt="بقرة" className="w-full h-full object-cover" />
          </div>

          {/* Right: Testimonial card */}
          <div className="bg-white rounded-2xl p-7 shadow-sm h-80 flex flex-col justify-between">
            {/* Quote mark */}
            <div>
              <div className="text-5xl font-bold text-dark-green leading-none mb-4" style={{ fontFamily: 'Georgia, serif' }}>"</div>
              <p className="text-text-dark text-sm leading-relaxed font-medium">
                {testimonial?.quote}
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img src={testimonialUser} alt={testimonial?.author} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-text-dark text-sm">{testimonial?.author}</p>
                <p className="text-text-gray text-xs">{testimonial?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection
