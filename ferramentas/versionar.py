"""Carimba estilo.css e app.js no index.html com o hash do conteúdo.

O GitHub Pages manda o navegador guardar cada arquivo por 10 minutos. Sem o
carimbo, logo depois de publicar alguém pode receber o HTML novo com o CSS
antigo. Rode antes de cada commit que mexa no CSS ou no JS:

    python3 ferramentas/versionar.py
"""
import hashlib
import re
from pathlib import Path

raiz = Path(__file__).resolve().parent.parent
html = raiz / "index.html"
s = html.read_text(encoding="utf-8")
for nome, attr in (("estilo.css", "href"), ("app.js", "src")):
    h = hashlib.sha1((raiz / nome).read_bytes()).hexdigest()[:8]
    s = re.sub(rf'{attr}="{re.escape(nome)}(\?v=\w+)?"', f'{attr}="{nome}?v={h}"', s)
html.write_text(s, encoding="utf-8")
print("ok")
