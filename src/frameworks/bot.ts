import { Client, GatewayIntentBits, ChannelType } from "discord.js";
import { AuthenticationUseCase } from "../usecases/AuthenticationUseCase.js";
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
    GatewayIntentBits.GuildMembers,
  ],
});

const memberRepository = InMemoryMemberRepository.getInstance(client);
const authUseCase = new AuthenticationUseCase(memberRepository);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "auth") {
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
  let unaurhorizedRole = member.guild.roles.cache.find(
    (role) => role.name === "Unauthorized"
  );
  if (!unaurhorizedRole) {
    try {
      unaurhorizedRole = await member.guild.roles.create({
        name: "未認証",
        color: "Grey",
        reason: "未認証ユーザー用のロール",
      });
      console.log("未認証ロールの作成に成功");
    } catch (error) {
      console.error("未認証ロールの作成に失敗", error);
    }
  }
  if (unaurhorizedRole) {
    member.roles.add(unaurhorizedRole);
    console.log(`未認証ロールが ${member.user.tag}に付与されました。`);
  }
  await authUseCase.handleNewMember(member.id);
  console.log(`Sent a welcome message to ${member.user.tag}.`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return; // ボットからのメッセージやDM以外は無視
  if (
    message.channel.type === ChannelType.DM &&
    message.content.includes("@shizuoka.ac.jp")
  ) {
    await authUseCase.handleEmailResponse(message.author.id, message.content);
  }
});

client.login(process.env.DISCORD_TOKEN);
