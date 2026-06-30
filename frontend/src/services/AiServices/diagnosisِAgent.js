import axiosInstance from '../axiosInstance'

//  TEXT DIAGNOSIS
export const diagnoseByText = (animalId, symptoms) => {
  return axiosInstance
    .post('/health-cases/diagnose', {
      animal_id: animalId,
      symptoms,
    })
    .then((res) => res.data)
}

//  IMAGE DIAGNOSIS
export const diagnoseByImage = (file, animalId) => {
  const formData = new FormData()

  formData.append('image', file)
  formData.append('animal_id', animalId)

  return axiosInstance
    .post('/health-cases/diagnose/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data)
}

//  VOICE DIAGNOSIS
export const diagnoseByVoice = (file, animalId) => {
  const formData = new FormData()

  formData.append('audio', file)
  formData.append('animal_id', animalId)

  return axiosInstance
    .post('/health-cases/diagnose/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data)
}

//  optional export object
export default {
  diagnoseByText,
  diagnoseByImage,
  diagnoseByVoice,
}
