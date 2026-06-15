import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Slider, Button, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { setRadius } from '../store/filtersSlice';
import { fetchLocationData } from '../store/heatmapSlice';
const RADIUS_MARKS = [
    { value: 1,  label: '1km'  },
    { value: 5,  label: '5km'  },
    { value: 10, label: '10km' },
    { value: 15, label: '15km' },
    { value: 25, label: '25km' },
];
export const RadiusForm = ({ onSubmit }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const currentRadius = useSelector((state) => state.filters.radius);
    const location = useSelector((state) => state.location);
    const filters = useSelector((state) => state.filters);
    const [localRadius, setLocalRadius] = useState(currentRadius || 5);
    const [error, setError] = useState('');
    const ORANGE = theme.palette.primary.main;
    const BROWN = theme.palette.secondary.main;
    const WHITE = theme.custom.white;
    const handleApply = () => {
        setError('');
        if (!location.lat || !location.lng) {
            setError('Please search a location first.');
            return;
        }
        if (!filters.industry.osmTag) {
            setError('Please select a Target Industry first.');
            return;
        }
        dispatch(setRadius(localRadius));
        dispatch(fetchLocationData({ osmTag: filters.industry.osmTag, radius: localRadius }));
        onSubmit();
    };
    return (
        <Box
            sx={{
                p: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                width: '100%',
                textAlign: 'center',
            }}
        >
            {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}
            <Typography variant='body2' sx={{ color: BROWN }}>
                Search radius: <strong>{localRadius} km</strong>
            </Typography>
            <Slider
                value={localRadius}
                onChange={(_, value) => setLocalRadius(value)}
                min={1}
                max={25}
                marks={RADIUS_MARKS}
                step={null}  // snap to marks only
                sx={{
                    color: BROWN,
                    '& .MuiSlider-markLabel': { color: BROWN },
                    '& .MuiSlider-thumb': { bgcolor: BROWN },
                    '& .MuiSlider-track': { bgcolor: BROWN },
                    '& .MuiSlider-rail': { bgcolor: 'rgba(87,53,37,0.3)' },
                }}
            />
            <Button
                onClick={handleApply}
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