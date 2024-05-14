import { CommandInteraction } from "discord.js";
import { MemberRepository } from "../interfaces/MemberRepository";
import { AuthService } from "./auth.js";

export async function handleAuthCommand(
  interaction: CommandInteraction,
  memberRepository: MemberRepository
) {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "auth") {
    const authService = new AuthService(memberRepository);
    const result = await authService.authenticateMember(interaction.user.id);
    await interaction.reply(result);
    // ロール管理などの追加処理もここに含める
    const guild = interaction.guild;
    if (guild) {
      await authService.grantAuthorisedRole(interaction.user.id, guild);
    } else {
      console.log("ギルドが見つかりません。");
    }
  }
}
