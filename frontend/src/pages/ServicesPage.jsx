import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import cowFieldBg from '../assets/images/cows-field-bg.jpg'
import {
  LayoutGrid,
  ClipboardPlus,
  Syringe,
  Brain,
  Bot,
  BellRing,
  MapPin,
  ChevronDown,
} from 'lucide-react'

/*
  STRICT COLOR SYSTEM
  --green:   #2A5C2A  (primary)
  --bg:      #F1F0EA  (light background)
  --neutral: #C3BFB4  (neutral)
  كل قيمة تانية في الكود ده متولدة من التلات ألوان دول بس
  عن طريق color-mix() أو rgba أو تدرجات — من غير أي لون جديد.
*/

const SERVICES = [
  {
    title: 'إدارة المزارع',
    description:
      'تسجيل مزرعتك ومتابعة كل بياناتها وإحصائياتها من مكان واحد بكل سهولة ويسر.',
    icon: LayoutGrid,
    tint: 'green',
  },
  {
    title: 'الملفات الطبية للحيوانات',
    description:
      'سجل رقمي كامل لكل حيوان يشمل بياناته، سلالته، وتاريخه الصحي بالتفصيل.',
    icon: ClipboardPlus,
    tint: 'neutral',
  },
  {
    title: 'متابعة التطعيمات',
    description:
      'جدولة التطعيمات الدورية وتنبيهات المواعيد أولاً بأول لحماية قطيعك من الأوبئة.',
    icon: Syringe,
    tint: 'green',
  },
  {
    title: 'التشخيص الذكي بالـ AI',
    description:
      'وصف الأعراض لنموذج الذكاء الاصطناعي واحصل على تشخيص أولي فوري مربوط بملف الحيوان.',
    icon: Brain,
    tint: 'neutral',
  },
  {
    title: 'مساعد الأونبوردنج الذكي',
    description:
      'شات بوت ذكي يسألك عن تاريخ حيوانك الطبي ويسجل البيانات ويفهرسها نيابة عنك.',
    icon: Bot,
    tint: 'green',
  },
  {
    title: 'إشعارات فورية',
    description:
      'تنبيهات لحظية على هاتفك أو حاسوبك بأي حالة صحية طارئة أو موعد تطعيم أو نتيجة تشخيص.',
    icon: BellRing,
    tint: 'neutral',
  },
  {
    title: 'أقرب عيادة بيطرية',
    description:
      'البحث عن أقرب العيادات البيطرية والأطباء المتاحين لموقعك الجغرافي في ثوانٍ معدودة.',
    icon: MapPin,
    tint: 'green',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const greenBackgroundVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 0,
    transition: { duration: 2, ease: 'easeInOut', delay: 0.3 },
  },
}

const textRevealVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.5 + i * 0.15 },
  }),
}

