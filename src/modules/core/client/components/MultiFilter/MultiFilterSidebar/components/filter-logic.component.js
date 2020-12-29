import React, { useEffect } from 'react';
import { Field } from 'formik';

const style = {
    minHeight: '75px'
}

const FilterLogic = (props) => {
    const { className, logic, filters, onLogicChange } = props;

    // const handleClearLogic = () => {
    //     console.log('Clear Logic')
    // }

    // useEffect(() => {
    //     handleClearLogic();
    // }, [props.clear])

    return <Field
            as="textarea"
            name="logic"
            style={style}
            className={className}
            value={logic}
            // onChange={onLogicChange}
        />
}

export default FilterLogic;
