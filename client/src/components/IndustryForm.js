import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, Select, MenuItem,
    FormControl, InputLabel, Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { INDUSTRY_OPTIONS } from '../config/industryOptions';
import { setIndustry } from '../store/filtersSlice';

export const IndustryForm = ({ handleSubmit }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const selectedIndustry = useSelector((state) => state.filters.industry);
    const [localSelection, setLocalSelection] = useState(selectedIndustry || '');

    const ORANGE = theme.palette.primary.main;
    const BROWN = theme.palette.secondary.main;
    const WHITE = theme.custom.white;

    const handleChange = (event) => {
        setLocalSelection(event.target.value);
    };

    const handleApply = () => {
        const option = INDUSTRY_OPTIONS.find(o => o.label === localSelection);
        if (option) {
            dispatch(setIndustry({ label: option.label, osmTag: option.osmTag }));
            handleSubmit();
        }
    };

    return (
        <Box sx={{ p: '20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant='h6' sx={{ color: BROWN, fontWeight: 'bold' }}>
                What industry are you competing in?
            </Typography>

            <FormControl fullWidth size='small'>
                <InputLabel sx={{ color: BROWN }}>Select Industry</InputLabel>
                <Select
                    value={localSelection}
                    onChange={handleChange}
                    label='Select Industry'
                    sx={{
                        bgcolor: WHITE,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: BROWN },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: BROWN },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BROWN },
                    }}
                    variant={'outlined'}>
                    {INDUSTRY_OPTIONS.map(({ label }) => (
                        <MenuItem key={label} value={label}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button
                onClick={handleApply}
                disabled={!localSelection}
                variant='contained'
                sx={{
                    bgcolor: ORANGE,
                    color: WHITE,
                    borderRadius: '25px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: WHITE, color: BROWN },
                }}
            >
                Apply
            </Button>
        </Box>
    );
};