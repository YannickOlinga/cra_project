import { AccountRole } from '../dto/register-account.dto';

export interface AuthenticatedUser {
  sub: number;
  email: string;
  role: AccountRole;
  profileId?: number;
}
