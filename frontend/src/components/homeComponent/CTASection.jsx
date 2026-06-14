import React from 'react'

const CTASection = () => {
  return (
    <section className="bg-bg-cream py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-3xl px-12 py-16 text-center"
          style={{ backgroundColor: '#1F5C34' }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            جاهز لتحديث صحة قطيعك؟
          </h2>
          <p className="text-green-200 text-sm mb-10 max-w-lg mx-auto leading-relaxed">
            انضم إلى آلاف الأطباء البيطريين والمزارعين الذين يستخدمون النظام للحفاظ على قطعانهم بصحة متميزة.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="bg-primary-green text-white font-semibold text-sm px-8 py-3 rounded-xl hover:bg-opacity-90 transition-all">
              ابدأ التجربة المجانية
            </button>
            <button className="border border-white text-white font-semibold text-sm px-8 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
              تواصل معنا
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
