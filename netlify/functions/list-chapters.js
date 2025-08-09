const fs = require('fs/promises');
const path = require('path');

exports.handler = async (event) => {
  try {
    // The 'chapters' directory is at the root of the repository.
    const chaptersDirectory = path.join(process.cwd(), 'chapters');
    const allFiles = await fs.readdir(chaptersDirectory);

    // Filter for .txt files only
    const chapters = allFiles.filter((file) => file.endsWith('.txt'));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapters }),
    };
  } catch (error) {
    console.error('Error listing chapters from repository:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not list chapters from the repository.' }),
    };
  }
};
