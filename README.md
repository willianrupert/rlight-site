# rlight.com.br

Site do RLight, o estúdio de engenharia de Willian Rupert.

Estático: `index.html`, `estilo.css` e `app.js`, sem build e sem dependências.
O tema segue o sistema (claro ou escuro). Toda interação é melhoria
progressiva: sem JavaScript, a página continua legível de ponta a ponta.

Para ver localmente:

```bash
python3 -m http.server 8766
```

`assets/og.png` é gerado a partir de `assets/og-fonte.svg` com o Chrome headless
(1200 × 630).
