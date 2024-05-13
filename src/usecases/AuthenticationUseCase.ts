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
      "メールアドレスを登録して認証を完了してください。"
    );
  }
  async handleEmailResponse(memberId: string, email: string): Promise<void> {
    if (email.endsWith("@shizuoka.ac.jp")) {
      const member = await this.memberRepository.findById(memberId);
      if (member) {
        member.setEmail(email);
        member.authorise();
        await this.memberRepository.update(member);
        const redirectUrl = process.env.REDIRECT_URL;
        if (!redirectUrl) {
          throw new Error("Redirect URL is not set.");
          return;
        }
        await sendAuthenticationLink(email, redirectUrl);
        await this.memberRepository.sendMessage(
          memberId,
          "認証リンクをメールに送信しました。メールを確認してください。"
        );
      }
    } else {
      await this.memberRepository.sendMessage(
        memberId,
        "Please provide a valid Shizuoka University email address."
      );
    }
  }
}
