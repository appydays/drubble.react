// src/components/Leagues/LeagueSettingsModal.js
import React, { useState, useEffect } from 'react';
import '../css/LeagueSettings.css';
import { useTranslation } from 'react-i18next';
import useApiRequest from '../useApiRequest';
import Modal from '../Modal'; // Assuming a Modal component exists
import Swal from 'sweetalert2'; // Using a custom message box instead of alert
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const LeagueSettingsModal = ({ isOpen, onClose, league, player, onLeagueDeleted }) => {
    const { t } = useTranslation();
    const { makeRequest, loading, error } = useApiRequest(process.env.REACT_APP_API_URL + '/api');
    const [leagueDetails, setLeagueDetails] = useState(null);
    const [status, setStatus] = useState((league?.status ?? false) ? 'active' : 'inactive');
    const [openSections, setOpenSections] = useState({
        inviteCode: true,
        status: false,
        players: false,
        delete: false,
    });
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (isOpen && league) {
            // Fetch full league details including members
            fetchLeagueDetails();
        }
    }, [isOpen, league]);

    const fetchLeagueDetails = async () => {
        try {
            // This API endpoint needs to be created on the backend to get all league details and members
            const response = await makeRequest(`/player/${player}/league/${league.id}?date=${today}`, 'GET');
            if (response.success) {
                console.log(response.data.league);
                setLeagueDetails(response.data.league);
                setStatus(response.data.league.active ? 'active' : 'inactive');
            } else {
                console.error("Failed to fetch league details:", response.message);
            }
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await makeRequest(`/player/${player}/league/${league.id}/status`, 'PUT', { status: newStatus });
            if (response.success) {
                setStatus(newStatus);
                Swal.fire({
                    icon: 'success',
                    title: t('leagues.settings.status.success.title'),
                    text: t('leagues.settings.status.success.text', {newStatus: newStatus})
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('leagues.settings.status.error.title'),
                    text: t('leagues.settings.status.error.text'),
                });
            }
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    const handleRemovePlayer = async (playerIdToRemove, playerName) => {
        // Show a confirmation dialog before proceeding
        const result = await Swal.fire({
            title: t('leagues.settings.players.confirm-remove.title'),
            text: t('leagues.settings.players.confirm-remove.text', { player: playerName }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('leagues.settings.players.confirm-remove.confirm-button'),
            cancelButtonText: t('leagues.settings.players.confirm-remove.cancel-button')
        });

        if (result.isConfirmed) {
            try {
                // This API endpoint needs to be created on the backend
                const response = await makeRequest(`/player/${player}/league/${league.id}/players/${playerIdToRemove}`, 'DELETE');
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: t('leagues.settings.players.remove.success.title'),
                        text: t('leagues.settings.players.remove.success.text'),
                    });
                    fetchLeagueDetails(); // Refresh the list of players
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: t('leagues.settings.players.remove.error.title'),
                        text: t('leagues.settings.players.remove.error.text'),
                    });
                }
            } catch (err) {
                console.error("Network error:", err);
                Swal.fire({
                    icon: 'error',
                    title: t('leagues.settings.players.remove.error.title'),
                    text: t('leagues.settings.players.remove.error.network-error-text'),
                });
            }
        }
    };

    const handleDeleteLeague = async () => {
        // Show a confirmation dialog before proceeding
        const result = await Swal.fire({
            title: t('leagues.settings.delete.confirm.title'),
            text: t('leagues.settings.delete.confirm.text'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('leagues.settings.delete.confirm.confirm-button'),
            cancelButtonText: t('leagues.settings.delete.confirm.cancel-button')
        });

        if (result.isConfirmed) {
            try {
                // This API endpoint needs to be created on the backend
                const response = await makeRequest(`/player/${player}/league/${league.id}/delete`, 'DELETE');
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: t('leagues.settings.delete.success.title'),
                        text: t('leagues.settings.delete.success.text'),
                    });
                    if (onLeagueDeleted) {
                        onLeagueDeleted();
                        onClose();
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: t('leagues.settings.delete.error.title'),
                        text: t('leagues.settings.delete.error.text'),
                    });
                }
            } catch (err) {
                console.error("Network error:", err);
                Swal.fire({
                    icon: 'error',
                    title: t('leagues.settings.delete.error.title'),
                    text: t('leagues.settings.delete.error.network-error-text'),
                });
            }
        }
    };

    const toggleSection = (sectionName) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    };

    return (
        <Modal className="league-settings" isOpen={isOpen} onClose={onClose} title={t('leagues.settings.title', { leagueName: league?.name })}>
            {leagueDetails && (
                <div className="league-details p-4">
                    <h2>{league.name}</h2>
                    <div>{t('leagues.settings.header-text')}</div>
                    <hr />
                    {/* Invite Code Accordion */}
                    <div className="accordion-item invite mb-2 border-b-2 border-gray-200">
                        <div className="accordion-header flex justify-between items-center cursor-pointer p-2" onClick={() => toggleSection('inviteCode')}>
                            <h3 className="text-lg font-bold">{t('leagues.settings.invite-code.title')}</h3>
                            <FontAwesomeIcon icon={openSections.inviteCode ? faChevronUp : faChevronDown} />
                        </div>
                        {openSections.inviteCode && (
                            <div className="accordion-content p-2">
                                <div className="invite-code-text">{t('leagues.settings.invite-code.text')}</div>
                                <code
                                    className="invite-code bg-gray-200 p-2 rounded-md block mt-1">{leagueDetails.share_code}</code>
                            </div>
                        )}
                    </div>
                    {/* Status Accordion */}
                    <div className="accordion-item status mb-2 border-b-2 border-gray-200">
                        <div className="accordion-header flex justify-between items-center cursor-pointer p-2" onClick={() => toggleSection('status')}>
                            <h3 className="text-lg font-bold">{t('leagues.settings.status.title')}</h3>
                            <FontAwesomeIcon icon={openSections.status ? faChevronUp : faChevronDown} />
                        </div>
                        {openSections.status && (
                            <div className="accordion-content p-2">
                                <div>{t('leagues.settings.status.text')}</div>
                                <div className="toggle-switch-container">
                                    <span className={`toggle-switch-text ${status === 'active' ? 'active-on' : ''}`}>
                                        {t('leagues.settings.status.on')}
                                    </span>
                                    <label className="toggle-switch-label">
                                        <input
                                            type="checkbox"
                                            className="toggle-switch-input"
                                            checked={status === 'active'}
                                            onChange={(e) => handleStatusChange(e.target.checked ? 'active' : 'inactive')}
                                            disabled={loading}
                                        />
                                        <div className="toggle-switch-track"></div>
                                    </label>
                                    <span className={`toggle-switch-text ${status === 'inactive' ? 'active-off' : ''}`}>
                                        {t('leagues.settings.status.off')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Manage Players Accordion */}
                    <div className="accordion-item manage-players mb-2 border-b-2 border-gray-200">
                        <div className="accordion-header flex justify-between items-center cursor-pointer p-2" onClick={() => toggleSection('players')}>
                            <h3 className="text-lg font-bold">{t('leagues.settings.players.title')}</h3>
                            <FontAwesomeIcon icon={openSections.players ? faChevronUp : faChevronDown} />
                        </div>
                        {openSections.players && (
                            <div className="accordion-content p-2">
                                {leagueDetails.players && leagueDetails.players.length > 1 ? (
                                    <ul className="player-list">
                                        {leagueDetails.players.filter(p => !p.pivot.is_owner).map((player) => (
                                            <li key={player.id}
                                                className="flex justify-between items-center py-2 border-b last:border-b-0">
                                                <span>{player.nickname}</span>
                                                <button
                                                    onClick={() => handleRemovePlayer(player.id, player.nickname)}
                                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full text-sm"
                                                    disabled={loading}
                                                >
                                                    {t('leagues.settings.players.remove.button')}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{t('leagues.settings.players.no-players')}</p>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Danger Zone Accordion */}
                    <div className="accordion-item delete-league mb-2 border-b-2 border-gray-200">
                        <div className="accordion-header flex justify-between items-center cursor-pointer p-2" onClick={() => toggleSection('delete')}>
                            <h3 className="text-lg font-bold text-red-600">{t('leagues.settings.delete.title')}</h3>
                            <FontAwesomeIcon icon={openSections.delete ? faChevronUp : faChevronDown} />
                        </div>
                        {openSections.delete && (
                            <div className="accordion-content p-2">
                                <button
                                    onClick={() => handleDeleteLeague()}
                                    className="delete bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full text-sm"
                                    disabled={loading}
                                >
                                    {t('leagues.settings.delete.button')}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            )}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </Modal>
    );
};

export default LeagueSettingsModal;
