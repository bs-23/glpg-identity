import React, { useState, useRef } from 'react';
import * as yup from 'yup';
import Row from './Row';
import { Formik } from 'formik';
import Header from './Header';

const EditableTable = ({ columns: rawColumns, rows: rawRows, schema: rowSchema, children, onSubmit, ...props }) => {
    const [editingCell, setEditingCell] = useState(null);
    const formikRef = useRef();

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
        // if(e.target.type === 'date') e.target.value = new Date(e.target.value);

        handleChange(e);
    }

    const handleSubmit = (values, formikProps) => {
        const done = success => {
            if(success) {
                formikProps.resetForm({
                    values: values
                });
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
        if(!formikRef.current) return [];

        const initialValues = formikRef.current.initialValues.rows;
        const currentValues = formikRef.current.values.rows;

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

    return <div className="">
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

                return <>
                    <table className="table table-bordered">
                        <Header columns={rawColumns} dirty={dirty} />
                        <tbody>
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
