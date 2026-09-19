import { describe, expect, it } from "vitest";
import { CARD_BY_ID, DECK_SIZE } from "../shared/okocCards";
import { adjustGold, createInitialState, joinPlayer, kickPlayer, playCard, snapshotRoom, startGame } from "./gameEngine";

describe("One King, One Crown game engine", () => {
  it("contains all 99 supplied print-and-play cards", () => {
    expect(DECK_SIZE).toBe(99);
    expect(CARD_BY_ID["betray-the-king"]?.copies).toBe(3);
    expect(CARD_BY_ID["royal-bomb"]?.copies).toBe(1);
  });

  it("sets the official starting hands and gold when play begins", () => {
    const { state, hostId } = createInitialState("Host");
    joinPlayer(state, "Noble A"); joinPlayer(state, "Noble B"); joinPlayer(state, "Noble C");
    startGame(state, hostId, hostId);
    const king = state.players.find(player => player.id === state.kingPlayerId)!;
    expect(state.status).toBe("playing");
    expect(king.gold).toBe(1000);
    expect(king.hand).toHaveLength(8);
    expect(state.players.filter(player => player.id !== king.id).every(player => player.gold === 600 && player.hand.length === 8)).toBe(true);
    expect(state.playsRemaining).toBe(3);
  });

  it("lets only the host remove a guest from the lobby", () => {
    const { state, hostId } = createInitialState("Host");
    const guest = joinPlayer(state, "Noble A"); joinPlayer(state, "Noble B");
    expect(() => kickPlayer(state, guest.id, state.players[2]!.id, hostId)).toThrow("Only the host");
    kickPlayer(state, hostId, guest.id, hostId);
    expect(state.players.map(player => player.name)).toEqual(["Host", "Noble B"]);
    expect(state.players[1]!.seat).toBe(2);
  });

  it("allows a fresh noble to join an active round and lets the host remove them", () => {
    const { state, hostId } = createInitialState("Host");
    joinPlayer(state, "Noble A"); joinPlayer(state, "Noble B"); joinPlayer(state, "Noble C");
    startGame(state, hostId, hostId);
    const returning = joinPlayer(state, "Returning Noble");
    expect(returning.hand).toHaveLength(8);
    expect(state.events[0]?.message).toContain("current game");
    kickPlayer(state, hostId, returning.id, hostId);
    expect(state.players.some(player => player.id === returning.id)).toBe(false);
  });

  it("keeps every private hand hidden in other player snapshots", () => {
    const { state, hostId, hostToken } = createInitialState("Host");
    const guest = joinPlayer(state, "Noble A"); joinPlayer(state, "Noble B"); joinPlayer(state, "Noble C");
    startGame(state, hostId, hostId);
    const room = { code: "COURT1", hostPlayerId: hostId, state, createdAt: new Date(), updatedAt: new Date() };
    const view = snapshotRoom(room, hostToken);
    const host = view.state.players.find(player => player.id === hostId)!;
    const guestView = view.state.players.find(player => player.id === guest.id)!;
    expect(host.hand).toHaveLength(8);
    expect(guestView.hand).toBeUndefined();
  });

  it("automates a Shadow Deal and retains the official card prompt", () => {
    const { state, hostId } = createInitialState("Host");
    const guest = joinPlayer(state, "Noble A"); joinPlayer(state, "Noble B"); joinPlayer(state, "Noble C");
    startGame(state, hostId, hostId);
    const active = state.players.find(player => player.id === state.currentPlayerId)!;
    active.hand = [{ instanceId: "shadow-deal-test", definitionId: "shadow-deal" }];
    state.playsRemaining = 1;
    const before = guest.gold;
    playCard(state, active.id, "shadow-deal-test", { targetPlayerId: guest.id, amount: 200 });
    expect(guest.gold).toBe(before + 200);
    expect(state.events.some(event => event.message.includes("Shadow Deal"))).toBe(true);
  });

  it("permits Royal Bomb only during the negotiation phase", () => {
    const { state, hostId } = createInitialState("Host");
    joinPlayer(state, "Noble A"); joinPlayer(state, "Noble B"); joinPlayer(state, "Noble C");
    startGame(state, hostId, hostId);
    const bombHolder = state.players.find(player => player.id !== state.kingPlayerId)!;
    bombHolder.hand = [{ instanceId: "royal-bomb-test", definitionId: "royal-bomb" }];
    state.phase = "negotiation";
    state.currentPlayerId = null;
    const goldBefore = state.players.filter(player => player.id !== state.kingPlayerId).map(player => player.gold);
    playCard(state, bombHolder.id, "royal-bomb-test");
    const goldAfter = state.players.filter(player => player.id !== state.kingPlayerId).map(player => player.gold);
    expect(goldAfter).toEqual(goldBefore.map(gold => Math.max(0, gold - 800)));
  });

  it("records persistent protection and blocks later gold theft", () => {
    const { state, hostId } = createInitialState("Host");
    const guest = joinPlayer(state, "Noble A"); joinPlayer(state, "Noble B"); joinPlayer(state, "Noble C");
    startGame(state, hostId, hostId);
    const actor = state.players.find(player => player.id === state.currentPlayerId)!;
    actor.hand = [{ instanceId: "kings-eye-test", definitionId: "kings-eye" }];
    state.playsRemaining = 1;
    playCard(state, actor.id, "kings-eye-test", { targetPlayerId: guest.id });
    expect(state.statusEffects.some(effect => effect.type === "kings-eye" && effect.targetPlayerIds.includes(guest.id))).toBe(true);
    expect(state.events.some(event => event.message.includes("protected by King's Eye"))).toBe(true);
    expect(() => adjustGold(state, hostId, guest.id, -100, "Test theft")).toThrow("protected");
  });
});
