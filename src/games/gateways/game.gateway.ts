import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEvents } from '../events/game.event';
import { GameService } from '../services/game.service';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private gameService: GameService) {}

  handleConnection(client: Socket) {
    Logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent(GameEvents.JOIN)
  handleGameJoinedEvent(payload: {
    gameUuid: string;
    userUuid: string;
    userName: string;
  }) {
    this.server.to(payload.gameUuid).emit('playerJoined', payload);
  }

  @SubscribeMessage('confirmJoin')
  confirmJoin(
    @MessageBody() data: { gameUuid: string; userUuid: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.gameService.isUserInGame(data.gameUuid, data.userUuid)) {
      return;
    }

    client.join(data.gameUuid);
    this.server
      .to(data.gameUuid)
      .emit('playerConnected', { userUuid: data.userUuid });
  }
}
