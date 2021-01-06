import React, { useEffect, useState } from 'react';

const FilterLogic = (props) => {
    const {
        className,
        logic,
        onLogicChange
    } = props;

    const [filterNodes, setFilterNodes] = useState([]);
    const [logicNodes, setLogicNodes] = useState([]);

    useEffect(() => {
        const updatedNodes = logic.split(' ');
        const updatedFilterNodes = [];
        const updatedLogicNodes = [];

        updatedNodes.forEach((e, idx) => {
            if (idx % 2 === 0) updatedFilterNodes.push(e);
            else updatedLogicNodes.push(e);
        });

        setFilterNodes(updatedFilterNodes);
        setLogicNodes(updatedLogicNodes);
    }, [logic]);

    const handleLogicChange = (e) => {
        const logicNodeIndex = e.target.name;
        const logicNodeValue = e.target.value;

        const updatedLogicNodes = [...logicNodes];
        updatedLogicNodes[logicNodeIndex] = logicNodeValue;

        setLogicNodes(updatedLogicNodes);

        const logic = filterNodes.map((f, ind) => {
            if (ind === filterNodes.length - 1) return f;
            return f + " " + updatedLogicNodes[ind];
        }).join(' ');

        onLogicChange(logic);
    }

    return <div className="d-flex flex-wrap align-items-center shadow-sm border p-2 rounded small filter__logic-wrap">
        {filterNodes.map((e, ind) => {
            return <div key={ind} className="d-flex align-items-center mb-2 filter__logic-item">
                <span className="mr-1">Filter {e}</span>
                {ind < filterNodes.length-1 &&
                    <select className="mx-1 form-control form-control-sm d-inline-block w-auto px-1 filter__logic-field" name={ind} value={logicNodes[ind]} onChange={handleLogicChange}>
                        <option value='null'></option>
                        <option value='and'>AND</option>
                        <option value='or'>OR</option>
                    </select>
                }
            </div>
        })}
    </div>
}

export default FilterLogic;
