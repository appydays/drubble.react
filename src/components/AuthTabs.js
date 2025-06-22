import { useState, useEffect } from "react"; // Import useEffect
import useApiRequest from './useApiRequest'; // Assuming this hook is still used elsewhere
import Swal from 'sweetalert2';
import GoogleLoginButton from './GoogleLoginButton';
import LanguageLevelSelect from "./LanguageLevelSelect";
import CookieSettingsButton from "./CookieSettingsButton"; // Ensure this import path is correct

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
            const errorMessage = data.message || "Login failed. Please try again.";
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
                console.log('Entered name is '+name);
                if (!name.trim()) {
                    newErrors.name = "A name is required.";
                } else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
                    newErrors.name = "Only letters, numbers and underscores are allowed.";
                }

                if (!nickname.trim()) {
                    newErrors.nickname = "A nickname is required.";
                } else if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
                    newErrors.nickname = "Only letters, numbers and underscores are allowed.";
                }

                if (!email.trim()) {
                    newErrors.email = "An e-mail is required";
                } else if (!/\S+@\S+\.\S+/.test(email)) {
                    newErrors.email = "The email format is not valid.";
                }

                if (!password.trim()) {
                    newErrors.password = "A password is required";
                } else {
                    if (password.length < 8) {
                        newErrors.password = "The password must be at least 8 characters.";
                    }
                    if ((!/[A-Z]/.test(password)) || (!/[a-z]/.test(password)) || (!/\d/.test(password)) || (!/[^a-zA-Z0-9<>]/.test(password))) {
                        newErrors.password = (newErrors.password ? newErrors.password + " " : "") + "It must contain at least one uppercase letter, one lowercase letter, one number and one symbol (except < or >).";
                    }
                }

                // Language Level validation (ensure it's a number and within expected range)
                if (typeof languageLevel !== 'number' || !Number.isInteger(languageLevel) || languageLevel < 1 || languageLevel > 3) {
                    newErrors.language_level = "Language level is required."; // Language level is required and must be a valid number.
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
                    newErrors.email = "Email is required.";
                } else if (!/\S+@\S+\.\S+/.test(email)) {
                    newErrors.email = "The email format is not valid.";
                }

                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return;
                }
            }
            // --- Frontend Validation END ---

            if (!window.grecaptcha || !window.grecaptcha.execute) {
                setErrors({ recaptcha: "reCAPTCHA is not available. Try again later." });
                return;
            }

            const token = await window.grecaptcha.execute("6LfrxB0rAAAAAK8bda-2GoskR_F7ALS9DmgZ2kdb", { action: "login" });

            if (!token) {
                setErrors({ recaptcha: "ReCAPTCHA verification failed. Try again." });
                return;
            }

            let response, data;

            if (activeTab === "signin") {
                console.log("Signing In:", { email, password });

                try {
                    await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: { 'Accept': 'application/json' },
                    });

                    response = await fetch(apiUrl + "/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email,
                            password,
                            recaptcha_token: token,
                        }),
                    });

                    const text = await response.text();
                    data = text ? JSON.parse(text) : null;

                    if (!response.ok || !data) {
                        const errorMessage = data?.message || "Something went wrong. Please try again.";
                        console.error("Login failed:", response.status, data);
                        setErrors({ credentials: errorMessage });
                        return;
                    }

                    if (data.success && data.token) {
                        localStorage.setItem("auth_token", data.token); // Uncomment if you need auth_token
                        localStorage.setItem("playerId", data.user.id);
                        localStorage.setItem("playerName", data.user.nickname);
                        localStorage.setItem('playerPrefReceiveNewsletter', data.user.pref_receive_newsletter ? '1' : '0');
                        localStorage.setItem('playerPrefReceivePrompts', data.user.pref_receive_prompts ? '1' : '0');
                        onSignupSuccess(data.user.id);
                        onLoginSuccess(data.user);
                    } else {
                        const errorMessage = data.message || "Login failed. Please try again.";
                        console.warn("Server rejected login:", errorMessage);
                        setErrors({ credentials: errorMessage });
                    }
                } catch (err) {
                    console.error("Network error or fetch threw an exception:", err);
                    setErrors({ network: "Unable to connect. Try again later." });
                }

            } else if (activeTab === "reset") {
                // ... (Your existing reset password logic) ...
                if (resetStep === "request") {
                    try {
                        const response = await fetch(apiUrl+"/forgot-password", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                email,
                                recaptcha_token: token
                            })
                        });

                        if (!response.ok) {
                            // Check if data is available for specific messages
                            const errorData = await response.json().catch(() => ({}));
                            setErrors({email: errorData.message || "Something went wrong"});
                            console.error("Failed to send password reset link:", response.status, errorData);
                            return;
                        }

                        data = await response.json();

                        if (data.success) {
                            Swal.fire('Reset Request accepted', 'Check your email for the reset code.', 'success');
                            setResetStep("verify");
                        } else {
                            setErrors({email: data.message || "Something went wrong"});
                            console.error("Error response:", data);
                        }
                    } catch (err) {
                        console.error("Request failed:", err);
                        setErrors({email: "Failed to send reset request"});
                        return;
                    }
                } else {
                    if (password !== passwordConfirm) {
                        setErrors({passwordConfirm: "Passwords do not match"});
                        return;
                    }

                    // STEP 2: Submit code + new password
                    try {
                        const response = await fetch(apiUrl+"/update-password", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                email,
                                verification_code: verificationCode,
                                password,
                                password_confirmation: passwordConfirm,
                            }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            setErrors({credentials: errorData.message || "Password reset failed. Please try again."});
                            console.error("Password reset error:", response.status, errorData);
                            return;
                        }

                        data = await response.json();

                        if (data.success) {
                            Swal.fire('Password reset successful', 'Your password has been reset.', 'success');
                            setActiveTab("signin");
                            setResetStep("request");
                            setEmail("");
                            setPassword("");
                            setPasswordConfirm("");
                            setVerificationCode("");
                        } else {
                            setErrors({credentials: data.message || "Password reset failed. Please try again."});
                            console.error("Password reset error:", data);
                        }
                    } catch (err) {
                        console.error("Request failed:", err);
                        setErrors({credentials: "Failed to reset password"});
                    }
                }
                return; // Ensure return after reset logic
            } else { // activeTab === "signup"
                console.log("Signing Up:", { name, nickname, email, password, languageLevel, pref_receive_newsletter, pref_receive_prompts });

                response = await fetch(apiUrl + "/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name,
                        nickname: nickname,
                        email: email,
                        password: password,
                        passwordConfirm: passwordConfirm,
                        language_level: languageLevel, // Ensure this is the correct value (integer)
                        pref_receive_newsletter: pref_receive_newsletter, // Send as boolean
                        pref_receive_prompts: pref_receive_prompts,       // Send as boolean
                        recaptcha_token: token
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        localStorage.setItem('playerId', data.user.id);
                        localStorage.setItem('playerName', data.user.nickname);
                        localStorage.setItem('playerPrefReceiveNewsletter', data.user.pref_receive_newsletter ? '1' : '0');
                        localStorage.setItem('playerPrefReceivePrompts', data.user.pref_receive_prompts ? '1' : '0');

                        onSignupSuccess(data.user.id);
                        onLoginSuccess(data.user);

                        console.log("Registered:", data);
                        // No need to setPassword here, handled by useEffect on tab switch
                        // setActiveTab("signin"); // This will happen via onLoginSuccess leading to route change
                    } else {
                        setErrors(data.errors || { credentials: data.message || "The registration failed. Please try again." });
                        console.error("Registration error (backend):", response.status, data);
                    }
                } else {
                    try {
                        const errorData = await response.json();
                        setErrors(errorData.errors || { credentials: errorData.message || "The registration failed. Server error." });
                        console.error("Registration failed (non-2xx):", response.status, errorData);
                    } catch (jsonErr) {
                        console.error("Registration failed and non-JSON response:", response.status, jsonErr);
                        setErrors({ credentials: "The registration failed. Server error." });
                    }
                }
            }
        } catch (err) {
            console.error("Error in handleSubmit", err);
            setErrors((prev) => ({
                ...prev,
                credentials: err?.message || "An unexpected error occurred.",
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
                    Login
                </button>
                <button className={activeTab === "signup" ? "active key special" : "key special"}
                        onClick={() => setActiveTab("signup")}>
                    Register
                </button>
            </div>

            {/* Auth Forms */}
            <form onSubmit={handleSubmit}>

                <GoogleLoginButton onLogin={handleSocialLogin}/>
                <p>OR</p>

                {activeTab === "signup" && (
                    // Group name and nickname for responsive layout
                    <div className="form-field-group signup">
                        <label>
                            <span>Name (Your Full Name)</span>
                            <input
                                type="text"
                                className={`${errors.name ? "error" : ""}`}
                                value={name}
                                placeholder="Your full name"
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </label>

                        <label>
                            <span>Nickname (your username)</span>
                            <input
                                type="text"
                                className={`${errors.nickname ? "error" : ""}`}
                                value={nickname}
                                placeholder="Unique nickname"
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
                                <span>E-mail</span>
                                <input
                                    type="email"
                                    className={`${errors.email ? "error" : ""}`}
                                    value={email}
                                    placeholder="E-Mail"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </label>
                            <label>
                                <span>Password</span>
                                <input
                                    type="password"
                                    className={`${errors.password ? "error" : ""}`}
                                    value={password}
                                    placeholder="Password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </label>
                    </div>
                )}
                {/* Place credentials error outside the group if it applies to both email/password */}
                {errors.credentials && <span className="error-message">{errors.credentials}</span>}

                {(activeTab === "signup") && (
                    // Group email and password for responsive layout
                    <>
                        <div className="form-field-group signup">
                            <label>
                                <span>E-mail</span>
                                <input
                                    type="email"
                                    className={`${errors.email ? "error" : ""}`}
                                    value={email}
                                    placeholder="E-Mail"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </label>
                        </div>
                        <div className="form-field-group signup">
                            <label>
                                <span>Password</span>
                                <input
                                    type="password"
                                    className={`${errors.password ? "error" : ""}`}
                                    value={password}
                                    placeholder="Password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </label>

                            <label>
                                    <span>Password confirmation</span>
                                    <input
                                        type="password"
                                        className={`${errors.passwordConfirm ? "error" : ""}`}
                                        value={passwordConfirm}
                                        placeholder="Confirm password"
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                    />
                                    {errors.passwordConfirm &&
                                        <span className="error-message">{errors.passwordConfirm}</span>}
                                </label>
                        </div>
                    </>
                )}

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
                            <h3>Communication preferences</h3>
                        </div>
                        <label class="choices">
                            <input
                                type="checkbox"
                                checked={pref_receive_newsletter}
                                onChange={handleCheckboxChange(setPrefReceiveNewsletter)}
                                required
                            />
                            Would you like to receive the latest news about Drubble and are you happy to receive
                            occasional email newsletters?
                        </label>
                        {errors.pref_receive_newsletter &&
                            <span className="error-message">{errors.pref_receive_newsletter}</span>}

                        <label class="choices">
                            <input
                                type="checkbox"
                                checked={pref_receive_prompts}
                                onChange={handleCheckboxChange(setPrefReceivePrompts)}
                            />
                            Would you like to receive tips and reminders to play Drubble?
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
                        {activeTab === "signin" ? "Login" : "Register"}
                    </button>
                )}

                {(activeTab === "signin" &&
                    <div style={{marginTop: "1rem"}}>
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
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}

                {activeTab === "reset" && resetStep === "request" && (
                    <>
                        <div>
                            <h3>Reset Password</h3>
                            <p>Enter your email address here, if an account exists for your email there will be a
                                verification code sent to your email address.</p>
                        </div>
                        <label>
                            <span>E-Mail</span>
                            <input
                                type="email"
                                className={`${errors.email ? "error" : ""}`}
                                value={email}
                                placeholder="Your account e-mail address"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </label>
                        {errors.credentials && <span className="error-message">{errors.credentials}</span>}

                        <button type="submit" className="submit" disabled={!email}>Send Reset Code</button>
                    </>
                )}

                {activeTab === "reset" && resetStep === "verify" && (
                    // Group for reset password fields (email is first, then verification/new password)
                    <div className="form-field-group">
                        <label>
                            <span>Email</span>
                            <input
                                type="email"
                                className={`${errors.email ? "error" : ""}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </label>

                        <label>
                            <span>Verification Code</span>
                            <input
                                type="text"
                                className={`${errors.verification_code ? "error" : ""}`}
                                value={verificationCode}
                                placeholder="Enter the code from your email"
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                            {errors.verification_code &&
                                <span className="error-message">{errors.verification_code}</span>}
                        </label>

                        <label>
                            <span>New Password</span>
                            <input
                                type="password"
                                className={`${errors.password ? "error" : ""}`}
                                value={password}
                                placeholder="New Password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </label>

                        <label>
                            <span>Password confirmation</span>
                            <input
                                type="password"
                                className={`${errors.passwordConfirm ? "error" : ""}`}
                                value={passwordConfirm}
                                placeholder="Confirm password"
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
                    >Reset Password
                    </button>
                )}
            </form>
            <CookieSettingsButton/>
            <div>
                By registering or logging in to Drubble, you confirm that you have read and agree to our
                Privacy Policy and our Terms of Service.
            </div>
            <div><a href="/privacy-policy.html" target="_blank">Privacy Policy</a></div>
            <div><a href="/terms-of-service.html" target="_blank">terms of Service</a></div>

            {errors.recaptcha && <span className="error">{errors.recaptcha}</span>}
        </div>
    );
};

export default AuthTabs;