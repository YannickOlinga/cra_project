import { IsInt } from 'class-validator';

export class CreateProviderDto {
  @IsInt()
  user_id: number;
}
