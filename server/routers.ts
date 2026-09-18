import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createRoom, getRoomByCode, saveRoomState } from "./db";
import { addChat, adjustGold, advanceTurn, crownPlayer, createInitialState, findPlayerForToken, joinPlayer, kickPlayer, playCard, rollDice, snapshotRoom, startGame, transferGold } from "./gameEngine";

const nameInput = z.string().trim().min(2, "Use at least two characters.").max(24, "Use 24 characters or fewer.");
const roomInput = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/, "Enter a six-character room code.");
const tokenInput = z.string().min(12);
const credentials = z.object({ code: roomInput, token: tokenInput });

async function roomAndPlayer(code: string, token: string) {
  const room = await getRoomByCode(code);
  if (!room) throw new Error("This court could not be found.");
  const player = findPlayerForToken(room.state, token);
  if (!player) throw new Error("This seat belongs to another noble. Join again with this browser.");
  return { room, player };
}

async function uniqueRoomCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = nanoid(6).replace(/[_-]/g, "A").toUpperCase();
    if (!(await getRoomByCode(code))) return code;
  }
  throw new Error("Unable to create a unique room code. Please try again.");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  game: router({
    create: publicProcedure.input(z.object({ name: nameInput })).mutation(async ({ input }) => {
      const { state, hostId, hostToken } = createInitialState(input.name);
      const code = await uniqueRoomCode();
      const room = await createRoom(code, hostId, state);
      if (!room) throw new Error("The court could not be created.");
      return { token: hostToken, room: snapshotRoom(room, hostToken) };
    }),
    join: publicProcedure.input(z.object({ code: roomInput, name: nameInput, token: z.string().optional() })).mutation(async ({ input }) => {
      const room = await getRoomByCode(input.code);
      if (!room) throw new Error("No court was found with that code.");
      if (input.token) {
        const previous = findPlayerForToken(room.state, input.token);
        if (previous) return { token: previous.token, room: snapshotRoom(room, previous.token) };
      }
      const newPlayer = joinPlayer(room.state, input.name);
      const saved = await saveRoomState(room.code, room.state);
      if (!saved) throw new Error("The seat could not be saved.");
      return { token: newPlayer.token, room: snapshotRoom(saved, newPlayer.token) };
    }),
    get: publicProcedure.input(credentials).query(async ({ input }) => {
      const { room } = await roomAndPlayer(input.code, input.token);
      return snapshotRoom(room, input.token);
    }),
    start: publicProcedure.input(credentials).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      startGame(room.state, player.id, room.hostPlayerId);
      const saved = await saveRoomState(room.code, room.state);
      return snapshotRoom(saved!, input.token);
    }),
    kick: publicProcedure.input(credentials.extend({ targetPlayerId: z.string() })).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      kickPlayer(room.state, player.id, input.targetPlayerId, room.hostPlayerId);
      const saved = await saveRoomState(room.code, room.state);
      return snapshotRoom(saved!, input.token);
    }),
    play: publicProcedure.input(credentials.extend({ instanceId: z.string().min(3), targetPlayerId: z.string().optional(), amount: z.number().optional() })).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      playCard(room.state, player.id, input.instanceId, { targetPlayerId: input.targetPlayerId, amount: input.amount });
      const saved = await saveRoomState(room.code, room.state);
      return snapshotRoom(saved!, input.token);
    }),
    adjustGold: publicProcedure.input(credentials.extend({ targetPlayerId: z.string(), amount: z.number(), reason: z.string().max(80).optional() })).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      adjustGold(room.state, player.id, input.targetPlayerId, input.amount, input.reason ?? "");
      const saved = await saveRoomState(room.code, room.state);
      return snapshotRoom(saved!, input.token);
    }),
    transfer: publicProcedure.input(credentials.extend({ fromPlayerId: z.string(), toPlayerId: z.string(), amount: z.number(), reason: z.string().max(80).optional() })).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      transferGold(room.state, player.id, input.fromPlayerId, input.toPlayerId, input.amount, input.reason ?? "");
      const saved = await saveRoomState(room.code, room.state);
      return snapshotRoom(saved!, input.token);
    }),
    roll: publicProcedure.input(credentials.extend({ label: z.string().max(60).optional() })).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      const result = rollDice(room.state, player.id, input.label);
      const saved = await saveRoomState(room.code, room.state);
      return { result, room: snapshotRoom(saved!, input.token) };
    }),
    nextTurn: publicProcedure.input(credentials).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      advanceTurn(room.state, player.id, room.hostPlayerId);
      const saved = await saveRoomState(room.code, room.state);
      return snapshotRoom(saved!, input.token);
    }),
    crown: publicProcedure.input(credentials.extend({ playerId: z.string() })).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      crownPlayer(room.state, player.id, input.playerId);
      const saved = await saveRoomState(room.code, room.state);
      return snapshotRoom(saved!, input.token);
    }),
    chat: publicProcedure.input(credentials.extend({ message: z.string().min(1).max(240) })).mutation(async ({ input }) => {
      const { room, player } = await roomAndPlayer(input.code, input.token);
      addChat(room.state, player.id, input.message);
      const saved = await saveRoomState(room.code, room.state);
      return snapshotRoom(saved!, input.token);
    }),
  }),
});

export type AppRouter = typeof appRouter;
