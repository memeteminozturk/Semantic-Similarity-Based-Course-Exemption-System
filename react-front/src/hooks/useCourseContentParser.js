// src/hooks/useCourseContentParser.js
import { useState } from 'react';
import { parsePdf } from '@/utils/pdfParser';
import { message } from 'antd';

export function useCourseContentParser() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const parseContents = async (file) => {
        setIsLoading(true);
        setProgress(0);

        try {
            // Mock progress updates
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + 10;
                    return newProgress >= 90 ? 90 : newProgress;
                });
            }, 300);
            // Parse PDF content - this would need to be implemented for course contents
            // Instead of returning the file object directly, return a serializable object
            const { name, type, size, lastModified } = file;
            const result = {
                name,
                type,
                size,
                lastModified,
                // You could add additional parsed content here in the future
                parsedContent: null
            };

            clearInterval(progressInterval);
            setProgress(100);
            setIsLoading(false);

            return result;
        } catch (error) {
            message.error('İçerik dosyası işlenirken hata oluştu.');
            console.error('Content parsing error:', error);
            setIsLoading(false);
            throw error;
        }
    };

    return { parseContents, isLoading, progress };
}
