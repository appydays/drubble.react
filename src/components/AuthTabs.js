import { useState, useEffect } from "react"; // Import useEffect
import useApiRequest from './useApiRequest'; // Assuming this hook is still used elsewhere
import Swal from 'sweetalert2';
import GoogleLoginButton from './GoogleLoginButton';
import LanguageLevelSelect from "./LanguageLevelSelect"; // Ensure this import path is correct
import CookieSettingsButton from "./CookieSettingsButton";
import { useTranslation } from 'react-i18next';

const AuthTabs = ({ onSignupSuccess, onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState("signin"); // Default to Sign In

    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // Default languageLevel to 1 (Learner) for new registrations
    const [languageLevel, setLanguageLevel] = useState(1); // Set default to 1 (Learner)
    const [pref_receive_newsletter, setPrefReceiveNewsletter] = useState(false); // Default to false (unchecked)
    const [pref_receive_prompts, setPrefReceivePrompts] = useState(false); // Default to false (unchecked)

    const [errors, setErrors] = useState({});
    const [resetStep, setResetStep] = useState("request");
    const [verificationCode, setVerificationCode] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const baseUrl = process.env.REACT_APP_API_URL;
    const apiUrl = baseUrl + '/api';

    const { t, i18n } = useTranslation();
    const siteName = process.env.REACT_APP_SITE_NAME;
    // Reset form fields when switching tabs
    useEffect(() => {
        setErrors({}); // Clear errors
        setName("");
        setNickname("");
        setEmail("");
        setPassword("");
        setLanguageLevel(1); // Reset to default Learner
        setPrefReceiveNewsletter(false); // Reset checkboxes
        setPrefReceivePrompts(false);
        setResetStep("request");
        setVerificationCode("");
        setPasswordConfirm("");
    }, [activeTab]);


    // --- NEW: Social (Google, Facebook,Apple) Login Handler ---
    const handleSocialLogin = (data) => {
        if (data.token && data.user) {
            localStorage.setItem("auth_token", data.token); // Consider if you need this with Sanctum token or session
            localStorage.setItem("playerId", data.user.id);
            localStorage.setItem("playerName", data.user.nickname);
            // Ensure these user properties exist in your Laravel response for Google login
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
    // --- END NEW: Google Login Handler ---

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setErrors({}); // Clear previous errors

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

                // Language Level validation (ensure it's a number and within expected range)
                if (typeof languageLevel !== 'number' || !Number.isInteger(languageLevel) || languageLevel < 1 || languageLevel > 3) {
                    newErrors.language_level = t('auth.form.lang-level.error-format'); // Language level is required and must be a valid number.
                }

                // Newsletter checkbox validation (required)
                // if (!pref_receive_newsletter) {
                //     newErrors.pref_receive_newsletter = "Rhaid i chi gytuno i dderbyn y cylchlythyr."; // You must agree to receive the newsletter.
                // }


                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return; // Stop the submission if there are frontend errors
                }
            }
            else if (activeTab === "reset") {
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

            let response, data;

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
                    data = text ? JSON.parse(text) : null;

                    if (!response.ok || !data) {
                        const errorMessage = data?.message || t('auth.login.server-error-default');
                        console.error("Login failed:", response.status, data);
                        setErrors({ credentials: errorMessage });
                        return;
                    }

                    if (data.success && data.token) {
                        localStorage.setItem("auth_token", data.token); // Uncomment if you need auth_token
                        localStorage.setItem("player", data.user);
                        localStorage.setItem("playerId", data.user.id);
                        localStorage.setItem("playerName", data.user.nickname);
                        localStorage.setItem('playerPrefReceiveNewsletter', data.user.pref_receive_newsletter ? '1' : '0');
                        localStorage.setItem('playerPrefReceivePrompts', data.user.pref_receive_prompts ? '1' : '0');
                        onSignupSuccess(data.user.id);
                        onLoginSuccess(data.user);
                    } else {
                        const errorMessage = data.message || t('auth.login.error-default');
                        console.warn("Server rejected login:", errorMessage);
                        setErrors({ credentials: errorMessage });
                    }
                } catch (err) {
                    console.error("Network error or fetch threw an exception:", err);
                    setErrors({ network: t('auth.login.network-error-default') });
                }

            } else if (activeTab === "reset") {
                // ... (Your existing reset password logic) ...
                if (resetStep === "request") {
                    try {
                        const response = await fetch(apiUrl+"/forgot-password", {
                            method: "POST",
                            headers: {"Content-Type": "application/json", 'Accept-Language': i18n.language},
                            body: JSON.stringify({
                                email,
                                recaptcha_token: token
                            })
                        });

                        if (!response.ok) {
                            // Check if data is available for specific messages
                            const errorData = await response.json().catch(() => ({}));
                            setErrors({email: errorData.message || t('auth.login.server-error-default')});
                            console.error("Failed to send password reset link:", response.status, errorData);
                            return;
                        }

                        data = await response.json();

                        if (data.success) {
                            Swal.fire(t('auth.forgot-password.success.title'), t('auth.forgot-password.success.text'), 'success');
                            setResetStep("verify");
                        } else {
                            setErrors({email: data.message || t('auth.login.server-error-default')});
                            console.error("Error response:", data);
                        }
                    } catch (err) {
                        console.error("Request failed:", err);
                        setErrors({email: t('auth.forgot-password.failed.text')});
                        return;
                    }
                } else {
                    if (password !== passwordConfirm) {
                        setErrors({passwordConfirm: t('auth.form.password-confirm.not-match')});
                        return;
                    }

                    // STEP 2: Submit code + new password
                    try {
                        const response = await fetch(apiUrl+"/update-password", {
                            method: "POST",
                            headers: {"Content-Type": "application/json", 'Accept-Language': i18n.language},
                            body: JSON.stringify({
                                email,
                                verification_code: verificationCode,
                                password,
                                password_confirmation: passwordConfirm,
                            }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            setErrors({credentials: errorData.message || t('auth.update-password.failed.text')});
                            console.error("Password reset error:", response.status, errorData);
                            return;
                        }

                        data = await response.json();

                        if (data.success) {
                            Swal.fire(t('auth.update-password.success.title'), t('auth.update-password.success.text'), 'success');
                            setActiveTab("signin");
                            setResetStep("request");
                            setEmail("");
                            setPassword("");
                            setPasswordConfirm("");
                            setVerificationCode("");
                        } else {
                            setErrors({credentials: data.message || t('auth.update-password.failed.default-error')});
                            console.error("Password reset error:", data);
                        }
                    } catch (err) {
                        console.error("Request failed:", err);
                        setErrors({credentials: t('auth.update-password.failed.credentials-error')});
                    }
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
                        language_level: languageLevel, // Ensure this is the correct value (integer)
                        pref_receive_newsletter: pref_receive_newsletter, // Send as boolean
                        pref_receive_prompts: pref_receive_prompts,       // Send as boolean
                        recaptcha_token: token
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        localStorage.setItem("player", data.user);
                        localStorage.setItem('playerId', data.user.id);
                        localStorage.setItem('playerName', data.user.nickname);
                        localStorage.setItem('playerPrefReceiveNewsletter', data.user.pref_receive_newsletter ? '1' : '0');
                        localStorage.setItem('playerPrefReceivePrompts', data.user.pref_receive_prompts ? '1' : '0');

                        onSignupSuccess(data.user.id);
                        onLoginSuccess(data.user);

                        // No need to setPassword here, handled by useEffect on tab switch
                        // setActiveTab("signin"); // This will happen via onLoginSuccess leading to route change
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

    // Handler for LanguageLevelSelect component
    const handleLanguageLevelChange = (level) => {
        setLanguageLevel(level);
    };

    // Handler for standard checkboxes
    const handleCheckboxChange = (setter) => (e) => {
        setter(e.target.checked); // Checkbox value is a boolean
    };

    return (
        <div>
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

                <GoogleLoginButton onLogin={handleSocialLogin} />
                <p>OR</p>

                {activeTab === "signup" && (
                    // Group name and nickname for responsive layout
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
                )}

                {(activeTab === "signin") && (
                    // Group email and password for responsive layout
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
                    // Group email and password for responsive layout
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

                {/* Place credentials error outside the group if it applies to both email/password */}
                {errors.credentials && <span className="error-message">{errors.credentials}</span>}


                {activeTab === "signup" && (
                    <>
                        {/* Language Level Selector - Assuming LanguageLevelSelect handles its own internal layout */}
                        <LanguageLevelSelect
                            onLevelChange={handleLanguageLevelChange}
                            initialLevel={languageLevel} // Pass current languageLevel state
                        />
                        {errors.language_level && <span className="error-message">{errors.language_level}</span>}

                        {/* Communication Preferences */}
                        <div>
                            <h3>{t('account.preferences.title')}</h3>
                        </div>
                        <label class="choices">
                            <input
                                type="checkbox"
                                checked={pref_receive_newsletter}
                                onChange={handleCheckboxChange(setPrefReceiveNewsletter)}
                                required
                            />{t('account.preferences.newsletter-text', {siteName: siteName})}
                        </label>
                        {errors.pref_receive_newsletter &&
                            <span className="error-message">{errors.pref_receive_newsletter}</span>}

                        <label class="choices">
                            <input
                                type="checkbox"
                                checked={pref_receive_prompts}
                                onChange={handleCheckboxChange(setPrefReceivePrompts)}
                            />{t('account.preferences.prompt-text')}
                        </label>
                        {errors.pref_receive_prompts &&
                            <span className="error-message">{errors.pref_receive_prompts}</span>}
                    </>
                )}

                {(activeTab === "signin" || activeTab === "signup") && (
                    <button
                        type="submit"
                        className="submit"
                        disabled={!email || !password || (activeTab === "signup" && (!name || !nickname || !languageLevel || !pref_receive_newsletter))} // Added required newsletter consent
                    >
                        {activeTab === "signin" ? t('auth.buttons.login') : t('auth.buttons.register')}
                    </button>
                )}

                {(activeTab === "signin" &&
                    <div style={{ marginTop: "1rem" }}>
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => setActiveTab("reset")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#007bff",
                                cursor: "pointer",
                                textDecoration: "underline",
                                padding: 0
                            }}
                        >{t('auth.buttons.forgot-password')}
                        </button>
                    </div>
                )}

                {activeTab === "reset" && resetStep === "request" && (
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

                {activeTab === "reset" && resetStep === "verify" && (
                    // Group for reset password fields (email is first, then verification/new password)
                    <div className="form-field-group">
                        <label>
                            <span>{t('auth.form.e-mail.label')}</span>
                            <input
                                type="email"
                                className={`${errors.email ? "error" : ""}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </label>

                        <label>
                            <span>{t('auth.form.verify-code.label')}</span>
                            <input
                                type="text"
                                className={`${errors.verification_code ? "error" : ""}`}
                                value={verificationCode}
                                placeholder={t('auth.form.verify-code.placeholder')}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                            {errors.verification_code && <span className="error-message">{errors.verification_code}</span>}
                        </label>

                        <label>
                            <span>{t('auth.form.new-password.title')}</span>
                            <input
                                type="password"
                                className={`${errors.password ? "error" : ""}`}
                                value={password}
                                placeholder={t('auth.form.new-password.placeholder')}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </label>

                        <label>
                            <span>{t('auth.form.password-confirm.title')}</span>
                            <input
                                type="password"
                                className={`${errors.passwordConfirm ? "error" : ""}`}
                                value={passwordConfirm}
                                placeholder={t('auth.form.password-confirm.placeholder')}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                            />
                            {errors.passwordConfirm && <span className="error-message">{errors.passwordConfirm}</span>}
                        </label>
                    </div>
                )}
                {/* Errors that apply outside a specific field group */}
                {activeTab === "reset" && resetStep === "verify" && errors.credentials &&
                    <span className="error-message">{errors.credentials}</span>}


                {activeTab === "reset" && resetStep === "verify" && (
                    <button
                        type="submit"
                        className="submit"
                        disabled={!email || !password || !verificationCode || password !== passwordConfirm}
                    >{t('auth.reset-password.title')}</button>
                )}
            </form>
            <CookieSettingsButton />

            {errors.recaptcha && <span className="error">{errors.recaptcha}</span>}
        </div>
    );
};

export default AuthTabs;