import { Member } from "../entities/Member.js";
import { MemberRepository } from "../interfaces/MemberRepository.js";
import { sendAuthenticationLink } from "../services/authservice.js";
import dotenv from "dotenv";

dotenv.config();
export class AuthenticationUseCase {
  private memberRepository: MemberRepository;
  private emailCache: { [key: string]: string } = {};

  constructor(memberRepository: MemberRepository) {
    this.memberRepository = memberRepository;
  }

  async handleNewMember(id: string): Promise<void> {
    const member = new Member(id, "", "", false);
    await this.memberRepository.save(member);
    await this.memberRepository.sendMessage(
      id,
      "静大メールアドレスを登録して認証を完了してください。"
    );
  }
  async handleEmailResponse(memberId: string, email: string): Promise<void> {
    if (email.endsWith("@shizuoka.ac.jp")) {
      const member = await this.memberRepository.findById(memberId);
      if (member) {
        member.setEmail(email);
        await this.memberRepository.update(member);
        await this.memberRepository.sendMessage(
          memberId,
          "Minecraftのユーザー名を入力してください。"
        );
        this.emailCache[memberId] = email;
      }
    } else {
      await this.memberRepository.sendMessage(
        memberId,
        "静大メールアドレスを入力してください。"
      );
    }
  }
  async handleMinecraftUsernameResponse(
    memberId: string,
    mcUsername: string
  ): Promise<void> {
    const email = this.emailCache[memberId];
    if (email) {
      const member = await this.memberRepository.findById(memberId);
      if (member) {
        member.setMinecraftUsername(mcUsername);
        await this.memberRepository.update(member);
        await this.memberRepository.sendMessage(
          memberId,
          "Minecraftユーザーネームが登録されました。認証リンクを送信します。"
        );
        await sendAuthenticationLink(email); // 認証リンクを送信
      }
    } else {
      await this.memberRepository.sendMessage(
        memberId,
        "最初に静大メールアドレスを入力してください。"
      );
    }
  }
}
