import React, { useState, useRef } from 'react';
import * as yup from 'yup';
import Row from './Row';
import { Formik, setIn, getIn } from 'formik';
import Header from './Header';
import { useEffect } from 'react';

yup.addMethod(yup.object, 'uniqueProperty', function (property, message) {
    return this.test('unique', message, function (value) {
        if (!value || !value[property]) {
            return true;
        }

        if (this.parent.filter(v => v !== value).some(v => v[property] === value[property])) {
            return this.createError({ path: `${this.path}.${property}` });
        }

        return true;
    });
});

const addValidationToSchema = (schema, columns) => {
    let modifiedSchema = schema;
    columns.map(col => {
        if(col.unique){
            modifiedSchema = modifiedSchema['uniqueProperty'](col.id, `${col.name} matches with another row.`)
        }
    })
    return modifiedSchema;
}

const EditableTable = ({ columns: rawColumns, rows, schema: rowSchema, children, onSubmit, onDirtyChange, sortOn, sortType, singleRowEditing, selectedRow, ...props }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [rawRows, setRawRows] = useState([]);
    const formikRef = useRef();
    const formikBag = formikRef.current;

    useEffect(() => {
        setRawRows(rows);
    }, [rows]);

    const rowSchemaWithOptionalValidation = rowSchema ? addValidationToSchema(rowSchema, rawColumns) : null;

    const tableSchema = rowSchema ? yup.object().shape({
        rows: yup.array().of(rowSchemaWithOptionalValidation)
    }) : null;

    const generateUpdateFinalizer = (values, formikProps) => (success, error) => {
        if(success === true){
            setRawRows(values.rows);

            formikProps.resetForm({
                values: values,
                status: { lastCommitedValues: { rows: values.rows }}
            });

            return;
        }

        if(Array.isArray(success)) {
            const updatedData = success;
            let newIntitialValue = formikBag.values;

            updatedData.forEach(({ rowIndex, property, value }) => {
                const inputName = `rows[${rowIndex}].${property}`;
                newIntitialValue = setIn(newIntitialValue, inputName, value);
            });

            setRawRows(newIntitialValue.rows);

            formikProps.resetForm({
                values: newIntitialValue,
                status: {}
            });
            return;
        }

        if(error){
            const numberOfRows = values.rows.length;
            const backendErrors = Array(numberOfRows).fill({});

            error.map(({ rowIndex, property, message }) => {
                const currentErrorObject = backendErrors[rowIndex];
                backendErrors[rowIndex] = { ...currentErrorObject, [property]: message };
            });

            formikProps.setStatus({ ...formikProps.status, backendErrors: { rows: backendErrors } });
        }
    }

    const handleCellSwitchToEdit = (rowIndex, columnIndex) => {
        setEditingCell({ rowIndex, columnIndex })
    }

    const handleCellBlur = (e, handleBlur) => {
        setEditingCell(null);

        if(formikBag) {
            const inputName = e.target.name;
            const value = e.target.value;
            const newLastCommitedValues = setIn(formikBag.status.lastCommitedValues, inputName, value);
            formikBag.setStatus({ ...formikBag.status, lastCommitedValues: newLastCommitedValues });
        }

        handleBlur(e);
    }

    const handleInputChange = (e, handleChange) => {
        handleChange(e);

        const inputName = e.target.name;

        if(formikBag.status && formikBag.status.backendErrors) {
            const newBackEndError = setIn(formikBag.status.backendErrors, inputName, null);
            formikBag.setStatus({ ...formikBag.status, backendErrors: newBackEndError });
        }
    }

    const handleSubmit = (values, formikProps) => {
        const done = generateUpdateFinalizer(values, formikProps);

        if(onSubmit) {
            onSubmit({
                rows: values.rows,
                updatedRows: getUpdatedRows(),
                getUpdatedCells,
                formikProps
            }, done);
        }
    }

    const handleInputKeyDown = async (e, handleBlur) => {
        e.persist();

        if(e.key === 'Escape') {
            const inputName = e.target.name;
            if(formikBag.status.lastCommitedValues) {
                const lastCommitedValue = getIn(formikBag.status.lastCommitedValues, inputName);
                await formikBag.setFieldValue(inputName, lastCommitedValue, true);
            }
            handleBlur(e);
        }

        if(e.key === 'Enter') {
            handleBlur(e);
        }
    }

    const getUpdatedRows = () => {
        if(!formikBag) return [];

        const initialValues = formikBag.initialValues.rows;
        const currentValues = formikBag.values.rows;

        const updatedRows = initialValues.reduce((acc, initRow, idx) => {
            const currRow = currentValues[idx];
            let hasRowChanged = false;

            Object.keys(initRow).forEach(key => {
                if (initRow[key] !== currRow[key]) hasRowChanged = true;
            });

            currRow._rowIndex = idx;

            if(hasRowChanged) acc.push(currRow);

            return acc;
        }, []);

        return updatedRows;
    }

    const getUpdatedCells = (mustIncludeProperties = ["id"]) => {
        if(!formikBag) return [];

        const initialValues = formikBag.initialValues.rows;
        const currentValues = formikBag.values.rows;

        const updatedCellsOfRows = initialValues.reduce((acc, initRow, idx) => {
            const currRow = currentValues[idx];
            const updatedCells = {};
            let hasRowChanged = false;

            Object.keys(currRow).forEach(key => {
                if (initRow[key] !== currRow[key]) {
                    updatedCells[key] = currRow[key];
                    hasRowChanged = true;
                    return;
                }
                if(mustIncludeProperties.includes(key)) updatedCells[key] = currRow[key];
            });

            updatedCells._rowIndex = idx;

            if(hasRowChanged) acc.push(updatedCells);

            return acc;
        }, []);

        return updatedCellsOfRows;
    }

    return <div className="shadow-sm bg-white table-responsive cdp-table__responsive-wrapper">
        <Formik
            initialValues={{ rows: rawRows }}
            initialStatus={{ lastCommitedValues: { rows: rawRows } }}
            validationSchema={tableSchema}
            onSubmit={handleSubmit}
            innerRef={formikRef}
            {...props}
        >
            {(formikProps) => {
                const editableTableProps = {
                    getUpdatedRows,
                    getUpdatedCells,
                    ...formikProps
                }

                const dirty = formikProps.dirty;

                if(onDirtyChange) setTimeout(() => {
                    onDirtyChange(dirty);
                }, 0);

                return <>
                    <table className="table table-hover table-sm mb-0 cdp-table cdp-table-sm cdp-table-inline-editing  cdp-table__responsive">
                        <Header columns={rawColumns} dirty={dirty} sortOn={sortOn} sortType={sortType} />
                        <tbody className="cdp-table__body bg-white">
                            {formikProps.values.rows.map((row, index) =>
                                <Row
                                    key={index}
                                    row={row}
                                    columns={rawColumns}
                                    rowIndex={index}
                                    editingCell={editingCell}
                                    formikProps={formikProps}
                                    singleRowEditing={singleRowEditing}
                                    onCellBlur={handleCellBlur}
                                    onInputChange={handleInputChange}
                                    onCellSwitchToEdit={handleCellSwitchToEdit}
                                    onInputKeyDown={handleInputKeyDown}
                                    editableTableProps={{ getUpdatedRows, getUpdatedCells, generateUpdateFinalizer }}
                                    selectedRow={selectedRow}
                                />
                            )}
                        </tbody>
                    </table>
                    {children && children(editableTableProps)}
                </>
            }}
        </Formik>
    </div>
}

export default EditableTable;
