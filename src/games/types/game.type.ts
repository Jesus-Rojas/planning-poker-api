import { Player } from './player.interface';

export interface Game {
  name: string;
  users: Record<string, Player>;
}
