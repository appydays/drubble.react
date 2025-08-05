// src/components/Leagues/UserLeaguesList.js
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// import LeagueSettingsModal from './LeagueSettingsModal'; // Import the new modal component

const useScript = (url) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => setLoaded(true);
        script.onerror = () => setError(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [url]);

    return { loaded, error };
};

const UserLeaguesList = ({ leagues, onSelectLeague, selectedLeagueId, player, onLeaguesUpdated }) => {
    const { t } = useTranslation();
    // const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    // const [selectedLeagueForSettings, setSelectedLeagueForSettings] = useState(null);

    const selectRef = useRef(null);
    const [isSelect2Initialized, setIsSelect2Initialized] = useState(false);

    // This useEffect handles the initialization of Select2.
    // It runs only when the component mounts and when the leagues prop changes.
    useEffect(() => {
        // We use a guard clause to ensure jQuery and Select2 are available
        // and that the DOM element is ready before we attempt to initialize.
        if (window.jQuery && window.jQuery.fn.select2 && selectRef.current) {
            console.log("jQuery and Select2 are loaded. Initializing Select2.");
            const $ = window.jQuery;

            // Initialize Select2 on the select element
            $(selectRef.current).select2({
                theme: 'classic'
            });

            // Attach an event listener to the Select2 change event
            // Note: The event is 'change', not a custom handler. It will call the prop function.
            $(selectRef.current).on('change', (e) => {
                const selectedId = parseInt($(e.target).val());
                const selectedLeague = leagues.find(league => league.id === selectedId);
                if (selectedLeague) {
                    console.log(`Select2 change event fired. Selected league ID: ${selectedId}`);
                    onSelectLeague(selectedLeague);
                }
            });

            setIsSelect2Initialized(true);

            // Cleanup function: destroy the Select2 instance when the component unmounts
            return () => {
                if (selectRef.current && $(selectRef.current).hasClass("select2-hidden-accessible")) {
                    console.log("Destroying Select2 instance.");
                    $(selectRef.current).select2('destroy');
                }
            };
        } else {
            console.log("Waiting for jQuery or Select2 to load...");
        }
    }, [leagues, onSelectLeague, t]);

    // This useEffect keeps the Select2 value in sync with the React state
    // It runs whenever the `selectedLeagueId` prop changes.
    useEffect(() => {
        if (isSelect2Initialized && selectRef.current && window.jQuery) {
            const $ = window.jQuery;
            // Check if the current value is different from the prop to avoid unnecessary updates
            if ($(selectRef.current).val() !== String(selectedLeagueId)) {
                console.log(`Updating Select2 value to ${selectedLeagueId}`);
                // Use .val() and .trigger() to programmatically change the selected option
                $(selectRef.current).val(String(selectedLeagueId)).trigger('change.select2');
            }
        }
    }, [isSelect2Initialized, selectedLeagueId]);

    // const handleOpenSettingsModal = (league) => {
    //     setSelectedLeagueForSettings(league);
    //     setIsSettingsModalOpen(true);
    // };
    //
    // const handleCloseSettingsModal = () => {
    //     setIsSettingsModalOpen(false);
    //     setSelectedLeagueForSettings(null);
    // };

    const handleSelectChange = (e) => {
        const selectedId = parseInt(e.target.value);
        const selectedLeague = leagues.find(league => league.id === selectedId);
        onSelectLeague(selectedLeague);
    };

    return (
        <div className="user-leagues-list">
            {/*<h2>{t('leagues.my-leagues.title')}</h2>*/}

            {leagues.length > 0 ? (
                <>
                    <div className="league-select-container">
                        {/* Label for the select box */}
                        <label htmlFor="league-select" className="text-gray-700 font-medium whitespace-nowrap">
                            {t('leagues.my-leagues.label')}:
                        </label>
                        {/* The new dropdown select list */}
                        <select
                            ref={selectRef}
                            id="league-select"
                            className="w-full"
                            defaultValue={selectedLeagueId || ''}
                        >
                            {leagues.map((league) => (
                                <option key={league.id} value={league.id}>
                                    {league.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </>
            ) : (
                <p className="text-gray-500 italic mt-4">{t('leagues.no-leagues')}</p>
            )}

            {/*{selectedLeagueForSettings && (*/}
            {/*    <LeagueSettingsModal*/}
            {/*        isOpen={isSettingsModalOpen}*/}
            {/*        onClose={handleCloseSettingsModal}*/}
            {/*        league={selectedLeagueForSettings}*/}
            {/*        player={player}*/}
            {/*        onLeagueDeleted={onLeaguesUpdated}*/}
            {/*    />*/}
            {/*)}*/}
        </div>
    );
};

export default UserLeaguesList;