// src/contexts/FileStoreContext.jsx
import React, { createContext, useContext, useRef } from 'react';

const FileStoreContext = createContext({});

export function useFileStore() {
  const context = useContext(FileStoreContext);
  if (!context) {
    throw new Error('useFileStore must be used within a FileStoreProvider');
  }
  return context;
}

export function FileStoreProvider({ children }) {
  // Use refs to store actual file objects (non-serializable)
  const transcriptFileRef = useRef(null);
  const oldContentsFileRef = useRef(null);

  const setTranscriptFile = file => {
    transcriptFileRef.current = file;
  };

  const getTranscriptFile = () => {
    return transcriptFileRef.current;
  };

  const setOldContentsFile = file => {
    oldContentsFileRef.current = file;
  };

  const getOldContentsFile = () => {
    return oldContentsFileRef.current;
  };

  const clearFiles = () => {
    transcriptFileRef.current = null;
    oldContentsFileRef.current = null;
  };

  const value = {
    setTranscriptFile,
    getTranscriptFile,
    setOldContentsFile,
    getOldContentsFile,
    clearFiles,
  };

  return (
    <FileStoreContext.Provider value={value}>
      {children}
    </FileStoreContext.Provider>
  );
}
