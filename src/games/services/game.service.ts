import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GameEvents } from '../events/game.event';
import { Game } from '../types/game.interface';
import { ResponseCreateGame } from '../types/response-create-game.interface';
import { RoleEnum } from '../types/role.enum';
import { DisplayModeEnum } from '../types/display-mode.enum';
import { GameStatusEnum } from '../types/game-status.enum';
import { ScoreCard } from '../types/score-card.interface';

@Injectable()
export class GameService {
  private games: Record<string, Game> = {};

  constructor(private eventEmitter: EventEmitter2) {}

  createGame(gameName: string): ResponseCreateGame {
    const gameUuid = uuidv4();
    this.games[gameUuid] = {
      average: 0,
      scoreCards: [],
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
      cardSelected: undefined,
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

  revealCards(gameUuid: string) {
    this.getGame(gameUuid);
    this.games[gameUuid].status = GameStatusEnum.Loading;
    const users = this.games[gameUuid].users;
    const cards: ScoreCard[] = users
      .filter((user) => typeof user.cardSelected === 'string')
      .reduce<ScoreCard[]>((cards, { cardSelected }) => {
        const card = cards.find((card) => card.id === cardSelected);
        if (!card) {
          return [
            ...cards,
            {
              id: cardSelected,
              text: cardSelected,
              amount: 1,
            },
          ];
        }

        return [
          ...cards.filter((card) => card.id !== cardSelected),
          {
            id: cardSelected,
            text: cardSelected,
            amount: card.amount + 1,
          },
        ];
      }, [] as ScoreCard[]);

    let totalVotes = 0;
    let weightedSum = 0;
    const cardsFiltered = cards.filter((card) => !isNaN(Number(card.text)));
    cardsFiltered.forEach(({ amount, text }) => {
      totalVotes += amount;
      weightedSum += Number(text) * amount;
    });
    const average = weightedSum / totalVotes;
    this.games[gameUuid].status = GameStatusEnum.Reset;
    this.games[gameUuid].average = average;
    this.games[gameUuid].scoreCards = cards;
    return { average, scoreCards: cards };
  }

  resetGame(gameUuid: string) {
    this.getGame(gameUuid);
    this.games[gameUuid].status = GameStatusEnum.Reveal;
    this.games[gameUuid].users = this.games[gameUuid].users.map((user) => ({
      ...user,
      cardSelected: undefined,
    }));
  }

  updateDisplayMode(gameUuid: string, userUuid: string) {
    this.getGame(gameUuid);
    this.games[gameUuid].users = this.games[gameUuid].users.map((user) => {
      if (user.uuid === userUuid) {
        user.displayMode =
          user.displayMode === DisplayModeEnum.Player
            ? DisplayModeEnum.Spectator
            : DisplayModeEnum.Player;
      }
      return user;
    });
  }

  convertToAdmin(gameUuid: string, userUuid: string) {
    this.getGame(gameUuid);
    this.games[gameUuid].users = this.games[gameUuid].users.map((user) => {
      if (user.uuid === userUuid) user.role = RoleEnum.Admin;
      return user;
    });
  }
}
