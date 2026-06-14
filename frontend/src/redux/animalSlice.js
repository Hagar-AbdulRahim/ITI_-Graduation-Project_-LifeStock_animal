// ─── Animal Profile Feature — Redux Slice ────────────────────────────────────
// Manages state for: animal, vaccinations, medicalHistory, diagnosisHistory,
// weightHistory, and notes. All thunks call animalService; swap to real API
// by simply wiring the backend endpoints in animalService.js.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { animalService } from '../features/animals/services/animalService';


// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAnimalById = createAsyncThunk(
  'animal/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      // animalService already returns response.data = {success, data}
      const result = await animalService.getAnimalById(id);
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحميل بيانات الحيوان');
    }
  }
);

export const fetchAnimalVaccinations = createAsyncThunk(
  'animal/fetchVaccinations',
  async (id, { rejectWithValue }) => {
    try {
      const result = await animalService.getAnimalVaccinations(id);
      return result.data || [];
    } catch (error) {
      // Endpoint may not exist yet on backend — return empty gracefully
      return [];
    }
  }
);

export const fetchAnimalMedicalHistory = createAsyncThunk(
  'animal/fetchMedicalHistory',
  async (id, { rejectWithValue }) => {
    try {
      const result = await animalService.getAnimalMedicalHistory(id);
      return result.data || [];
    } catch (error) {
      // Endpoint may not exist yet on backend — return empty gracefully
      return [];
    }
  }
);

export const fetchAnimalDiagnosisHistory = createAsyncThunk(
  'animal/fetchDiagnosisHistory',
  async (id, { rejectWithValue }) => {
    try {
      const result = await animalService.getAnimalDiagnosisHistory(id);
      return result.data || [];
    } catch (error) {
      // Endpoint may not exist yet on backend — return empty gracefully
      return [];
    }
  }
);

export const fetchAnimalWeightHistory = createAsyncThunk(
  'animal/fetchWeightHistory',
  async (id, { rejectWithValue }) => {
    try {
      const result = await animalService.getAnimalWeightHistory(id);
      return result.data || [];
    } catch (error) {
      // Endpoint may not exist yet on backend — return empty gracefully
      return [];
    }
  }
);

// ─── Mutation Thunks ──────────────────────────────────────────────────────────

export const addNewAnimal = createAsyncThunk(
  'animal/addNewAnimal',
  async (animalData, { rejectWithValue }) => {
    try {
      const result = await animalService.createAnimal(animalData);
      return result.data; // backend returns {success, message, data: animal}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء الحيوان');
    }
  }
);

export const updateExistingAnimal = createAsyncThunk(
  'animal/updateExistingAnimal',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await animalService.updateAnimal(id, data);
      return result.data; // backend returns {success, message, data: animal}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحديث بيانات الحيوان');
    }
  }
);

export const addVaccination = createAsyncThunk(
  'animal/addVaccination',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await animalService.addAnimalVaccination(id, data);
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إضافة التطعيم');
    }
  }
);

