import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CreateGameDto } from '../dtos/create-game.dto';
import { GameService } from '../services/game.service';
import { JoinGameDto } from '../dtos/join-game.dto';
import { GameStatusEnum } from '../types/game-status.enum';

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

  @Post(':gameUuid/reveal-cards')
  revealCards(@Param('gameUuid', ParseUUIDPipe) gameUuid: string) {
    return this.gameService.revealCards(gameUuid);
  }

  @Post(':gameUuid/reset')
  resetGame(@Param('gameUuid', ParseUUIDPipe) gameUuid: string) {
    return this.gameService.resetGame(gameUuid);
  }

  @Post(':gameUuid/update-display-mode/:userUuid')
  updateDisplayMode(
    @Param('gameUuid', ParseUUIDPipe) gameUuid: string,
    @Param('userUuid', ParseUUIDPipe) userUuid: string,
  ) {
    return this.gameService.updateDisplayMode(gameUuid, userUuid);
  }

  @Post(':gameUuid/convert-to-admin/:userUuid')
  convertToAdmin(
    @Param('gameUuid', ParseUUIDPipe) gameUuid: string,
    @Param('userUuid', ParseUUIDPipe) userUuid: string,
  ) {
    return this.gameService.convertToAdmin(gameUuid, userUuid);
  }

  @Put(':gameUuid/users/:userUuid')
  updateMeCardSelected(
    @Param('gameUuid', ParseUUIDPipe) gameUuid: string,
    @Param('userUuid', ParseUUIDPipe) userUuid: string,
    @Body('cardSelected') cardSelected: string,
  ) {
    return this.gameService.updateUserCardSelected(
      gameUuid,
      userUuid,
      cardSelected,
    );
  }

  @Put(':gameUuid/status')
  updateGameStatus(
    @Param('gameUuid', ParseUUIDPipe) gameUuid: string,
    @Body('status') status: GameStatusEnum,
  ) {
    return this.gameService.updateGameStatus(gameUuid, status);
  }

  @Get(':gameUuid')
  getGame(@Param('gameUuid', ParseUUIDPipe) gameUuid: string) {
    return this.gameService.getGame(gameUuid);
  }
}
