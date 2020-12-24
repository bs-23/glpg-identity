import React, { useEffect, useState } from 'react';

import { Button } from '../common';
import { Filter } from './components';

const style = {
    container: {
        position: 'absolute',
        right: '20%',
        background: 'white',
        border: '1px solid darkgreen',
        borderRadius: '5px',
        width: '20%'
    }
}

const filterOptions = [
    {
        "fieldName": "first_name",
        "valueType": "text",
        "displayText": "First Name",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "contains",
                "displayText": "Contains"
            },
            {
                "key": "starts-with",
                "displayText": "Starts With"
            }
        ]
    },
    {
        "fieldName": "last_name",
        "valueType": "text",
        "displayText": "Last Name",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "contains",
                "displayText": "Contains"
            },
            {
                "key": "starts-with",
                "displayText": "Starts With"
            }
        ]
    },
    {
        "fieldName": "email",
        "valueType": "text",
        "displayText": "Email",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "contains",
                "displayText": "Contains"
            },
            {
                "key": "starts-with",
                "displayText": "Starts With"
            }
        ]
    },
    {
        "fieldName": "countries",
        "valueType": "select",
        "displayText": "Country",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            }
        ],
        "options": [
            {
                "key": "BE",
                "displayText": "Belgium"
            },
            {
                "key": "FR",
                "displayText": "France"
            },
            {
                "key": "DE",
                "displayText": "Germany"
            },
            {
                "key": "IT",
                "displayText": "Italy"
            },
            {
                "key": "NL",
                "displayText": "Netherlands"
            },
            {
                "key": "ES",
                "displayText": "Spain"
            },
            {
                "key": "GB",
                "displayText": "United Kingdom"
            }
        ]
    },
    {
        "fieldName": "created_at",
        "valueType": "date",
        "displayText": "Creation Date",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "less-than",
                "displayText": "Before"
            },
            {
                "key": "greater-than",
                "displayText": "After"
            }
        ]
    },
    {
        "fieldName": "expiry_date",
        "valueType": "date",
        "displayText": "Expiry Date",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "less-than",
                "displayText": "Before"
            },
            {
                "key": "greater-than",
                "displayText": "After"
            }
        ]
    },
    {
        "fieldName": "created_by",
        "valueType": "text",
        "displayText": "Created By",
        "operators": [
            {
                "key": "equal",
                "displayText": "Equals to"
            },
            {
                "key": "contains",
                "displayText": "Contains"
            },
            {
                "key": "starts-with",
                "displayText": "Starts With"
            }
        ]
    }
];

const AddFilter = (props) => {
    const { onDone, onAddMoreFilter, filters: existingFilters } = props;
    const [filters, setFilters] = useState([]);

    const handleAddMoreFilter = () => {
        const emptyFilter = {
            name: "Filter " + (filters.length + 1),
            field: '',
            operator: '',
            value: ''
        };
        setFilters([...filters, emptyFilter]);
    }

    const handleDone = (e) => {
        console.log('Done ', filters)
        onDone && onDone(filters);
    }

    const handleChange = (e, index) => {
        const targetName = e.target.name;
        const targetValue = e.target.value;
        const updatedFilters = [...filters];
        updatedFilters[index][targetName] = targetValue;
        setFilters(updatedFilters);
    }

    useEffect(() => {
        setFilters(existingFilters);
    }, []);

    console.log("Filters: ", filters);

    return <div style={style.container}>
        <div className="bg-light p-2">Add Filter</div>
        {
            filters && filters.map((filter, index) =>
                <Filter
                    key={filter.name}
                    name={filter.name}
                    index={index}
                    fieldValue={filter.field}
                    operatorValue={filter.operator}
                    value={filter.value}
                    filterOptions={filterOptions}
                    onChange={handleChange}
                />
            )
        }
        <Button className="btn cdp-btn-outline-primary my-2 btn-block" label="+ add more filter" onClick={handleAddMoreFilter} />
        <Button className="btn cdp-btn-secondary btn-block text-white" label="Done" onClick={handleDone} />
        {/* <div className="p-2">
            <Filter name="Filter 01" operators={operators} operatorValue={'equals'} />
            <Filter name="Filter 02" operators={operators} operatorValue={'greater-than'} />
        </div> */}
    </div>
}

export default AddFilter;
