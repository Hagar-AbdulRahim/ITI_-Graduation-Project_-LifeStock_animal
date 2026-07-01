/**
 * خدمة البحث عن عيادات/مستشفيات بيطرية قريبة عبر OpenStreetMap
 * - Overpass API  → بيجيب العيادات القريبة (مع fallback mirrors + retry)
 * - Nominatim     → بيحول اسم المحافظة لـ lat/lng (fallback)
 *
 * مفيش API key — مجاناً تماماً
 */
const axios = require("axios");

const USER_AGENT      = "LifeStock-App/1.0 (mariamelwheshiy@gmail.com)";
const NOMINATIM_URL   = "https://nominatim.openstreetmap.org/search";
const DEFAULT_RADIUS  = 10000; // 10 كم

// أكتر من mirror للـ Overpass عشان لو واحد وقع أو رفض نجرب اللي بعده
// (السيرفر المجاني بتاع overpass-api.de بيرفض/يبطئ لو الطلبات كتير في وقت قصير)
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * يحول اسم المحافظة لـ lat/lng عبر Nominatim
 */
const geocodeGovernorate = async (governorate) => {
  try {
    const res = await axios.get(NOMINATIM_URL, {
      headers: { "User-Agent": USER_AGENT },
      params: {
        q:              `${governorate}, Egypt`,
        format:         "json",
        limit:          1,
        addressdetails: 0,
      },
      timeout: 8000,
    });
    if (res.data?.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon),
      };
    }
    return null;
  } catch (err) {
    console.error("Nominatim error:", err.message);
    return null;
  }
};

/**
 * يحسب المسافة بين نقطتين بالكيلومتر (Haversine)
 */
const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

const buildOverpassQuery = (lat, lng, radius) => `
  [out:json][timeout:20];
  (
    node["amenity"="veterinary"](around:${radius},${lat},${lng});
    way["amenity"="veterinary"](around:${radius},${lat},${lng});
    node["shop"="veterinary"](around:${radius},${lat},${lng});
  );
  out body;
  >;
  out skel qt;
`;

/**
 * بينادي على mirror واحد بمهلة زمنية محددة
 */
const callOverpassMirror = async (url, query, timeout) => {
  const res = await axios.post(url, `data=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent":   USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout,
  });
  return res.data?.elements || [];
};

/**
 * يجيب العيادات البيطرية القريبة عبر Overpass API
 * بيجرب كل الـ mirrors بالترتيب، ولو الأول رجّع 504/429/timeout يجرب اللي بعده
 */
const findNearbyClinics = async ({ lat, lng, radius = DEFAULT_RADIUS }) => {
  const query = buildOverpassQuery(lat, lng, radius);

  let lastError = null;

  for (let i = 0; i < OVERPASS_MIRRORS.length; i++) {
    const url = OVERPASS_MIRRORS[i];
    try {
      const elements = await callOverpassMirror(url, query, 15000);
      return mapElementsToClinics(elements, lat, lng);
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      console.error(
        `Overpass mirror #${i + 1} (${url}) failed:`,
        status || err.code || err.message
      );

      // لو السيرفر مشغول (504/429/503) استنى شوية وجرب اللي بعده
      // لو خطأ تاني (زي 400) مفيش داعي نستنى
      if ([429, 500, 502, 503, 504].includes(status) || err.code === "ECONNABORTED") {
        await sleep(500);
        continue;
      }
    }
  }

  // كل الـ mirrors فشلوا — نرجّع مصفوفة فاضية بدل ما نكسر الـ route بالكامل
  console.error("All Overpass mirrors failed:", lastError?.message);
  return [];
};

const mapElementsToClinics = (elements, lat, lng) => {
  return elements
    .filter((el) => el.type === "node" && el.lat && el.lon)
    .map((el) => {
      const tags = el.tags || {};
      return {
        place_id:     el.id.toString(),
        name:         tags.name || tags["name:ar"] || "عيادة بيطرية",
        address:      [
          tags["addr:street"],
          tags["addr:city"] || tags["addr:governorate"],
        ].filter(Boolean).join("، ") || null,
        phone:        tags.phone || tags["contact:phone"] || null,
        opening_hours: tags.opening_hours || null,
        lat:          el.lat,
        lng:          el.lon,
        distance_km:  calculateDistanceKm(lat, lng, el.lat, el.lon),
        source:       "openstreetmap",
      };
    })
    .sort((a, b) => a.distance_km - b.distance_km);
};

module.exports = { findNearbyClinics, geocodeGovernorate };