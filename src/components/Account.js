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
        { key: "profile", label: "Proffil" },
        { key: "privacy", label: "Preifatrwydd" },
        { key: "logout", label: "Allgofnodi" },
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
                title: "Cais Data",
                text: "Byddwn yn prosesu'ch cais data. Ydych chi'n siŵr?",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Ie, cadarnhau",
                cancelButtonText: "Na, canslo"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const responseData = await makeRequest(`/players/${playerId}/data-request`, 'POST', {});
                        Swal.fire('Llwyddiant!', responseData.message || 'Mae eich cais data wedi cael ei brosesu.', 'success');
                    } catch (err) {
                        Swal.fire('Gwall!', err.message || 'Methodd eich cais data.', 'error');
                    }
                }
            });
        } catch (error) {
            console.error("Error making data request:", error);
            Swal.fire('Gwall Rhwydwaith!', 'Methu cysylltu â’r gweinydd.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Swal.fire({
            title: "Ydych chi'n siŵr?",
            text: "Bydd dileu eich cyfrif yn dileu eich holl ddata defnyddiwr yn barhaol ac ni fydd unrhyw hanes o'ch cyfrif yn cael ei gadw. Ni ellir dadwneud hyn!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ie, dilëwch fy nghyfrif!",
            cancelButtonText: "Na, peidiwch â dileu"
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                try {
                    // Ensure player object is valid before attempting deletion
                    if (!player || !player.id) {
                        throw new Error("Cannot delete account: Player ID not found.");
                    }
                    const responseData = await makeRequest(`/players/${player.id}/delete-account`, 'DELETE', {});
                    Swal.fire('Wedi Dileu!', responseData.message || 'Mae eich cyfrif wedi cael ei ddileu.', 'success');
                    onClose();
                    // Clear local storage for user data
                    clearClientSideData(); // Re-use the existing clear function
                } catch (err) {
                    Swal.fire('Gwall!', err.message || 'Methodd y dileu cyfrif.', 'error');
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!player || !player.id) {
            alert("Rhaid mewngofnodi i ddiweddaru'r proffil.");
            return;
        }

        let newErrors = {};
        if (!nickname.trim()) {
            newErrors.nickname = "Mae angen llysenw";
        }
        // Basic frontend validation for languageLevel
        if (typeof languageLevel !== 'number' || !Number.isInteger(languageLevel) || languageLevel < 1 || languageLevel > 3) {
            newErrors.language_level = "Mae lefel iaith yn ofynnol ac rhaid iddo fod yn rhif dilys.";
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
                Swal.fire('Diweddarwyd!', 'Mae eich proffil wedi cael ei ddiweddaru.', 'success'); // Success message
                onClose();
            } else {
                // If backend sends specific errors, display them
                if (data && data.errors) {
                    setErrors(data.errors);
                } else {
                    Swal.fire('Gwall!', data?.message || 'Digwyddodd gwall wrth ddiweddaru.', 'error');
                }
            }
        } catch (error) {
            Swal.fire('Gwall!', 'Digwyddodd gwall. ' + error.message || error, 'error');// Display error message from makeRequest hook
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
                                            <h5>Llysenw (Eich Enw Defnyddiwr)</h5>
                                            <label>
                                                <input
                                                    type="text"
                                                    className={`${errors.nickname ? "error" : ""}`}
                                                    value={nickname}
                                                    placeholder="Llysenw unigryw"
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
                                            <h5>Dewisiadau Cyfathrebu</h5>
                                            <div className="inputs">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={playerPrefReceiveNewsletter}
                                                        onChange={handleCheckboxChange(setPlayerPrefReceiveNewsletter)}
                                                    />A hoffech chi gael y newyddion diweddaraf am ScramAir ac a ydych chi'n
                                                    hapus i dderbyn cylchlythyrau achlysurol drwy e-bost?
                                                </label>
                                                {errors.pref_receive_newsletter && <span className="error">{errors.pref_receive_newsletter}</span>}
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={playerPrefReceivePrompts}
                                                        onChange={handleCheckboxChange(setPlayerPrefReceivePrompts)}
                                                    />Hoffech chi dderbyn awgrymiadau ac atgofion i chwarae ScramAir?
                                                </label>
                                                {errors.pref_receive_prompts && <span className="error">{errors.pref_receive_prompts}</span>}
                                            </div>
                                        </div>

                                        <button type="submit"
                                                className="submit"
                                        >Diweddaru Proffil
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
                                    <h3 style={{textAlign: 'center', marginBottom: '25px', color: '#333'}}>Eich
                                        cyfrif</h3>

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
                                            {isLoading ? 'Yn Prosesu...' : 'Gwneud Cais Data'}
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
                                            {isLoading ? 'Yn Dileu...' : 'Dileu Cyfrif'}
                                        </button>
                                    </div>

                                    <hr />
                                    <CookieSettingsButton />

                                </div>
                            )}
                            {activeTab === "logout" && (
                                <div className="logout-container">
                                    <p className="mb-4">Hoffech chi allgofnodi?</p>
                                    <button
                                        className="key special logout"
                                        onClick={handleLogout}
                                    >
                                        <LogoutIcon/>&nbsp;Allgofnodi
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3>Mewngofnodwch neu cofrestrwch</h3>
                        <p>Trwy gofrestru a llofnodi i mewn i chwarae, byddwch yn gallu gweld eich ystadegau gêm a bydd
                            eich sgôr yn cael ei ychwanegu at ein bwrdd arweinwyr dyddiol. Gweld a allwch chi gyrraedd
                            brig y bwrdd arweinwyr!</p>
                        <AuthTabs onSignupSuccess={onSignupSuccess} onLoginSuccess={(playerData) => {
                            onLoginSuccess(playerData);
                            onClose();
                        }}/>
                    </div>
                )}
                <div className="support-link">Am gymorth, cysylltwch â ni drwy e-bost yn <a href="mailto:cymorth@scramair.cymru">cymorth@scramair.cymru</a></div>
            </div>
        </Modal>
    );
}

export default AccountSettingsModal;