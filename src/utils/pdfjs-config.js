import { pdfjs } from 'react-pdf';

// Set the worker path
pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
