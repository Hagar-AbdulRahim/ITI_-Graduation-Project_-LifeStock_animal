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
export const diagnoseWithAI = (animalId, symptoms, species, chatHistory = []) => {
  return api
    .post(`/api/health-cases/diagnose`, {
      animal_id: animalId || undefined,
      symptoms: [symptoms],
      species: species || undefined,
      chatHistory,
    })
    .then((res) => res.data)
}

// 📸 DIAGNOSE WITH IMAGE
export const diagnoseWithImage = (imageFile, animalId, species, symptoms) => {
  const formData = new FormData()
  const files = Array.isArray(imageFile) ? imageFile : [imageFile]

  const mimeMap = { jfif: 'image/jpeg', jpe: 'image/jpeg', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

  files.forEach((file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    const correctMime = mimeMap[ext] || file.type || 'image/jpeg'
    const fixedFile = file.type === correctMime
      ? file
      : new File([file], file.name.replace(`.${ext}`, '.jpg'), { type: correctMime })

    formData.append('images', fixedFile)
  })

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

// 🎙️🖼️ DIAGNOSE WITH AUDIO + IMAGES
export const diagnoseWithMixed = (audioBlob, imageFiles, animalId, species, symptoms) => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  const mimeMap = { jfif: 'image/jpeg', jpe: 'image/jpeg', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

  const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles]
  files.forEach((file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    const correctMime = mimeMap[ext] || file.type || 'image/jpeg'
    const fixedFile = file.type === correctMime
      ? file
      : new File([file], file.name.replace(`.${ext}`, '.jpg'), { type: correctMime })
    formData.append('images', fixedFile)
  })

  if (animalId) formData.append('animal_id', animalId)
  if (species) formData.append('species', species)
  if (symptoms) formData.append('symptoms', symptoms)

  return api
    .post(`/api/health-cases/diagnose/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    })
    .then((res) => res.data)
}
