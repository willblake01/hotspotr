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
    },
    reducers: {
        setIndustry: (state, action) => {
            state.industry.label  = action.payload.label;
            state.industry.osmTag = action.payload.osmTag;
        },
        clearIndustry: (state) => {
            state.industry = { label: '', osmTag: '' };
        },
        toggleDemographicFilter: (state, action) => {
            const { group, label } = action.payload;
            const current = state.demographics[group];
            state.demographics[group] = current.includes(label)
                ? current.filter((l) => l !== label)
                : [...current, label];
        },
        clearDemographics: (state) => {
            state.demographics = { age: [], income: [], education: [], density: [] };
        },
        clearAllFilters: (state) => {
            state.industry    = { label: '', osmTag: '' };
            state.demographics = { age: [], income: [], education: [], density: [] };
        },
    },
});

export const {
    setIndustry,
    clearIndustry,
    toggleDemographicFilter,
    clearDemographics,
    clearAllFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;