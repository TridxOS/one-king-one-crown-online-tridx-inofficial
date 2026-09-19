from pathlib import Path
p = Path('/home/ubuntu/one-king-one-crown-online/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('<span className="phase-pill">WARTESAAL</span></header>', '<div className="lobby-header-actions"><ThemeToggle /><span className="phase-pill">WARTESAAL</span></div></header>', 1)
s = s.replace('const busy = create.isPending || join.isPending || start.isPending || play.isPending || adjust.isPending || transfer.isPending || roll.isPending || nextTurn.isPending || sendChat.isPending || kick.isPending;', 'const busy = create.isPending || join.isPending || start.isPending || play.isPending || adjust.isPending || transfer.isPending || roll.isPending || nextTurn.isPending || sendChat.isPending || kick.isPending;\n  function requestKick(targetId: string, targetName: string) { if (window.confirm(`${targetName} wirklich aus dem Raum entfernen?`)) kick.mutate({ ...seat!, targetPlayerId: targetId }); }', 1)
s = s.replace('<main className="app-shell">\n    <header', '<main className="app-shell">\n    <header', 1)
old = '<span>{noble.id === room.viewer?.id ? "Du" : noble.id === room.state.kingPlayerId ? "König" : "Adliger"} · {noble.handCount} Karten{room.state.statusEffects?.some(effect => effect.targetPlayerIds.includes(noble.id)) ? " · geschützt" : ""}</span></div><Gold value={noble.gold} />'
new = '<span>{noble.id === room.viewer?.id ? "Du" : noble.id === room.state.kingPlayerId ? "König" : "Adliger"} · {noble.handCount} Karten{room.state.statusEffects?.some(effect => effect.targetPlayerIds.includes(noble.id)) ? " · geschützt" : ""}</span></div><Gold value={noble.gold} />{room.viewer?.isHost && noble.id !== room.viewer.id && <button className="kick-button mid-game-kick" disabled={busy} onClick={() => requestKick(noble.id, noble.name)}><UserX size={13} /> Kicken</button>}'
if old not in s:
    raise SystemExit('player row template not found')
s = s.replace(old, new, 1)
p.write_text(s)
print('updated controls')
