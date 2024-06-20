import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameEvents } from '../events/game.event';
import { Game } from '../types/game.type';

@Injectable()
export class GameService {
  private games: Record<string, Game> = {};

  constructor(private eventEmitter: EventEmitter2) {}

  createGame(gameName: string) {
    const gameUuid = uuidv4();
    this.games[gameUuid] = { name: gameName, users: {} };
    return { gameUuid };
  }

  joinGame(gameUuid: string, userName: string) {
    if (!this.games[gameUuid]) throw new BadRequestException('Game not found');
    const userUuid = uuidv4();
    this.games[gameUuid].users[userUuid] = { name: userName, score: 0 };
    this.eventEmitter.emit(GameEvents.JOIN, { gameUuid, userUuid, userName });
    return { userUuid };
  }

  isUserInGame(gameUuid: string, userUuid: string) {
    const game = this.games[gameUuid];
    if (!game) return false;
    return game.users[userUuid] !== undefined;
  }

  getGame(gameUuid: string) {
    if (!this.games[gameUuid]) throw new BadRequestException('Game not found');
    return this.games[gameUuid];
  }
}
