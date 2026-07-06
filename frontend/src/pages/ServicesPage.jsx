import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/homeComponent/Navbar'
import Footer from '../components/homeComponent/Footer'
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
  CheckCircle,
  HelpCircle,
} from 'lucide-react'

/*
  STRICT COLOR SYSTEM
  --green:   #2A5C2A  (primary)
  --bg:      #F1F0EA  (light background)
  --neutral: #C3BFB4  (neutral)
*/

const FEATURES = [
  {
    number: '01',
    title: 'إدارة المزارع والقطعان',
    description: 'تسجيل مزرعتك وإدارتها بالكامل من مكان واحد لمتابعة أعداد وإحصائيات الثروة الحيوانية.',
    benefits: [
      'تنظيم بيانات المزارع المتعددة والوصول إليها بسرعة وسهولة.',
      'توفير لوحة تحكم ذكية تعرض إحصائيات فورية عن حالة القطيع الصحية والعدد الإجمالي.',
      'تقليل العمل الإداري الورقي وضمان حفظ البيانات التاريخية للمزرعة بأمان.'
    ],
    steps: [
      'قم بتسجيل الدخول إلى حسابك، ثم توجه إلى صفحة "المزارع" من شريط التنقل.',
      'اضغط على زر "إضافة مزرعة جديدة" وقم بتعبئة البيانات الأساسية (الاسم، الموقع، المساحة).',
      'بعد الإضافة، ستظهر لك لوحة التحكم الخاصة بالمزرعة لتتابع كل شيء بشكل فوري.'
    ],
    icon: LayoutGrid,
    badgeColor: '#2A5C2A',
  },
  {
    number: '02',
    title: 'السجل الطبي الرقمي للحيوانات',
    description: 'ملف صحي شامل لكل حيوان يسهل عليك مراجعة تاريخه المرضي وسلالته وإنتاجيته في أي وقت.',
    benefits: [
      'ملف كامل يحتوي على السلالة، العمر، الوزن، والوضع الصحي لكل حيوان بشكل منفصل.',
      'إمكانية مراجعة الفحوصات والتشخيصات السابقة بسرعة لتشخيص أدق.',
      'متابعة شاملة لتطور الحالة الصحية للحيوان مما يسهل اتخاذ قرارات الإنتاج.'
    ],
    steps: [
      'من لوحة تحكم المزرعة الخاصة بك، انتقل إلى قسم "الحيوانات".',
      'اضغط على زر "إضافة حيوان جديد" وأدخل رقمه التعريفي وسلالته وعمره الحالي.',
      'يمكنك الآن استعراض الملف الطبي للحيوان في أي وقت وتعديله أو إضافة سجلات صحية جديدة له.'
    ],
    icon: ClipboardPlus,
    badgeColor: '#C3BFB4',
  },
  {
    number: '03',
    title: 'مستشار اللقاحات وتتبع التطعيمات',
    description: 'نظام ذكي لجدولة اللقاحات الدورية للحيوانات وحمايتها من الأوبئة الموسمية والعدوى.',
    benefits: [
      'حماية القطيع من الأوبئة مثل الحمى القلاعية والجدري بفضل الجدولة المنظمة.',
      'تحديد البرامج التحصينية الدقيقة لكل نوع من أنواع الحيوانات.',
      'تلقي تنبيهات استباقية بالجرعات المستحقة لمنع إغفال أي تطعيم.'
    ],
    steps: [
      'ادخل إلى قسم "مستشار اللقاحات" من القائمة الرئيسية.',
      'اختر نوع الحيوان (أبقار، أغنام، إلخ) والبرنامج التحصيني المطلوب.',
      'قم بجدولة المواعيد وتوزيع الجرعات على قطيعك لتسجيلها وتلقي إشعارات بها عند الاستحقاق.'
    ],
    icon: Syringe,
    badgeColor: '#2A5C2A',
  },
  {
    number: '04',
    title: 'التشخيص الذكي بالذكاء الاصطناعي (AI)',
    description: 'تحليل فوري للأعراض بالذكاء الاصطناعي للحصول على تشخيص مبكر وإرشادات علاجية أولية.',
    benefits: [
      'تشخيص أولي فوري يوفر الوقت والجهد في الحالات غير الحرجة.',
      'دعم اتخاذ القرار البيطري وتقديم إرشادات إسعافية للحيوان.',
      'الربط التلقائي للتشخيص بملف الحيوان الطبي للرجوع إليه مستقبلاً.'
    ],
    steps: [
      'توجه إلى صفحة "التشخيص الذكي بالـ AI" من لوحة التحكم.',
      'اختر الحيوان الذي تظهر عليه الأعراض، ثم اكتب تفاصيل الأعراض التي تلاحظها بدقة.',
      'يمكنك أيضاً رفع صورة للأعراض الظاهرة (كالأمراض الجلدية)، ثم اضغط "تحليل" لتلقي التقرير الطبي فوراً.'
    ],
    icon: Brain,
    badgeColor: '#C3BFB4',
  },
  {
    number: '05',
    title: 'مساعد الأونبوردنج والشات بوت التفاعلي',
    description: 'مساعد رقمي بيطري تفاعلي يسهل إدخال البيانات ويجيب على تساؤلاتك بشكل فوري.',
    benefits: [
      'تسهيل إدخال وتحديث البيانات الطبية للحيوانات دون الحاجة لملء استمارات طويلة.',
      'الحصول على إجابات سريعة حول كيفية استخدام المنصة أو النصائح البيطرية العامة.',
      'تحسين تجربة الاستخدام من خلال التوجيه الصوتي أو الكتابي التفاعلي.'
    ],
    steps: [
      'اضغط على أيقونة المساعد الذكي (الدردشة) الموجودة في أسفل الشاشة أو في القائمة.',
      'اكتب استفسارك أو أخبره بالبيانات التي تود إضافتها (مثال: "سجل بقرة جديدة رقمها 105").',
      'سيقوم المساعد بفهم طلبك، وتنفيذ الإجراء تلقائياً أو إرشادك للخطوات المطلوبة.'
    ],
    icon: Bot,
    badgeColor: '#2A5C2A',
  },
  {
    number: '06',
    title: 'نظام الإشعارات والإنذار المبكر',
    description: 'تنبيهات فورية ومباشرة تصلك لحمايتك من الأوبئة والتنبيه بمواعيد التطعيمات والحالات الحرجة.',
    benefits: [
      'عدم تفويت أي موعد تطعيم أو زيارة بيطرية مجدولة.',
      'إنذار مبكر عند تسجيل بؤر وبائية في منطقتك الجغرافي لحماية مزرعتك.',
      'إشراك الفريق الطبي في المزرعة لحظة بلحظة بأي تطورات صحية.'
    ],
    steps: [
      'تأكد من تفعيل إذن الإشعارات في المتصفح أو على هاتفك عند طلب المنصة.',
      'ستتلقى تنبيهات في شريط التنقل العلوي وعند حدوث أي حالة طارئة أو اقتراب موعد تطعيم.',
      'يمكنك زيارة صفحة "الإشعارات" لاستعراض سجل التنبيهات السابقة وإدارتها بالكامل.'
    ],
    icon: BellRing,
    badgeColor: '#C3BFB4',
  },
  {
    number: '07',
    title: 'البحث عن عيادات وأطباء بيطريين',
    description: 'العثور على أقرب الأطباء والخدمات البيطرية المتاحة حولك لتوفير التدخل الطبي السريع.',
    benefits: [
      'الاستجابة السريعة في حالات الطوارئ التي تتطلب حضور الطبيب للمزرعة.',
      'توفير معلومات الاتصال الكاملة والموقع الجغرافي للعيادات القريبة.',
      'ضمان جودة الرعاية بفضل الأطباء المرخصين المسجلين في المنصة.'
    ],
    steps: [
      'توجه إلى صفحة "البحث عن عيادة بيطرية" من القائمة الرئيسية.',
      'اسمح للمنصة بالوصول إلى موقعك الجغرافي لتحديد محيطك بدقة.',
      'ستظهر لك خريطة وقائمة بالعيادات والأطباء القريبين مع إمكانية الاتصال المباشر بهم.'
    ],
    icon: MapPin,
    badgeColor: '#2A5C2A',
  },
]

