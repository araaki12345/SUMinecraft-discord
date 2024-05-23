import { MemberRepository } from "../interfaces/MemberRepository.js";
import { Member } from "../entities/Member.js";
import { admin } from "../config/firebaseAdminConfig.js";

async function handleRoleModification(
  operation: Promise<any>,
  successMessage: string,
  errorMessage: string
) {
  try {
    const result = await operation;
    console.log(successMessage);
    return result;
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
}
export class AuthService {
  private memberRepository: MemberRepository;

  constructor(memberRepository: MemberRepository) {
    this.memberRepository = memberRepository;
  }

  async authenticateMember(id: string): Promise<string> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      // メンバーが見つからない場合は新規作成と認証
      const newMember = new Member(id, "Unknown");
      newMember.authorise();
      await this.memberRepository.save(newMember);
      return "Member was not found, created and authorised.";
    } else if (!member.isAuthorised()) {
      // 既存のメンバーが未認証の場合は認証
      member.authorise();
      await this.memberRepository.update(member);
      return "Member was authorised.";
    } else {
      // 既に認証されている場合はその旨を返す
      return "Member is already authorised.";
    }
  }
  async grantAuthorisedRole(userId: string, guild: any) {
    const member = await this.memberRepository.findById(userId);
    if (member && member.isAuthorised()) {
      console.log(`Member with ID ${userId} is authorised, granting role.`);
      let authorisedRole = guild.roles.cache.find(
        (role: any) => role.name === "認証済"
      );
      const guildMember = guild.members.cache.get(userId);

      if (!authorisedRole) {
        authorisedRole = await handleRoleModification(
          guild.roles.create({
            name: "認証済",
            color: "Green",
            reason: "認証済ユーザー用のロール",
          }),
          "認証済ロールの作成に成功",
          "認証済ロールの作成に失敗"
        );
      }

      if (authorisedRole && guildMember) {
        await handleRoleModification(
          guildMember.roles.add(authorisedRole),
          "認証済ロールが${guildMember.user.tag}に付与されました。",
          "認証済ロールを${guildMember.user.tag}に付与できませんでした。"
        );
      }

      const unauthorizedRole = guild.roles.cache.find(
        (role: any) => role.name === "未認証"
      );
      if (unauthorizedRole) {
        await handleRoleModification(
          guildMember.roles.remove(unauthorizedRole),
          "未認証ロールが${guildMember.user.tag}から削除されました。",
          "未認証ロールを${guildMember.user.tag}から削除できませんでした。"
        );
      } else {
        console.log("未認証ロールが見つかりません。");
      }
    } else {
      console.log("メンバーが見つからないか、未認証です。");
    }
  }

  async addUnauthorizedRole(member: any): Promise<void> {
    let unauthorizedRole = member.guild.roles.cache.find(
      (role: any) => role.name === "未認証"
    );
    if (!unauthorizedRole) {
      unauthorizedRole = await handleRoleModification(
        member.guild.roles.create({
          name: "未認証",
          color: "GREY",
          reason: "未認証ユーザー用のロール",
        }),
        "未認証ロールの作成に成功",
        "未認証ロールの作成に失敗"
      );
    }

    if (unauthorizedRole) {
      await handleRoleModification(
        member.roles.add(unauthorizedRole),
        "未認証ロールが ${member.user.tag} に付与されました。",
        "未認証ロールの付与に失敗しました。"
      );
    } else {
      console.log("未認証ロールの付与に失敗しました。");
    }
  }

  async verifyUserAndAuthorize(
    userEmail: string,
    userId: string,
    guild: any
  ): Promise<string> {
    try {
      const userRecord = await admin.auth().getUserByEmail(userEmail);

      if (userRecord.emailVerified) {
        console.log(`Email ${userEmail} is verified.`);
        const member = await this.memberRepository.findById(userId);
        if (member) {
          member.authorise();
          await this.memberRepository.update(member);
          await this.grantAuthorisedRole(userId, guild);
          return "ユーザーを認証しました！";
        } else {
          return "認証に失敗しました。";
        }
      } else {
        console.log(`Email ${userEmail} is not verified.`);
        return "メールアドレスが認証されていません。";
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      return "エラーが発生しました。";
    }
  }
}
