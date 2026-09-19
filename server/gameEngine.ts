import { nanoid } from "nanoid";
import { CARD_BY_ID, makeDeck, type DeckCard } from "../shared/okocCards";
import type { GameEvent, GameState, PlayerState, RoomSnapshot } from "../shared/gameTypes";

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 4;

function shuffle<T>(items: T[]): T[] { const copy = [...items]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j]!, copy[i]!]; } return copy; }
function roll() { return Math.floor(Math.random() * 6) + 1; }
function clampGold(value: number) { return Math.max(0, Math.min(9999, Math.round(value / 100) * 100)); }
function player(state: GameState, id: string) { const found = state.players.find(candidate => candidate.id === id); if (!found) throw new Error("This noble is no longer in the room."); return found; }
function event(state: GameState, message: string, tone: GameEvent["tone"] = "system") { state.events = [{ id: nanoid(10), message, at: Date.now(), tone }, ...state.events].slice(0, 60); state.version += 1; }
function deckFor(state: GameState, noble: PlayerState) { return noble.id === state.kingPlayerId ? state.kingDeck : state.nobleDeck; }
function drawToEight(state: GameState, noble: PlayerState) { const deck = deckFor(state, noble); const needed = Math.max(0, 8 - noble.hand.length); const drawn = deck.splice(0, needed); noble.hand.push(...drawn); return drawn; }
function drawExtra(state: GameState, noble: PlayerState, count: number) { const deck = deckFor(state, noble); const drawn = deck.splice(0, count); noble.hand.push(...drawn); return drawn; }
function seatOrder(state: GameState) { return [...state.players].sort((a, b) => a.seat - b.seat); }
function nextAfter(state: GameState, id: string) { const ordered = seatOrder(state); const index = ordered.findIndex(noble => noble.id === id); return ordered[(index + 1) % ordered.length]!; }
function ensureEffects(state: GameState) { state.statusEffects ??= []; state.turnNumber ??= 1; }
function goldProtected(state: GameState, targetId: string, cardId?: string) { ensureEffects(state); return cardId !== "betrayal" && state.statusEffects.some(effect => effect.targetPlayerIds.includes(targetId) && ["isolation", "kings-eye"].includes(effect.type) && effect.expiresAtTurn >= state.turnNumber); }

export function createInitialState(hostName: string) {
  const hostId = nanoid(12); const hostToken = nanoid(28);
  const state: GameState = { players: [{ id: hostId, token: hostToken, name: hostName.trim().slice(0, 24), seat: 1, gold: 600, hand: [], table: [], joinedAt: Date.now() }], nobleDeck: shuffle(makeDeck("noble")), kingDeck: shuffle(makeDeck("king")), discard: [], kingPlayerId: null, currentPlayerId: null, playsRemaining: 0, phase: "playing", round: 1, maxRounds: 4, status: "lobby", events: [], statusEffects: [], turnNumber: 1, version: 1 };
  event(state, `${state.players[0]!.name} founded this court. Invite 3–7 more nobles with the room code.`, "crown");
  return { state, hostId, hostToken };
}

export function joinPlayer(state: GameState, name: string) {
  if (state.status !== "lobby" && state.status !== "playing") throw new Error("This game has already finished.");
  if (state.players.length >= MAX_PLAYERS) throw new Error("This court already has eight nobles.");
  const newPlayer: PlayerState = { id: nanoid(12), token: nanoid(28), name: name.trim().slice(0, 24), seat: state.players.length + 1, gold: 600, hand: [], table: [], joinedAt: Date.now() };
  state.players.push(newPlayer);
  if (state.status === "playing") drawToEight(state, newPlayer);
  event(state, `${newPlayer.name} joins the court${state.status === "playing" ? " during the current game and receives a fresh noble hand" : ""}.`); return newPlayer;
}
export function findPlayerForToken(state: GameState, token: string) { return state.players.find(candidate => candidate.token === token); }
export function kickPlayer(state: GameState, actorId: string, targetId: string, hostPlayerId: string) {
  if (state.status === "finished") throw new Error("This game has already finished.");
  if (actorId !== hostPlayerId) throw new Error("Only the host may remove a player.");
  if (targetId === hostPlayerId) throw new Error("The host cannot remove themselves.");
  const targetIndex = state.players.findIndex(noble => noble.id === targetId);
  if (targetIndex < 0) throw new Error("This player is no longer in the room.");
  const [removed] = state.players.splice(targetIndex, 1);
  state.players.forEach((noble, index) => { noble.seat = index + 1; });
  if (state.currentPlayerId === removed!.id) state.currentPlayerId = state.players.length ? state.players[0]!.id : null;
  if (state.kingPlayerId === removed!.id) {
    const successor = state.players.reduce((best, noble) => !best || noble.gold > best.gold ? noble : best, undefined as PlayerState | undefined);
    state.kingPlayerId = successor?.id ?? null;
    if (successor) event(state, `${removed!.name} was removed by the host. ${successor.name} inherits the crown.`, "crown");
  } else event(state, `${removed!.name} was removed from the court by the host.`, "system");
}

