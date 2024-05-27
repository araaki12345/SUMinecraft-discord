export class Member {
  private id: string;
  private email: string;
  private minecraftUsername: string;
  private authorised: boolean;

  constructor(
    id: string,
    email: string,
    minecraftUsername: string,
    authorised: boolean = false
  ) {
    this.id = id;
    this.email = email;
    this.minecraftUsername = minecraftUsername;
    this.authorised = authorised;
  }

  public authorise() {
    this.authorised = true;
  }

  public setEmail(email: string) {
    this.email = email;
  }

  public getId() {
    return this.id;
  }

  public getEmail() {
    return this.email;
  }

  public setMinecraftUsername(minecraftUsername: string) {
    this.minecraftUsername = minecraftUsername;
  }
  public getMinecraftUsername(): string {
    return this.minecraftUsername;
  }

  public isAuthorised(): boolean {
    return this.authorised;
  }
}
