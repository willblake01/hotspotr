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
    toggleDemographicFilter: (state, action) => {
      const { group, label } = action.payload;
      const current = state.demographics[group];
      state.demographics[group] = current.includes(label)
        ? current.filter(l => l !== label)
        : [...current, label];
    },
    setIndustry: (state, action) => {
      state.industry.label  = action.payload.label;
      state.industry.osmTag = action.payload.osmTag;
    },
    setRadius: (state, action) => {
      state.radius = action.payload;
    }
  },
});

export const { toggleDemographicFilter, setIndustry, setRadius } = filtersSlice.actions;
export default filtersSlice.reducer;

