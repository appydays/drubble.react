// src/components/Accordion.js

import React, { useState } from 'react';
import getFaqData from '../assets/faqData';
import { useTranslation } from 'react-i18next';

const Accordion = () => {
    const [openSection, setOpenSection] = useState(null);
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language; // Get the current language from i18n
    const faqs = getFaqData(t); // Call the function to get the data

    // Filter items based on the current language
    const filteredFaqs = faqs.filter(item => {
        // Check if the item's languages array includes the current language
        return item.languages.includes(currentLanguage);
    });

    return (
        <div className="welcome-section welcome-details">
            {filteredFaqs.map(item => (
                <React.Fragment key={item.id}>
                    {/* ... rendering logic here */}
                    <h2 className="section-title" onClick={() => setOpenSection(openSection === item.id ? null : item.id)}>
                        {item.title}
                        <span className="toggle-icon">{openSection === item.id ? '▲' : '▼'}</span>
                    </h2>
                    {openSection === item.id && (
                        <div className="section-content expanded">
                            {item.content}
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Accordion;