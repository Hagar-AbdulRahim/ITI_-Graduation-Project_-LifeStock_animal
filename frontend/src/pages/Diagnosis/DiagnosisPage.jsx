import axiosInstance from './axiosInstance'

// 🧠 Diagnosis Agent
// general OR linked to animal

export const diagnose = async ({
  animalId = null,
  species = 'cattle',
  symptoms = [],
}) => {
  const body = {
    symptoms,
  }

  // لو فيه حيوان اربطه
  if (animalId) {
    body.animal_id = animalId
  } else {
    // استشارة عامة
    body.species = species
  }

  const response = await axiosInstance.post('/health-cases/diagnose', body)

  return response.data
}

// 🖼️ Image Diagnosis

export const diagnoseImage = async ({
  file,
  animalId = null,
  species = 'cattle',
}) => {
  const formData = new FormData()

  formData.append('image', file)

  if (animalId) {
    formData.append('animal_id', animalId)
  } else {
    formData.append('species', species)
  }

  const response = await axiosInstance.post(
    '/health-cases/diagnose/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

// 🎤 Voice Diagnosis

export const diagnoseVoice = async ({
  audio,
  animalId = null,
  species = 'cattle',
}) => {
  const formData = new FormData()

  formData.append('audio', audio)

  if (animalId) {
    formData.append('animal_id', animalId)
  } else {
    formData.append('species', species)
  }

  const response = await axiosInstance.post(
    '/health-cases/diagnose/voice',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}

export default {
  diagnose,
  diagnoseImage,
  diagnoseVoice,
}
