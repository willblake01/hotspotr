import { createSlice } from '@reduxjs/toolkit';

const locationSlice = createSlice({
    name: 'location',
    initialState: {
        lat: 30.27,
        lng: -97.74,
        zoom: 11,
        bbox: null,
        placeName: null,
        history: [],
    },
    reducers: {
        setLocation: (state, action) => {
            const { lat, lng, bbox, placeName, query } = action.payload;
            state.lat = lat;
            state.lng = lng;
            state.bbox = bbox;
            state.placeName = placeName;
            // Prepend to history, cap at 10 entries
            state.history = [
                { query, lat, lng, placeName },
                ...state.history
            ].slice(0, 10);
        },
    },
});

export const { setLocation } = locationSlice.actions;
export default locationSlice.reducer;