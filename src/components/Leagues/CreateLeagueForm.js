import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useApiRequest from '../useApiRequest';

const CreateLeagueForm = ({ onLeagueCreated, playerId }) => {
    const [leagueName, setLeagueName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const { t } = useTranslation();
    const { makeRequest, loading, error } = useApiRequest(process.env.REACT_APP_API_URL + '/api');
    const sitename = process.env.REACT_APP_SITE_NAME;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await makeRequest(`/player/${playerId}/league`, 'POST', { name: leagueName });
            if (response.success) {
                setInviteCode(response.data.league.share_code);
                onLeagueCreated(response.data.league);
                setLeagueName('');
            } else {
                console.error("Failed to create league:", response.message);
            }
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    return (
        <div className="create-league-form">
            <h2>{t('leagues.create.title')}</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <input
                        type="text"
                        value={leagueName}
                        onChange={(e) => setLeagueName(e.target.value)}
                        placeholder={t('leagues.create.placeholder')}
                        required
                        className="league-name-input"
                    />
                    <button
                        type="submit"
                        disabled={loading || leagueName.trim() === ''}
                        className="create-league-button"
                        aria-label={t('leagues.create.button')}
                    >
                        {loading ? t('leagues.create.loading') : t('leagues.create.button')}
                    </button>
                </div>
            </form>

            {inviteCode && (
                <div className="invite-code-display">
                    <p>{t('leagues.create.success', {siteName: sitename})}</p>
                    <pre><code>{inviteCode}</code></pre>
                </div>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default CreateLeagueForm;