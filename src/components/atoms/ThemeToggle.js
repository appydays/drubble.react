// ThemeToggle.js
import { useTheme } from '../../ThemeContext';
import '../css/ThemeToggle.css';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <label className="theme-switch">
            <input
                type="checkbox"
                checked={isDark}
                onChange={toggleTheme}
            />
            <span className="slider"></span>
        </label>
    );
}

export default ThemeToggle;