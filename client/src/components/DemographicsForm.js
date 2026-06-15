import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, FormGroup, FormControlLabel,
    Checkbox, Button, Divider
} from '@mui/material';
import { toggleDemographicFilter } from "../store/filtersSlice";
import { fetchCensusOnly } from '../store/heatmapSlice';

const DEMOGRAPHIC_FILTERS = {
    age: [
        { label: '18-24', variables: ['B01001_007E', 'B01001_008E', 'B01001_009E', 'B01001_010E', 'B01001_011E'] },
        { label: '25-34', variables: ['B01001_011E', 'B01001_012E'] },
        { label: '35-44', variables: ['B01001_013E', 'B01001_014E'] },
        { label: '45-54', variables: ['B01001_015E', 'B01001_016E'] },
        { label: '55+',   variables: ['B01001_017E', 'B01001_018E', 'B01001_019E', 'B01001_020E', 'B01001_021E', 'B01001_022E', 'B01001_023E', 'B01001_024E', 'B01001_025E'] },
    ],
    income: [
        { label: 'Under $30k', variables: ['B19001_002E', 'B19001_003E', 'B19001_004E', 'B19001_005E', 'B19001_006E'] },
        { label: '$30k-$60k',  variables: ['B19001_007E', 'B19001_008E', 'B19001_009E', 'B19001_010E', 'B19001_011E'] },
        { label: '$60k-$100k', variables: ['B19001_012E', 'B19001_013E'] },
        { label: '$100k+',     variables: ['B19001_014E', 'B19001_015E', 'B19001_016E', 'B19001_017E'] },
    ],
    education: [
        { label: 'High School',   variables: ['B15003_017E', 'B15003_018E'] },
        { label: 'Some College',  variables: ['B15003_019E', 'B15003_020E'] },
        { label: "Bachelor's",    variables: ['B15003_022E'] },
        { label: 'Graduate',      variables: ['B15003_023E', 'B15003_024E', 'B15003_025E'] },
    ],
    density: [
        { label: 'Urban',    threshold: '>1000' },
        { label: 'Suburban', threshold: '200-1000' },
        { label: 'Rural',    threshold: '<200' },
    ],
};

export const DemographicsForm = ({ onSubmit }) => {
    const dispatch = useDispatch();
    const selectedFilters = useSelector((state) => state.filters.demographics);
    const location = useSelector((state) => state.location);
    const filters = useSelector((state) => state.filters);
    const [error, setError] = useState('');

    const handleCheck = (group, label) => {
        dispatch(toggleDemographicFilter({ group, label }));
        setError('');
    };

    const handleApply = () => {
        if (!location.lat || !location.lng) {
            setError('Please search a location first.');
            return;
        }
        if (!filters.industry.osmTag) {
            setError('Please select a Target Industry first.');
            return;
        }
        dispatch(fetchCensusOnly());  // separate thunk — Overpass and BLS not re-called
        onSubmit();
    };

    const hasSelection = Object.values(selectedFilters).some(g => g.length > 0);

    return (
        <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
                <Typography
                    variant='body2'
                    sx={{ color: 'error.main', fontSize: '0.875rem' }}
                >
                    {error}
                </Typography>
            )}

            {Object.entries(DEMOGRAPHIC_FILTERS).map(([group, options]) => (
                <Box key={group}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 'bold', textTransform: 'capitalize', mb: 1 }}>
                        {group === 'density' ? 'Population Density' : group.charAt(0).toUpperCase() + group.slice(1) + ' Range'}
                    </Typography>
                    <FormGroup>
                        {options.map(({ label }) => (
                            <FormControlLabel
                                key={label}
                                control={
                                    <Checkbox
                                        checked={selectedFilters[group]?.includes(label) || false}
                                        onChange={() => handleCheck(group, label)}
                                        size='small'
                                    />
                                }
                                label={label}
                            />
                        ))}
                    </FormGroup>
                    <Divider sx={{ mt: 1 }} />
                </Box>
            ))}

            <Button
                onClick={handleApply}
                disabled={!hasSelection}
                variant='contained'
                sx={{ borderRadius: '25px', textTransform: 'none' }}
            >
                Apply Filters
            </Button>
        </Box>
    );
};