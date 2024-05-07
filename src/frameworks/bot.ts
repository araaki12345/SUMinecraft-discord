import { Client, GatewayIntentBits } from "discord.js";
import { AuthenticationUseCase } from "../usecases/AuthenticationUseCase";
import { InMemoryMemberRepository } from "../interfaces/InMemoryMemberRepository";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // メッセージ内容を受信するためにはこのインテントが必要
    GatewayIntentBits.DirectMessages,
  ],
});

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
  } else {
    console.log("Client is ready, but the user detail is not available.");
  }
});
client.on("guildMemberAdd", async (member) => {
  console.log(`New member added:" ${member.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
