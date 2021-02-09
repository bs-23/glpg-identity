const XLSX = require('xlsx');
const path = require('path');

function exportExcel(data, filename, workSheetName) {
    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName);
    XLSX.writeFile(workBook, filename);
    const filePath = path.join(process.cwd(), filename);
    return filePath;
}

exports.exportExcel = exportExcel;