export function startGame(state: GameState, actorId: string, hostPlayerId: string) {
  if (actorId !== hostPlayerId) throw new Error("Only the host may begin the game.");
  if (state.status !== "lobby") throw new Error("The game has already begun.");
  if (state.players.length < MIN_PLAYERS) throw new Error("One King, One Crown needs at least four nobles.");
  state.status = "playing"; state.kingPlayerId = state.players[Math.floor(Math.random() * state.players.length)]!.id;
  const king = player(state, state.kingPlayerId); king.gold = 1000;
  state.players.filter(noble => noble.id !== king.id).forEach(noble => { noble.gold = 600; });
  state.players.forEach(noble => drawToEight(state, noble));
  state.currentPlayerId = king.id; state.playsRemaining = 3; state.phase = "playing";
  event(state, `${king.name} reveals the 1,000-gold card and becomes King. The King plays three cards first; each noble plays two.`, "crown");
}

function resolveCrownChange(state: GameState) {
  const king = state.kingPlayerId ? player(state, state.kingPlayerId) : undefined;
  if (!king) return;
  const challenger = state.players.find(noble => noble.id !== king.id && noble.gold > king.gold);
  if (!challenger) return;
  const oldHand = king.hand; king.hand = challenger.hand; challenger.hand = oldHand;
  const oldSeat = king.seat; king.seat = challenger.seat; challenger.seat = oldSeat;
  state.kingPlayerId = challenger.id;
  event(state, `${challenger.name} has more gold than the King and seizes the crown. Seats and cards are exchanged.`, "crown");
}

type PlayOptions = { targetPlayerId?: string; amount?: number };
function applyAutomaticEffect(state: GameState, actor: PlayerState, card: DeckCard, options: PlayOptions) {
  ensureEffects(state);
  const target = options.targetPlayerId ? player(state, options.targetPlayerId) : undefined;
  const amount = options.amount === 200 ? 200 : 100;
  switch (card.definitionId) {
    case "isolation": { state.statusEffects.push({ id: nanoid(10), type: "isolation", sourcePlayerId: actor.id, targetPlayerIds: [actor.id], expiresAtTurn: state.turnNumber + 1 }); return `${actor.name} is protected from card looks and gold theft until the end of their next turn.`; }
    case "kings-eye": { if (!target) return "Choose a player to protect with King's Eye."; state.statusEffects.push({ id: nanoid(10), type: "kings-eye", sourcePlayerId: actor.id, targetPlayerIds: [target.id], expiresAtTurn: state.turnNumber + 1 }); return `${target.name} is protected by King's Eye until ${actor.name}'s next turn.`; }
    case "shifting-tides": { if (!target) return "Choose the first noble; the second noble must be agreed at the table."; const second = state.players.find(noble => noble.id !== target.id && noble.id !== actor.id); if (!second) return "Not enough nobles for Shifting Tides."; state.statusEffects.push({ id: nanoid(10), type: "shifting-tides", sourcePlayerId: actor.id, targetPlayerIds: [target.id, second.id], expiresAtTurn: state.turnNumber + 1 }); return `${target.name} and ${second.name} may only take gold from each other until ${actor.name}'s next turn.`; }
    case "betrayal": { if (!target) return "Choose a noble to target."; const knight = target.table.findIndex(tableCard => tableCard.definitionId === "knight"); if (knight >= 0) { target.table.splice(knight, 1); return `${target.name}'s face-down Knight blocked Betrayal and was discarded.`; } const taken = target.gold; target.gold = 0; actor.gold += taken; return `${actor.name} took ${taken} gold from ${target.name}.`; }
    case "beggars-blessing": { const recipients = state.players.filter(noble => noble.gold <= 300); recipients.forEach(noble => { noble.gold += 200; }); return `${recipients.length} noble(s) received 200 gold.`; }
    case "subsidies": { state.players.forEach(noble => { if (noble.gold === 0) noble.gold += 300; else if (noble.gold >= 100 && noble.gold <= 300) noble.gold += 200; else if (noble.gold >= 400 && noble.gold <= 500) noble.gold += 100; }); return "Subsidies were calculated for every noble."; }
    case "eye-for-an-eye": { if (!target) return "Choose a target with the Gold desk to settle the losses."; actor.gold = clampGold(actor.gold - 100); target.gold = clampGold(target.gold - 300); return `${actor.name} and ${target.name} paid the bank.`; }
    case "shadow-deal": { if (!target) return "Choose a recipient with the Gold desk to settle the deal."; target.gold += amount; return `${target.name} received ${amount} gold from the bank.`; }
    case "loyal-dog": { if (!target) return "Choose a recipient with the Gold desk to settle Loyal Dog."; const gift = options.amount && [100, 200, 300].includes(options.amount) ? options.amount : 100; target.gold += gift; return `${target.name} received ${gift} gold from the bank and owes the pledge.`; }
    case "royal-bomb": { state.players.filter(noble => noble.id !== state.kingPlayerId).forEach(noble => { noble.gold = clampGold(noble.gold - 800); }); return "Royal Bomb detonated: every noble other than the king lost 800 gold."; }
    case "helping-hand": { const cards = drawExtra(state, actor, 2); state.playsRemaining += 1; return `${actor.name} drew ${cards.length} extra card(s) and gains one extra play.`; }
    case "meat-for-meat": { if (!target) return "Choose an opponent, roll both dice, and settle the payment."; const selfRoll = roll(); const rivalRoll = roll(); if (selfRoll > rivalRoll) { const paid = Math.min(200, target.gold); target.gold -= paid; actor.gold += paid; } return `${actor.name} rolled ${selfRoll}; ${target.name} rolled ${rivalRoll}. ${selfRoll > rivalRoll ? `${actor.name} collects 200 gold.` : "No gold changes hands."}`; }
    case "icarus": { const result = roll(); if (result >= 4) { state.players.filter(noble => noble.id !== actor.id).forEach(noble => { const paid = Math.min(100, noble.gold); noble.gold -= paid; actor.gold += paid; }); return `Icarus rolled ${result}: every other noble paid ${actor.name} 100 gold where possible.`; } state.players.filter(noble => noble.id !== actor.id).forEach(noble => { const paid = Math.min(100, actor.gold); actor.gold -= paid; noble.gold += paid; }); return `Icarus rolled ${result}: ${actor.name} paid every other noble 100 gold where possible.`; }
    case "unprotected": { const result = roll(); if (result >= 5) state.players.forEach(noble => { if (noble.id !== actor.id) noble.table = noble.table.filter(tableCard => tableCard.definitionId !== "knight"); }); return `Unprotected rolled ${result}${result >= 5 ? "; every other face-down Knight was removed." : "; no Knights were removed."}`; }
    default: return CARD_BY_ID[card.definitionId]?.prompt ?? "Resolve this card’s instruction with the court.";
  }
}

