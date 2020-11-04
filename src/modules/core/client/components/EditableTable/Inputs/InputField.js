import React from 'react';
import fieldTypes from './fieldTypes';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import DateInput from './DateInput';
import EmailInput from './EmailInput';
import SelectContainer from './Container/SelectContainer';

const InputField = ({ type, ...props }) => {
    const { name: inputFieldType, options } = type || {};

    if(inputFieldType === fieldTypes.TEXT) return <TextInput {...props} />
    if(inputFieldType === fieldTypes.SELECT) return <SelectContainer {...props} options={options}>{(selectOptions) => <SelectInput options={selectOptions} {...props} />}</SelectContainer>
    if(inputFieldType === fieldTypes.DATE) return <DateInput {...props} />
    if(inputFieldType === fieldTypes.EMAIL) return <EmailInput {...props} />

    return <TextInput {...props} />
}

export default InputField;
