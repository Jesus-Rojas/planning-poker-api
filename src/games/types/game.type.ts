import { Player } from './player.interface';

export interface Game {
  name: string;
  users: Player[];
}
