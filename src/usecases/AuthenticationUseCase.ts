import { Member } from "../entities/Member.js";
import { MemberRepository } from "../interfaces/MemberRepository.js";

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
        await this.memberRepository.sendMessage(
          memberId,
          "Your email has been verified. Welcome!"
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
