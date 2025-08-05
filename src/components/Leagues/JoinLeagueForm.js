// src/components/Leagues/JoinLeagueForm.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useApiRequest from '../useApiRequest';

const JoinLeagueForm = ({ onLeagueJoined, playerId }) => {
    const [inviteCode, setInviteCode] = useState('');
    const { t } = useTranslation();
    const { makeRequest, loading, error } = useApiRequest(process.env.REACT_APP_API_URL + '/api');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await makeRequest(`/player/${playerId}/league/${inviteCode}/join`, 'POST', { inviteCode, player_id: playerId });
            if (response.success) {
                onLeagueJoined(response.data.league);
                setInviteCode('');
            } else {
                console.error("Failed to join league:", response.message);
            }
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    return (
        <div className="join-league-form">
            <h2>{t('leagues.join.title')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder={t('leagues.join.placeholder')}
                        className="invite-code-input"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || inviteCode.trim() === ''}
                        className="join-league-button"
                        aria-label={t('leagues.join.button')}
                    >
                        {loading ? t('leagues.join.loading') : t('leagues.join.button')}
                    </button>
                </div>

            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default JoinLeagueForm;