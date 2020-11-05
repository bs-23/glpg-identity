import React, { useState } from 'react';
import DefaultCell from './Cell';
import InputField from './Inputs/InputField';
import { Field, getIn } from 'formik';

const cellInvalidStyle = {
    border: '1px solid rgba(255, 0, 0, 0.50)'
}

const cellChangedStyle = {
    background: 'lightyellow'
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

const Row = ({ rowIndex, columns, row, onCellSwitchToEdit, onCellBlur, editingCell, formikProps, onInputChange }) => {

    const { handleBlur, handleChange, initialValues, values } = formikProps;

    const isCellInvalid = (name) => {
        const error = getIn(formikProps.errors, name);
        const touch = getIn(formikProps.touched, name);
        return touch && error ? true : false;
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
        const { customizeCellContent, beforeChangeAction, customCell: CustomCell, key } = column;

        const currentCellValue = row[column.id];
        const inputName = `rows[${rowIndex}].${column.id}`;

        const customCellValue = customizeCellContent
            ? customizeCellContent(row[column.id], row)
            : null;

        const handleOnBlur = e => {
            const done = () => onCellBlur(e, handleBlur);
            beforeChangeAction ? beforeChangeAction(row, done) : onCellBlur(e, handleBlur);
        };

        const Cell = CustomCell ? CustomCell : DefaultCell;

        return <React.Fragment key={key || inputName}>
            <td
                style={getCellStyle(inputName)}
                className="inline-editing__td"
            >
                {editingCell && editingCell.rowIndex === rowIndex && editingCell.columnIndex === colIndex
                    ? <InputField
                        name={`rows[${rowIndex}].${column.id}`}
                        type={column.fieldType}
                        onBlur={handleOnBlur}
                        onChange={e => onInputChange(e, handleChange)}
                        value={currentCellValue}
                        row={row}
                    />
                    : <Cell
                        value={customCellValue || currentCellValue}
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
