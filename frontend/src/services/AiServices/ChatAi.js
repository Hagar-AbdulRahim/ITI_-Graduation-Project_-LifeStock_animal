// ChatAi.js — يستخدم نفس api instance المستخدم في التطبيق كله (Redux store token)
import api from '../api'

// 🤖 CHAT WITH AI (Onboarding / Assistant)
export const chatWithAI = (animalId, message, history = []) => {
  return api
    .post(`/api/onboarding/${animalId}/chat`, {
      message,
      history,
    })
    .then((res) => res.data)
}

// 🩺 DIAGNOSE WITH AI — Text (Health Cases)
export const diagnoseWithAI = (animalId, symptoms, species) => {
  return api
    .post(`/api/health-cases/diagnose`, {
      animal_id: animalId || undefined,
      symptoms: [symptoms],
      species: species || undefined,
    })
    .then((res) => res.data)
}

// 📸 DIAGNOSE WITH IMAGE
export const diagnoseWithImage = (imageFile, animalId, species, symptoms) => {
  const formData = new FormData()

  // Fix MIME type: .jfif and other JPEG variants often get sent as application/octet-stream
  const ext = imageFile.name.split('.').pop().toLowerCase()
  const mimeMap = { jfif: 'image/jpeg', jpe: 'image/jpeg', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const correctMime = mimeMap[ext] || imageFile.type || 'image/jpeg'

  const fixedFile = imageFile.type === correctMime
    ? imageFile
    : new File([imageFile], imageFile.name.replace(`.${ext}`, '.jpg'), { type: correctMime })

  formData.append('image', fixedFile)
  if (animalId) formData.append('animal_id', animalId)
  if (species) formData.append('species', species)
  if (symptoms) formData.append('symptoms', symptoms)

  return api
    .post(`/api/health-cases/diagnose/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    })
    .then((res) => res.data)
}

// 🎙️ DIAGNOSE WITH VOICE
export const diagnoseWithVoice = (audioBlob, animalId, species) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  if (animalId) formData.append('animal_id', animalId)
  if (species) formData.append('species', species)

  return api
    .post(`/api/health-cases/diagnose/voice`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    })
    .then((res) => res.data)
}
