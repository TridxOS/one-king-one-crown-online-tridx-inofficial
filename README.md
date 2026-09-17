# One King, One Crown — Online

A German-language, browser-based multiplayer adaptation of the user-provided **One King One Crown** official print-and-play edition. It provides a private room workflow for **4–8 players**, private hands, simultaneous state refresh, an activity chronicle, card-aware assistance, dice, a visible gold ledger, two-minute negotiation checkpoints, and automatic crown, seat, and hand transfer when a noble exceeds the king’s gold.

## Included rules and components

The implementation follows the official explainer: four rounds; one randomly chosen king begins at 1,000 gold with eight cards from the king deck; each noble begins at 600 gold with eight cards from the noble deck; the king plays three cards per playing phase, each noble plays two, then all hands refill to eight. After the playing phase, the host advances from the negotiation phase. The card catalog contains **all 99 cards** from the supplied PDF: 81 noble-deck cards and 18 king-deck cards. Objective consequences—deck routing, turn flow, gold transfers, dice results, card discard/table state, subsidies, Shadow Deal, Royal Bomb, Helping Hand, Icarus, Meat for Meat, Unprotected, and power transfer—are handled by the app. Social-decision cards include their exact text, timing checks, target prompts, and a public chronicle entry so the people at the table can conduct votes, promises, vocal support, hidden predictions, and role-play together.

## Hosting

The project is a standard full-stack TypeScript application. The managed preview starts with `pnpm dev`; the production commands are `pnpm build` and `pnpm start`. A MySQL-compatible database is required because rooms and private seat tokens are stored server-side. The included `drizzle/0001_simple_klaw.sql` migration creates the room table. On the managed project environment the database migration has already been applied.

For a public production release, deploy the whole project to a Node.js host with a persistent MySQL-compatible database and set the template’s environment variables. The source uses short polling rather than a long-lived WebSocket connection, so it works on ordinary serverless/managed web hosting. Each browser keeps a random private seat token in local storage; players should use one browser profile per seat and should not share that token. The room code is not a password, so share it only with the intended group.

## Verification

Run `pnpm test`, `pnpm check`, and `pnpm build`. Tests cover the 99-card catalog, correct starting cards/gold, hand privacy, automatic Shadow Deal transfer, and Royal Bomb’s negotiation-only timing. See `VALIDATION.md` for the browser validation record.

## License and attribution

This is a **noncommercial adaptation** of the official One King One Crown print-and-play package provided in this task. The supplied PDF states that the original material is licensed under [Creative Commons Attribution–NonCommercial–ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/). The app keeps a visible attribution and license notice and must remain free to use, not be sold, and not be placed behind a paywall. Any distributed derivative must credit the original design and remain under the same CC BY-NC-SA 4.0 terms.
