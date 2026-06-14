import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, TextField } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import { geocodeLocation } from '../utils/API';
import { setLocation } from '../store/locationSlice';

export const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const dispatch = useDispatch();

    const history = useSelector((state) => state.location.history)
        .filter((item) => item.query !== 'current-location');

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

    const handleHistorySelect = (item) => {
        dispatch(setLocation(item));
        setQuery(item.placeName);
        setShowHistory(false);
    };

    return (
        <Box sx={{
            position: 'relative',
            display: 'flex',
            gap: 1,
            p: 1,
            minWidth: '400px',
            width: '30vw'
        }}>
            <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 150)}
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

            {/* History dropdown */}
            {showHistory && history.length > 0 && (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: 'calc(100% - 48px)', // Account for search button width
                        zIndex: 1000,
                        maxHeight: 300,
                        overflow: 'auto',
                        mt: '2px',
                    }}
                >
                    <List dense>
                        {history.map((item, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton onMouseDown={() => handleHistorySelect(item)}>
                                    <HistoryIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                                    <ListItemText
                                        primary={item.placeName}
                                        secondary={item.query !== item.placeName ? item.query : null}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
};