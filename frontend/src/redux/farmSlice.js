import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { farmService } from '../services/farmService';
import { animalService } from '../features/animals/services/animalService';

export const fetchMyFarms = createAsyncThunk(
  'farm/fetchMyFarms',
  async (_, { rejectWithValue }) => {
    try {
      // farmService already returns response.data (the full {success, data} object)
      const result = await farmService.getMyFarms();
      return result.data; // result = {success, count, data: [...farms]}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحميل المزارع');
    }
  }
);

export const fetchFarmById = createAsyncThunk(
  'farm/fetchFarmById',
  async (id, { rejectWithValue }) => {
    try {
      const result = await farmService.getFarmById(id);
      return result.data; // result = {success, data: farm}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحميل تفاصيل المزرعة');
    }
  }
);

export const fetchFarmAnimals = createAsyncThunk(
  'farm/fetchFarmAnimals',
  async (farmId, { rejectWithValue }) => {
    try {
      const result = await animalService.getAnimalsByFarm(farmId);
      return result.data; // result = {success, count, data: [...animals]}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحميل حيوانات المزرعة');
    }
  }
);

export const fetchFarmStats = createAsyncThunk(
  'farm/fetchFarmStats',
  async (farmId, { rejectWithValue }) => {
    try {
      // GET /api/farms/:id/stats
      // axios: response.data = { success, data: { farm, stats: {...} } }
      // farmService already returns response.data, so result = { success, data: { farm, stats } }
      const result = await farmService.getFarmStats(farmId);
      return result.data; // { farm, stats: { total_animals, by_species, by_health_status, upcoming_vaccinations, emergencies, ... } }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في تحميل إحصائيات المزرعة');
    }
  }
);

export const addNewFarm = createAsyncThunk(
  'farm/addNewFarm',
  async (farmData, { rejectWithValue }) => {
    try {
      const result = await farmService.createFarm(farmData);
      return result.data; // {success, data: farm}
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل في إنشاء المزرعة');
    }
  }
);
const initialState = {
  farms: [],
  currentFarm: null,
  farmAnimals: [],
  farmStats: null, // populated by GET /api/farms/:id/stats
  loading: {
    farms: false,
    currentFarm: false,
    animals: false,
    stats: false,
  },
  error: {
    farms: null,
    currentFarm: null,
    animals: null,
    stats: null,
  },
};

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    clearFarmState: () => initialState,
    clearFarmErrors: (state) => {
      state.error = { farms: null, currentFarm: null, animals: null, stats: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Farms
      .addCase(fetchMyFarms.pending, (state) => {
        state.loading.farms = true;
        state.error.farms = null;
      })
      .addCase(fetchMyFarms.fulfilled, (state, action) => {
        state.loading.farms = false;
        state.farms = action.payload || [];
      })
      .addCase(fetchMyFarms.rejected, (state, action) => {
        state.loading.farms = false;
        state.error.farms = action.payload;
      })
      // Fetch Farm By Id
      .addCase(fetchFarmById.pending, (state) => {
        state.loading.currentFarm = true;
        state.error.currentFarm = null;
      })
      .addCase(fetchFarmById.fulfilled, (state, action) => {
        state.loading.currentFarm = false;
        state.currentFarm = action.payload;
      })
      .addCase(fetchFarmById.rejected, (state, action) => {
        state.loading.currentFarm = false;
        state.error.currentFarm = action.payload;
      })
      // Fetch Farm Animals
      .addCase(fetchFarmAnimals.pending, (state) => {
        state.loading.animals = true;
        state.error.animals = null;
      })
      .addCase(fetchFarmAnimals.fulfilled, (state, action) => {
        state.loading.animals = false;
        state.farmAnimals = action.payload || [];
      })
      .addCase(fetchFarmAnimals.rejected, (state, action) => {
        state.loading.animals = false;
        state.error.animals = action.payload;
      })
      // Fetch Farm Stats (real endpoint: GET /api/farms/:id/stats)
      .addCase(fetchFarmStats.pending, (state) => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(fetchFarmStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.farmStats = action.payload; // {farm, stats: {total_animals, by_species, by_health_status}}
      })
      .addCase(fetchFarmStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload;
      })
      // Add New Farm
      .addCase(addNewFarm.pending, (state) => {
        state.loading.farms = true;
        state.error.farms = null;
      })
      .addCase(addNewFarm.fulfilled, (state, action) => {
        state.loading.farms = false;
        state.farms.push(action.payload);
      })
      .addCase(addNewFarm.rejected, (state, action) => {
        state.loading.farms = false;
        state.error.farms = action.payload;
      });
  },
});

export const { clearFarmState, clearFarmErrors } = farmSlice.actions;
export default farmSlice.reducer;
