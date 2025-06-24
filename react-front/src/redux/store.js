// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './courseSlice';
import wizardReducer from './wizardSlice';

export const store = configureStore({
    reducer: {
        courses: courseReducer,
        wizard: wizardReducer
    }
});
