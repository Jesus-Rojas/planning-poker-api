import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { DisplayModeEnum } from '../types/display-mode.enum';

export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DisplayModeEnum)
  @IsNotEmpty()
  displayMode: DisplayModeEnum;
}
