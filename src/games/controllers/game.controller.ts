import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateGameDto } from '../dtos/create-game.dto';
import { GameService } from '../services/game.service';
import { JoinGameDto } from '../dtos/join-game.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  createGame(@Body() createGameDto: CreateGameDto) {
    return this.gameService.createGame(createGameDto.name);
  }

  @Post('join/:gameUuid')
  joinGame(
    @Param('gameUuid', ParseUUIDPipe) gameUuid: string,
    @Body() joinGameDto: JoinGameDto,
  ) {
    const { name, displayMode } = joinGameDto;
    return this.gameService.joinGame(gameUuid, name, displayMode);
  }

  @Get(':gameUuid/users/:userUuid')
  getUser(
    @Param('gameUuid', ParseUUIDPipe) gameUuid: string,
    @Param('userUuid', ParseUUIDPipe) userUuid: string,
  ) {
    return this.gameService.getUser(gameUuid, userUuid);
  }

  @Get(':gameUuid')
  getGame(@Param('gameUuid', ParseUUIDPipe) gameUuid: string) {
    return this.gameService.getGame(gameUuid);
  }
}
