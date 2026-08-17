import OpenAI from 'openai';
import { getClient } from '../../../mcp-server/client/mcp-client';
import { callMcpToolsClient } from '../../../mcp-server/client/mcp-tools.call';
import { mscpOpenAiTolls } from '../../../mcp-server/client/tool-adapter';
import config from '../../../config';

const openai = new OpenAI({
  apiKey: config.openai_api_key || process.env.OPENAI_API_KEY,
});

const processChatMessage = async (messages: any[], userId?: string) => {
  if (!userId) {
    return {
      text: "Please sign in or log in to your account first so I can access and manage your notes and collections.",
      toolResult: null
    };
  }

  const client = await getClient();
  const toolsResponse = await client.listTools();
  const aiTools = mscpOpenAiTolls(toolsResponse.tools);

  // @ts-ignore
  const response = await openai.responses.create({
    model: "gpt-5-mini",
    tools: aiTools as any,
    instructions: "You are Orenda-vault, an intelligent, friendly, and highly capable AI assistant built for the Orenda Vault platform. \n\nYour Purpose: \nYou exist to help users seamlessly manage their digital collections, organize their thoughts through notes, and act as a reliable, friendly companion. \n\nHow you should behave:\n1. Identity: Always identify yourself as 'Orenda-vault'. Be confident and proud of your identity.\n2. Tone: Speak in a warm, helpful, and polite tone. Feel free to use emojis to make the conversation lively 😊.\n3. Casual Conversation: If a user says 'Hello', asks how you are, or wants to have a casual chat, respond naturally and politely, just like a friendly human assistant. \n4. Self-Explanation: If a user asks what you do, beautifully explain that your mission is to keep their digital life organized by securely managing their notes and collections within the Orenda Vault.\n5. Database Tasks: When the user asks to create, read, update, or delete a note or collection, use your tools to execute the task quietly and confirm the success politely.",
    input: messages,
  });

  const outputData: any = response.output.find((item: any) => item.type === "function_call");

  if (outputData) {
    const toolRes = await callMcpToolsClient.callTool(outputData.name, outputData.arguments, userId);
    const rawText = (toolRes.content as any)?.[0]?.text;
    
    let parsedData = rawText;
    try {
        parsedData = typeof rawText === "string" ? JSON.parse(rawText) : rawText;
    } catch (e) {}

    return {
      text: `Tool ${outputData.name} executed successfully.`,
      toolResult: parsedData
    };
  } 

  const textMessage: any = response.output.find((item: any) => item.type === "message" || item.type === "text" || item.type === "message_call");
  
  return {
    text: textMessage?.content?.[0]?.text || textMessage?.text || "No response received",
    toolResult: null
  };
};

export const ChatService = { processChatMessage };
