import React, { useState } from 'react'

const TestimonialSection = () => {
  const testimonials = [
    {
      id: 1,
      stars: 5,
      quote: 'المساعد الصوتي غير طريقة تسجيلنا للملاحظات تمامًا، أحكي وأنا في الحظيرة وهو يرتب كل شيء بمكانه.',
      author: 'د. أحمد سليمان',
      role: 'طبيب بيطري ميداني — مصر',
    },
    {
      id: 2,
      stars: 5,
      quote: 'تحليل الصور وفر علينا زيارات بيطرية كثيرة لحالات بسيطة، والتقارير الشهرية بقت جاهزة في دقائق معدودة.',
      author: 'أ. فهد الشمري',
      role: 'مستثمر زراعي — السعودية',
    },
    {
      id: 3,
      stars: 5,
      quote: 'رعاية بيحس بالحيوان قبل ما يظهر عليه التعب، المتابعة المستمرة تمنع انتشار العدوى وتوفر الأمان للمزرعة.',
      author: 'د. سارة جنسن',
      role: 'مديرة مزرعة — أستراليا',
    },
  ]

  return (
    <section className="bg-[#f8f8f5] py-20 px-6 overflow-hidden" id="testimonials">
      <div className="max-w-7xl mx-auto">

        {/* Section Heading & Navigation */}
        <div
          className="flex items-center justify-between mb-12"
          dir="rtl"
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-once="true"
        >
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a]">
            رعاية من قطعان حقيقية
          </h2>

</div>   
     {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
          {testimonials.map((t, index) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.012)] border border-gray-100/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 text-right flex flex-col justify-between min-h-[220px]"
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay={index * 120}
              data-aos-once="true"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex justify-start gap-1 mb-4 text-[#1b4d2c]">
                  {[...Array(t.stars)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6 font-medium">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="border-t border-gray-50 pt-4 flex items-center justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e8f3ec] flex items-center justify-center text-[#1b4d2c] font-black text-xs">
                  {t.author[0]}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1a1a1a]">{t.author}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default TestimonialSection
