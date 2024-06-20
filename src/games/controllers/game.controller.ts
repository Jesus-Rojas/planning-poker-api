import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
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

  @Post(':gameUuid/join')
  joinGame(
    @Param('gameUuid', ParseUUIDPipe) gameUuid: string,
    @Body() joinGameDto: JoinGameDto,
  ) {
    return this.gameService.joinGame(gameUuid, joinGameDto.name);
  }
}
