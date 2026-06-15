import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCensusData } from "../utils/API";
import { api } from '../utils/API';

export const fetchLocationData = createAsyncThunk(
    'heatmap/fetchLocationData',
    async ({ osmTag: passedOsmTag, radius: passedRadius } = {}, { getState, rejectWithValue }) => {
        const state = getState();
        const { lat, lng } = state.location;
        const { industry, demographics, radius } = state.filters;

        if (!lat || !lng) {
            return rejectWithValue('No location selected.');
        }

        // Use passed osmTag (from IndustryForm) or fall back to Redux state
        // Direct pass avoids timing issue where state hasn't updated yet
        const resolvedOsmTag = passedOsmTag || industry.osmTag;
        const resolvedRadius = passedRadius || radius || 5;

        if (!resolvedOsmTag) {
            return rejectWithValue('No industry selected.');
        }

        try {
            const [overpassResponse, censusResponse, blsResponse] = await Promise.all([
                api.get('/api/overpass', {
                    params: { lat, lng, osmTag: resolvedOsmTag, radius: resolvedRadius * 1000 }, // convert km to meters
                }),
                api.get('/api/census', {
                    params: { lat, lng, filters: JSON.stringify(demographics) }
                }),
                api.get('/api/bls', {
                    params: { lat, lng }
                }),
            ]);

            return {
                overpassData: overpassResponse.data,
                censusData: censusResponse.data,
                blsData: blsResponse.data,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || err.message);
        }
    }
);

export const fetchCensusOnly = createAsyncThunk(
    'heatmap/fetchCensusOnly',
    async (_, { getState, rejectWithValue }) => {
        const { location, filters } = getState();
        try {
            const demographics = await fetchCensusData({
                lat: location.lat,
                lng: location.lng,
                filters: filters.demographics,  // passed here
            });
            return { demographics };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const heatmapSlice = createSlice({
  name: 'heatmap',
  initialState: {
    overpassData: null,
    censusData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearHeatmapData: (state) => {
      state.overpassData = null;
      state.censusData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationData.fulfilled, (state, action) => {
        state.loading = false;
        state.overpassData = action.payload.overpassData;
        state.censusData = action.payload.censusData;
      })
      .addCase(fetchLocationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchCensusOnly.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCensusOnly.fulfilled, (state, action) => {
        state.loading = false;
        state.censusData = action.payload;
      })
      .addCase(fetchCensusOnly.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearHeatmapData } = heatmapSlice.actions;
export default heatmapSlice.reducer;

