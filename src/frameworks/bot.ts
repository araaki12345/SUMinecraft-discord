import {
  Client,
  GatewayIntentBits,
  ChannelType,
  ActivityType,
} from "discord.js";
import { AuthenticationUseCase } from "../usecases/AuthenticationUseCase.js";
import { handleAuthCommand } from "../commands/authCommandHandler.js";
import { FirestoreMemberRepository } from "../interfaces/FirestoreMemberRepository.js";
import { InMemoryMemberRepository } from "../interfaces/InMemoryMemberRepository.js";
import { AuthService } from "../commands/auth.js";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN) {
  throw new Error("Discordトークンが設定されていません");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

let memberRepository;
let environment: string;

if (process.env.NODE_ENV === "production") {
  memberRepository = new FirestoreMemberRepository(client);
  environment = "本番モード";
} else {
  memberRepository = InMemoryMemberRepository.getInstance(client);
  environment = "テストモード";
}

const authUseCase = new AuthenticationUseCase(memberRepository);
const authService = new AuthService(memberRepository);

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(environment, { type: ActivityType.Watching });
  } else {
    console.log("Client is ready, but the user detail is not available.");
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  try {
    await handleAuthCommand(interaction, memberRepository);
  } catch (error) {
    console.error("Error handling interaction:", error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp("エラーが発生しました。");
    } else {
      await interaction.reply("エラーが発生しました。");
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  console.log(`New member added: ${member.user.tag}`);
  await authUseCase.handleNewMember(member.id);
  await authService.addUnauthorizedRole(member);
  console.log(`Sent a welcome message to ${member.user.tag}.`);
});

client.on("messageCreate", async (message) => {
  console.log(
    "Received a message:",
    message.content,
    "Channel type:",
    message.channel.type
  );
  if (message.author.bot) return; // ボットからのメッセージやDM以外は無視
  if (!message.guild && message.channel.type === ChannelType.DM) {
    const emailRegex = /[\w.-]+@shizuoka\.ac\.jp$/i; // メールアドレスの正規表現
    const emailMatch = message.content.match(emailRegex);
    const member = await memberRepository.findById(message.author.id);

    if (emailMatch) {
      console.log(`Received email: ${emailMatch[0]}`);
      await authUseCase.handleEmailResponse(message.author.id, emailMatch[0]);
    } else if (member && member.getEmail()) {
      console.log(`Received username: ${message.content}`);
      await authUseCase.handleMinecraftUsernameResponse(
        message.author.id,
        message.content
      );
    } else {
      console.log("Received invalid or no email address.");
      await message.reply("有効な静岡大学のメールアドレスを入力してください。");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
