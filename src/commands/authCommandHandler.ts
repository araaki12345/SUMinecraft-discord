import { CommandInteraction } from "discord.js";
import { MemberRepository } from "../interfaces/MemberRepository";
import { AuthService } from "../commands/auth.js"; // 修正されたパス

export async function handleAuthCommand(
  interaction: CommandInteraction,
  memberRepository: MemberRepository
) {
  if (!interaction.isCommand()) return;

  const authService = new AuthService(memberRepository);
  const userId = interaction.user.id;

  if (interaction.commandName === "auth") {
    try {
      const member = await memberRepository.findById(userId);
      if (!member || !member.getEmail()) {
        await interaction.reply(
          "メールアドレスが見つかりません。認証プロセスを完了してください。"
        );
        return;
      }

      const userEmail = member.getEmail();
      console.log(`Fetching Firebase user by email: ${userEmail}.`);

      const result = await authService.verifyUserAndAuthorize(
        userEmail,
        userId,
        interaction.guild
      );

      await interaction.reply(result);
    } catch (error) {
      console.error("Error fetching user data:", error);
      await interaction.reply("エラーが発生しました。");
    }
  }
}
