# AI Integration Setup

This project includes intelligent chat responses powered by OpenAI's GPT models. The AI service provides natural, context-aware responses instead of raw data dumps.

## Features

- **Smart Response Generation**: Instead of showing raw customer lists, the AI might say "You have 25 active customers in your database"
- **Context-Aware Answers**: The AI understands the intent behind questions and provides relevant insights
- **Fallback System**: Works without AI if API key is not configured
- **Flexible Provider**: Easy to switch between OpenAI, Claude, or other LLM providers

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 2. Configure Environment

Add your API key to the `.env` file:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Example Conversations

**Without AI (raw data):**
```
User: "How many customers do I have?"
Bot: "• John Doe (john@email.com)
     • Jane Smith (jane@email.com)
     • Mike Johnson (mike@email.com)
     ..."
```

**With AI (intelligent response):**
```
User: "How many customers do I have?"
Bot: "You have 25 customers in your database. Your customer base has grown 15% this month!"

User: "Show me inventory"
Bot: "You're managing 142 products across different categories. Your top sellers are laptops and accessories, and you have healthy stock levels overall."
```

## Cost Considerations

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **GPT-4**: More expensive but higher quality responses
- **Average cost per chat message**: ~$0.01-0.05

## Alternative Providers

You can easily switch to other providers by modifying `ai-service.ts`:

- **Anthropic Claude**
- **Google Gemini**  
- **Azure OpenAI**
- **Local models (Ollama, etc.)**

## Disabling AI

If you don't want to use AI, simply don't set the `OPENAI_API_KEY`. The system will automatically fall back to simpler, structured responses.

## Configuration Options

The AI service supports several configuration options in `ai-service.ts`:

```typescript
model: "gpt-3.5-turbo",     // Model to use
max_tokens: 150,            // Response length limit  
temperature: 0.7,           // Creativity level (0-1)
```

## Troubleshooting

**AI not working?**
- Check your API key is valid
- Verify you have OpenAI credits
- Check backend logs for errors

**Responses too long/short?**
- Adjust `max_tokens` in the service
- Modify the system prompt

**Want more creative responses?**
- Increase `temperature` (0.7-1.0)
- Modify the system prompt
