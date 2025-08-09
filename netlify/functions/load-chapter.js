// netlify/functions/load-chapter.js

const AWS = require('aws-sdk');

exports.handler = async (event) => {
  try {
    let key = '';
    if (event.httpMethod === 'GET') {
      key = event.queryStringParameters && event.queryStringParameters.key || '';
    } else {
      const body = JSON.parse(event.body || '{}');
      key = body.key || '';
    }
    if (!key) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing key parameter' }),
      };
    }
    
    // BEFORE: This uses the reserved (and therefore undefined) variable
    // const s3 = new AWS.S3({ region: process.env.AWS_REGION });
    // const bucket = process.env.AWS_S3_BUCKET_NAME;

    // AFTER: Explicitly use your custom variables
    const s3 = new AWS.S3({
      region: process.env.APP_AWS_REGION,
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
    });
    const bucket = process.env.APP_AWS_S3_BUCKET_NAME;


    const data = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const content = data.Body.toString('utf-8');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    };
  } catch (error) {
    console.error('Error loading chapter:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
