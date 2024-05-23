import { Member } from "../entities/Member.js";
import { MemberRepository } from "../interfaces/MemberRepository.js";
import { sendAuthenticationLink } from "../services/authservice.js";
import dotenv from "dotenv";

dotenv.config();
export class AuthenticationUseCase {
  private memberRepository: MemberRepository;

  constructor(memberRepository: MemberRepository) {
    this.memberRepository = memberRepository;
  }

  async handleNewMember(id: string): Promise<void> {
    const member = new Member(id, "");
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
        await sendAuthenticationLink(email);
        await this.memberRepository.sendMessage(
          memberId,
          "認証リンクをメールに送信しました。メールを確認してください。"
        );
      }
    } else {
      await this.memberRepository.sendMessage(
        memberId,
        "静大メールアドレスを入力してください。"
      );
    }
  }
}
