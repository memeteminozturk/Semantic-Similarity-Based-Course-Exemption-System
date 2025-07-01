// src/hooks/usePdfParser.js
import { useMutation } from 'react-query';
import { parsePdf } from '@/utils/pdfParser';

export function usePdfParser(options = {}) {
  return useMutation(file => parsePdf(file), {
    onSuccess: options.onSuccess,
    onError: options.onError,
    onMutate: () => {
      // optional: reset progress
    },
  });
}
