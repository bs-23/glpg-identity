const XLSX = require('xlsx');

function exportExcel(data, workSheetName) {
    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName);

    var wbbuf = XLSX.write(workBook, {
        type: 'base64'
    });
    const fileBuffer = Buffer.from(wbbuf, 'base64');
    return fileBuffer;
}

exports.exportExcel = exportExcel;
