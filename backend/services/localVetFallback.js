/**
 * localVetFallback.js
 * -----------------------------------------------------------------------
 * بيتفعل من جوه clinicsService.js لما Geoapify يرجّع مصفوفة فاضية.
 * بيرجع نتايج بنفس شكل بيانات findNearbyClinics بالظبط
 * (place_id, name, address, phone, opening_hours, lat, lng, distance_km, source)
 * عشان الفرونت (EmergencyPage.jsx) يشتغل من غير أي تعديل.
 *
 * منطق المطابقة:
 *   1) عندهم إحداثيات -> Haversine distance فعلي، بيترتبوا الأول.
 *   2) من غيرهم       -> مطابقة بالمحافظة بس (English governorate name)، من غير مسافة.
 * -----------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { toEnglishGovernorate } = require("../utils/governorateMap");

const DATA_PATH = path.join(__dirname, "..", "knowledge-base", "vet_directorates_egypt.json");

let cachedData = null;

function loadLocalVetData() {
  if (cachedData) return cachedData;
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  cachedData = JSON.parse(raw);
  return cachedData;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

/** لو مفيش governorate متبعت، نجيبها بالـ reverse geocoding من نفس Geoapify key */
async function getGovernorateFromCoords(lat, lng) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
      params: { lat, lon: lng, lang: "en", apiKey },
      timeout: 8000,
    });
    const props = res.data?.features?.[0]?.properties;
    return props?.state || props?.county || null;
  } catch (err) {
    console.error("localVetFallback reverse geocode error:", err.message);
    return null;
  }
}

/** بيحول working_hours (سترنج أو أوبچكت أيام) لسترنج مقروءة زي opening_hours بتاع Geoapify */
function formatWorkingHours(working_hours) {
  if (!working_hours) return null;
  if (typeof working_hours === "string") return working_hours;

  const days = Object.entries(working_hours);
  const openDays = days.filter(([, v]) => v && v !== "Closed");
  const closedDays = days.filter(([, v]) => v === "Closed");

  const uniqueHours = [...new Set(openDays.map(([, v]) => v))];
  if (uniqueHours.length === 1 && closedDays.length <= 1) {
    const closedNote = closedDays.length
      ? ` (ماعدا ${closedDays.map(([d]) => d).join(", ")})`
      : "";
    return `${uniqueHours[0]}${closedNote}`;
  }
  // fallback عام لو الساعات مختلفة من يوم لآخر
  return days.map(([d, v]) => `${d}: ${v}`).join(" | ");
}

function normalizeEntry(entry, distance_km) {
  return {
    place_id: entry.name_ar || entry.name, // مفيش place_id حقيقي، نستخدم الاسم كمعرف فريد
    name: entry.name_ar || entry.name,
    address: entry.address || null,
    phone: entry.phone || entry.alternate_phone || null,
    opening_hours: formatWorkingHours(entry.working_hours),
    lat: entry.latitude ?? null,
    lng: entry.longitude ?? null,
    distance_km,
    source: "local_directorate", // عشان تفرق بينها وبين نتايج geoapify لو حبيت
  };
}

/**
 * @param {Object} params
 * @param {number} params.lat
 * @param {number} params.lng
 * @param {string} [params.governorate] - عربي أو إنجليزي، اختياري
 * @param {number} [params.limit=10]
 */
async function findNearbyFromLocalDB({ lat, lng, governorate, limit = 10 }) {
  const data = loadLocalVetData();

  let enGovernorate = toEnglishGovernorate(governorate);
  if (!enGovernorate && lat && lng) {
    enGovernorate = await getGovernorateFromCoords(lat, lng);
  }

  // 1) نفلتر بالمحافظة الأول (لو معروفة) — عشان محافظة متبانش لواحد في محافظة تانية.
  //    لو مش عارفين المحافظة خالص (نادر)، بنرجع لكل الداتا كحل أخير.
  const pool = enGovernorate
    ? data.filter((e) => e.governorate?.toLowerCase() === enGovernorate.toLowerCase())
    : data;

  // 2) جوه نفس المحافظة: اللي عندهم إحداثيات نرتبهم بالمسافة الفعلية،
  //    واللي مالهومش إحداثيات نضيفهم في الآخر من غير مسافة.
  const withDistance = [];
  const withoutDistance = [];

  for (const e of pool) {
    if (e.latitude != null && e.longitude != null && lat && lng) {
      withDistance.push(normalizeEntry(e, haversineKm(lat, lng, e.latitude, e.longitude)));
    } else {
      withoutDistance.push(normalizeEntry(e, null));
    }
  }

  // لو مكنش فيه محافظة معروفة (بحثنا في كل الداتا)، بنحط سقف منطقي للمسافة
  // عشان مايظهرش حد على بعد مئات الكيلومترات.
  const MAX_KM_WHEN_NO_GOVERNORATE = 150;
  const filteredWithDistance = enGovernorate
    ? withDistance
    : withDistance.filter((c) => c.distance_km == null || c.distance_km <= MAX_KM_WHEN_NO_GOVERNORATE);

  filteredWithDistance.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));

  return [...filteredWithDistance, ...withoutDistance].slice(0, limit);
}

module.exports = { findNearbyFromLocalDB };