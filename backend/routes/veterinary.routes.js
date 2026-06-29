// routes/veterinary.routes.js
const express = require("express");
const router  = express.Router();
const { protect } = require("../middelwares/Auth.middleware");

router.use(protect);

// POST /api/veterinary/nearby
router.post("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "الإحداثيات مطلوبة",
      });
    }

    // ── Overpass API (OpenStreetMap) ──────────────────────────────────────────
    // بيدور على veterinary clinics وانimal hospitals في نطاق معين
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="veterinary"](around:${radius},${latitude},${longitude});
        way["amenity"="veterinary"](around:${radius},${latitude},${longitude});
        node["healthcare"="veterinary"](around:${radius},${latitude},${longitude});
      );
      out body;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    `data=${encodeURIComponent(query)}`,
    });

    const data = await response.json();

    // ── تنسيق النتائج ─────────────────────────────────────────────────────────
    const clinics = data.elements.map((el) => ({
      id:        el.id,
      name:      el.tags?.name || el.tags?.["name:ar"] || "عيادة بيطرية",
      nameAr:    el.tags?.["name:ar"] || el.tags?.name || "عيادة بيطرية",
      latitude:  el.lat || el.center?.lat,
      longitude: el.lon || el.center?.lon,
      phone:     el.tags?.phone || el.tags?.["contact:phone"] || null,
      address:   el.tags?.["addr:full"] || el.tags?.["addr:street"] || null,
      opening_hours: el.tags?.opening_hours || null,
      // حساب المسافة التقريبية
      distance_km: calcDistance(latitude, longitude, el.lat || el.center?.lat, el.lon || el.center?.lon),
    }))
    .filter((c) => c.latitude && c.longitude)
    .sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      success: true,
      count:   clinics.length,
      data:    clinics,
    });
  } catch (err) {
    console.error("veterinary nearby error:", err.message);
    res.status(500).json({ success: false, message: "خطأ في البحث" });
  }
});

// ── حساب المسافة بين نقطتين (Haversine Formula) ──────────────────────────────
const calcDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R    = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
};

module.exports = router;