from pathlib import Path
p = Path('/home/ubuntu/one-king-one-crown-online/client/src/pages/Home.tsx')
s = p.read_text()
old = '<span className="nav-license">OFFIZIELLE PNP-ADAPTION · CC BY-NC-SA 4.0</span></nav>'
new = '<span className="nav-license">OFFIZIELLE PNP-ADAPTION · CC BY-NC-SA 4.0</span><ThemeToggle /></nav>'
if old not in s:
    raise SystemExit('landing nav not found')
p.write_text(s.replace(old, new, 1))
print('updated landing theme control')
