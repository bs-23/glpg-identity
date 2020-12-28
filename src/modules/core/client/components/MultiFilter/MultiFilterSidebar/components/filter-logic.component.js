import React, { useEffect } from 'react';

const style = {
    minHeight: '75px'
}

const FilterLogic = (props) => {
    const { className, filters, onLogicChange } = props;

    const handleClearLogic = () => {
        console.log('Clear Logic')
    }

    useEffect(() => {
        handleClearLogic();
    }, [props.clear])

    return <div style={style} className={className}></div>
}

export default FilterLogic;
