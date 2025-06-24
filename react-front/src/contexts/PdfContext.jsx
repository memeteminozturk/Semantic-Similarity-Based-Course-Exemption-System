// src/contexts/PdfContext.jsx
// Note: Despite the filename, this context now handles Word documents (.docx)
// The variable names remain 'pdf' for backward compatibility with existing code
import React, { createContext, useContext, useState } from 'react';

const PdfContext = createContext();

export function PdfProvider({ children }) {
    const [pdfBlob, setPdfBlob] = useState(null);
    const [pdfInfo, setPdfInfo] = useState(null);

    const setPdf = (blob) => {
        setPdfBlob(blob);
        setPdfInfo({
            type: blob.type,
            size: blob.size,
            generated: true,
            timestamp: new Date().toISOString()
        });
    };

    const clearPdf = () => {
        if (pdfBlob) {
            URL.revokeObjectURL(pdfBlob);
        }
        setPdfBlob(null);
        setPdfInfo(null);
    };

    const value = {
        pdfBlob,
        pdfInfo,
        setPdf,
        clearPdf,
        hasGeneratedPdf: !!pdfBlob
    };

    return (
        <PdfContext.Provider value={value}>
            {children}
        </PdfContext.Provider>
    );
}

export function usePdf() {
    const context = useContext(PdfContext);
    if (!context) {
        throw new Error('usePdf must be used within a PdfProvider');
    }
    return context;
}
