const fs = require('fs');
const path = require('path');
var AWS = require('aws-sdk');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const S3 = new AWS.S3({
    accessKeyId: nodecache.getValue('AWS_ACCESS_KEY_ID'),
    secretAccessKey: nodecache.getValue('AWS_SECRET_ACCESS_KEY'),
    region: nodecache.getValue('AWS_REGION')
});
const SIGNED_URL_EXPIRATION_TIME = 60 * 30; // seconds

// options: { bucket, folder, fileName, fileContent }
async function upload(options) {
    const params = {
        Bucket: options.bucket,
        Key: `${options.folder}${options.fileName}`,
        Body: options.fileContent
    };

    const response = await S3.upload(params).promise();
    return response;
}

async function deleteFiles(options) {
    const response = await S3.deleteObjects(options).promise();
    return response;
}


function getSignedUrl(bucket, key) {
    const url = S3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: SIGNED_URL_EXPIRATION_TIME
    });
    return url;
}

exports.upload = upload;
exports.getSignedUrl = getSignedUrl;
exports.deleteFiles = deleteFiles;
