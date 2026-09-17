export type CardZone = "discard" | "table";

export type CardDefinition = {
  id: string;
  name: string;
  copies: number;
  text: string;
  prompt: string;
  zone?: CardZone;
  timing?: string;
};

/**
 * Complete card catalog transcribed from the supplied Official Print & Play PDF.
 * Card rules and artwork are licensed CC BY-NC-SA 4.0 by the original designer.
 */
export const CARD_DEFINITIONS: CardDefinition[] = [
  { id: "actors", name: "Actors", copies: 3, text: "Everyone must thank the king for their glorious rule however horrible and cruel it might have been. Everyone must laugh at the player of your choice.", prompt: "Choose the noble to be laughed at, then let the table perform the decree." },
  { id: "allies", name: "Allies", copies: 3, text: "Pick a noble. They choose if you gain 100 gold or lose 200 to the bank. Other players can convince them to take the second option.", prompt: "Choose a noble; record their decision with the gold controls." },
  { id: "bad-blood", name: "Bad Blood", copies: 3, text: "Pick two nobles. You gain 200 gold from the bank at the beginning of every round until one of them gives the other 200 gold. They can make this payment out of turn.", prompt: "Choose two nobles and leave a note in the activity log to track the ongoing pact.", zone: "table" },
  { id: "beggars-blessing", name: "Beggar’s Blessing", copies: 3, text: "All nobles with 300 gold or lower gain 200.", prompt: "Apply +200 gold to every eligible noble." },
  { id: "betrayal", name: "Betrayal", copies: 3, text: "Take all gold from another noble. Requires vocal support from another noble after it’s played or it has no effect. Not playable in the first round.", prompt: "Choose a target, obtain vocal support, then transfer all their gold if successful.", timing: "Not playable in round 1" },
  { id: "betray-the-king", name: "Betray the King", copies: 3, text: "The king rolls: 1–3, you switch places and gold. 4–6, they remain king and gain 200 gold from the bank. After it’s played, you must gain vocal support from TWO players or it has no effect. Not playable in the first round.", prompt: "Get support from two nobles, roll for the king, then use Crown player and gold controls to settle the result.", timing: "Not playable in round 1" },
  { id: "council-meeting", name: "Council Meeting", copies: 3, text: "If all players vote yes, you take 100 gold from the king. If one votes no, you lose 100 to the bank. Draw two cards, but you must praise the king.", prompt: "Open a vote, then draw two cards and settle the result." },
  { id: "divine-right", name: "Divine Right", copies: 1, text: "If you roll 5+: You gain 1200 gold. Play only if you have 300 gold or less. Can only be played or discarded in the last 2 rounds.", prompt: "Confirm timing and gold requirement, then roll and settle the result.", timing: "Only in rounds 3–4; player must have 300 gold or less" },
  { id: "grudge", name: "Grudge", copies: 2, text: "Pick a player. They have to agree to you taking 200 gold from the noble of your choice. If they disagree, you lose 100 gold to the bank.", prompt: "Ask the chosen player for a decision and settle the chosen gold change." },
  { id: "helping-hand", name: "Helping Hand", copies: 4, text: "Draw 2 extra cards and play an extra card. So, if this is your first card, you get to play 3 more now.", prompt: "Draw two cards, then keep the turn active for the extra play." },
  { id: "hindsight", name: "Hindsight", copies: 2, text: "Back a specific noble to play the Betrayal card before the end of the next round. If correct, gain 300 gold from the bank. If not, lose 100. Keep this in front of you until then.", prompt: "Choose and record your prediction in a private note; keep this card on your table.", zone: "table" },
  { id: "icarus", name: "Icarus", copies: 2, text: "If you roll a 4–6, all nobles must pay you 100 gold. If you fail, you must pay each noble 100 gold. You can only play this card if you can afford it.", prompt: "Confirm you can afford the loss, roll, then use transfers to settle all payments." },
  { id: "indebted", name: "Indebted", copies: 2, text: "If you roll a 3–6, a noble has to pay you 100 gold at the beginning of every round until another player frees them by paying you 200. This payment can be made at any time. Any debts are gone if you become king.", prompt: "Roll, choose a debtor if successful, and track the debt in the activity log.", zone: "table" },
  { id: "isolation", name: "Isolation", copies: 3, text: "No one can look at your cards until the end of your next turn. No one can take gold from you until the end of your next turn. This does not apply to the Betrayal card.", prompt: "Keep this card on the table until the end of your next turn and honor the protection.", zone: "table" },
  { id: "king-maker", name: "King Maker", copies: 2, text: "Play this card out of turn when you or someone plays Betray the King. Choose a side: support (+1 to the King’s roll) or oppose (-1 to the King’s roll). If your side fails, pay 300 gold to the bank.", prompt: "Play only in response to Betray the King; announce your side and adjust the king’s roll." },
  { id: "knight", name: "Knight", copies: 3, text: "Place this card FACE DOWN in front of you to protect you from one betrayal. Placing a knight down counts as a card played.", prompt: "Place it face-down on your table. It blocks one Betrayal and cannot be inspected.", zone: "table" },
  { id: "loyalty", name: "Loyalty", copies: 3, text: "Pick a player. They choose whether to pay you 100 gold or force the king pay you. Force a player to pay the king 100 gold and pledge their loyalty to them.", prompt: "Choose a player, record their choice, and settle the resulting payment." },
  { id: "meat-for-meat", name: "Meat for Meat", copies: 4, text: "You and another noble roll. If you roll higher, you collect 200 from them.", prompt: "Choose another noble; both roll and transfer 200 if you win." },
  { id: "peoples-champion", name: "People’s Champion", copies: 1, text: "Nominate a noble as King. If all other nobles agree, they roll against the current King to take the throne. Can only be played or discarded in the last round.", prompt: "Confirm it is round 4, nominate a noble, collect unanimous consent, then roll off and crown the winner.", timing: "Only in round 4" },
  { id: "royal-bomb", name: "Royal Bomb", copies: 1, text: "You and everyone else (excluding the king) lose 800 gold. This card cannot be stolen and can only be discarded or played by you during the Negotiation Phase. If you become king, the card is discarded. Use this card to pressure and negotiate.", prompt: "Only use in negotiation. If played, apply -800 gold to every noble except the king.", timing: "Negotiation phase only" },
  { id: "scout", name: "Scout", copies: 2, text: "Back a noble to become king by the end of the next round. If you’re correct, earn 300 gold from the bank. If you’re wrong, lose 100. Keep this card in front of you until then.", prompt: "Choose and privately record a prediction; keep this card on your table.", zone: "table" },
  { id: "shadow-deal", name: "Shadow Deal", copies: 6, text: "Give another player 100 or 200 gold (you pick) from the bank. You can give it to the king.", prompt: "Choose any noble and give them 100 or 200 gold from the bank." },
  { id: "sub-rosa-search", name: "Sub Rosa", copies: 4, text: "Look at any player’s hand or one face down knight card (pick one). If you roll a 4 or higher you can take a card from their hand.", prompt: "Choose an inspection target, then roll; on 4+ take one card with the table’s agreement." },
  { id: "subsidies", name: "Subsidies", copies: 3, text: "All nobles get gold for as much gold as they have: No gold — Receive 300; 100–300 — Receive 200; 400–500 — Receive 100.", prompt: "Apply subsidies to all nobles according to their current gold." },
  { id: "suppress-rebellion", name: "Suppress Rebellion", copies: 2, text: "If the king pathetically rolls a 1–3, the bank must give you 200 gold and every other noble 100 gold.", prompt: "Have the king roll; on 1–3 award the specified bank payments." },
  { id: "tithe", name: "Tithe", copies: 2, text: "Pick a player. They must pick a noble to give you 100 gold.", prompt: "Choose a player; they choose a paying noble, then transfer 100 gold to you." },
  { id: "unprotected", name: "Unprotected", copies: 2, text: "If you roll a 5–6, all face down knights in play are removed except yours.", prompt: "Roll; on 5–6 remove all other face-down Knight cards from tables." },
  { id: "wrath", name: "Wrath", copies: 4, text: "You lose 100 gold, but a noble of your choice loses 300. Make a player lose 100 to the bank.", prompt: "Choose nobles and settle all listed bank losses." },
  { id: "black-plague", name: "Black Plague", copies: 1, text: "All nobles pair up and each roll a die. If either noble in a pair rolls a 1, both nobles in that pair lose 200 gold. If there is an odd number of nobles, roll with a lone one, but only they lose gold.", prompt: "Pair nobles, have every pair roll, and apply bank losses to affected pairs." },
  { id: "eye-for-an-eye", name: "Eye for an Eye", copies: 1, text: "You lose 100 gold to the bank but a player of your choice loses 300.", prompt: "Choose a noble and settle both bank losses." },
  { id: "bend-the-knee", name: "Bend the Knee", copies: 2, text: "Force a player to thank you for everything you’ve done for them. If they refuse, they pay the bank 300 gold. If they cannot afford to, they must thank you.", prompt: "Choose a player and settle any refusal with the bank loss." },
  { id: "anchor", name: "Anchor", copies: 1, text: "Player loses 200 gold to the bank or lets the player of your choice lose 100 to you.", prompt: "Choose a player; record whether they pay the bank 200 or permit the alternative loss." },
  { id: "anchor-noble", name: "Anchor", copies: 1, text: "Player loses 200 gold to the bank or lets the player of your choice lose 100 to you.", prompt: "Choose a player; record whether they pay the bank 200 or permit the alternative loss." },
  { id: "loyal-dog", name: "Loyal Dog", copies: 3, text: "Give a player 100 to 300 gold (you pick) from the bank but they must say ‘Thank you my king, I pledge my loyalty to you my king.’", prompt: "Choose an amount and recipient; award the bank gold after the pledge." },
  { id: "mad-king", name: "Mad King", copies: 1, text: "Force everyone to roll dice. Whoever rolls a 1 loses 300 to the bank. You must roll too. If you roll a 1 you lose 500.", prompt: "Have all nobles roll, then apply the respective bank losses." },
  { id: "debt-collector", name: "Debt Collector", copies: 2, text: "Pick a player. This player picks someone to lose 200 gold to the bank.", prompt: "Choose a player; they choose the noble who loses 200 gold." },
  { id: "royal-parrot", name: "Royal Parrot", copies: 2, text: "As the royal parrot, a player of your choice has to pay the bank 100 gold then repeat a sentence you give them in a high-pitched voice. 300 to the bank if they refuse.", prompt: "Choose a player, then settle their payment and response." },
  { id: "shifting-tides", name: "Shifting Tides", copies: 1, text: "Pick two nobles. They can only take gold from each other until your next turn. This does not include Betrayal cards.", prompt: "Choose two nobles and post the restriction; remove it at the start of your next turn.", zone: "table" },
  { id: "snakes", name: "Snakes", copies: 1, text: "Pick a player and announce it. All nobles must vote by raising their hand. If even one noble raises their hand, the chosen player loses 300 gold to the bank.", prompt: "Choose a player, take a public vote, and apply the loss if at least one noble votes yes." },
  { id: "sub-rosa-discard", name: "Sub Rosa", copies: 2, text: "Look at another player’s hand. If you roll a 4 or higher, you can also discard a card.", prompt: "Choose another hand to inspect, roll, then discard a card on 4+." },
  { id: "scapegoat", name: "Scapegoat", copies: 1, text: "Each noble must vote on another noble to lose 300 gold to the bank, starting from the noble to your left. A tie is decided by a dice roll.", prompt: "Run a vote, resolve any tie by dice, and apply the 300-gold bank loss." },
  { id: "kings-eye", name: "King’s Eye", copies: 2, text: "Protect a player of your choice until your next turn. If a noble looks at their cards or takes gold from them, they must pay the bank 100 gold.", prompt: "Choose a protected noble and post the protection until your next turn.", zone: "table" },
  { id: "we-ride-together", name: "We Ride Together", copies: 2, text: "Pick two players. Whoever rolls lower between them has to lose 200 gold to the bank. Players can agree to lose 100 gold each instead only AFTER they both roll. Roll again if they tie.", prompt: "Choose two nobles, have them roll, then settle the loss or their shared agreement." },
];

export type DeckCard = { instanceId: string; definitionId: string };

/** The crown-backed sheets on PDF pages 25 and 27 form the King's 18-card deck. */
export const KING_CARD_IDS = new Set([
  "anchor", "loyal-dog", "mad-king", "debt-collector", "royal-parrot",
  "shifting-tides", "snakes", "sub-rosa-discard", "scapegoat", "kings-eye", "we-ride-together",
]);

export function makeDeck(deck: "noble" | "king" | "all" = "all"): DeckCard[] {
  return CARD_DEFINITIONS.filter(card => deck === "all" || (deck === "king" ? KING_CARD_IDS.has(card.id) : !KING_CARD_IDS.has(card.id))).flatMap(card =>
    Array.from({ length: card.copies }, (_, index) => ({
      instanceId: `${card.id}-${index + 1}`,
      definitionId: card.id,
    })),
  );
}

export const CARD_BY_ID = Object.fromEntries(CARD_DEFINITIONS.map(card => [card.id, card]));
export const DECK_SIZE = makeDeck("all").length;
