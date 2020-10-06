import React, { useState, useEffect } from 'react';

const MenuItem = ({ id, label, onClick, isSelected }) =>
    <div id={id} className={`nav-item font-weight-bold ${isSelected ? 'bg-info' : 'bg-light'}`} onClick={onClick} >
        <div className="nav-link">{label}</div>
    </div>

const Sidebar = ({ menuItems, idExtractor }) => {
    const [selectedMenuItemID, setSelectedMenuItemID] = useState(null);

    const onMenuItemSelect = (event, onClick) => {
        const menuItemID = event.target.id;
        const menuItems = menuItems.map(item => idExtractor(item));

        // let currentElement = event.target;

        // while(currentElement.parentNode && !menuItems.includes(currentElement.id)){
        //     currentElement = currentElement.parentNode;
        // }

        setSelectedMenuItemID(menuItemID);
        onClick();
    }

    useEffect(() => {
        setSelectedMenuItemID(idExtractor(menuItems[0]));
    }, []);

    return <aside className="my-2">
        {menuItems && menuItems.map(item =>
            <MenuItem
                key={idExtractor(item)}
                id={idExtractor(item)}
                label={item.label}
                onClick={e => onMenuItemSelect(e, item.onClick)}
                isSelected={idExtractor(item) === selectedMenuItemID}
            />)}
    </aside>
}

export default Sidebar;
