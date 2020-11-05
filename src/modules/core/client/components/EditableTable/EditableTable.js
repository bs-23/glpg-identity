import React, { useState, useRef } from 'react';
import * as yup from 'yup';
import Row from './Row';
import { Formik, setIn } from 'formik';
import Header from './Header';
import { useEffect } from 'react';

const EditableTable = ({ columns: rawColumns, rows, schema: rowSchema, children, onSubmit, onDirtyChange, ...props }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [rawRows, setRawRows] = useState([]);
    const formikRef = useRef();
    const formikBag = formikRef.current;

    useEffect(() => {
        setRawRows(rows);
    }, [rows]);

    const tableSchema = yup.object().shape({
        rows: yup.array().of(rowSchema)
    });

    const handleCellSwitchToEdit = (rowIndex, columnIndex) => {
        setEditingCell({ rowIndex, columnIndex })
    }

    const handleCellBlur = (e, handleBlur) => {
        setEditingCell(null);
        handleBlur(e);
    }

    const handleInputChange = (e, handleChange) => {
        handleChange(e);

        const inputName = e.target.name;

        if(formikBag.status && formikBag.status.backendErrors) {
            const newBackEndError = setIn(formikBag.status.backendErrors, inputName, null);
            formikBag.setStatus({ backendErrors: newBackEndError });
        }
    }

    const handleSubmit = (values, formikProps) => {
        const done = (success, error) => {
            if(success === true){
                setRawRows(values.rows);

                formikProps.resetForm({
                    values: values,
                    status: {}
                });

                return;
            }

            if(Array.isArray(success)) {
                const updatedData = success;
                let newIntitialValue = formikBag.initialValues;

                updatedData.map(({ rowIndex, property, value }) => {
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

                error.map(({ rowIndex, property, message}) => {
                    const currentErrorObject = backendErrors[rowIndex];
                    backendErrors[rowIndex] = { ...currentErrorObject, [property]: message };
                });

                formikProps.setStatus({ backendErrors: { rows: backendErrors } });
            }
        }

        if(onSubmit) {
            onSubmit({
                rows: values.rows,
                updatedRows: getUpdatedRows(),
                formikProps
            }, done);
        };
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

    // useEffect(() => {
    //     if(formikBag) {
    //         if(onDirtyChange) onDirtyChange(formikBag.dirty);
    //     }
    // })

    return <div className="shadow-sm bg-white table-responsive">
        <Formik
            initialValues={{ rows: rawRows }}
            validationSchema={tableSchema}
            onSubmit={handleSubmit}
            innerRef={formikRef}
            {...props}
        >
            {(formikProps) => {
                const editableTableProps = {
                    getUpdatedRows,
                    ...formikProps
                }
                const dirty = formikProps.dirty;

                if(onDirtyChange) setTimeout(() => {
                    onDirtyChange(dirty);
                }, 0);

                return <>
                    <table className="table table-hover table-sm mb-0 cdp-table cdp-table-sm mt-3 cdp-table-inline-editing">
                        <Header columns={rawColumns} dirty={dirty} />
                        <tbody className="cdp-table__body bg-white">
                            {formikProps.values.rows.map((row, index) =>
                                <Row
                                    key={index}
                                    row={row}
                                    columns={rawColumns}
                                    rowIndex={index}
                                    editingCell={editingCell}
                                    formikProps={formikProps}
                                    onCellBlur={handleCellBlur}
                                    onInputChange={handleInputChange}
                                    onCellSwitchToEdit={handleCellSwitchToEdit}
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
