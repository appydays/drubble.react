import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import CreateLeagueForm from './Leagues/CreateLeagueForm';
import JoinLeagueForm from './Leagues/JoinLeagueForm';
import UserLeaguesList from './Leagues/UserLeaguesList';
import LeagueDetails from './Leagues/LeagueDetails';
import LeagueSettingsModal from './Leagues/LeagueSettingsModal';
import { useTranslation } from 'react-i18next';
import useApiRequest from './useApiRequest';

const LeaguesPage = ({ playerId, isOpen, onClose }) => {
    const [userLeagues, setUserLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    // Change initial active tab to 'my-leagues' for better UX
    const [activeTab, setActiveTab] = useState('my-leagues');

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedLeagueForSettings, setSelectedLeagueForSettings] = useState(null);

    const { t } = useTranslation();
    const { makeRequest } = useApiRequest(process.env.REACT_APP_API_URL + '/api');

    // Function to fetch leagues from the API
    const fetchUserLeagues = async () => {
        if (!playerId) {
            setUserLeagues([]);
            return;
        }
        try {
            const response = await makeRequest(`/player/${playerId}/leagues`, 'GET');
            if (response.success) {
                setUserLeagues(response.data.leagues);
                // Automatically select the first league in the list if available
                if (response.data.leagues.length > 0) {
                    setSelectedLeague(response.data.leagues[0]);
                }
            } else {
                console.error('Error fetching user leagues:', response.message);
                setUserLeagues([]);
            }
        } catch (error) {
            console.error('Error fetching user leagues:', error);
            setUserLeagues([]);
        }
    };

    useEffect(() => {
        fetchUserLeagues();
    }, [playerId]);

    const handleLeagueCreated = (newLeague) => {
        setUserLeagues([...userLeagues, newLeague]);
        // After creating a league, automatically switch to 'my-leagues' tab
        setActiveTab('my-leagues');
        // Select the newly created league
        setSelectedLeague(newLeague);
        fetchUserLeagues();
    };

    const handleLeagueJoined = (joinedLeague) => {
        setUserLeagues([...userLeagues, joinedLeague]);
        // After joining a league, automatically switch to 'my-leagues' tab
        setActiveTab('my-leagues');
        // Select the newly joined league
        setSelectedLeague(joinedLeague);
    };

    const handleSelectLeague = (league) => {
        setSelectedLeague(league);
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const handleLeaguesUpdated = () => {
        // This function is passed to the modal to trigger a re-fetch of the leagues list
        // after a league is deleted or updated.
        fetchUserLeagues();
        setSelectedLeague(null); // Deselect the league to prevent rendering old details
    };

    const handleOpenSettingsModal = (league) => {
        setSelectedLeagueForSettings(league);
        setIsSettingsModalOpen(true);
    };

    const handleCloseSettingsModal = () => {
        setIsSettingsModalOpen(false);
        setSelectedLeagueForSettings(null);
    };

    return (
        <Modal className="league" isOpen={isOpen} onClose={onClose}>
            <div className="leagues-container flex flex-col md:flex-row md:space-x-4 p-4 md:p-8 lg:space-x-8">

                {/* Left Ad Column - 25% on tablet, 33.3% on desktop */}
                <div className="ad-block left">
                    {/* Ad content will go here */}
                </div>

                {/* Main Content Column - 100% on mobile, 50% on tablet, 33.3% on desktop */}
                <div className="content">
                    <button id="league-model-close" className="league-modal-close" onClick={onClose} style={{float: 'right'}}>Close</button>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h1 className="text-3xl font-bold mb-4">{t('leagues.title')}</h1>

                        {!playerId && <p className="text-gray-600">{t('leagues.not-logged-in')}</p>}

                        {playerId && (
                            <>
                                {/* Tabbed Navigation for forms */}
                                <div className="leagues-management mb-6">
                                    <div className="tabs flex justify-start border-b-2 border-gray-200">
                                        <button
                                            className={`py-2 px-4 text-center font-semibold transition-colors duration-200 
                                                ${activeTab === 'my-leagues' ? 'active border-b-4 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                                            onClick={() => setActiveTab('my-leagues')}
                                        >
                                            {t('leagues.my-leagues.title')}
                                        </button>
                                        <button
                                            className={`py-2 px-4 text-center font-semibold transition-colors duration-200 
                                                ${activeTab === 'join' ? 'active border-b-4 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                                            onClick={() => setActiveTab('join')}
                                        >
                                            {t('leagues.join.title')}
                                        </button>
                                        <button
                                            className={`py-2 px-4 text-center font-semibold transition-colors duration-200 
                                                ${activeTab === 'create' ? 'active border-b-4 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                                            onClick={() => setActiveTab('create')}
                                        >
                                            {t('leagues.create.title')}
                                        </button>

                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-b-lg">
                                        {activeTab === 'create' && (
                                            <CreateLeagueForm onLeagueCreated={handleLeagueCreated}
                                                              playerId={playerId}/>
                                        )}
                                        {activeTab === 'join' && (
                                            <JoinLeagueForm onLeagueJoined={handleLeagueJoined} playerId={playerId}/>
                                        )}
                                        {activeTab === 'my-leagues' && (
                                            <>
                                                <UserLeaguesList
                                                    leagues={userLeagues}
                                                    onSelectLeague={handleSelectLeague}
                                                    selectedLeagueId={selectedLeague?.id}
                                                    player={playerId}
                                                    onLeaguesUpdated={handleLeaguesUpdated}
                                                    onOpenSettingsModal={handleOpenSettingsModal}
                                                />
                                                <br/>
                                                <hr/>
                                                <br/>
                                                {selectedLeague && (
                                                    <LeagueDetails
                                                        league={selectedLeague}
                                                        selectedDate={selectedDate}
                                                        onDateChange={setSelectedDate}
                                                        playerId={playerId}
                                                        onOpenSettingsModal={handleOpenSettingsModal}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Ad Column - 25% on tablet, 33.3% on desktop */}
                <div className="ad-block right">
                    {/* Ad content will go here */}
                </div>

            </div>

            {/* The modal is now rendered here in the parent component */}
            {selectedLeagueForSettings && (
                <LeagueSettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={handleCloseSettingsModal}
                    league={selectedLeagueForSettings}
                    player={playerId}
                    onLeagueDeleted={handleLeaguesUpdated}
                />
            )}

        </Modal>
)
    ;
};

export default LeaguesPage;
