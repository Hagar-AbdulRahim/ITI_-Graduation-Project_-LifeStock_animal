// routes/index.jsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/DashboardPage";

// Placeholder pages — هتبنيهم لاحقاً
const ComingSoon = ({ title }) => (
  <div dir="rtl" className="flex flex-col items-center justify-center h-[60vh] text-stone-400">
    <div className="text-5xl mb-4">🚧</div>
    <p className="text-xl font-bold text-stone-600">{title}</p>
    <p className="text-sm mt-2">هذه الصفحة قيد التطوير</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "animals", element: <ComingSoon title="الحيوانات" /> },
      { path: "ai-assistant", element: <ComingSoon title="مساعد الذكاء الاصطناعي" /> },
      { path: "diagnosis", element: <ComingSoon title="التشخيص" /> },
      { path: "image-analysis", element: <ComingSoon title="تحليل الصور" /> },
      { path: "vaccinations", element: <ComingSoon title="التطعيمات" /> },
      { path: "emergencies", element: <ComingSoon title="حالات الطوارئ" /> },
      { path: "library", element: <ComingSoon title="المكتبة" /> },
      { path: "reports", element: <ComingSoon title="التقارير" /> },
    ],
  },
]);
