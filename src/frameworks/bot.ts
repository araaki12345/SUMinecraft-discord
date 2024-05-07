import { Client, GatewayIntentBits } from "discord.js";
import { AuthenticationUseCase } from "../usecases/AuthenticationUseCase";
import { handleAuthCommand } from "../commands/authCommandHandler.js";
import { InMemoryMemberRepository } from "../interfaces/InMemoryMemberRepository.js";
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "auth") {
    const memberRepository = InMemoryMemberRepository.getInstance();
    await handleAuthCommand(interaction, memberRepository);
  }
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
