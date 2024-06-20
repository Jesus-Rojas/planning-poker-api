import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';
import { GameGateway } from './gateways/game.gateway';
import { GameService } from './services/game.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [GameController],
  providers: [GameService, GameGateway],
})
export class GamesModule {}