function completeTurn(state: GameState, actor: PlayerState) {
  ensureEffects(state);
  drawToEight(state, actor);
  const next = nextAfter(state, actor.id);
  if (next.id === state.kingPlayerId) { state.phase = "negotiation"; state.currentPlayerId = null; state.playsRemaining = 0; event(state, `All cards for round ${state.round} are played. Negotiation phase begins: trade cards, gold, promises, and alliances for two minutes.`, "system"); return; }
  state.currentPlayerId = next.id; state.playsRemaining = 2; state.turnNumber += 1; state.statusEffects = state.statusEffects.filter(effect => effect.expiresAtTurn >= state.turnNumber);
  event(state, `${next.name} is next and may play two cards.`, "system");
}

export function playCard(state: GameState, actorId: string, instanceId: string, options: PlayOptions = {}) {
  ensureEffects(state);
  if (state.status !== "playing") throw new Error("The court has not started a game.");
  const actor = player(state, actorId); const handIndex = actor.hand.findIndex(card => card.instanceId === instanceId); if (handIndex < 0) throw new Error("That card is not in your hand.");
  const card = actor.hand[handIndex]!; const outOfTurn = card.definitionId === "king-maker" && state.currentPlayerId !== actorId;
  const royalBombInNegotiation = card.definitionId === "royal-bomb" && state.phase === "negotiation";
  if (state.phase !== "playing" && !royalBombInNegotiation) throw new Error("Only Royal Bomb may be played during negotiation.");
  if (state.currentPlayerId !== actorId && !outOfTurn && !royalBombInNegotiation) throw new Error("Wait for your turn to play a card.");
  if (state.round === 1 && ["betrayal", "betray-the-king"].includes(card.definitionId)) throw new Error("This card cannot be played in round 1.");
  if (card.definitionId === "divine-right" && (state.round < 3 || actor.gold > 300)) throw new Error("Divine Right requires round 3–4 and 300 gold or less.");
  if (card.definitionId === "peoples-champion" && state.round !== 4) throw new Error("People’s Champion may only be played in round 4.");
  actor.hand.splice(handIndex, 1); const def = CARD_BY_ID[card.definitionId];
  if (def?.zone === "table") actor.table.push({ ...card, playedAt: Date.now(), faceDown: card.definitionId === "knight" }); else state.discard.push(card);
  const outcome = applyAutomaticEffect(state, actor, card, options); resolveCrownChange(state); event(state, `${actor.name} played ${def?.name ?? "a card"}. ${outcome}`, "card");
  if (!outOfTurn && !royalBombInNegotiation) { state.playsRemaining -= 1; if (state.playsRemaining <= 0) completeTurn(state, actor); }
}

