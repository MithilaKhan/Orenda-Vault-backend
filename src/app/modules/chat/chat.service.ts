import OpenAI from 'openai';
import { getClient } from '../../../mcp-server/client/mcp-client';
import { callMcpToolsClient } from '../../../mcp-server/client/mcp-tools.call';
import { mscpOpenAiTolls } from '../../../mcp-server/client/tool-adapter';
import config from '../../../config';
import { Chat } from './chat.model';
import { SYSTEM_INSTRUCTIONS } from './chat.constants';

const openai = new OpenAI({
  apiKey: config.openai_api_key || process.env.OPENAI_API_KEY,
});

/**
 * Processes an incoming AI chat conversation message chain.
 * Handles OpenAI tool calls (MCP tools), database updates, and response generation.
 */
const processChatMessage = async (messages: any[], userId?: string) => {
  const client = await getClient();
  const toolsResponse = await client.listTools();
  const aiTools = mscpOpenAiTolls(toolsResponse.tools);

  const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;

  const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTIONS },
    ...messages.map((m: any) => ({
      role: (m.role === 'assistant' || m.role === 'user' || m.role === 'system' ? m.role : 'user') as 'user' | 'assistant' | 'system',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    })),
  ];

  // Turn 1: Initial call to OpenAI to determine if tool execution is required
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: formattedMessages,
    tools: aiTools as any,
  });

  const choice = completion.choices[0];
  const responseMessage = choice.message;

  let replyText = '';
  let toolResultData: any = null;

  // Turn 2: Handle tool calls if requested by OpenAI
  if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
    if (!userId) {
      return {
        text: 'Please sign in or log in to your account first so I can access and manage your notes and collections.',
        toolResult: null,
      };
    }

    formattedMessages.push(responseMessage);

    for (const toolCall of responseMessage.tool_calls as any[]) {
      const toolName = toolCall.function?.name || toolCall.name;
      let toolArgs: any = {};
      try {
        toolArgs = JSON.parse(toolCall.function?.arguments || toolCall.arguments || '{}');
      } catch (e) {
        toolArgs = {};
      }

      const toolRes = await callMcpToolsClient.callTool(toolName, toolArgs, userId);
      const rawText = (toolRes.content as any)?.[0]?.text;

      let parsedData = rawText;
      try {
        parsedData = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
      } catch (e) {}

      toolResultData = parsedData;

      formattedMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: typeof rawText === 'string' ? rawText : JSON.stringify(rawText || { success: true }),
      });
    }

    const secondCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
    });

    replyText = secondCompletion.choices[0].message.content || "Done! I've completed your request successfully. ✨";
  } else {
    replyText = responseMessage.content || 'No response received';
  }

  // Persist conversation turn to MongoDB if user is authenticated
  if (userId) {
    let chatDoc = await Chat.findOne({ user: userId });
    if (!chatDoc) {
      chatDoc = new Chat({ user: userId, messages: [] });
    }

    if (lastUserMsg && lastUserMsg.content) {
      chatDoc.messages.push({
        role: lastUserMsg.role || 'user',
        content: typeof lastUserMsg.content === 'string' ? lastUserMsg.content : JSON.stringify(lastUserMsg.content),
      });
    }

    chatDoc.messages.push({
      role: 'assistant',
      content: replyText,
      toolResult: toolResultData,
    });

    await chatDoc.save();
  }

  return {
    text: replyText,
    toolResult: toolResultData,
  };
};

/**
 * Retrieves chat message history for an authenticated user.
 */
const getChatHistory = async (userId: string) => {
  const chatDoc = await Chat.findOne({ user: userId });
  if (!chatDoc) {
    return [];
  }
  return chatDoc.messages;
};

/**
 * Clears chat history for an authenticated user.
 */
const clearChatHistory = async (userId: string) => {
  await Chat.findOneAndDelete({ user: userId });
  return { message: 'Chat history cleared successfully' };
};

export const ChatService = {
  processChatMessage,
  getChatHistory,
  clearChatHistory,
};
