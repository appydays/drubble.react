import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import LogoutIcon from "./atoms/LogoutIcon";
import AuthTabs from './AuthTabs'; // Keep if you use AuthTabs for login/signup within this modal
import useApiRequest from './useApiRequest';
import CookieSettingsButton from "./CookieSettingsButton";
import Swal from 'sweetalert2';
import LanguageLevelSelect from "./LanguageLevelSelect"; // Import the LanguageLevelSelect component

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
        { key: "profile", label: "Profile" },
        { key: "privacy", label: "Privacy" },
        { key: "logout", label: "Logout" },
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
                Swal.fire('Login Required', 'Please log in to request your data.', 'warning');
                return;
            }

            Swal.fire({
                title: "Data Request",
                text: "We will process your data request. are you sure?",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No, cancel"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const responseData = await makeRequest(`/players/${playerId}/data-request`, 'POST', {});
                        Swal.fire('Success!', responseData.message || 'Your data request has been processed,  you will receive an email shortly.', 'success');
                    } catch (err) {
                        Swal.fire('Error!', err.message || 'Your data request failed, please try again later or contact us for assistance.', 'error');
                    }
                }
            });
        } catch (error) {
            console.error("Error making data request:", error);
            Swal.fire('Network Error!', 'Unable to connect to the server.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "Deleting your account will permanently delete all your user data and no history of your account will be kept. This cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete my account!",
            cancelButtonText: "No, don't delete"
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                try {
                    // Ensure player object is valid before attempting deletion
                    if (!player || !player.id) {
                        throw new Error("Cannot delete account: Player ID not found.");
                    }
                    const responseData = await makeRequest(`/players/${player.id}/delete-account`, 'DELETE', {});
                    Swal.fire('Deleted!', responseData.message || 'Your account has been deleted.', 'success');
                    onClose();
                    // Clear local storage for user data
                    clearClientSideData(); // Re-use the existing clear function
                } catch (err) {
                    Swal.fire('Error!', err.message || 'Account deletion failed. Please try again later, if the problem persists, please let us know and we can process this request.', 'error');
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!player || !player.id) {
            alert("You must login to update your profile.");
            return;
        }

        let newErrors = {};
        if (!nickname.trim()) {
            newErrors.nickname = "Nickname is required";
        }
        // Basic frontend validation for languageLevel
        if (typeof languageLevel !== 'number' || !Number.isInteger(languageLevel) || languageLevel < 1 || languageLevel > 3) {
            newErrors.language_level = "Language level is required and must be a valid number.";
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
                Swal.fire('Updated!', 'Your profile has been updated.', 'success'); // Success message
                onClose();
            } else {
                // If backend sends specific errors, display them
                if (data && data.errors) {
                    setErrors(data.errors);
                } else {
                    Swal.fire('Error!', data?.message || 'An error occurred while updating.', 'error');
                }
            }
        } catch (error) {
            Swal.fire('Error!', 'An unexpected error has occurred. ' + error.message || error, 'error');// Display error message from makeRequest hook
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
                                            <h5>Nickname (Your Username)</h5>
                                            <label>
                                                <input
                                                    type="text"
                                                    className={`${errors.nickname ? "error" : ""}`}
                                                    value={nickname}
                                                    placeholder="A unique nickname"
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
                                            {errors.language_level && <span className="error">{errors.language_level}</span>}
                                        </div>


                                        <div className="preferences">
                                            <h5>Communication Preferences</h5>
                                            <div className="inputs">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={playerPrefReceiveNewsletter}
                                                        onChange={handleCheckboxChange(setPlayerPrefReceiveNewsletter)}
                                                    />Would you like to receive the latest news about Drubble and are you
                                                    happy to receive occasional newsletters by email?
                                                </label>
                                                {errors.pref_receive_newsletter && <span className="error">{errors.pref_receive_newsletter}</span>}
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={playerPrefReceivePrompts}
                                                        onChange={handleCheckboxChange(setPlayerPrefReceivePrompts)}
                                                    />Would you like to receive tips and reminders to play Drubble?
                                                </label>
                                                {errors.pref_receive_prompts && <span className="error">{errors.pref_receive_prompts}</span>}
                                            </div>
                                        </div>

                                        <button type="submit"
                                                className="submit"
                                        >Update Profile
                                        </button>
                                    </>
                                </form>
                            )}
                            {activeTab === "privacy" && (
                                <div className="account__settings" style={{
                                    padding: '20px',
                                    maxWidth: '400px',
                                    margin: 'auto',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{textAlign: 'center', marginBottom: '25px', color: '#333'}}>Your Account</h3>

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
                                            {isLoading ? 'Processing...' : 'Make data request'}
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
                                            {isLoading ? 'Deleting...' : 'Delete Account'}
                                        </button>
                                    </div>

                                    <hr />
                                    <CookieSettingsButton />

                                </div>
                            )}
                            {activeTab === "logout" && (
                                <div className="logout-container">
                                    <p className="mb-4">Would you like to logout?</p>
                                    <button
                                        className="key special logout"
                                        onClick={handleLogout}
                                    >
                                        <LogoutIcon/>&nbsp;Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3>Log in or register</h3>
                        <p>By registering and signing in to play, you will be able to see your game statistics and
                            your score is added to our daily leaderboard. See if you can get to
                            top of the leaderboard!</p>
                        <AuthTabs onSignupSuccess={onSignupSuccess} onLoginSuccess={(playerData) => {
                            onLoginSuccess(playerData);
                            onClose();
                        }}/>
                    </div>
                )}
                <div className="support-link">For assistance, please contact us by email at <a href="mailto:support@drubble.uk">support@drubble.uk</a></div>
            </div>
        </Modal>
    );
}

export default AccountSettingsModal;