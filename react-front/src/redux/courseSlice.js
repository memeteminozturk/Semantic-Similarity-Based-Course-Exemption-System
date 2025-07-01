// src/redux/courseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { parsePdf } from '@/utils/pdfParser';

// Example thunk to parse PDF and set courses
export const fetchParsedCourses = createAsyncThunk(
  'courses/fetchParsed',
  async file => {
    const courses = await parsePdf(file);
    return courses;
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addCourse(state, action) {
      state.list.push(action.payload);
    },
    updateCourse(state, action) {
      const { id, data } = action.payload;
      const idx = state.list.findIndex(c => c.id === id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...data };
    },
    deleteCourse(state, action) {
      state.list = state.list.filter(c => c.id !== action.payload);
    },
    setCourses(state, action) {
      state.list = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchParsedCourses.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchParsedCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchParsedCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { addCourse, updateCourse, deleteCourse, setCourses } =
  courseSlice.actions;
export default courseSlice.reducer;
