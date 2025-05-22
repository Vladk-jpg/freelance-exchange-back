import { UserRole } from 'src/database/enums/user-role.enum';

export class Profile {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public role: UserRole,
    public createdAt: Date,
    public profilePicture?: string,
  ) {}
}
