import React, { useEffect, useState } from 'react';

const style = {
    minHeight: '75px'
}

const FilterLogic = (props) => {
    const {
        className,
        logic,
        numberOfFilters,
        onLogicChange
    } = props;

    const [logicNodes, setLogicNodes] = useState([]);

    const getLogicTextFromLogicNodes = (nodes) => {
        let logic = '';
        let i;
        for(i = 1; i <= nodes.length; ++i){
            logic = logic + String(i) + ' ' + nodes[i-1] + ' ';
        }
        logic = logic + String(i);
        return logic;
    }

    const handleLogicChange = (e) => {
        const logicNodeIndex = e.target.name;
        const logicNodeValue = e.target.value;

        const updatedLogicNodes = [...logicNodes];
        updatedLogicNodes[logicNodeIndex] = logicNodeValue;

        setLogicNodes(updatedLogicNodes);

        const logic = getLogicTextFromLogicNodes(updatedLogicNodes);

        console.log(logic);

        onLogicChange(logic);
    }

    const setLogicNodesFromLogic = (logic) => {
        const nodes = (logic || '').trim().split(' ');
        const defaultLogicNodes = Array(numberOfFilters-1 || 0).fill('and');
        const logicNodesFromLogicText = nodes.filter((e, ind) => ind%2 === 1);

        logicNodesFromLogicText.forEach((ln, ind) => {
            defaultLogicNodes[ind] = ln;
        })

        setLogicNodes(defaultLogicNodes);

        const logicText = getLogicTextFromLogicNodes(defaultLogicNodes);

        onLogicChange(logicText);
    }

    useEffect(() => {
        if(logic) setLogicNodesFromLogic(logic);
        else setLogicNodes(Array(numberOfFilters-1 || 0).fill('and'));
    }, [numberOfFilters, logic]);

    return <div style={style} className={className ? className : "border border-secondary"}>
        {Array(numberOfFilters || 0).fill(0).map((e, ind) => {
            return <React.Fragment key={ind}>
                <span className="mx-1">Filter {ind}</span>
                {ind < numberOfFilters-1 &&
                    <select className="mx-1" name={ind} value={logicNodes[ind]} onChange={handleLogicChange}>
                        <option value='and'>AND</option>
                        <option value='or'>OR</option>
                    </select>
                }
            </React.Fragment>
        })}
    </div>
}

export default FilterLogic;
