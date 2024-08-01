import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameEvents } from '../events/game.event';
import { Game } from '../types/game.interface';
import { ResponseCreateGame } from '../types/response-create-game.interface';
import { RoleEnum } from '../types/role.enum';
import { DisplayModeEnum } from '../types/display-mode.enum';
import { GameStatusEnum } from '../types/game-status.enum';

@Injectable()
export class GameService {
  private games: Record<string, Game> = {};

  constructor(private eventEmitter: EventEmitter2) {}

  createGame(gameName: string): ResponseCreateGame {
    const gameUuid = uuidv4();
    this.games[gameUuid] = {
      name: gameName,
      users: [],
      status: GameStatusEnum.Reveal,
    };
    return { gameUuid };
  }

  joinGame(gameUuid: string, userName: string, displayMode: DisplayModeEnum) {
    this.getGame(gameUuid);

    const userUuid = uuidv4();
    const role =
      this.games[gameUuid].users.length === 0
        ? RoleEnum.Admin
        : RoleEnum.Player;

    this.games[gameUuid].users.push({
      uuid: userUuid,
      name: userName,
      score: 0,
      role,
      isActive: true,
      displayMode,
    });
    this.games[gameUuid].users[userUuid] = { name: userName, score: 0 };
    this.eventEmitter.emit(GameEvents.JOIN, { gameUuid, userUuid, userName });
    return { userUuid };
  }

  isUserInGame(gameUuid: string, userUuid: string) {
    const game = this.games[gameUuid];
    if (!game) return false;
    const user = game.users.find((user) => user.uuid === userUuid);
    return user !== undefined;
  }

  getGame(gameUuid: string) {
    const game = this.games[gameUuid];
    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  getUser(gameUuid: string, userUuid: string) {
    const game = this.getGame(gameUuid);
    const user = game.users.find((user) => user.uuid === userUuid);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateUserCardSelected(
    gameUuid: string,
    userUuid: string,
    cardSelected: string,
  ) {
    this.getUser(gameUuid, userUuid);
    this.games[gameUuid].users = this.games[gameUuid].users.map((user) => {
      if (user.uuid === userUuid) user.cardSelected = cardSelected;
      return user;
    });
  }

  updateGameStatus(gameUuid: string, status: GameStatusEnum) {
    this.getGame(gameUuid);
    this.games[gameUuid].status = status;
    if (status === GameStatusEnum.Loading) {
      setTimeout(
        () => (this.games[gameUuid].status = GameStatusEnum.Reset),
        3000,
      );
    }
  }
}
