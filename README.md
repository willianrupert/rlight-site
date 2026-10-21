# rlight.com.br

Site do RLight, o estúdio de engenharia de Willian Rupert.

Estático: `index.html`, `estilo.css` e `app.js`, sem build e sem dependências.
O tema segue o sistema (claro ou escuro). Toda interação é melhoria
progressiva: sem JavaScript, a página continua legível de ponta a ponta.

Para ver localmente:

```bash
python3 -m http.server 8766
```

`assets/og.png` é gerado a partir de `assets/og-fonte.html` com o Chrome headless,
com o servidor local no ar:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1200,630 --screenshot=assets/og.png http://localhost:8766/assets/og-fonte.html
```

A marca mora em `assets/marca/`: `icone.svg` (o Traço), `app.svg` (ícone de app)
e `app-quadrado.svg` (base do `apple-touch-icon.png`, sem cantos, que o iOS arredonda).
