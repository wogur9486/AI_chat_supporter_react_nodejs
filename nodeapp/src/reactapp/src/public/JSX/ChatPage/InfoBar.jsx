import { useState } from 'react';
import '../../CSS/InfoBar.css';

export default function InfoBar({ roomName, onSearch }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchClick = () => {
        if (onSearch && searchQuery) {
            onSearch(searchQuery);
        }
    };

    return (
        <div className="InfoBar">
            <h3>{roomName}</h3>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search messages..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="barsearch" onClick={handleSearchClick}></div>
            </div>
        </div>
    );
}
