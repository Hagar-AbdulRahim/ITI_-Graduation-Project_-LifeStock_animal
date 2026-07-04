/**
 * خدمة البحث عن عيادات/مستشفيات بيطرية قريبة
 * - Geoapify Places API → بيانات أماكن حقيقية (اسم، عنوان، تليفون، ساعات)
 * - Nominatim           → تحويل اسم المحافظة لـ lat/lng (fallback)
 */
const axios = require("axios");

const USER_AGENT        = "LifeStock-App/1.0 (mariamelwheshiy@gmail.com)";
const NOMINATIM_URL     = "https://nominatim.openstreetmap.org/search";
const GEOAPIFY_URL      = "https://api.geoapify.com/v2/places";
const DEFAULT_RADIUS    = 10000; // 10 كم

// ── Nominatim: تحويل اسم المحافظة لإحداثيات ─────────────
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

// ── Haversine: حساب المسافة بالكيلومتر ──────────────────
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

// ── Geoapify: البحث عن عيادات بيطرية قريبة ──────────────
const findNearbyClinics = async ({ lat, lng, radius = DEFAULT_RADIUS }) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    console.error("GEOAPIFY_API_KEY غير موجود في .env");
    return [];
  }

  try {
    const res = await axios.get(GEOAPIFY_URL, {
      params: {
        categories: "pet.veterinary",
        filter: `circle:${lng},${lat},${radius}`,
        limit:      15,
        apiKey,
      },
      timeout: 15000,
    });

    const features = res.data?.features || [];

    return features
      .map((f) => {
        const p = f.properties || {};
        const placeLat = f.geometry?.coordinates?.[1] ?? null;
        const placeLng = f.geometry?.coordinates?.[0] ?? null;

        const addressParts = [
          p.address_line1,
          p.address_line2,
        ].filter(Boolean);

        return {
          place_id:      p.place_id || f.id,
          name:          p.name || "عيادة بيطرية",
          address:       addressParts.join("، ") || null,
          phone:         p.contact?.phone || p.datasource?.raw?.phone || null,
          opening_hours: p.opening_hours || p.datasource?.raw?.opening_hours || null,
          lat:           placeLat,
          lng:           placeLng,
          distance_km:   placeLat && placeLng
                           ? calculateDistanceKm(lat, lng, placeLat, placeLng)
                           : null,
          source:        "geoapify",
        };
      })
      .filter((c) => c.lat && c.lng)
      .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));

  } catch (err) {
    const status = err.response?.status;
    console.error("Geoapify error:", status, JSON.stringify(err.response?.data));
    if (status === 401) console.error("GEOAPIFY_API_KEY غلط أو منتهي");
    if (status === 429) console.error("Geoapify rate limit");
    return [];
    
  }
  
};


module.exports = { findNearbyClinics, geocodeGovernorate };