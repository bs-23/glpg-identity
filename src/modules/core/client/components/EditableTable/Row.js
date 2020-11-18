import React from 'react';
import Cell from './Cell';
import InputField from './Inputs/InputField';
import { Field, getIn } from 'formik';

const cellInvalidStyle = {
    border: '1px solid rgba(255, 0, 0, 0.50)'
}

const cellChangedStyle = {
    background: '#F8FFB5'
}

const ErrorMessage = ({ name }) => (
    <Field name={name} >
        {({ form }) => {
            const error = getIn(form.errors, name);
            const touch = getIn(form.touched, name);
            return touch && error ? error : null;
        }}
    </Field>
);

const BackendErrorMessage = ({ name }) => (
    <Field name={name} >
        {({ form }) => {
            const backendErrors = (form.status|| {})['backendErrors'];
            const error = getIn(backendErrors, name);
            return error ? error : null;
        }}
    </Field>
)

const Row = ({ rowIndex, columns, row, onCellSwitchToEdit, onCellBlur, editingCell, formikProps, onInputChange, onInputKeyDown }) => {
    const { handleBlur, handleChange, initialValues, values } = formikProps;

    const isCellInvalid = (name) => {
        const feError = getIn(formikProps.errors, name);
        const touch = getIn(formikProps.touched, name);
        const hasFrontEndError = touch && feError ? true : false;

        const backendErrors = (formikProps.status|| {})['backendErrors'];
        const beError = getIn(backendErrors, name);
        const hasBackEndError = beError ? true : false;

        return hasFrontEndError || hasBackEndError;
    }

    const hasCellChanged = name => {
        const initVal = getIn(initialValues, name);
        const currVal = getIn(values, name);
        return initVal !== currVal;
    }

    const getCellStyle = (inputName) => {
        return {
            ...(hasCellChanged(inputName) && cellChangedStyle),
            ...(isCellInvalid(inputName) && cellInvalidStyle)
        }
    }

    const renderRow = () => columns.map((column, colIndex) => {
        const { fieldType, customizeCellContent, onChangeAction, customCell: CustomCell, key } = column;

        const currentCellValue = row[column.id];
        const inputName = `rows[${rowIndex}].${column.id}`;

        const customCellValue = customizeCellContent
            ? customizeCellContent(currentCellValue, row, formikProps, callbackProps)
            : null;

        const customOrCurrentCellValue = customizeCellContent
            ? customCellValue
            : currentCellValue;

        const callbackProps = {
            rowIndex,
            columnID: column.id
        }

        const handleOnBlur = e => {
            onChangeAction && onChangeAction(currentCellValue, row, formikProps, callbackProps);
            onCellBlur(e, handleBlur);
        };

        const handleInputKeyDown = e => onInputKeyDown(e, handleOnBlur);

        return <React.Fragment key={key || inputName}>
            <td
                style={getCellStyle(inputName)}
                className="inline-editing__td"
            >
                {editingCell && editingCell.rowIndex === rowIndex && editingCell.columnIndex === colIndex
                    ? <div className="inline-editing__field-wrap">
                        <InputField
                            name={`rows[${rowIndex}].${column.id}`}
                            type={fieldType}
                            value={currentCellValue}
                            row={row}
                            onBlur={handleOnBlur}
                            onChange={e => onInputChange(e, handleChange)}
                            onKeyDown={handleInputKeyDown}
                        />
                    </div>
                    : CustomCell
                        ? <CustomCell
                            value={customOrCurrentCellValue}
                            editable={column.editable}
                            onSwitchToEditMode={e => onCellSwitchToEdit(rowIndex, colIndex, e)}
                            row={row}
                            rowIndex={rowIndex}
                            columnID={column.id}
                            formikProps={formikProps}
                        />
                        : <Cell
                            value={customOrCurrentCellValue}
                            editable={column.editable}
                            onSwitchToEditMode={e => onCellSwitchToEdit(rowIndex, colIndex, e)}
                            row={row}
                        />
                }
                <div className="invalid-feedback">
                    <ErrorMessage name={`rows[${rowIndex}].${column.id}`}/>
                </div>
                <div className="invalid-feedback">
                    <BackendErrorMessage name={`rows[${rowIndex}].${column.id}`}/>
                </div>
            </td>
        </React.Fragment>
    })

    return columns && row && <tr>
        {renderRow()}
    </tr>;
}

export default Row;
