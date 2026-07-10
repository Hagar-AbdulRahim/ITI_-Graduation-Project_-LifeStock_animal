const OutbreakReport = require("../models/Outbreakreport");
const { parsePagination, paginatedResponse } = require("../utils/accessControl");

// ════════════════════════════════════════════════════════════════════════════
// GET /api/outbreaks — قائمة الفاشيات النشطة (للمستخدم العادي، read-only)
// اختياري: ?governorate=... عشان تفلتري بمحافظة اليوزر بس
// ════════════════════════════════════════════════════════════════════════════
const getPublicOutbreaks = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { status: "active" };
    if (req.query.governorate) filter.governorate = req.query.governorate;

    const [outbreaks, total] = await Promise.all([
      OutbreakReport.find(filter)
        .select(
          "disease_name governorate cases_count status ai_warning_message symptoms treatment prevention available_vaccines detected_at"
        )
        .sort({ detected_at: -1 })
        .skip(skip)
        .limit(limit),
      OutbreakReport.countDocuments(filter),
    ]);

    paginatedResponse(res, outbreaks, total, page, limit);
  } catch (err) {
    console.error("getPublicOutbreaks error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// GET /api/outbreaks/:id — تفاصيل فاشية واحدة (active بس، عشان اليوزر مايشوفش
// فاشيات لسه pending تحت مراجعة الأدمن أو resolved/rejected)
// ════════════════════════════════════════════════════════════════════════════
const getPublicOutbreakById = async (req, res) => {
  try {
    const outbreak = await OutbreakReport.findOne({
      _id: req.params.id,
      status: "active",
    });

    if (!outbreak) {
      return res.status(404).json({ success: false, message: "الفاشية غير موجودة أو غير نشطة" });
    }

    res.json({ success: true, data: outbreak });
  } catch (err) {
    console.error("getPublicOutbreakById error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = { getPublicOutbreaks, getPublicOutbreakById };
