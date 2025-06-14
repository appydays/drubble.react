// ContrastToggle.js
import { useTheme } from '../../ThemeContext';
import '../css/ContrastToggle.css'; // if separate styles

function ContrastToggle() {
    const { contrast, toggleContrast } = useTheme();
    const isHighContrast = contrast === 'high';

    return (
        <label className="contrast-switch">
            <input
                type="checkbox"
                checked={isHighContrast}
                onChange={toggleContrast}
            />
            <span className="slider"></span>
        </label>
    );
}

export default ContrastToggle;