export function adjustGold(state: GameState, actorId: string, targetId: string, amount: number, reason: string) { if (state.status !== "playing") throw new Error("Start the game before adjusting gold."); player(state, actorId); const target = player(state, targetId); const normalized = Math.max(-3000, Math.min(3000, Math.round(amount / 100) * 100)); if (!normalized) throw new Error("Enter a gold amount in steps of 100."); if (normalized < 0 && goldProtected(state, target.id)) throw new Error(`${target.name} is protected and cannot lose gold right now.`); target.gold = clampGold(target.gold + normalized); resolveCrownChange(state); event(state, `${target.name} ${normalized > 0 ? "gained" : "lost"} ${Math.abs(normalized)} gold${reason ? ` — ${reason.slice(0, 80)}` : ""}.`, "gold"); }
export function transferGold(state: GameState, actorId: string, fromId: string, toId: string, amount: number, reason: string) { if (state.status !== "playing") throw new Error("Start the game before transferring gold."); player(state, actorId); const from = player(state, fromId); const to = player(state, toId); if (from.id === to.id) throw new Error("Choose two different nobles."); ensureEffects(state); if (goldProtected(state, from.id)) throw new Error(`${from.name} is protected and cannot lose gold right now.`); const tides = state.statusEffects.find(effect => effect.type === "shifting-tides" && effect.expiresAtTurn >= state.turnNumber && effect.targetPlayerIds.includes(from.id)); if (tides && !tides.targetPlayerIds.includes(to.id)) throw new Error("Shifting Tides only allows gold between its two chosen nobles."); const proposed = Math.max(100, Math.min(3000, Math.round(amount / 100) * 100)); const paid = Math.min(from.gold, proposed); from.gold -= paid; to.gold += paid; resolveCrownChange(state); event(state, `${from.name} paid ${to.name} ${paid} gold${reason ? ` — ${reason.slice(0, 80)}` : ""}.`, "gold"); }
export function rollDice(state: GameState, actorId: string, label = "rolled the die") { if (state.status !== "playing") throw new Error("Start the game before rolling."); const actor = player(state, actorId); const result = roll(); event(state, `${actor.name} ${label.slice(0, 60)}: ${result}.`, "card"); return result; }
export function addChat(state: GameState, actorId: string, message: string) { const actor = player(state, actorId); const trimmed = message.trim().slice(0, 240); if (!trimmed) throw new Error("Write a message first."); event(state, `${actor.name}: ${trimmed}`); }
export function advanceTurn(state: GameState, actorId: string, hostPlayerId: string) { if (state.status !== "playing" || state.phase !== "negotiation") throw new Error("This control opens only during negotiation."); if (actorId !== hostPlayerId) throw new Error("Only the host may begin the next round."); if (state.round >= state.maxRounds) { state.status = "finished"; state.currentPlayerId = null; const king = state.kingPlayerId ? player(state, state.kingPlayerId) : undefined; const highestGold = Math.max(...state.players.map(noble => noble.gold)); const tied = state.players.filter(noble => noble.gold === highestGold); event(state, `Four rounds are complete. ${king?.name ?? "The crowned noble"} holds the crown with ${king?.gold ?? 0} gold. ${tied.length > 1 ? "The top gold total is tied; resolve the tie at the table." : "The crowned noble with the most gold wins."}`, "crown"); return; } state.round += 1; state.phase = "playing"; state.currentPlayerId = state.kingPlayerId; state.playsRemaining = 3; event(state, `Round ${state.round} begins. ${player(state, state.kingPlayerId!).name} plays first with three cards.`, "crown"); }
export function crownPlayer(state: GameState, actorId: string, newKingId: string) { player(state, actorId); const newKing = player(state, newKingId); state.kingPlayerId = newKing.id; event(state, `${newKing.name} now wears the crown.`, "crown"); }
export function snapshotRoom(room: { code: string; hostPlayerId: string; createdAt: Date; updatedAt: Date; state: GameState }, token?: string): RoomSnapshot { const viewer = token ? findPlayerForToken(room.state, token) : undefined; return { code: room.code, hostPlayerId: room.hostPlayerId, createdAt: room.createdAt, updatedAt: room.updatedAt, viewer: viewer ? { id: viewer.id, name: viewer.name, isHost: viewer.id === room.hostPlayerId } : null, state: { ...room.state, players: room.state.players.map(noble => ({ id: noble.id, name: noble.name, seat: noble.seat, gold: noble.gold, table: noble.table, joinedAt: noble.joinedAt, handCount: noble.hand.length, ...(viewer?.id === noble.id ? { hand: noble.hand } : {}) })) } }; }
