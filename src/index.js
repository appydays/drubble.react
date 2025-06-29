// src/index.js
import React,{ Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// --- ADD THESE IMPORTS ---
import i18n from './i18n'; // Your i18n configuration
import { I18nextProvider } from 'react-i18next'; // The provider component
// --- END ADDITIONS ---

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Suspense fallback={<div>Loading translations...</div>}>
            {/* --- WRAP APP WITH I18nextProvider --- */}
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
            {/* --- END WRAP --- */}
        </Suspense>
    </React.StrictMode>
);

reportWebVitals();