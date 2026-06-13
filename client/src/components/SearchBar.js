import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TextField, IconButton, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { geocodeLocation } from '../utils/API';
import { setLocation } from '../store/locationSlice';

export const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    const handleSearch = async () => {
        if (!query.trim() || query.trim().length < 3) return;
        setLoading(true);
        setError('');
        try {
            const result = await geocodeLocation(query);
            dispatch(setLocation(result));
            setQuery('');
        } catch (err) {
            setError(err.message || 'Search unavailable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, p: 1, minWidth: '400px', width: '30vw' }}>
            <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='Search city, neighborhood, or address...'
                helperText={error || (query.length > 0 && query.length < 3 ? 'Enter at least 3 characters' : '')}
                error={!!error}
                size='small'
                fullWidth
                inputProps={{ 'aria-label': 'location search' }}
                sx={{
                    bgcolor: 'white',
                    borderRadius: '4px',
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                    }
                }}
            />
            <IconButton
                onClick={handleSearch}
                disabled={loading || query.trim().length < 3}
                aria-label='search'
                sx={{ color: 'white' }}
            >
                {loading ? <CircularProgress size={20} /> : <SearchIcon sx={{ color: 'white' }} />}
            </IconButton>
        </Box>
    );
};