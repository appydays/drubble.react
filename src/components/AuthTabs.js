import { useState, useEffect } from "react";
import useApiRequest from './useApiRequest';
import Swal from 'sweetalert2';
import GoogleLoginButton from './GoogleLoginButton';
import LanguageLevelSelect from "./LanguageLevelSelect";
import CookieSettingsButton from "./CookieSettingsButton";
import { useTranslation } from 'react-i18next';
import FacebookLoginButton from "./FacebookLoginButton";
import ReferralCodeSelect from './atoms/ReferralCodeSelect';

const AuthTabs = ({ onSignupSuccess, onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState("signin"); // Default to Sign In

    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [languageLevel, setLanguageLevel] = useState(1);
    const [pref_receive_newsletter, setPrefReceiveNewsletter] = useState(false);
    const [pref_receive_prompts, setPrefReceivePrompts] = useState(false);
    const [referral_from_code, setReferralFromCode] = useState(1);
    const [referral_other, setReferralOther] = useState(null);

    const availableCodes = t('referral.codes', { returnObjects: true });

    const [errors, setErrors] = useState({});
    // Removed resetStep, verificationCode, passwordConfirm as they are no longer needed for frontend reset flow
    // const [resetStep, setResetStep] = useState("request"); // No longer needed
    // const [verificationCode, setVerificationCode] = useState(""); // No longer needed
    // const [passwordConfirm, setPasswordConfirm] = useState(""); // No longer needed

    // NEW STATE: To show the "check email" message
    const [showForgotPasswordSuccessMessage, setShowForgotPasswordSuccessMessage] = useState(false);

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';
    const { data, loading, error, makeRequest } = useApiRequest(apiUrl); // makeRequest is now unused in this snippet

    const { t, i18n } = useTranslation();
    const siteName = process.env.REACT_APP_SITE_NAME;

    // Reset form fields and messages when switching tabs
    useEffect(() => {
        setErrors({});
        setName("");
        setNickname("");
        setEmail("");
        setPassword("");
        setLanguageLevel(1);
        setPrefReceiveNewsletter(false);
        setPrefReceivePrompts(false);
        // setResetStep("request"); // No longer needed
        // setVerificationCode(""); // No longer needed
        // setPasswordConfirm(""); // No longer needed
        setShowForgotPasswordSuccessMessage(false); // Clear message on tab switch
    }, [activeTab]);

    const handleReferralChange = (e) => {
        const { name, value } = e.target;
        setReferralFromCode((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleReferralTextChange = (e) => {
        const { name, value } = e.target;
        setReferralOther((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    // --- Social (Google, Facebook,Apple) Login Handler ---
    const handleSocialLogin = (data) => {
        if (data.token && data.user) {
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("playerId", data.user.id);
            localStorage.setItem("playerName", data.user.nickname);
            localStorage.setItem('playerPrefReceiveNewsletter', data.user.pref_receive_newsletter ? '1' : '0');
            localStorage.setItem('playerPrefReceivePrompts', data.user.pref_receive_prompts ? '1' : '0');

            onSignupSuccess(data.user.id);
            onLoginSuccess(data.user);
        } else {
            const errorMessage = data.message || t('auth.social-login.error-default');
            console.warn("Server rejected Social login:", errorMessage);
            setErrors({ credentials: errorMessage });
        }
    };
    // --- END Social Login Handler ---

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setErrors({}); // Clear previous errors
            setShowForgotPasswordSuccessMessage(false); // Hide any previous success message

            // --- Frontend Validation START ---
            const newErrors = {};

            if (activeTab === "signup") {
                if (!name.trim()) {
                    newErrors.name = t('auth.form.name.error-required');
                } else if (!/^[a-zA-Z\s]+$/.test(name)) {
                    newErrors.name = t('auth.form.name.error-format');
                }

                if (!nickname.trim()) {
                    newErrors.nickname = t('auth.form.nickname.error-required');
                } else if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
                    newErrors.nickname = t('auth.form.nickname.error-format');
                }

                if (!email.trim()) {
                    newErrors.email = t('auth.form.e-mail.error-required');
                } else if (!/\S+@\S+\.\S+/.test(email)) {
                    newErrors.email = t('auth.form.e-mail.error-format');
                }

                if (!password.trim()) {
                    newErrors.password = t('auth.form.password.error-required');
                } else {
                    if (password.length < 8) {
                        newErrors.password = t('auth.form.password.error-length');
                    }
                    if ((!/[A-Z]/.test(password)) || (!/[a-z]/.test(password)) || (!/\d/.test(password)) || (!/[^a-zA-Z0-9<>]/.test(password))) {
                        newErrors.password = (newErrors.password ? newErrors.password + " " : "") + t('auth.form.password.error-format');
                    }
                }

                if (typeof languageLevel !== 'number' || !Number.isInteger(languageLevel) || languageLevel < 1 || languageLevel > 3) {
                    newErrors.language_level = t('auth.form.lang-level.error-format');
                }

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return;
                }
            }
            else if (activeTab === "reset") { // Only validate email for reset request
                const newErrors = {};
                if (!email.trim()) {
                    newErrors.email = t('auth.form.e-mail.error-required');
                } else if (!/\S+@\S+\.\S+/.test(email)) {
                    newErrors.email = t('auth.form.e-mail.error-format');
                }

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return;
                }
            }
            // --- Frontend Validation END ---

            if (!window.grecaptcha || !window.grecaptcha.execute) {
                setErrors({ recaptcha: t('auth.form.recaptcha.not-available') });
                return;
            }

            const token = await window.grecaptcha.execute("6LfrxB0rAAAAAK8bda-2GoskR_F7ALS9DmgZ2kdb", { action: "login" });

            if (!token) {
                setErrors({ recaptcha: t('auth.form.recaptcha.error-token') });
                return;
            }

            let response, responseData; // Renamed 'data' to 'responseData' to avoid conflict with hook's 'data'

            if (activeTab === "signin") {
                try {
                    await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: { 'Accept': 'application/json','Accept-Language': i18n.language },
                    });

                    response = await fetch(apiUrl + "/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", 'Accept-Language': i18n.language },
                        body: JSON.stringify({
                            email,
                            password,
                            recaptcha_token: token,
                        }),
                    });

                    const text = await response.text();
                    responseData = text ? JSON.parse(text) : null;

                    if (!response.ok || !responseData) {
                        const errorMessage = responseData?.message || t('auth.login.server-error-default');
                        console.error("Login failed:", response.status, responseData);
                        setErrors({ credentials: errorMessage });
                        return;
                    }

                    if (responseData.success && responseData.token) {
                        localStorage.setItem("authToken", responseData.token);
                        localStorage.setItem("playerId", responseData.user.id);
                        localStorage.setItem("playerName", responseData.user.nickname);
                        localStorage.setItem('playerPrefReceiveNewsletter', responseData.user.pref_receive_newsletter ? '1' : '0');
                        localStorage.setItem('playerPrefReceivePrompts', responseData.user.pref_receive_prompts ? '1' : '0');
                        onSignupSuccess(responseData.user.id);
                        onLoginSuccess(responseData.user);
                    } else {
                        const errorMessage = responseData.message || t('auth.login.error-default');
                        console.warn("Server rejected login:", errorMessage);
                        setErrors({ credentials: errorMessage });
                    }
                } catch (err) {
                    console.error("Network error or fetch threw an exception:", err);
                    setErrors({ network: t('auth.login.network-error-default') });
                }

            } else if (activeTab === "reset") {
                // This is the "request password reset email" part
                try {
                    response = await fetch(apiUrl+"/forgot-password", {
                        method: "POST",
                        headers: {"Content-Type": "application/json", 'Accept-Language': i18n.language},
                        body: JSON.stringify({
                            email,
                            recaptcha_token: token
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        setErrors({email: errorData.message || t('auth.login.server-error-default')});
                        console.error("Failed to send password reset link:", response.status, errorData);
                        return;
                    }

                    responseData = await response.json();

                    if (responseData.success) {
                        // Instead of Swal.fire and changing resetStep:
                        // 1. Show the custom success message
                        setShowForgotPasswordSuccessMessage(true);
                        // 2. Switch back to the signin tab
                        setActiveTab("signin");
                        // 3. Clear the email field
                        setEmail("");
                        // 4. Set a timeout to hide the message after a few seconds
                        setTimeout(() => {
                            setShowForgotPasswordSuccessMessage(false);
                        }, 8000); // Message disappears after 8 seconds
                    } else {
                        setErrors({email: responseData.message || t('auth.login.server-error-default')});
                        console.error("Error response:", responseData);
                    }
                } catch (err) {
                    console.error("Request failed:", err);
                    setErrors({email: t('auth.forgot-password.failed.text')});
                }
                return; // Ensure return after reset logic
            } else { // activeTab === "signup"
                response = await fetch(apiUrl + "/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", 'Accept-Language': i18n.language },
                    body: JSON.stringify({
                        name: name,
                        nickname: nickname,
                        email: email,
                        password: password,
                        password_confirmation: passwordConfirm,
                        language_level: languageLevel,
                        pref_receive_newsletter: pref_receive_newsletter,
                        pref_receive_prompts: pref_receive_prompts,
                        recaptcha_token: token,
                        referral_from_code: referral_from_code,
                        referral_other: referral_other
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        localStorage.setItem('authToken', data.token);
                        localStorage.setItem('playerId', data.user.id);
                        localStorage.setItem('playerName', data.user.nickname);
                        localStorage.setItem('playerPrefReceiveNewsletter', data.user.pref_receive_newsletter ? '1' : '0');
                        localStorage.setItem('playerPrefReceivePrompts', data.user.pref_receive_prompts ? '1' : '0');

                        onSignupSuccess(data.user.id);
                        onLoginSuccess(data.user);
                    } else {
                        setErrors(data.errors || { credentials: data.message || t('auth.register.server-error-default') });
                        console.error("Registration error (backend):", response.status, data);
                    }
                } else {
                    try {
                        const errorData = await response.json();
                        setErrors(errorData.errors || { credentials: errorData.message || t('auth.register.error-default') });
                        console.error("Registration failed (non-2xx):", response.status, errorData);
                    } catch (jsonErr) {
                        console.error("Registration failed and non-JSON response:", response.status, jsonErr);
                        setErrors({ credentials: t('auth.register.error-default') });
                    }
                }
            }
        } catch (err) {
            console.error("Error in handleSubmit", err);
            setErrors((prev) => ({
                ...prev,
                credentials: err?.message || t('auth.unexpected-error'),
            }));
        }
    };

    const handleLanguageLevelChange = (level) => {
        setLanguageLevel(level);
    };

    const handleCheckboxChange = (setter) => (e) => {
        setter(e.target.checked);
    };

    return (
        <div>
            <div className="login-register">
                {/* Toggle Tabs */}
                <div className="tabs auth-tabs">
                    <button className={activeTab === "signin" ? "active key special" : "key special"}
                            onClick={() => setActiveTab("signin")}>
                        {t('auth.buttons.login')}
                    </button>
                    <button className={activeTab === "signup" ? "active key special" : "key special"}
                            onClick={() => setActiveTab("signup")}>
                        {t('auth.buttons.register')}
                    </button>
                </div>

                {/* Auth Forms */}
                <form onSubmit={handleSubmit}>

                    {activeTab === "signin" &&
                        <>
                            <div className="form-heading">{t('account.login.form-heading')}</div>
                            {/*<FacebookLoginButton onLogin={handleSocialLogin}/>*/}

                            <GoogleLoginButton onLogin={handleSocialLogin}/>
                            <p>OR</p>
                        </>
                    }

                    {/* Conditional message for successful forgot password request */}
                    {activeTab === "signin" && showForgotPasswordSuccessMessage && (
                        <div className="success-message" style={{
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            border: '1px solid #c3e6cb',
                            borderRadius: '4px',
                            padding: '10px 15px',
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            {t('auth.forgot-password.check-email-message')}
                        </div>
                    )}

                    {activeTab === "signup" && (
                        <>
                        <div className="form-heading">{t('account.register.form-heading')}</div>
                            <div className="form-field-group signup">
                                <label>
                                    <span>{t('auth.form.name.label')}</span>
                                    <input
                                        type="text"
                                        className={`${errors.name ? "error" : ""}`}
                                        value={name}
                                        placeholder={t('auth.form.name.placeholder')}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </label>

                                <label>
                                    <span>{t('auth.form.nickname.label')}</span>
                                    <input
                                        type="text"
                                        className={`${errors.nickname ? "error" : ""}`}
                                        value={nickname}
                                        placeholder={t('auth.form.nickname.placeholder')}
                                        onChange={(e) => setNickname(e.target.value)}
                                    />
                                    {errors.nickname && <span className="error-message">{errors.nickname}</span>}
                                </label>
                            </div>
                        </>
                    )}

                    {(activeTab === "signin") && (
                        <div className="form-field-group signin">
                            <label>
                                <span>{t('auth.form.e-mail.label')}</span>
                                <input
                                    type="email"
                                    className={`${errors.email ? "error" : ""}`}
                                    value={email}
                                    placeholder={t('auth.form.e-mail.placeholder')}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </label>

                            <label>
                                <span>{t('auth.form.password.label')}</span>
                                <input
                                    type="password"
                                    className={`${errors.password ? "error" : ""}`}
                                    value={password}
                                    placeholder={t('auth.form.password.placeholder')}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </label>
                        </div>
                    )}

                    {(activeTab === "signup") && (
                        <>
                            <div className="form-field-group signup">
                                <label>
                                    <span>{t('auth.form.e-mail.label')}</span>
                                    <input
                                        type="email"
                                        className={`${errors.email ? "error" : ""}`}
                                        value={email}
                                        placeholder={t('auth.form.e-mail.placeholder')}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </label>
                            </div>
                            <div className="form-field-group signup">
                                <label>
                                    <span>{t('auth.form.password.label')}</span>
                                    <input
                                        type="password"
                                        className={`${errors.password ? "error" : ""}`}
                                        value={password}
                                        placeholder={t('auth.form.password.placeholder')}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {errors.password && <span className="error-message">{errors.password}</span>}
                                </label>

                                <label>
                                    <span>{t('auth.form.password-confirm.label')}</span>
                                    <input
                                        type="password"
                                        className={`${errors.passwordConfirm ? "error" : ""}`}
                                        value={passwordConfirm}
                                        placeholder={t('auth.form.password-confirm.placeholder')}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                    />
                                    {errors.passwordConfirm &&
                                        <span className="error-message">{errors.passwordConfirm}</span>}
                                </label>
                            </div>
                        </>
                    )}

                    {errors.credentials && <span className="error-message">{errors.credentials}</span>}


                    {activeTab === "signup" && (
                        <>

                            <ReferralCodeSelect
                                codes={availableCodes}
                                siteName={siteName}
                                selectedCode={referral_from_code}
                                onCodeChange={handleReferralChange}
                                otherText={referral_other}
                                onOtherTextChange={handleReferralTextChange}
                            />

                            <LanguageLevelSelect
                                onLevelChange={handleLanguageLevelChange}
                                initialLevel={languageLevel}
                            />
                            {errors.language_level && <span className="error-message">{errors.language_level}</span>}

                            <div>
                                <h3>{t('account.preferences.title')}</h3>
                            </div>
                            <label className="choices">
                                <input
                                    type="checkbox"
                                    checked={pref_receive_newsletter}
                                    onChange={handleCheckboxChange(setPrefReceiveNewsletter)}
                                />{t('account.preferences.newsletter-text', {siteName: siteName})}
                            </label>
                            {errors.pref_receive_newsletter &&
                                <span className="error-message">{errors.pref_receive_newsletter}</span>}

                            <label className="choices">
                                <input
                                    type="checkbox"
                                    checked={pref_receive_prompts}
                                    onChange={handleCheckboxChange(setPrefReceivePrompts)}
                                />{t('account.preferences.prompt-text', {siteName: siteName})}
                            </label>
                            {errors.pref_receive_prompts &&
                                <span className="error-message">{errors.pref_receive_prompts}</span>}
                        </>
                    )}

                    {(activeTab === "signin" || activeTab === "signup") && (
                        <button
                            type="submit"
                            className="submit"
                            disabled={!email || !password || (activeTab === "signup" && (!name || !nickname || !languageLevel ))}
                        >
                            {activeTab === "signin" ? t('auth.buttons.login') : t('auth.buttons.register')}
                        </button>
                    )}

                    {/* Forgot Password Section - Only visible on signin tab normally */}
                    {(activeTab === "signin" &&
                        <div style={{marginTop: "1rem"}}>
                            <div className="forgot-password__title" style={{marginTop: "1rem"}}>
                                {t('auth.forgot-password.title')}
                            </div>
                            <div className="forgot-password__text" style={{marginTop: "1rem"}}>
                                {t('auth.forgot-password.text')}
                            </div>
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => setActiveTab("reset")} // Switch to reset tab to enter email
                                style={{
                                    background: "#a0a0a0",
                                    border: "none",
                                    borderRadius: "50px",
                                    color: "#000000",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    marginTop: "1rem",
                                    padding: "1rem"
                                }}
                            >{t('auth.buttons.forgot-password')}
                            </button>
                        </div>
                    )}

                    {/* Reset Password Request Form (Email Input Only) */}
                    {activeTab === "reset" && (
                        <>
                            <div>
                                <h3>{t('auth.reset-password.title')}</h3>
                                <p>{t('auth.reset-password.text')}</p>
                            </div>
                            <label>
                                <span>{t('auth.form.e-mail.label')}</span>
                                <input
                                    type="email"
                                    className={`${errors.email ? "error" : ""}`}
                                    value={email}
                                    placeholder={t('auth.form.e-mail.placeholder-reset')}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </label>
                            {errors.credentials && <span className="error-message">{errors.credentials}</span>}

                            <button type="submit" className="submit" disabled={!email}>{t('auth.reset-password.button')}</button>
                        </>
                    )}

                    {/* Removed the 'activeTab === "reset" && resetStep === "verify"' block entirely */}
                    {/* As the verification and password update will now be handled by the Laravel Blade view */}

                </form>
            </div>
            <CookieSettingsButton />

            {errors.recaptcha && <span className="error">{errors.recaptcha}</span>}
        </div>
    );
};

export default AuthTabs;