export const addMedicalRecord = createAsyncThunk(
  'animal/addMedicalRecord',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const result = await animalService.addAnimalMedicalRecord(id, data);
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إضافة السجل الطبي');
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  animal: null,
  vaccinations: [],
  medicalHistory: [],
  diagnosisHistory: [],
  weightHistory: [],
  notes: [], // Notes endpoint not yet planned
  loading: {
    animal: false,
    vaccinations: false,
    medicalHistory: false,
    diagnosisHistory: false,
    weightHistory: false,
    saving: false,
  },
  error: {
    animal: null,
    vaccinations: null,
    medicalHistory: null,
    diagnosisHistory: null,
    weightHistory: null,
    saving: null,
  },
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const animalSlice = createSlice({
  name: 'animal',
  initialState,
  reducers: {
    clearAnimalState: () => initialState,
  },
  extraReducers: (builder) => {
    // ── fetchAnimalById ──────────────────────────────────────────────────────
    builder
      .addCase(fetchAnimalById.pending, (state) => {
        state.loading.animal = true;
        state.error.animal = null;
      })
      .addCase(fetchAnimalById.fulfilled, (state, action) => {
        state.loading.animal = false;
        state.animal = action.payload;
      })
      .addCase(fetchAnimalById.rejected, (state, action) => {
        state.loading.animal = false;
        state.error.animal = action.payload || 'فشل في تحميل بيانات الحيوان';
      });

    // ── fetchAnimalVaccinations ──────────────────────────────────────────────
    builder
      .addCase(fetchAnimalVaccinations.pending, (state) => {
        state.loading.vaccinations = true;
        state.error.vaccinations = null;
      })
      .addCase(fetchAnimalVaccinations.fulfilled, (state, action) => {
        state.loading.vaccinations = false;
        state.vaccinations = action.payload;
      })
      .addCase(fetchAnimalVaccinations.rejected, (state, action) => {
        state.loading.vaccinations = false;
        state.error.vaccinations = action.payload || 'فشل في تحميل سجل التطعيمات';
      });

    // ── fetchAnimalMedicalHistory ────────────────────────────────────────────
    builder
      .addCase(fetchAnimalMedicalHistory.pending, (state) => {
        state.loading.medicalHistory = true;
        state.error.medicalHistory = null;
      })
      .addCase(fetchAnimalMedicalHistory.fulfilled, (state, action) => {
        state.loading.medicalHistory = false;
        state.medicalHistory = action.payload;
      })
      .addCase(fetchAnimalMedicalHistory.rejected, (state, action) => {
        state.loading.medicalHistory = false;
        state.error.medicalHistory = action.payload || 'فشل في تحميل السجل الطبي';
      });

    // ── fetchAnimalDiagnosisHistory ──────────────────────────────────────────
    builder
      .addCase(fetchAnimalDiagnosisHistory.pending, (state) => {
        state.loading.diagnosisHistory = true;
        state.error.diagnosisHistory = null;
      })
      .addCase(fetchAnimalDiagnosisHistory.fulfilled, (state, action) => {
        state.loading.diagnosisHistory = false;
        state.diagnosisHistory = action.payload;
      })
      .addCase(fetchAnimalDiagnosisHistory.rejected, (state, action) => {
        state.loading.diagnosisHistory = false;
        state.error.diagnosisHistory =
          action.payload || 'فشل في تحميل سجل التشخيصات';
      });

    // ── fetchAnimalWeightHistory ─────────────────────────────────────────────
    builder
      .addCase(fetchAnimalWeightHistory.pending, (state) => {
        state.loading.weightHistory = true;
        state.error.weightHistory = null;
      })
      .addCase(fetchAnimalWeightHistory.fulfilled, (state, action) => {
        state.loading.weightHistory = false;
        state.weightHistory = action.payload;
      })
      .addCase(fetchAnimalWeightHistory.rejected, (state, action) => {
        state.loading.weightHistory = false;
        state.error.weightHistory =
          action.payload || 'فشل في تحميل سجل الأوزان';
      })

    // ── Mutations ────────────────────────────────────────────────────────────
      .addCase(addNewAnimal.pending, (state) => {
        state.loading.saving = true;
        state.error.saving = null;
      })
      .addCase(addNewAnimal.fulfilled, (state) => {
        state.loading.saving = false;
      })
      .addCase(addNewAnimal.rejected, (state, action) => {
        state.loading.saving = false;
        state.error.saving = action.payload || 'فشل في حفظ بيانات الحيوان';
      })
      
      .addCase(updateExistingAnimal.pending, (state) => {
        state.loading.saving = true;
        state.error.saving = null;
      })
      .addCase(updateExistingAnimal.fulfilled, (state, action) => {
        state.loading.saving = false;
        if (state.animal && state.animal._id === action.payload._id) {
          state.animal = action.payload;
        }
      })
      .addCase(updateExistingAnimal.rejected, (state, action) => {
        state.loading.saving = false;
        state.error.saving = action.payload || 'فشل في تحديث بيانات الحيوان';
      })

      .addCase(addVaccination.pending, (state) => {
        state.loading.saving = true;
        state.error.saving = null;
      })
      .addCase(addVaccination.fulfilled, (state, action) => {
        state.loading.saving = false;
        state.vaccinations.push(action.payload);
      })
      .addCase(addVaccination.rejected, (state, action) => {
        state.loading.saving = false;
        state.error.saving = action.payload || 'فشل في إضافة التطعيم';
      })

      .addCase(addMedicalRecord.pending, (state) => {
        state.loading.saving = true;
        state.error.saving = null;
      })
      .addCase(addMedicalRecord.fulfilled, (state, action) => {
        state.loading.saving = false;
        state.medicalHistory.push(action.payload);
      })
      .addCase(addMedicalRecord.rejected, (state, action) => {
        state.loading.saving = false;
        state.error.saving = action.payload || 'فشل في إضافة السجل الطبي';
      });
  },
});

export const { clearAnimalState } = animalSlice.actions;
export default animalSlice.reducer;
