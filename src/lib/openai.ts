import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Fallback responses for different topics
const fallbackResponses = {
  general: [
    "I can help you with UPCAT preparation, including study strategies, subject reviews, and practice questions.",
    "Let me assist you with your UPCAT review. We can focus on specific subjects or general test preparation.",
    "I'm here to support your UPCAT journey. What specific area would you like to work on?"
  ],
  math: [
    "For UPCAT Mathematics, focus on algebra, geometry, and basic calculus concepts.",
    "Let's work on strengthening your math skills. We can start with any specific topic you find challenging.",
    "Mathematics in UPCAT covers various topics. Would you like to focus on a particular area?"
  ],
  science: [
    "UPCAT Science includes physics, chemistry, and biology. Which area interests you?",
    "For science preparation, let's review fundamental concepts and problem-solving strategies.",
    "Science questions in UPCAT test both knowledge and application. How can I help you prepare?"
  ],
  reading: [
    "Reading Comprehension requires careful analysis and understanding of passages.",
    "Let's work on strategies to improve your reading speed and comprehension.",
    "For the reading section, focus on identifying main ideas and supporting details."
  ],
  language: [
    "Language Proficiency covers both English and Filipino usage.",
    "Let's enhance your language skills through practice exercises and reviews.",
    "Grammar, vocabulary, and proper usage are key areas in the language section."
  ]
};

// Get a random fallback response based on context
const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('math') || lowerMessage.includes('algebra') || lowerMessage.includes('geometry')) {
    return fallbackResponses.math[Math.floor(Math.random() * fallbackResponses.math.length)];
  }
  if (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry')) {
    return fallbackResponses.science[Math.floor(Math.random() * fallbackResponses.science.length)];
  }
  if (lowerMessage.includes('reading') || lowerMessage.includes('comprehension')) {
    return fallbackResponses.reading[Math.floor(Math.random() * fallbackResponses.reading.length)];
  }
  if (lowerMessage.includes('language') || lowerMessage.includes('english') || lowerMessage.includes('filipino')) {
    return fallbackResponses.language[Math.floor(Math.random() * fallbackResponses.language.length)];
  }
  
  return fallbackResponses.general[Math.floor(Math.random() * fallbackResponses.general.length)];
};

export const generateResponse = async (message: string): Promise<string> => {
  if (!message.trim()) {
    throw new Error('Message cannot be empty');
  }

  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const systemPrompt = `You are UPCAiT, an AI-powered UPCAT review assistant created by Neureview Analytics Corporation. Your role is to help students prepare for the UPCAT exam.

Brand Voice:
- Professional yet approachable
- Clear and concise
- Encouraging and supportive
- Technology-savvy but not intimidating
- Educational and informative

Key Messages:
1. "AI-powered personalized learning"
2. "Learn smarter, not harder"
3. "Your path to UP excellence"
4. "Community-driven success"
5. "Future-ready preparation"

Focus Areas:
1. UPCAT subject matter expertise:
   - Mathematics
   - Science
   - Language Proficiency
   - Reading Comprehension

2. Learning Support:
   - Study strategies and tips
   - Time management techniques
   - Test-taking strategies
   - Progress tracking
   - Performance optimization

3. Emotional Support:
   - Motivation and encouragement
   - Stress management
   - Confidence building
   - Goal setting
   - Positive reinforcement

Communication Style:
- Use active voice
- Keep sentences clear and concise
- Avoid educational jargon
- Maintain a positive and motivational tone
- Support statements with data when relevant

Always maintain a supportive and encouraging tone while providing accurate, helpful information.
If unsure about something, be honest and suggest reliable resources for further research.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    });

    const aiResponse = response.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('Empty response from AI');
    }

    return aiResponse;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
      }
      if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }
      throw new Error(`Failed to generate response: ${error.message}`);
    }
    
    return getFallbackResponse(message);
  }
};