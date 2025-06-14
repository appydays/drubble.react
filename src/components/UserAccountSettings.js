import { useState } from "react";
import Modal from "./Modal";
import LogoutIcon from "./atoms/LogoutIcon";

const tabs = [
    { key: "profile", label: "Profile" },
    { key: "privacy", label: "Privacy" },
    { key: "logout", label: "Logout" },
];

function UserAccountSettings({ ...props }) {
    const [activeTab, setActiveTab] = useState("profile");

    return (
            <div className="p-4 w-full max-w-xl">
                <div className="flex border-b mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 border-b-2 ${
                                activeTab === tab.key ? "border-blue-600 font-semibold" : "border-transparent text-gray-500"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="mt-4">
                    {activeTab === "profile" && (
                        <ProfileTab {...props} />
                    )}
                    {activeTab === "privacy" && (
                        <PrivacyTab {...props} />
                    )}
                    {activeTab === "logout" && (
                        <div className="text-center">
                            <p className="mb-4">Would you like to log out of your account?</p>
                            <button
                                onClick={props.handleLogout}
                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                <LogoutIcon className="mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
    );
}

// Subcomponents for clean separation
function ProfileTab({ nickname, setNickname, playerPrefReceiveNewsletter, setPlayerPrefReceiveNewsletter, playerPrefReceivePrompts, setPlayerPrefReceivePrompts }) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block font-medium">Nickname</label>
                <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={playerPrefReceiveNewsletter}
                    onChange={() => setPlayerPrefReceiveNewsletter(!playerPrefReceiveNewsletter)}
                    className="mr-2"
                />
                <label>Receive Newsletter</label>
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={playerPrefReceivePrompts}
                    onChange={() => setPlayerPrefReceivePrompts(!playerPrefReceivePrompts)}
                    className="mr-2"
                />
                <label>Receive Prompts</label>
            </div>
        </div>
    );
}

function PrivacyTab({ handleDataRequest, handleDeleteAccount, isLoading }) {
    return (
        <div className="space-y-4">
            <button
                onClick={handleDataRequest}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
                Request My Data
            </button>
            <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
                Delete My Account
            </button>
        </div>
    );
}

export default UserAccountSettings;