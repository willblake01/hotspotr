import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCensusData } from "../utils/API";
import { api } from '../utils/API';

export const fetchLocationData = createAsyncThunk(
    'heatmap/fetchLocationData',
    async ({ osmTag: passedOsmTag, radius: passedRadius } = {}, { getState, rejectWithValue }) => {
        const state = getState();
        const { lat, lng } = state.location;
        const { industry, demographics, radius } = state.filters;

        const resolvedOsmTag   = passedOsmTag   || industry.osmTag;
        const resolvedRadius   = passedRadius   || radius || 5;

        if (!lat || !lng)          return rejectWithValue('No location selected.');
        if (!resolvedOsmTag)       return rejectWithValue('No industry selected.');

        try {
            const response = await api.post('/api/score', {
                lat, lng,
                osmTag: resolvedOsmTag,
                radius: resolvedRadius,
                demographics,
            });
            return response.data; // { geoJSON, competitors }
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
        geoJSON: null,       // scored GeoJSON FeatureCollection
        competitors: null,   // raw Overpass elements for competitor pins
        loading: false,
        error: null,
    },
    reducers: {
        clearHeatmap: (state) => {
            state.geoJSON = null;
            state.competitors = null;
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
                state.geoJSON = action.payload.geoJSON;
                state.competitors = action.payload.competitors;
            })
            .addCase(fetchLocationData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default heatmapSlice.reducer;

