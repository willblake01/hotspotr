import { combineReducers } from 'redux';
import { profile } from './profile';

export const rootReducer = combineReducers({
  user: profile,
});