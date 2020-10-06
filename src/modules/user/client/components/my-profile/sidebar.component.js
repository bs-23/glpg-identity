import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MenuItem = ({ id, label, onClick, isSelected, toUrl }) =>
    <div id={id} className={`nav-item font-weight-bold ${isSelected ? 'bg-info' : 'bg-light'}`} onClick={onClick} >
        <Link to={toUrl} className="nav-link">{label}</Link>
    </div>

const Sidebar = ({ menuItems, idExtractor, header }) => {
    const [selectedMenuItemID, setSelectedMenuItemID] = useState(null);

    const onMenuItemSelect = (event, onClick) => {
        const allMenuItemIDs = menuItems.map(item => idExtractor(item));
        let currentElement = event.target;

        while(currentElement.parentNode && !allMenuItemIDs.includes(currentElement.id)){
            currentElement = currentElement.parentNode;
        }

        setSelectedMenuItemID(currentElement.id);
        onClick && onClick();
    }

    useEffect(() => {
        setSelectedMenuItemID(idExtractor(menuItems[0]));
    }, []);

    return <aside className="my-2">
            <h4 className="pb-2">{header}</h4>
        {menuItems && menuItems.map(item =>
            <MenuItem
                key={idExtractor(item)}
                id={idExtractor(item)}
                label={item.label}
                toUrl={item.toUrl}
                isSelected={idExtractor(item) === selectedMenuItemID}
                onClick={e => onMenuItemSelect(e, item.onClick)}
            />)}
    </aside>
}

export default Sidebar;
