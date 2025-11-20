/**
 * Redux store configuration
 */
import { configureStore } from '@reduxjs/toolkit';
import formReducer from './formSlice';
import dragReducer from './dragSlice';

export const store = configureStore({
  reducer: {
    form: formReducer,
    drag: dragReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export FormState for convenience
export type { FormState } from '../types';
