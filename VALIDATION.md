# Validation record

The application was validated on 17 September 2026 against the local managed preview.

The landing page rendered with the German room creation/join experience, visible license notice, and the stated four-round, four-to-eight-player, 99-card format. A browser-created room accepted three simulated participant joins and correctly exposed the start control at four players. Starting the game produced the table view with one randomly-selected King at 1,000 gold, three nobles at 600 gold, eight private cards per player, an 18-card King deck reduced to 10 after dealing, an 81-card noble deck reduced to 57 after dealing, and a 0-card discard pile.

The rendered table showed the active-player banner, seat order, gold ledger, dice action, private hand, activity chronicle, room-code action, responsive card strip, and expandable complete card catalog. The catalog visibly identifies 99 cards split into 81 noble and 18 king cards and carries a CC BY-NC-SA 4.0 attribution notice. Unit tests also verify the full deck count, official starting conditions, privacy of another player’s hand, and automated Shadow Deal effect.

No runtime console errors were reported after the application reload. The product test room uses code `WTSFEQ`; it is isolated from the app UI and not referenced by the released interface.

A further live interaction test gave the original host 500 gold via the visible Gold-Tresor. Once the noble reached 1,100 gold versus the incumbent King’s 1,000, the application immediately changed the crown, swapped the two players’ seats, and swapped the browser’s private hand from noble cards to king cards. The activity chronicle recorded both the bank change and automatic transfer. This confirms the central power-transfer rule is implemented end-to-end.

## Host moderation and contrast update

The host lobby was opened in the browser with three temporary guests. The host-only **Entfernen** control rendered on each guest seat and did not render on the host's own seat. The page showed the removal action next to Adele, Bram, and Cora and retained a usable start control. Server tests verify that a guest cannot invoke the kick engine, the host can remove a guest, and remaining seats are compacted. Numeric contrast was improved for player gold totals, table gold totals, deck counters, and gold/transfer form controls; the kick action uses a clear red-tinted accessible button.

## Dark mode, rejoin, and mid-game moderation

The landing page now exposes a persistent theme toggle. Browser verification confirmed the toggle changes from **Hell** to **Dunkel**, updates the root theme, and applies the light-mode palette; light-mode hero contrast was corrected after visual inspection. The active-room engine tests cover joining an already-playing room with a fresh eight-card noble hand and host removal from that active state. The same `game.join` procedure is used for normal and active-room rejoin, while the local seat token continues to restore an existing player automatically.
