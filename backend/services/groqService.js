const axios = require('axios');

const generateContent = async (title, projectName, type) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not defined in environment variables');
    }

    let prompt = '';
    if (type === 'description') {
        prompt = `Generate a professional, concise task description for:
Task Title: ${title}
Project: ${projectName}
Formatting Rules:
- Return ONLY the description.
- Use clean bullet points starting with "-".
- DO NOT use asterisks (*) for formatting.
- Be professional and direct.`;
    } else if (type === 'project_description') {
        prompt = `Generate a high-level, professional project description for:
Project Name: ${title}
Formatting Rules:
- Return ONLY the description.
- Use clean bullet points starting with "-".
- DO NOT use asterisks (*) for formatting.
- Focus on business goals and key objectives.`;
    } else if (type === 'definition') {
        prompt = `Generate a professional "Definition of Done" for:
Task Title: ${title}
Project: ${projectName}
Formatting Rules:
- Return ONLY the checklist items.
- Use clean bullet points starting with "-".
- DO NOT use asterisks (*) for formatting.`;
    } else if (type === 'subtasks') {
        prompt = `Generate a list of 3-5 logical subtasks for:
Task Title: ${title}
Project: ${projectName}
Formatting Rules:
- Return ONLY the subtask titles.
- Use a simple comma-separated list or one per line.
- DO NOT use numbers or bullet points.
- DO NOT use asterisks (*).`;
    }

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful project management assistant. Return clean structured output only, without conversational filler.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        const detail = error.response?.data?.error?.message || error.response?.data || error.message;
        console.error('Groq API Error:', detail);
        throw new Error(`Failed to generate content: ${detail}`);
    }
};

module.exports = { generateContent };
