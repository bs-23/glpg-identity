import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MenuItem = ({ id, label, onClick, isSelected, toUrl }) =>
    <div id={id} className={`nav-item ${isSelected ? 'my-profile__menu selected' : 'my-profile__menu'}`} onClick={onClick} >
        <Link to={toUrl} className="nav-link border-top">{label}</Link>
    </div>

const Sidebar = ({ menuItems, idExtractor, header }) => {
    const location = useLocation();
    const [selectedMenuItemID, setSelectedMenuItemID] = useState(null);

    useEffect(() => {
        const currentPath = location.pathname;
        const selectedMenu = menuItems.find(item => item.toUrl === currentPath);
        if(selectedMenu) setSelectedMenuItemID(idExtractor(selectedMenu));
    }, [location]);

    return <aside className="my-2 border rounded my-profile__sidebar shadow-sm">
        <h4 className="py-2 px-3">{header}</h4>
        {menuItems && menuItems.map(item =>
            <MenuItem
                key={idExtractor(item)}
                id={idExtractor(item)}
                label={item.label}
                toUrl={item.toUrl}
                isSelected={idExtractor(item) === selectedMenuItemID}
            />)}
    </aside>
}

export default Sidebar;
