const fs = require('fs/promises');
const path = require('path');

exports.handler = async (event) => {
  try {
    const requestedChapter = event.queryStringParameters?.key || '';

    // Security check to prevent directory traversal attacks
    if (!requestedChapter || requestedChapter.includes('..') || requestedChapter.includes('/')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid chapter name.' }),
      };
    }

    const chaptersDirectory = path.join(process.cwd(), 'chapters');
    const chapterPath = path.join(chaptersDirectory, requestedChapter);
    
    // Final validation to ensure the path is within the chapters directory
    if (!chapterPath.startsWith(chaptersDirectory)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid path." }),
        };
    }

    const content = await fs.readFile(chapterPath, 'utf-8');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    };
  } catch (error) {
    console.error(`Error loading chapter "${event.queryStringParameters?.key}":`, error);
    if (error.code === 'ENOENT') {
        return {
            statusCode: 404, // Not Found
            body: JSON.stringify({ error: 'Chapter not found.' }),
        };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not load chapter content.' }),
    };
  }
};
