const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }
  try {
    const body = JSON.parse(event.body || '{}');
    const lessonUnitTitle = body.lesson_unit_title || '';
    const topicData = body.topic_data || {};
    const textbookContent = body.textbook_content || '';
    const userGoals = body.user_goals || '';
    const userNotes = body.user_notes || '';
    const temperature = body.temperature || 0.45;
    const maxTokens = body.max_tokens || 20048;

    const systemPrompt = process.env.SYSTEM_PROMPT_C || '';
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const generationConfig = {
      temperature: temperature,
      maxOutputTokens: maxTokens,
      responseMimeType: 'application/json',
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig,
      systemInstruction: systemPrompt,
    });

    const finalPrompt = `--- LESSON UNIT TITLE ---\n${lessonUnitTitle}\n\n--- TOPIC DATA (JSON) ---\n${JSON.stringify(topicData)}\n\n--- TEXTBOOK CONTENT ---\n${textbookContent}\n\n--- USER GOALS ---\n${userGoals}\n\n--- USER NOTES ---\n${userNotes}`;

    const result = await model.generateContent(finalPrompt);
    const response = result.response;
    const text = response.text();
    const jsonResponse = JSON.parse(text);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonResponse),
    };
  } catch (error) {
    console.error('Error generating line C content:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
