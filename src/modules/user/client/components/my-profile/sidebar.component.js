import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MenuItem = ({ id, label, isSelected, toUrl }) =>
    <div id={id} className={`nav-item font-weight-bold ${isSelected ? 'bg-info' : 'bg-light'}`} >
        <Link to={toUrl} className="nav-link">{label}</Link>
    </div>

const Sidebar = ({ menuItems, idExtractor, header }) => {
    const location = useLocation();
    const [selectedMenuItemID, setSelectedMenuItemID] = useState(null);

    useEffect(() => {
        const currentPath = location.pathname;
        const selectedMenu = menuItems.find(item => item.toUrl === currentPath);
        if(selectedMenu) setSelectedMenuItemID(idExtractor(selectedMenu));
    }, [location]);

    return <aside className="my-2">
            <h4 className="pb-2">{header}</h4>
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
