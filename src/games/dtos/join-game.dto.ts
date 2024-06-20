import { IsString, IsNotEmpty } from 'class-validator';

export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
