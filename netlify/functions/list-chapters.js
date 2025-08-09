// netlify/functions/list-chapters.js

const AWS = require('aws-sdk');

exports.handler = async (event) => {
  try {
    // BEFORE: This uses the reserved (and therefore undefined) variable
    // const s3 = new AWS.S3({
    //   region: process.env.AWS_REGION,
    // });
    // const bucket = process.env.AWS_S3_BUCKET_NAME;

    // AFTER: Explicitly use your custom variables
    const s3 = new AWS.S3({
      region: process.env.APP_AWS_REGION,
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
    });
    const bucket = process.env.APP_AWS_S3_BUCKET_NAME;


    const prefix = process.env.AWS_S3_PREFIX || ''; // This one isn't reserved
    const params = {
      Bucket: bucket,
      Prefix: prefix,
    };
    const data = await s3.listObjectsV2(params).promise();
    const chapters = (data.Contents || []).filter((item) => item.Key.endsWith('.txt')).map((item) => item.Key);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapters }),
    };
  } catch (error) {
    console.error('Error listing chapters:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
