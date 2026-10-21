# rlight.com.br

Site do RLight, o estúdio de engenharia de Willian Rupert.

Estático: `index.html`, `estilo.css` e `app.js`, sem build e sem dependências.
O tema segue o sistema (claro ou escuro). Toda interação é melhoria
progressiva: sem JavaScript, a página continua legível de ponta a ponta.

Antes de cada commit que mexa no CSS ou no JS, carimbe as versões, para
ninguém receber o HTML novo com o CSS antigo do cache:

```bash
python3 ferramentas/versionar.py
```

Para ver localmente:

```bash
python3 -m http.server 8766
```

`assets/og.png` é gerado a partir de `assets/og-fonte.html` com o Chrome headless,
com o servidor local no ar:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1200,630 --screenshot=assets/og.png http://localhost:8766/assets/og-fonte.html
```

A marca mora em `assets/marca/`. O símbolo se simplifica conforme encolhe:

- `brilho.svg`: o R com o LED irradiando, para tamanhos grandes (imagem de
  compartilhamento, ícone de app, avatar).
- `icone.svg`: o mesmo R só com o pad aceso, para tamanhos pequenos (cabeçalho,
  rodapé, favicon).
- `app.svg` e `app-quadrado.svg`: o Brilho sobre grafite; o quadrado, sem cantos,
  é a base do `apple-touch-icon.png`, que o iOS arredonda sozinho.
