// services/dashboardService.js
// ─────────────────────────────────────────────────────────────
// كل الـ API calls هتتحط هنا لما يجي الـ Backend
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.livestock-health.com/v1";

// الـ token هيجي من authService أو localStorage
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ── Dashboard Overview ──────────────────────────────────────
export const fetchDashboardStats = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
  // Expected shape: { total, sick, vaccinations, emergencies }
};

export const fetchAnimalDistribution = async () => {
  const res = await fetch(`${BASE_URL}/animals/distribution`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch distribution");
  return res.json();
  // Expected shape: [{ name, value, percentage, color }]
};

export const fetchWeeklyTrends = async (period = "7days") => {
  const res = await fetch(`${BASE_URL}/health/trends?period=${period}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch trends");
  return res.json();
  // Expected shape: [{ day, score, label }]
};

export const fetchAIRecommendations = async () => {
  const res = await fetch(`${BASE_URL}/ai/recommendations`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
};

export const fetchRecentActivities = async () => {
  const res = await fetch(`${BASE_URL}/activities/recent`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
};
