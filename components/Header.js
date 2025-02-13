import React from 'react';
import '../styles/Header.css'; 

const Header = () => {
    return (
        <header className="header">
            <img src="/logo.jpg" className="logo" />
            <input type="text" placeholder="search..." className="search-bar" />
            <div className="profile">
                <button >
                    <img src="/profile.jpg"></img>
                </button>
            </div>
        </header>
    );
};

export default Header;