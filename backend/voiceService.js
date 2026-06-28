const Groq = require("groq-sdk");
const fs   = require("fs");

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY غير موجود");
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * يحوّل ملف صوتي لنص عربي عبر Whisper (Groq)
 * الـ prompt بيوجّه الموديل لمصطلحات بيطرية شائعة لتحسين الدقة
 *
 * @param {string} filePath - مسار ملف الصوت المؤقت على القرص (من multer)
 * @returns {Promise<string>} النص المُفرَّغ بالعربية
 */
const transcribeAudio = async (filePath) => {
  const groq = getGroq();

  const transcription = await groq.audio.transcriptions.create({
    file:     fs.createReadStream(filePath),
    model:    "whisper-large-v3",
    language: "ar",
    prompt:   "مزرعة، ماشية، أبقار، أغنام، ماعز، مرض، أعراض، علاج",
  });

  return transcription.text;
};

module.exports = { transcribeAudio };