import { combineReducers } from 'redux';
import { profile } from './profile';
import locationReducer from '../store/locationSlice';
import filtersReducer from '../store/filtersSlice';
import heatmapReducer from '../store/heatmapSlice';

export const rootReducer = combineReducers({
  user: profile,
  location: locationReducer,
  filters: filtersReducer,
  heatmap: heatmapReducer,
});