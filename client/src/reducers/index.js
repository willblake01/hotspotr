import { combineReducers } from 'redux';
import { profile } from './profile';
import locationReducer from '../store/locationSlice';

export const rootReducer = combineReducers({
  user: profile,
  location: locationReducer,
});