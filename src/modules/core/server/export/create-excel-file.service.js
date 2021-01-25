const XLSX = require('xlsx');

async function createExcelFile(data, workSheetName, filename) {
    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.json_to_sheet(
        data,
        //   { header: ["A","B","C","D","E","F","G"] }
    );

    XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName);

    XLSX.writeFile(workBook, filename);
}

exports.createExcelFile = createExcelFile;
