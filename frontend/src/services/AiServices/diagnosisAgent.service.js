import axiosInstance from '../axiosInstance';

export const diagnose = async ({ animalId, species, symptoms }) => {
  const body = { symptoms };
  if (animalId) {
    body.animal_id = animalId;
  } else {
    body.species = species;
  }

  const response = await axiosInstance.post('/health-cases/diagnose', body);
  return response.data;
};

export const diagnoseImage = async ({ file, animalId, species }) => {
  const formData = new FormData();
  formData.append('image', file);
  if (animalId) {
    formData.append('animal_id', animalId);
  } else {
    formData.append('species', species);
  }

  const response = await axiosInstance.post('/health-cases/diagnose/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const diagnoseVoice = async ({ audio, animalId, species }) => {
  const formData = new FormData();
  formData.append('audio', audio);
  if (animalId) {
    formData.append('animal_id', animalId);
  } else {
    formData.append('species', species);
  }

  const response = await axiosInstance.post('/health-cases/diagnose/voice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const diagnosisAgentService = {
  diagnose,
  diagnoseImage,
  diagnoseVoice,
};

export default diagnosisAgentService;
