import type { DeckCard } from "./okocCards";

export type GameStatus = "lobby" | "playing" | "finished";
export type GamePhase = "playing" | "negotiation";

export type PlayedCard = DeckCard & { playedAt: number; faceDown?: boolean };

export type PlayerState = {
  id: string;
  token: string;
  name: string;
  seat: number;
  gold: number;
  hand: DeckCard[];
  table: PlayedCard[];
  joinedAt: number;
};

export type GameEvent = { id: string; message: string; at: number; tone?: "system" | "gold" | "crown" | "card" };

export type GameState = {
  players: PlayerState[];
  nobleDeck: DeckCard[];
  kingDeck: DeckCard[];
  discard: DeckCard[];
  kingPlayerId: string | null;
  currentPlayerId: string | null;
  playsRemaining: number;
  phase: GamePhase;
  round: number;
  maxRounds: number;
  status: GameStatus;
  events: GameEvent[];
  version: number;
};

export type RoomSnapshot = {
  code: string;
  hostPlayerId: string;
  createdAt: Date;
  updatedAt: Date;
  viewer: { id: string; name: string; isHost: boolean } | null;
  state: Omit<GameState, "players"> & {
    players: Array<Omit<PlayerState, "token" | "hand"> & { handCount: number; hand?: DeckCard[] }>;
  };
};
