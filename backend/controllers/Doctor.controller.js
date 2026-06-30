const HealthCase    = require("../models/healthCase");
const Consultation  = require("../models/Consultation");
const OutbreakReport = require("../models/Outbreakreport");
const { doctorGovernorateQuery, parsePagination, paginatedResponse } = require("../utils/accessControl");

// ════════════════════════════════════════════════════════════════════════════
// GET /api/doctor/dashboard/stats
// ════════════════════════════════════════════════════════════════════════════
const getDashboardStats = async (req, res) => {
  try {
    const govFilter = doctorGovernorateQuery(req.user);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [openCases, consultationsToday, outbreaks] = await Promise.all([
      HealthCase.countDocuments({ ...govFilter, resolved: false }),
      Consultation.countDocuments({ ...govFilter, created_at: { $gte: todayStart } }),
      OutbreakReport.countDocuments({ ...govFilter, status: "active" }),
    ]);

    res.json({
      success: true,
      data: {
        open_cases: openCases,
        consultations_today: consultationsToday,
        active_outbreaks: outbreaks,
      },
    });
  } catch (err) {
    console.error("doctor getDashboardStats error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// GET /api/doctor/health-cases
// ════════════════════════════════════════════════════════════════════════════
const getHealthCases = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { ...doctorGovernorateQuery(req.user) };

    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status === "resolved") filter.resolved = true;
    if (req.query.status === "open") filter.resolved = false;

    const [cases, total] = await Promise.all([
      HealthCase.find(filter)
        .populate("animal_id", "tag_number species")
        .populate("user_id", "name email phone")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      HealthCase.countDocuments(filter),
    ]);

    paginatedResponse(res, cases, total, page, limit);
  } catch (err) {
    console.error("doctor getHealthCases error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/doctor/health-cases/:id/review
// ════════════════════════════════════════════════════════════════════════════
const reviewHealthCase = async (req, res) => {
  try {
    const healthCase = await HealthCase.findById(req.params.id);
    if (!healthCase) return res.status(404).json({ success: false, message: "الحالة غير موجودة" });

    const govFilter = doctorGovernorateQuery(req.user);
    if (govFilter.governorate && !govFilter.governorate.$in.includes(healthCase.governorate)) {
      return res.status(403).json({ success: false, message: "هذه الحالة خارج نطاق محافظاتك" });
    }

    const { vet_notes, severity, recommended_treatment } = req.body;
    if (vet_notes !== undefined) healthCase.vet_notes = vet_notes;
    if (severity !== undefined) healthCase.severity = severity;
    if (recommended_treatment !== undefined) healthCase.recommended_treatment = recommended_treatment;
    healthCase.reviewed_by = req.user._id;
    healthCase.reviewed_at = new Date();
    healthCase.vet_consulted = true;

    await healthCase.save();

    res.json({ success: true, message: "تمت مراجعة الحالة", data: healthCase });
  } catch (err) {
    console.error("reviewHealthCase error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// GET /api/doctor/consultations
// ════════════════════════════════════════════════════════════════════════════
const getConsultations = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { ...doctorGovernorateQuery(req.user), doctor_status: "pending" };

    const [consultations, total] = await Promise.all([
      Consultation.find(filter).populate("user_id", "name email phone").sort({ created_at: -1 }).skip(skip).limit(limit),
      Consultation.countDocuments(filter),
    ]);

    paginatedResponse(res, consultations, total, page, limit);
  } catch (err) {
    console.error("doctor getConsultations error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/doctor/consultations/:id/respond
// ════════════════════════════════════════════════════════════════════════════
const respondConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ success: false, message: "الاستشارة غير موجودة" });

    const govFilter = doctorGovernorateQuery(req.user);
    if (govFilter.governorate && !govFilter.governorate.$in.includes(consultation.governorate)) {
      return res.status(403).json({ success: false, message: "هذه الاستشارة خارج نطاق محافظاتك" });
    }

    const { doctor_response } = req.body;
    if (!doctor_response) {
      return res.status(400).json({ success: false, message: "رد الطبيب مطلوب" });
    }

    consultation.doctor_response = doctor_response;
    consultation.doctor_status = "responded";
    consultation.responded_by = req.user._id;
    consultation.responded_at = new Date();
    await consultation.save();

    res.json({ success: true, message: "تم إرسال الرد", data: consultation });
  } catch (err) {
    console.error("respondConsultation error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// GET /api/doctor/outbreaks
// ════════════════════════════════════════════════════════════════════════════
const getOutbreaks = async (req, res) => {
  try {
    const filter = { status: "active", ...doctorGovernorateQuery(req.user) };
    const outbreaks = await OutbreakReport.find(filter).sort({ detected_at: -1 });
    res.json({ success: true, count: outbreaks.length, data: outbreaks });
  } catch (err) {
    console.error("doctor getOutbreaks error:", err);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getDashboardStats,
  getHealthCases,
  reviewHealthCase,
  getConsultations,
  respondConsultation,
  getOutbreaks,
};
