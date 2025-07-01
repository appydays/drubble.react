import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import LogoutIcon from "./atoms/LogoutIcon";
import AuthTabs from './AuthTabs'; // Keep if you use AuthTabs for login/signup within this modal
import useApiRequest from './useApiRequest';
import CookieSettingsButton from "./CookieSettingsButton";
import Swal from 'sweetalert2';
import LanguageLevelSelect from "./LanguageLevelSelect"; // Import the LanguageLevelSelect component
import { useTranslation } from 'react-i18next';

function AccountSettingsModal({ isOpen, onClose, onSignupSuccess, onLoginSuccess, player, onPlayerUpdate }) {

    const [nickname, setNickname] = useState('');
    // New state for language level, default to null or a sensible initial value if player is not loaded
    const [languageLevel, setLanguageLevel] = useState(null);
    const [playerPrefReceiveNewsletter, setPlayerPrefReceiveNewsletter] = useState(false); // Initialize as boolean
    const [playerPrefReceivePrompts, setPlayerPrefReceivePrompts] = useState(false); // Initialize as boolean
    const [errors, setErrors] = useState({});

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';
    // Destructure makeRequest directly, as data, loading, error will be managed locally for update
    const { makeRequest } = useApiRequest(apiUrl);

    const { t, i18n } = useTranslation();
    const siteName = process.env.REACT_APP_SITE_NAME;

    // Effect to initialize form fields when the player prop changes
    useEffect(() => {
        if (player && typeof player === 'object' && player.id) {
            setNickname(player.nickname || '');
            // Convert '1'/'0' strings from player object to booleans
            setPlayerPrefReceiveNewsletter(player.pref_receive_newsletter === '1' || player.pref_receive_newsletter === true);
            setPlayerPrefReceivePrompts(player.pref_receive_prompts === '1' || player.pref_receive_prompts === true);
            // Initialize languageLevel from player data, ensure it's a number
            setLanguageLevel(player.language_level ? parseInt(player.language_level) : 1); // Default to 1 if not set
        } else {
            // Reset state if player is null or not a valid object
            setNickname('');
            setLanguageLevel(1); // Default to 'Learner' when no player is loaded
            setPlayerPrefReceiveNewsletter(false);
            setPlayerPrefReceivePrompts(false);
            setErrors({}); // Clear errors
        }
    }, [player]); // Rerun when the player prop changes

    const [activeTab, setActiveTab] = useState("profile");
    const tabs = [
        { key: "profile", label: t('account.tabs.profile.label') },
        { key: "privacy", label: t('account.tabs.privacy.label') },
        { key: "logout", label: t('account.tabs.logout.label') },
    ];

    const [isLoading, setIsLoading] = useState(false); // To manage loading state for async operations like delete/data request

    const handleLogout = async () => {
        const authToken = localStorage.getItem('auth_token');

        if (!authToken) {
            clearClientSideData();
            window.location.reload();
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'Accept-Language': i18n.language
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend logout failed:', errorData);
            }
        } catch (error) {
            console.error('Network error during logout:', error);
        } finally {
            clearClientSideData();
            window.location.reload();
        }
    };

    const clearClientSideData = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("playerId");
        localStorage.removeItem("playerName");
        localStorage.removeItem("playerPrefReceiveNewsletter");
        localStorage.removeItem("playerPrefReceivePrompts");
        // Add any other localStorage items related to player/authentication
    };

    const handleDataRequest = async () => {
        setIsLoading(true);
        try {
            const playerId = localStorage.getItem('playerId');
            if (!playerId) {
                Swal.fire(t('account.alerts.login-required.title'), t('account.alerts.login-required.text'), 'warning');
                return;
            }

            Swal.fire({
                title: t('account.alerts.data-request.title'),
                text: t('account.alerts.data-request.text'),
                icon: "info",
                showCancelButton: true,
                confirmButtonText: t('account.alerts.data-request.confirm'),
                cancelButtonText: t('account.alerts.data-request.cancel')
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const responseData = await makeRequest(`/players/${playerId}/data-request`, 'POST', {});
                        Swal.fire(t('alert.titles.success'), responseData.message || t('account.alerts.data-request.processed'), 'success');
                    } catch (err) {
                        Swal.fire(t('alert.titles.error'), err.message || t('account.alerts.data-request.failed'), 'error');
                    }
                }
            });
        } catch (error) {
            console.error("Error making data request:", error);
            Swal.fire(t('alert.titles.network-error'), t('account.alerts.data-request.connect-error'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Swal.fire({
            title: t('alert.titles.sure'),
            text:  t('account.alerts.delete-request.text'),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: t('account.alerts.delete-request.confirm'),
            cancelButtonText: t('account.alerts.delete-request.cancel'),
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                try {
                    // Ensure player object is valid before attempting deletion
                    if (!player || !player.id) {
                        throw new Error("Cannot delete account: Player ID not found.");
                    }
                    const responseData = await makeRequest(`/players/${player.id}/delete-account`, 'DELETE', {});
                    Swal.fire(t('account.alerts.delete-request.title.complete'), responseData.message || t('alert.delete-request.complete'), 'success');
                    onClose();
                    // Clear local storage for user data
                    clearClientSideData(); // Re-use the existing clear function

                    window.location.href = '/';
                } catch (err) {
                    Swal.fire(t('alert.titles.error'), err.message || t('account.alerts.delete-request.error'), 'error');
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!player || !player.id) {
            Swal.fire(t('account.alerts.login-required'), t('account.alerts.profile.login-required'), 'error');
            return;
        }

        let newErrors = {};
        if (!nickname.trim()) {
            newErrors.nickname = t('account.validation.messages.nickname');
        }
        // Basic frontend validation for languageLevel
        if (typeof languageLevel !== 'number' || !Number.isInteger(languageLevel) || languageLevel < 1 || languageLevel > 3) {
            newErrors.language_level = t('account.validation.messages.language-level');
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            const data = await makeRequest(`/players/${player.id}/update`, 'POST', {
                nickname: nickname,
                language_level: languageLevel, // Include language_level in the payload
                pref_receive_newsletter: playerPrefReceiveNewsletter,
                pref_receive_prompts: playerPrefReceivePrompts
            });

            if (data && data.success) { // Check for data before data.success
                localStorage.setItem('playerName', nickname);
                localStorage.setItem('playerPrefReceiveNewsletter', playerPrefReceiveNewsletter ? '1' : '0');
                localStorage.setItem('playerPrefReceivePrompts', playerPrefReceivePrompts ? '1' : '0');

                // Update the player object in the parent component
                if (onPlayerUpdate) {
                    const updatedPlayer = {
                        ...player, // Spread existing player data
                        nickname: nickname,
                        language_level: languageLevel, // Update language_level
                        pref_receive_newsletter: playerPrefReceiveNewsletter ? '1' : '0',
                        pref_receive_prompts: playerPrefReceivePrompts ? '1' : '0',
                    };
                    onPlayerUpdate(updatedPlayer);
                }
                Swal.fire(t('alert.titles.updated'), t('account.alerts.profile.updated'), 'success'); // Success message
                onClose();
            } else {
                // If backend sends specific errors, display them
                if (data && data.errors) {
                    setErrors(data.errors);
                } else {
                    Swal.fire(t('alert.titles.error'), data?.message || t('account.alerts.profile.failed'), 'error');
                }
            }
        } catch (error) {
            Swal.fire(t('alert.titles.error'), t('alert.content.unexpected') + error.message || error, 'error');// Display error message from makeRequest hook
        }
    };

    // Handler for LanguageLevelSelect component
    const handleLanguageLevelChange = (level) => {
        setLanguageLevel(level);
    };

    // Helper for checkbox changes
    const handleCheckboxChange = (setter) => (e) => {
        setter(e.target.checked);
    };


    return (
        <Modal className="account" isOpen={isOpen} onClose={onClose}>
            <div>
                {/* --- Use the 'player' prop to determine view --- */}
                {player ? (
                    <div>
                        <div className="account__tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`tab-button ${
                                        activeTab === tab.key ? "active" : ""
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4">
                            {activeTab === "profile" && (
                                <form onSubmit={handleSubmit} className="profile">
                                    <>
                                        <div className="nickname">
                                            <h5>{t('account.forms.profile.labels.nickname')}</h5>
                                            <label>
                                                <input
                                                    type="text"
                                                    className={`${errors.nickname ? "error" : ""}`}
                                                    value={nickname}
                                                    placeholder={t('account.forms.profile.placehilders.nickname')}
                                                    onChange={(e) => setNickname(e.target.value)}
                                                />
                                            </label>
                                            {errors.nickname && <span className="error">{errors.nickname}</span>}
                                        </div>

                                        {/* Language Level Selector */}
                                        <div className="language-level-selector">
                                            <LanguageLevelSelect
                                                onLevelChange={handleLanguageLevelChange}
                                                initialLevel={languageLevel} // Pass current languageLevel state
                                            />
                                            {errors.language_level &&
                                                <span className="error">{errors.language_level}</span>}
                                        </div>


                                        <div className="preferences">
                                            <h5>{t('account.preferences.title')}</h5>
                                            <div className="inputs">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={playerPrefReceiveNewsletter}
                                                        onChange={handleCheckboxChange(setPlayerPrefReceiveNewsletter)}
                                                    />{t('account.preferences.newsletter-text', {siteName:siteName})}
                                                </label>
                                                {errors.pref_receive_newsletter &&
                                                    <span className="error">{errors.pref_receive_newsletter}</span>}
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={playerPrefReceivePrompts}
                                                        onChange={handleCheckboxChange(setPlayerPrefReceivePrompts)}
                                                    />{t('account.preferences.prompt-text', {siteName: siteName})}
                                                </label>
                                                {errors.pref_receive_prompts &&
                                                    <span className="error">{errors.pref_receive_prompts}</span>}
                                            </div>
                                        </div>

                                        <button type="submit"
                                                className="submit"
                                        >{t('account.forms.profile.update-button')}
                                        </button>
                                    </>
                                </form>
                            )}
                            {activeTab === "privacy" && (
                                <div className="account__settings">
                                    <h3 style={{
                                        textAlign: 'center',
                                        marginBottom: '25px',
                                        color: '#333'
                                    }}>{t('account.privacy.title')}</h3>

                                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                        <button
                                            onClick={handleDataRequest}
                                            disabled={isLoading}
                                            style={{
                                                padding: '12px 20px',
                                                fontSize: '16px',
                                                borderRadius: '5px',
                                                border: '1px solid #007bff',
                                                backgroundColor: isLoading ? '#a0cfff' : '#3498db',
                                                color: 'white',
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                transition: 'background-color 0.3s ease',
                                            }}
                                        >
                                            {isLoading ? t('account.privacy.data-request.processing') : t('account.privacy.data-request.make')}
                                        </button>

                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={isLoading}
                                            style={{
                                                padding: '12px 20px',
                                                fontSize: '16px',
                                                borderRadius: '5px',
                                                border: '1px solid #dc3545',
                                                backgroundColor: isLoading ? '#ffb3ba' : '#dc3545',
                                                color: 'white',
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                transition: 'background-color 0.3s ease',
                                            }}
                                        >
                                            {isLoading ? t('account.privacy.delete.processing') : t('account.privacy.delete.make')}
                                        </button>
                                    </div>

                                    <hr/>
                                    <CookieSettingsButton/>

                                </div>
                            )}
                            {activeTab === "logout" && (
                                <div className="logout-container">
                                    <p className="mb-4">{t('account.logout.title')}</p>
                                    <button
                                        className="key special logout"
                                        onClick={handleLogout}
                                    >
                                        <LogoutIcon/>&nbsp;{t('alert.titles.logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3>{t('account.register.title')}</h3>
                        <p>{t('account.register.text')}</p>
                        <AuthTabs onSignupSuccess={onSignupSuccess} onLoginSuccess={(playerData) => {
                            onLoginSuccess(playerData);
                            onClose();
                        }}/>
                    </div>
                )}
                <div>{t('account.privacy.leader-text', {sitename: process.env.REACT_APP_SITE_NAME})}</div>
                <div><a href="/privacy-policy?lang=x" target="_blank">{t('account.privacy-policy')}</a></div>
                <div><a href="/terms-of-service" target="_blank">{t('account.terms-of-service')}</a></div>

                <div className="support-link">{t('account.support-link-text')} <a
                    href={`mailto:${process.env.REACT_APP_SUPPORT_EMAIL}`}>{process.env.REACT_APP_SUPPORT_EMAIL}</a></div>
            </div>
        </Modal>
    );
}

export default AccountSettingsModal;