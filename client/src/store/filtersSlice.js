import { createSlice } from '@reduxjs/toolkit';

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    industry: {
      label: '',
      osmTag: '',
    },
    demographics: {
      age: [],
      income: [],
      education: [],
      density: [],
    },
    radius: 5,  // default radius in km
  },
  reducers: {
    setIndustry: (state, action) => {
      state.industry.label  = action.payload.label;
      state.industry.osmTag = action.payload.osmTag;
    },
    setRadius: (state, action) => {
      state.radius = action.payload;
    },
    toggleDemographicFilter: (state, action) => {
      const { group, label } = action.payload;
      const current = state.demographics[group];
      state.demographics[group] = current.includes(label)
        ? current.filter(l => l !== label)
        : [...current, label];
    },
    setAllFilters: (state, action) => {
      state.industry    = action.payload.industry    ?? state.industry;
      state.demographics = action.payload.demographics ?? state.demographics;
      state.radius      = action.payload.radius      ?? state.radius;
    },
  },
});

export const { setIndustry, setRadius, toggleDemographicFilter, setAllFilters } = filtersSlice.actions;
export default filtersSlice.reducer;

