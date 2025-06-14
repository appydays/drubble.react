import React from 'react';

function Modal({ className, isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className='modal' style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div className={`modal-container ${className}`} >
                <button className="close" onClick={onClose} style={{float: 'right'}}>X</button>
                {children}
            </div>
        </div>

    );
}

export default Modal;

