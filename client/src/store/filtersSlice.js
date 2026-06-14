import { createSlice } from '@reduxjs/toolkit';

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    demographics: {
      age: [],
      income: [],
      education: [],
      density: [],
    },
    industry: '',
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
      state.industry = action.payload;
    },
  },
});

export const { toggleDemographicFilter, setIndustry } = filtersSlice.actions;
export default filtersSlice.reducer;

