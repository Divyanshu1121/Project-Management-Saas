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

const generateDocAssist = async (projectName, action, section, contextText) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not defined');

    let prompt = '';
    if (action === 'summarize') {
        prompt = `Summarize the following ${section} for project "${projectName}":\n\n${contextText}`;
    } else if (action === 'improve') {
        prompt = `Improve the writing, grammar, and professional tone of the following ${section} for project "${projectName}". Keep formatting if any:\n\n${contextText}`;
    } else if (action === 'generate_reqs') {
        prompt = `Generate a high-level list of project requirements for a project named "${projectName}" based on this context:\n\n${contextText}\n\nReturn clean bullet points.`;
    } else if (action === 'generate_risks') {
        prompt = `Identify 3-5 potential real-world risks or issues for the project "${projectName}" based on this context:\n\n${contextText}\n\nReturn clean bullet points.`;
    } else if (action === 'summarize_meeting') {
        prompt = `Extract key action items and summarize the following meeting notes for project "${projectName}":\n\n${contextText}`;
    } else {
        throw new Error('Invalid AI action');
    }

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a technical project manager assistant. Return professional, structured output directly without conversational filler text.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
            },
            {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        const detail = error.response?.data?.error?.message || error.response?.data || error.message;
        console.error('Groq API Error (DocAssist):', detail);
        throw new Error(`Failed to generate document content: ${detail}`);
    }
};

module.exports = { generateContent, generateDocAssist };
