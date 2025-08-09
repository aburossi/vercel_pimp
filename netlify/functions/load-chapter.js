const AWS = require('aws-sdk');

exports.handler = async (event) => {
  try {
    // Determine the S3 key from query parameters or request body
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
    const s3 = new AWS.S3({ region: process.env.AWS_REGION });
    const bucket = process.env.AWS_S3_BUCKET_NAME;
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
