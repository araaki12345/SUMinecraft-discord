import { Member } from "../entities/Member";
import { MemberRepository } from "../interfaces/MemberRepository.js";

export class AuthenticationUseCase {
  private memberRepository: MemberRepository;

  constructor(memberRepository: MemberRepository) {
    this.memberRepository = memberRepository;
  }

  async handleNewMember(id: string): Promise<void> {
    const member = new Member(id, "");
    await this.memberRepository.save(member);
  }
  async authenticateMember(memberId: string, email: string): Promise<boolean> {
    const member = await this.memberRepository.findById(memberId);
    if (!member) return false;
    if (email.endsWith("@shizuoka.ac.jp")) {
      member.setEmail(email);
      member.authorise();
      await this.memberRepository.update(member);
      return true;
    }
    return false;
  }
}
