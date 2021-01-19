const fs = require('fs');
const path = require('path');
var AWS = require('aws-sdk');
const nodecache = require(path.join(process.cwd(), 'src/config/server/lib/nodecache'));

const S3 = new AWS.S3({
    accessKeyId: nodecache.getValue('AWS_ACCESS_KEY_ID'),
    secretAccessKey: nodecache.getValue('AWS_SECRET_ACCESS_KEY'),
    region: nodecache.getValue('AWS_REGION')
});

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

exports.upload = upload;
