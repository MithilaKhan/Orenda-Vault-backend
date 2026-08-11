import dotenv from "dotenv";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ChatService } from "../../app/modules/chat/chat.service";

dotenv.config();

async function main() {
  const rl = readline.createInterface({
    input,
    output,
  });

  const question = await rl.question("You: ");
  const messages = [{ role: "user", content: question }];
  const result = await ChatService.processChatMessage(messages);

  console.log("\nAssistant:");
  if (result.toolResult) {
    console.log(result.toolResult);
  } else {
    console.log(result.text);
  }

  rl.close();
}

main().catch(console.error);