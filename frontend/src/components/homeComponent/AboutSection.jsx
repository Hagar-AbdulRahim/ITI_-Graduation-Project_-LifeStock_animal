import React from "react";

const EyeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const TargetIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const SparkleIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 21l-.813-5.096L3 15l5.188-.904L9 9l.813 5.096L15 15l-5.187.904z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.071 4.929l-1.071 1.071m0 8.486l1.071 1.071M4.929 4.929l1.071 1.071m8.486 0l1.071-1.071"
    />
  </svg>
);

const HeartPulseIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const BeakerIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const AboutSection = () => {
  const cards = [
    {
      icon: <EyeIcon />,
      title: "رؤيتنا",
      description:
        "أن نكون الشريك الذكي لكل مزارع، ونساهم في بناء ثروة حيوانية أكثر صحة وإنتاجية باستخدام أحدث تقنيات الذكاء الاصطناعي.",
    },
    {
      icon: <TargetIcon />,
      title: "مهمتنا",
      description:
        "تقديم استشارات بيطرية ذكية وفورية، ومساعدة المربين في متابعة صحة الحيوانات، والكشف المبكر عن الأمراض، وإدارة التحصينات.",
    },
    {
      icon: <SparkleIcon />,
      title: "تشخيص ذكي",
      description:
        "تحليل الأعراض واقتراح التشخيصات المحتملة باستخدام الذكاء الاصطناعي.",
    },
    {
      icon: <HeartPulseIcon />,
      title: "متابعة صحية",
      description:
        "سجل رقمي متكامل لكل حيوان يشمل التاريخ المرضي والتحصينات.",
    },
    {
      icon: <BeakerIcon />,
      title: "دقة علمية",
      description:
        "تعتمد المنصة على مراجع وقواعد بيانات بيطرية موثوقة لضمان تقديم معلومات دقيقة.",
    },
    {
      icon: <ShieldIcon />,
      title: "الخصوصية والأمان",
      description:
        "نحافظ على بيانات المزرعة والحيوانات بأعلى معايير الأمان والخصوصية.",
    },
  ];

  return (
    <section
      className="bg-[#f8f8f5] py-16 md:py-20 px-6"
      id="about"
      dir="rtl"
    >
      <style>{`
        .about-card{
          position:relative;
          overflow:hidden;
        }

        .about-card::before,
        .about-card::after{
          content:"";
          position:absolute;
          width:0;
          height:0;
          background:#1b4d2c;
          transition:all .6s ease;
          z-index:0;
        }

        .about-card::before{
          bottom:0;
          right:0;
        }

        .about-card::after{
          top:0;
          left:0;
        }

        .about-card:hover::before,
        .about-card:hover::after{
          width:100%;
          height:100%;
        }

        .about-card>*{
          position:relative;
          z-index:2;
        }
      `}</style>

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div
          className="w-full text-center flex flex-col items-center mb-12"
          data-aos="fade-up"
        >
          <div className="inline-flex items-center gap-2 bg-[#e8f3ec] text-[#1b4d2c] text-xs font-bold px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b4d2c] animate-pulse"></span>
            <span>من نحن</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black text-[#1a1a1a] mb-6">
            نحن هنا لنرتقي بصحة <span className="text-[#1b4d2c]">ماشيتك</span>
          </h2>

          <p className=" text-[#555] text-sm md:text-base  leading-[32px] max-w-2xl">
            نسعى إلى تمكين المزارع المصري من خلال حلول ذكية تعتمد على الذكاء
            الاصطناعي، للمساهمة في تحسين صحة وإنتاجية الثروة الحيوانية، وتقليل
            الخسائر الناتجة عن الأمراض، عبر أدوات سهلة الاستخدام ومتاحة في أي
            وقت.
          </p>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <div
                key={index}
                className="about-card group bg-white rounded-2xl p-6 shadow-md border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex justify-start mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#1b4d2c]/10 flex items-center justify-center text-[#1b4d2c] transition-all duration-300 group-hover:bg-white/20 group-hover:text-white">
                    {card.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#1b4d2c] mb-3 transition-colors duration-300 group-hover:text-white">
                  {card.title}
                </h3>

                <p className="text-gray-600 leading-7 transition-colors duration-300 group-hover:text-white/90">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;