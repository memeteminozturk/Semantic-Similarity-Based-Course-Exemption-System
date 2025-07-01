// src/redux/wizardSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

const wizardSlice = createSlice({
  name: 'wizard',
  initialState: {
    activeStep: 0,
    // Belge Yükleme
    transcriptFile: null,
    oldContentsFile: null,
    // File storage for email attachments
    transcriptFileBlob: null, // Store actual file for email sending
    oldContentsFileBlob: null, // Store actual file for email sending
    // Dersler
    courses: [], // Transkriptten çıkarılan dersler
    courseContents: {}, // Her ders için içerik metinleri. Key: courseId, Value: içerik metni
    // Internal course selections per external course
    intSelections: {},
    // Eşleştirme
    matches: [], // API'den dönen eşleşmeler
    selectedMatches: [], // Öğrencinin muafiyet için seçtiği dersler    // Kişisel Bilgiler
    personalInfo: {
      studentId: '',
      fullName: '',
      university: '',
      faculty: '',
      department: '',
      phone: '',
      email: '',
      transferType: 'yatay', // yatay | dikey
    },
    // PDF
    generatedPdf: null,
    // Durum
    isSubmitted: false,
    isSuccess: false,
    errorMessage: '',
  },
  reducers: {
    setActiveStep(state, action) {
      state.activeStep = action.payload;
    },
    nextStep(state) {
      state.activeStep += 1;
    },
    prevStep(state) {
      if (state.activeStep > 0) {
        state.activeStep -= 1;
      }
    },
    setTranscriptFile(state, action) {
      // Ensure we only store serializable properties
      const { name, type, size, lastModified } = action.payload;
      state.transcriptFile = { name, type, size, lastModified };
    },
    setTranscriptFileBlob(state, action) {
      // Store file blob for email attachments (we'll use a file store outside Redux)
      // This action is mainly for tracking that we have the file
      state.transcriptFileBlob = action.payload
        ? {
            name: action.payload.name,
            size: action.payload.size,
          }
        : null;
    },
    setOldContentsFile(state, action) {
      // Ensure we only store serializable properties
      if (action.payload instanceof File) {
        const { name, type, size, lastModified } = action.payload;
        state.oldContentsFile = { name, type, size, lastModified };
      } else {
        // If it's already a plain object, just store it
        state.oldContentsFile = action.payload;
      }
    },
    setOldContentsFileBlob(state, action) {
      // Store file blob for email attachments (we'll use a file store outside Redux)
      // This action is mainly for tracking that we have the file
      state.oldContentsFileBlob = action.payload
        ? {
            name: action.payload.name,
            size: action.payload.size,
          }
        : null;
    },
    setCourses(state, action) {
      state.courses = action.payload.map(course => ({
        ...course,
        id: course.id || nanoid(),
      }));
    },
    addCourse(state, action) {
      const newCourse = {
        ...action.payload,
        id: action.payload.id || nanoid(),
      };
      state.courses.push(newCourse);
    },
    updateCourse(state, action) {
      const { id, data } = action.payload;
      const idx = state.courses.findIndex(course => course.id === id);
      if (idx !== -1) {
        state.courses[idx] = { ...state.courses[idx], ...data };
      }
    },
    deleteCourse(state, action) {
      state.courses = state.courses.filter(
        course => course.id !== action.payload
      );
    },
    setCourseContent(state, action) {
      const { courseId, content } = action.payload;
      state.courseContents[courseId] = content;
    },
    setMatches(state, action) {
      state.matches = action.payload;
      // Otomatik olarak yüksek skorlu eşleşmeleri seç
      state.selectedMatches = action.payload
        .filter(match => match.score >= 0.78)
        .map(match => match.id);
    },
    setAutoMatchResults(state, action) {
      // Handle auto-match API response format
      // action.payload should be { results: [{ ext_code, candidates: [{ int_code, percent, exempt }] }] }
      const autoMatchResults = action.payload.results;
      const processedMatches = [];

      autoMatchResults.forEach(result => {
        const course = state.courses.find(c => c.code === result.ext_code);
        if (!course) return;

        // Find the best match (highest percent)
        const bestMatch = result.candidates.reduce(
          (best, current) =>
            current.percent > (best?.percent || 0) ? current : best,
          null
        );

        if (bestMatch) {
          processedMatches.push({
            id: course.id,
            courseCode: result.ext_code,
            courseName: course.name || '',
            matchedWith: bestMatch.int_code,
            matchedName: bestMatch.int_code, // Will be enriched with actual name in component
            score: bestMatch.percent / 100, // Convert percentage to decimal
            isEligible: bestMatch.exempt,
            allCandidates: result.candidates, // Store all candidates for detailed view
          });
        }
      });

      state.matches = processedMatches;
      // Auto-select eligible matches
      state.selectedMatches = processedMatches
        .filter(match => match.isEligible)
        .map(match => match.id);
    },
    toggleMatchSelection(state, action) {
      const matchId = action.payload;
      const index = state.selectedMatches.indexOf(matchId);

      if (index === -1) {
        state.selectedMatches.push(matchId);
      } else {
        state.selectedMatches.splice(index, 1);
      }
    },
    setPersonalInfo(state, action) {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    setGeneratedPdf(state, action) {
      // Store only serializable properties of the PDF blob
      // We'll store the binary data as a base64 string if needed
      if (action.payload instanceof Blob) {
        state.generatedPdf = {
          type: action.payload.type,
          size: action.payload.size,
          // We don't store the binary data itself in Redux
          // Instead, we'll use URL.createObjectURL when needed in components
        };
      } else {
        state.generatedPdf = action.payload;
      }
    },
    setSubmissionStatus(state, action) {
      const { isSuccess, errorMessage } = action.payload;
      state.isSubmitted = true;
      state.isSuccess = isSuccess;
      state.errorMessage = errorMessage || '';
    },
    setIntSelection(state, action) {
      const { courseId, intCode } = action.payload;
      state.intSelections[courseId] = intCode;
    },
    resetWizard(state) {
      return {
        ...state,
        activeStep: 0,
        transcriptFile: null,
        oldContentsFile: null,
        transcriptFileBlob: null,
        oldContentsFileBlob: null,
        courseContents: {},
        matches: [],
        selectedMatches: [],
        personalInfo: {
          studentId: '',
          fullName: '',
          phone: '',
          email: '',
          transferType: 'yatay',
        },
        generatedPdf: null,
        isSubmitted: false,
        isSuccess: false,
        errorMessage: '',
      };
    },
  },
});

export const {
  setActiveStep,
  nextStep,
  prevStep,
  setTranscriptFile,
  setTranscriptFileBlob,
  setOldContentsFile,
  setOldContentsFileBlob,
  setCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  setCourseContent,
  setMatches,
  setAutoMatchResults,
  toggleMatchSelection,
  setPersonalInfo,
  setGeneratedPdf,
  setSubmissionStatus,
  setIntSelection,
  resetWizard,
} = wizardSlice.actions;

export default wizardSlice.reducer;