export default function ServicesPage() {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="min-h-screen font-cairo text-[#20301f]"
      style={{ backgroundColor: '#F1F0EA' }}
      dir="rtl"
    >
      {/* الهيرو: مثلثين متشابكين — أخضر فيه الكلام، وصورة البقرة */}
      <section className="relative overflow-hidden min-h-[520px] md:min-h-[580px]">
        <motion.div
          variants={greenBackgroundVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 z-[2] flex items-center max-md:static max-md:block max-md:pt-14 max-md:pb-7 max-md:px-5"
          style={{
            clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 60% 100%, 40% 50%)',
            background:
              'linear-gradient(160deg, color-mix(in srgb, #2A5C2A 60%, black 40%) 0%, #2A5C2A 100%)',
          }}
        >
          <div className="relative z-[3] w-full md:w-[44%] md:mr-0 md:ms-auto md:pe-[6%] md:ps-[4%] text-center md:text-right">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block text-[11px] sm:text-xs font-bold tracking-wide rounded-full px-4 py-1.5"
              style={{
                color: 'color-mix(in srgb, #F1F0EA 90%, #2A5C2A 10%)',
                background: 'rgba(241,240,234,0.12)',
                border: '1px solid rgba(241,240,234,0.2)',
              }}
            >
              خدماتنا
            </motion.span>

            <motion.h1
              custom={0}
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-tight text-white leading-[1.2] mt-4 mb-3"
            >
              كل اللي محتاجه لرعاية قطيعك <br />
              <span style={{ color: '#F1F0EA' }}>في مكان واحد</span>
            </motion.h1>

            <motion.p
              custom={1}
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              className="text-sm leading-relaxed font-medium"
              style={{ color: '#F1F0EA' }}
            >
              منصتك الذكية للسيطرة الكاملة على صحة قطيعك — تشخيص فوري بالذكاء
              الاصطناعي، متابعة تطعيمات أول بأول، وقرارات أسرع تقلل خسائرك قبل
              ما تحصل.
            </motion.p>

            <motion.div
              animate={reduceMotion ? {} : { y: [0, 8, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="pt-5 flex justify-center md:justify-end"
              style={{ color: 'rgba(241,240,234,0.55)' }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </motion.div>

        <div
          className="absolute inset-0 z-[1] max-md:static max-md:h-[200px]"
          style={{ clipPath: 'polygon(0 0, 60% 0, 40% 50%, 60% 100%, 0 100%)' }}
        >
          <img
            src={cowFieldBg}
            alt="مزرعة أبقار"
            className="w-full h-full object-cover block"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, #2A5C2A 30%, transparent) 0%, transparent 55%)',
            }}
          />
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full h-16 sm:h-20 md:h-24 z-[4] max-md:-mt-1"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C240,120 480,0 720,32 C960,64 1200,112 1440,56 L1440,120 L0,120 Z"
            fill="#F1F0EA"
          />
        </svg>
      </section>

      {/* شبكة الخدمات */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #2A5C2A 0, #2A5C2A 1px, transparent 1px, transparent 22px)',
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {SERVICES.map((service, index) => {
            const IconComponent = service.icon
            const isGreen = service.tint === 'green'
            const iconBg = isGreen
              ? 'color-mix(in srgb, #2A5C2A 10%, transparent)'
              : 'color-mix(in srgb, #C3BFB4 45%, transparent)'
            const iconColor = isGreen
              ? '#2A5C2A'
              : 'color-mix(in srgb, #2A5C2A 65%, #C3BFB4 35%)'

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={reduceMotion ? {} : { y: -6, scale: 1.015 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  '--accent-soft':
                    'color-mix(in srgb, #2A5C2A 12%, transparent)',
                  '--accent-border':
                    'color-mix(in srgb, #2A5C2A 30%, transparent)',
                  '--accent-line': '#2A5C2A',
                  backgroundColor: 'color-mix(in srgb, #F1F0EA 40%, white 60%)',
                  borderColor: 'color-mix(in srgb, #C3BFB4 45%, transparent)',
                  backdropFilter: 'blur(6px)',
                }}
                className="group relative overflow-hidden rounded-[26px] border p-6 sm:p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_24px_44px_-18px_rgba(0,0,0,0.18)] hover:border-[var(--accent-border)] before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-0 before:bg-[var(--accent-soft)] before:transition-[height] before:duration-500 before:ease-out group-hover:before:h-full after:content-[''] after:absolute after:top-0 after:right-1/2 after:left-1/2 after:h-[3px] after:bg-[var(--accent-line)] after:transition-all after:duration-500 after:ease-out group-hover:after:right-0 group-hover:after:left-0"
              >
                <div className="relative z-10 flex flex-col items-start gap-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                    style={{ backgroundColor: iconBg, color: iconColor }}
                  >
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="space-y-2">
                    <h3
                      className="font-black text-base sm:text-lg"
                      style={{ color: '#20301f' }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed font-medium"
                      style={{
                        color: 'color-mix(in srgb, #20301f 70%, #C3BFB4 30%)',
                      }}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* الـ CTA الختامي */}
      <section
        className="relative mt-4 mx-4 sm:mx-6 mb-16 md:mb-24 rounded-[28px] sm:rounded-[36px] overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, #2A5C2A 55%, black 45%), #2A5C2A)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full blur-[80px]"
          style={{ background: 'color-mix(in srgb, #F1F0EA 20%, transparent)' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-xl mx-auto text-center text-white px-6 py-14 sm:py-16 space-y-5"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black">
            ابدأ في إدارة وتأمين قطيعك اليوم
          </h2>
          <p
            className="text-sm md:text-base leading-relaxed"
            style={{ color: 'rgba(241,240,234,0.75)' }}
          >
            سجل الآن وانضم لمئات المزارعين الذين يستخدمون الذكاء الاصطناعي
            لتأمين وحماية ثرواتهم الحيوانية.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 font-bold rounded-2xl shadow-md transition-all active:scale-95 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              style={{ backgroundColor: '#F1F0EA', color: '#2A5C2A' }}
            >
              سجل الآن
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-8 py-3.5 font-bold rounded-2xl transition-all active:scale-95 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              style={{
                backgroundColor: 'rgba(241,240,234,0.1)',
                border: '1px solid rgba(241,240,234,0.25)',
                color: '#fff',
              }}
            >
              تواصل معنا
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
