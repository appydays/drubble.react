import { FaUser, FaDoorOpen } from 'react-icons/fa';

const AccountIcon = ({ isLoggedIn }) => {
    return (
        <div>
            {isLoggedIn ? (
                <FaDoorOpen />  // Filled-in person icon for logged-in user
            ) : (
                <FaUser />     // Outline person icon for logged-out user
            )}
        </div>
    );
};

export default AccountIcon;