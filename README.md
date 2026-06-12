# 🐾 رعاية الماشية AI — Frontend Dashboard

## Stack
- **React 19** + **Vite**
- **Redux Toolkit** — state management
- **React Router v7** — routing
- **Tailwind CSS v3** — styling
- **Recharts** — charts (Donut + Bar)
- **react-intersection-observer** — scroll animations

---

## 📁 Project Structure

```
src/
├── constants/
│   └── mockData.js          ← كل الـ mock data هنا (استبدلها بـ API لاحقاً)
│
├── store/
│   ├── index.js             ← Redux store setup
│   └── slices/
│       └── dashboardSlice.js ← dashboard state + actions
│
├── services/
│   └── dashboardService.js  ← API calls (جاهزة، بس معطلة لحد ما يجي الـ backend)
│
├── layouts/
│   ├── MainLayout.jsx       ← Sidebar + Topbar + Outlet
│   ├── Sidebar.jsx          ← القائمة الجانبية
│   └── Topbar.jsx           ← شريط العنوان العلوي
│
├── components/
│   └── ui/
│       └── SidebarIcon.jsx  ← أيقونات SVG مُعاد استخدامها
│
├── features/
│   └── dashboard/
│       └── components/
│           ├── StatsCard.jsx              ← بطاقات الإحصائيات الأربعة
│           ├── AnimalDistributionChart.jsx ← Donut Chart (Recharts)
│           ├── WeeklyHealthChart.jsx       ← Bar Chart (Recharts)
│           ├── AIRecommendations.jsx       ← توصيات الذكاء الاصطناعي
│           └── RecentActivities.jsx        ← الأنشطة الأخيرة
│
├── pages/
│   └── DashboardPage.jsx    ← الصفحة الرئيسية (بتجمّع كل الكمبوننتات)
│
└── routes/
    └── index.jsx            ← تعريف كل الـ routes
```

---

## 🚀 Installation

```bash
npm install
npm run dev
```

---

## 🔌 ربط الـ API لاحقاً

### الخطوات:

1. **في `services/dashboardService.js`** — اكتب الـ fetch calls الحقيقية (الملف جاهز وموثق)

2. **في `store/slices/dashboardSlice.js`** — أضف `createAsyncThunk`:
```js
export const fetchStats = createAsyncThunk("dashboard/fetchStats", async () => {
  return await dashboardService.fetchDashboardStats();
});
```

3. **في `pages/DashboardPage.jsx`** — استخدم `useEffect` لـ dispatch:
```js
useEffect(() => {
  dispatch(fetchStats());
  dispatch(fetchAnimalDistribution());
  dispatch(fetchWeeklyTrends(period));
}, [period]);
```

4. **الرسوم البيانية** — Recharts بتقرأ البيانات من Redux تلقائي عن طريق `useSelector` — مش محتاج تعدّل فيها حاجة غير الـ data shape.

---

## 📊 تغيير شكل الرسوم البيانية

### Bar Chart (`WeeklyHealthChart.jsx`)
```js
// غيّر الـ THRESHOLD لتغيير اللون الوردي
const THRESHOLD = 60;

// غيّر الألوان من هنا
fill={entry.score < THRESHOLD ? "#f9a8d4" : "#c5ddb8"}
```

### Donut Chart (`AnimalDistributionChart.jsx`)
```js
// الألوان في mockData.js في كل item
{ name: "الأبقار", value: 744, color: "#3d6b47" }
```

---

## 🎨 Theme Colors

```css
--color-primary:       #2d5a1b  (dark green)
--color-primary-light: #3d6b47  (medium green)
--color-accent:        #c5ddb8  (pale green)
--color-bg:            #f5f2eb  (warm beige)
```