// Animations
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const headerTextVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
}

export default function ServicesPage() {
  return (
    <div
      className="min-h-screen font-cairo text-[#20301f]"
      style={{ backgroundColor: '#F1F0EA' }}
      dir="rtl"
    >
      <Navbar />

      {/* الهيرو: دليل الاستخدام الشامل */}
      <section className="relative overflow-hidden min-h-[500px] md:min-h-[580px] bg-[#F1F0EA]">
        {/* الخلفية الخضراء المقصوصة - للديسك توب فقط */}
        <div
          className="hidden md:block absolute inset-0 z-[1]"
          style={{
            clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 60% 100%, 50% 50%)',
            background:
              'linear-gradient(165deg, #1e3f1e 0%, #2A5C2A 50%, #3d7c3d 100%)',
          }}
        />

        {/* خلفية الصورة المقصوصة - للديسك توب فقط */}
        <div
          className="hidden md:block absolute inset-0 z-[0]"
          style={{
            clipPath: 'polygon(0 0, 60% 0, 50% 50%, 60% 100%, 0 100%)',
          }}
        >
          <img
            src={cowFieldBg}
            alt="مزرعة أبقار"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#2A5C2A]/30 to-transparent"
          />
        </div>

        {/* محتوى الهيرو المتجاوب */}
        <div className="relative z-[10] max-w-7xl mx-auto px-6 h-full min-h-[500px] md:min-h-[580px] grid grid-cols-1 md:grid-cols-12 items-center gap-8">
          
          {/* الجانب الأيمن: نصوص العرض والتقديم */}
          <div className="md:col-start-2 md:col-span-4 flex flex-col justify-center text-center md:text-right text-white max-md:bg-[#2A5C2A] max-md:p-8 max-md:rounded-[32px] max-md:shadow-xl max-md:mt-8">
            <motion.div
              variants={headerTextVariants}
              initial="hidden"
              animate="visible"
              className="space-y-7"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-stone-100 self-center md:self-start w-fit mx-auto md:mx-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                دليل الاستخدام التفاعلي
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-[38px] font-black leading-[1.5] text-white">
                كيف تستخدم منصة <br />
                <span className="text-[#d8f3d8] drop-shadow-sm">رعاية الماشية الذكية؟</span>
              </h1>

              <p className="text-sm md:text-base leading-relaxed text-stone-200 font-medium">
                مرحباً بك في دليل المنصة الشامل. تم تصميم هذا القسم خصيصاً لمساعدتك في التعرف على كيفية تفعيل كافة المميزات والأدوات الطبية والذكية للمشروع خطوة بخطوة لتحقيق الاستفادة القصوى لقطيعك.
              </p>

              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <a
                  href="#features-guide"
                  className="px-6 py-3 bg-white text-[#2A5C2A] font-bold rounded-2xl shadow-lg hover:bg-[#F1F0EA] hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2"
                >
                  تصفح الدليل الآن
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* الجانب الأيسر: الصورة (يظهر فقط في الموبايل تحت النص كعنصر مستقل) */}
          <div className="md:hidden w-full h-[250px] rounded-[32px] overflow-hidden shadow-lg relative mb-8">
            <img
              src={cowFieldBg}
              alt="مزرعة أبقار"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

        </div>

        {/* فاصل متموج سفلي */}
        <svg
          className="absolute bottom-0 left-0 w-full h-12 sm:h-16 md:h-20 z-[5]"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C240,120 480,0 720,32 C960,64 1200,112 1440,56 L1440,120 L0,120 Z"
            fill="#F1F0EA"
          />
        </svg>
      </section>

      {/* قسم الإرشاد والتوضيح */}
      <section id="features-guide" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[#2A5C2A] font-bold text-xs uppercase tracking-wider bg-stone-200/60 px-4 py-1.5 rounded-full border border-stone-300/40">
            خطوة بخطوة نحو الرعاية الذكية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#20301f] mt-4 mb-3">
            دليل تشغيل الميزات والخدمات
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            استعرض الميزات الأساسية للمنصة أدناه للتعرف على الغرض من كل ميزة وكيفية تفعيلها للبدء الفوري في إدارة شؤون مزرعتك.
          </p>
        </div>

        {/* قائمة الميزات - كل ميزة سيكشن مستقل ثنائي الأعمدة */}
        <div className="space-y-24">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.section
                key={index}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch border-b border-stone-300/40 pb-16 last:border-0"
              >
                {/* العمود الأيمن: اسم الفيتشر */}
                <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl sm:text-5xl font-black text-[#2A5C2A]/20 font-mono">
                      {feature.number}
                    </span>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-white"
                      style={{ backgroundColor: '#2A5C2A' }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#20301f]">
                    {feature.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed font-medium">
                    {feature.description}
                  </p>

                  <div className="pt-2">
                    <span
                      className="inline-block text-[11px] font-bold px-3 py-1 rounded-full border"
                      style={{
                        borderColor: '#2A5C2A',
                        color: '#2A5C2A',
                        backgroundColor: 'rgba(42, 92, 42, 0.05)',
                      }}
                    >
                      ميزة أساسية
                    </span>
                  </div>
                </div>

                {/* العمود الأيسر: الفائدة وكيفية الاستخدام */}
                <div className="lg:col-span-7 bg-white/60 backdrop-blur-sm rounded-[32px] border border-stone-200/50 p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_35px_-15px_rgba(0,0,0,0.08)] transition-all duration-300">
                  <div className="space-y-6">
                    {/* الفوائد */}
                    <div>
                      <h4 className="text-sm font-black text-[#20301f] flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-[#2A5C2A]" />
                        الفوائد والمميزات:
                      </h4>
                      <ul className="space-y-2 text-stone-600 text-xs sm:text-sm leading-relaxed pr-6 list-disc list-outside marker:text-[#2A5C2A]">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    {/* كيفية الاستخدام */}
                    <div>
                      <h4 className="text-sm font-black text-[#20301f] flex items-center gap-2 mb-3">
                        <HelpCircle className="w-4 h-4 text-[#2A5C2A]" />
                        طريقة الاستخدام وتفعيل الميزة:
                      </h4>
                      <div className="space-y-3">
                        {feature.steps.map((step, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="w-5 h-5 rounded-full bg-stone-200 text-[#20301f] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )
          })}
        </div>
      </section>

      {/* الـ CTA الختامي */}
      <section
        className="relative mt-12 mx-4 sm:mx-6 mb-16 md:mb-24 rounded-[28px] sm:rounded-[36px] overflow-hidden"
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
            جاهز لإدارة قطيعك باحترافية؟
          </h2>
          <p
            className="text-sm md:text-base leading-relaxed"
            style={{ color: 'rgba(241,240,234,0.75)' }}
          >
            سجل الآن وابدأ في تفعيل هذه المميزات لحماية ثروتك الحيوانية وزيادة إنتاجيتك بالذكاء الاصطناعي.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 font-bold rounded-2xl shadow-md transition-all active:scale-95 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              style={{ backgroundColor: '#F1F0EA', color: '#2A5C2A' }}
            >
              ابدأ الآن مجاناً
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-3.5 font-bold rounded-2xl transition-all active:scale-95 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              style={{
                backgroundColor: 'rgba(241,240,234,0.1)',
                border: '1px solid rgba(241,240,234,0.25)',
                color: '#fff',
              }}
            >
              الرئيسية
            </Link>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  )
}
