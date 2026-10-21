// RLight · interações. Tudo é melhoria progressiva: sem JS, a página lê inteira.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vibra = (ms = 8) => { try { navigator.vibrate?.(ms); } catch {} };
  const captura = (el, ev) => { try { el.setPointerCapture(ev.pointerId); } catch {} };

  // Bipe curto do leitor. O AudioContext só nasce depois de um gesto.
  let audio;
  const bipe = (freq = 1760, dur = 0.07) => {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = freq; o.type = 'sine';
      g.gain.setValueAtTime(0.0001, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      o.connect(g).connect(audio.destination);
      o.start(); o.stop(audio.currentTime + dur + 0.02);
    } catch {}
  };

  // ------------------------------------------------------------ barra
  const barra = $('.barra');
  const aoRolar = () => barra.classList.toggle('rolou', scrollY > 8);
  addEventListener('scroll', aoRolar, { passive: true }); aoRolar();

  // ------------------------------------------------------------ revelar
  const revela = $$('.revela');
  const grupos = new Map();
  revela.forEach(el => {
    const p = el.parentElement, i = grupos.get(p) ?? 0;
    grupos.set(p, i + 1);
    el.style.setProperty('--atraso', `${Math.min(i, 5) * 0.08}s`);
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revela.forEach(el => io.observe(el));

  // ------------------------------------------------------------ circuito
  const svg = $('#circuito'), luz = $('#luz'), circuito = $('.circuito');
  if (svg) {
    const ponto = svg.createSVGPoint();
    const segue = ev => {
      ponto.x = ev.clientX; ponto.y = ev.clientY;
      const p = ponto.matrixTransform(svg.getScreenCTM().inverse());
      luz.setAttribute('cx', Math.max(80, Math.min(440, p.x)));
      luz.setAttribute('cy', Math.max(80, Math.min(360, p.y)));
    };
    circuito.addEventListener('pointermove', segue);
    circuito.addEventListener('pointerleave', () => { luz.setAttribute('cx', 260); luz.setAttribute('cy', 220); });
    let t;
    $('#chip').addEventListener('click', () => {
      circuito.classList.add('rapido'); vibra(12); bipe(1320, 0.05);
      clearTimeout(t); t = setTimeout(() => circuito.classList.remove('rapido'), 1800);
    });
  }

  // ------------------------------------------------------------ Adsum
  const cracha = $('#cracha'), leitor = $('#leitor');
  if (cracha) {
    const nomes = ['Ana Beatriz', 'João Pedro', 'Marina Costa', 'Lucas Andrade', 'Beatriz Lima', 'Rafael Souza', 'Clara Mendes', 'Davi Ribeiro', 'Helena Rocha', 'Gabriel Nunes'];
    let i = 0, presentes = 0;
    const lista = $('#lista'), total = $('#presentes'), nomeEl = $('#cracha-nome'), planilha = $('#planilha');
    const hora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const ler = () => {
      leitor.classList.remove('leu'); void leitor.offsetWidth; leitor.classList.add('leu');
      bipe(); vibra(10);
      const li = document.createElement('li');
      li.innerHTML = `${nomes[i % nomes.length]}<span>presente · ${hora()}</span>`;
      lista.prepend(li);
      while (lista.children.length > 4) lista.lastElementChild.remove();
      presentes = Math.min(48, presentes + 1); total.textContent = presentes;
      if (presentes >= 3) { planilha.hidden = false; planilha.style.animation = 'none'; void planilha.offsetWidth; planilha.style.animation = ''; }
      i++;
      setTimeout(() => { nomeEl.textContent = nomes[i % nomes.length]; }, 250);
    };

    const delta = () => {
      const a = cracha.getBoundingClientRect(), b = leitor.getBoundingClientRect();
      return { x: (b.left + b.width / 2) - (a.left + a.width / 2), y: (b.top + b.height / 2) - (a.top + a.height / 2) };
    };
    const volta = () => { cracha.style.transform = ''; leitor.classList.remove('perto'); };

    let ini = null, moveu = false, ocupado = false;
    cracha.addEventListener('pointerdown', ev => {
      if (ocupado) return;
      ini = { x: ev.clientX, y: ev.clientY }; moveu = false;
      captura(cracha, ev);
    });
    cracha.addEventListener('pointermove', ev => {
      if (!ini) return;
      const dx = ev.clientX - ini.x, dy = ev.clientY - ini.y;
      if (!moveu && Math.hypot(dx, dy) < 6) return;
      moveu = true; cracha.classList.add('arrastando');
      cracha.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * -0.03}deg)`;
      const a = cracha.getBoundingClientRect(), b = leitor.getBoundingClientRect();
      const sobre = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
      leitor.classList.toggle('perto', sobre);
    });
    const solta = () => {
      if (!ini) return;
      ini = null; cracha.classList.remove('arrastando');
      if (!moveu) return;
      if (leitor.classList.contains('perto')) ler();
      volta();
    };
    cracha.addEventListener('pointerup', solta);
    cracha.addEventListener('pointercancel', () => { ini = null; cracha.classList.remove('arrastando'); volta(); });

    // Toque, clique ou teclado: o crachá vai sozinho até o leitor e volta.
    cracha.addEventListener('click', () => {
      if (moveu || ocupado) { moveu = false; return; }
      ocupado = true;
      const d = delta();
      cracha.style.transform = `translate(${d.x * 0.62}px, ${d.y}px) rotate(-4deg)`;
      setTimeout(ler, calmo ? 0 : 380);
      setTimeout(() => { volta(); ocupado = false; }, calmo ? 50 : 760);
    });
  }

  // ------------------------------------------------------------ Pendant: carrossel
  const carrossel = $('#carrossel');
  if (carrossel) {
    const figs = $$('figure', carrossel), pts = $$('#pontinhos i');
    const marca = n => { figs.forEach((f, k) => f.classList.toggle('atual', k === n)); pts.forEach((p, k) => p.classList.toggle('atual', k === n)); };
    marca(0);
    const ioc = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) marca(figs.indexOf(e.target));
    }), { root: carrossel, threshold: 0.6 });
    figs.forEach(f => ioc.observe(f));
    figs.forEach(f => f.addEventListener('click', () => f.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })));
  }

  // ------------------------------------------------------------ Portaria: passos
  const passos = $$('#passos .passo'), notif = $('#notificacao');
  if (passos.length) {
    let atual = -1, timer, visivel = false;
    const vai = n => {
      atual = n;
      passos.forEach((p, k) => { p.classList.toggle('atual', k === n); p.classList.toggle('feito', k < n); });
      notif.classList.toggle('mostra', n === passos.length - 1);
    };
    const passo = () => {
      clearTimeout(timer);
      if (!visivel) return;
      const prox = atual + 1;
      if (prox >= passos.length) { timer = setTimeout(() => { vai(-1); timer = setTimeout(passo, 700); }, 2600); return; }
      vai(prox);
      timer = setTimeout(passo, prox === passos.length - 1 ? 3200 : 1500);
    };
    passos.forEach((p, k) => p.addEventListener('click', () => { vai(k); clearTimeout(timer); timer = setTimeout(passo, 4000); }));
    new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel) passo(); else clearTimeout(timer);
    }, { threshold: 0.4 }).observe($('#passos'));
  }

  // ------------------------------------------------------------ Caixa d'água: a máquina de estados
  const inox = $('#inox');
  if (inox) {
    const COR = { vermelho: '#ff3b30', azul: '#0a84ff', verde: '#30d158', amarelo: '#ffd60a', roxo: '#bf5af2', branco: '#ffffff' };
    const E = {
      E0: { nome: 'Standby', led: 'transparent', nivel: 28, desc: 'LED apagado: tudo certo. Toque para encher; segure para pausar.' },
      E1: { nome: 'Pré-partida', led: COR.vermelho, nivel: 28, desc: 'A bomba nunca liga de surpresa: o LED avisa antes da partida.' },
      E3: { nome: 'Enchendo', led: COR.azul, nivel: 92, desc: 'Enchendo no manual. Toque de novo para desligar.' },
      E4: { nome: 'Caixa cheia', led: COR.verde, nivel: 92, desc: 'A boia de cima fechou. O verde fica um minuto (aqui, três segundos) e volta ao repouso.' },
      E8: { nome: 'Pausa', led: COR.amarelo, desc: 'Manutenção: nada liga a bomba, nem as boias. Segure de novo para sair.' },
      E5: { nome: 'Contator soldado', led: COR.branco, pisca: true, desc: 'Relé desligado e corrente no motor. Desligue o disjuntor. Toque para reconhecer.' },
      E6: { nome: 'Rotor preso', led: COR.vermelho, pisca: true, desc: 'Sobrecorrente: a bomba parou na hora. Só volta com um toque humano.' },
      E7: { nome: 'Bomba a seco', led: COR.azul, pisca: true, desc: 'Subcorrente: a cisterna secou. Só volta com um toque humano.' },
    };
    const agua = $('#agua'), cod = $('#estado-codigo'), nome = $('#estado-nome'), desc = $('#estado-desc');
    let estado = 'E0', timers = [];
    const limpa = () => { timers.forEach(clearTimeout); timers = []; };
    const depois = (ms, fn) => timers.push(setTimeout(fn, ms));
    const vai = e => {
      limpa(); estado = e; const s = E[e];
      cod.textContent = e; nome.textContent = s.nome; desc.textContent = s.desc;
      inox.style.setProperty('--led', s.led);
      inox.classList.toggle('pisca', !!s.pisca);
      agua.style.transitionDuration = e === 'E3' ? '5.5s' : '';
      if (s.nivel != null) agua.style.setProperty('--nivel', s.nivel + '%');
      if (e === 'E1') depois(calmo ? 10 : 700, () => vai('E3'));
      if (e === 'E3') depois(5600, () => vai('E4'));
      if (e === 'E4') depois(3000, () => vai('E0'));
      if (e === 'E0') agua.style.setProperty('--nivel', '28%');
    };
    const curto = () => {
      vibra(8);
      if (estado === 'E0') vai('E1');
      else if (estado === 'E3' || estado === 'E4') vai('E0');
      else if (['E5', 'E6', 'E7'].includes(estado)) vai('E0');
    };
    const longo = () => { vibra([12, 40, 12]); vai(estado === 'E8' ? 'E0' : 'E8'); };

    // Segurar: o anel enche em 1,5 s. Soltar antes de 1 s é clique curto.
    // O tempo decide (setTimeout); o anel só desenha (requestAnimationFrame).
    let t0 = 0, raf, tLongo, disparou = false, segurando = false;
    const anima = () => {
      inox.style.setProperty('--segura', Math.min(1, (performance.now() - t0) / 1500));
      if (segurando && !disparou) raf = requestAnimationFrame(anima);
    };
    const comeca = () => {
      if (segurando) return;
      segurando = true; disparou = false; t0 = performance.now();
      inox.classList.add('pressionado'); raf = requestAnimationFrame(anima);
      tLongo = setTimeout(() => { disparou = true; inox.style.setProperty('--segura', 0); longo(); }, 1500);
    };
    const termina = cancelou => {
      if (!segurando) return;
      segurando = false; cancelAnimationFrame(raf); clearTimeout(tLongo); inox.classList.remove('pressionado');
      const dt = performance.now() - t0;
      inox.style.setProperty('--segura', 0);
      if (!cancelou && !disparou && dt < 1000) curto();
    };
    inox.addEventListener('pointerdown', ev => { captura(inox, ev); comeca(); });
    inox.addEventListener('pointerup', () => termina(false));
    inox.addEventListener('pointercancel', () => termina(true));
    inox.addEventListener('contextmenu', ev => ev.preventDefault());
    inox.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && !ev.repeat) { ev.preventDefault(); comeca(); } });
    inox.addEventListener('keyup', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); termina(false); } });
    inox.addEventListener('click', ev => ev.preventDefault());
    $$('.falhas button').forEach(b => b.addEventListener('click', () => { vibra([20, 30, 20]); vai(b.dataset.falha); }));
  }

  // ------------------------------------------------------------ mapa
  const NOS = {
    internet: ['Fora de casa', 'Internet', 'Nenhuma conexão de fora chega direto em casa. O roteador não tem uma única porta aberta.'],
    tunel: ['A única entrada', 'Cloudflare Tunnel', 'A casa liga para fora, nunca o contrário. O túnel publica o Home Assistant e a Portaria sem expor o endereço de casa.'],
    proxmox: ['Servidor local', 'Proxmox', 'Roda tudo em máquinas virtuais e containers: Home Assistant, fotos da família, reconhecimento facial e o servidor da CNC.'],
    nobreak: ['Energia', 'Nobreak inteligente', 'Feito com um ESP32-S3 e tela própria. O laço crítico de hardware roda separado da interface: a tela travar nunca queima o equipamento.'],
    facial: ['Visão local', 'Câmeras e rostos', 'Frigate e CompreFace reconhecem rostos nas câmeras, tudo processado em casa. Nenhuma imagem sai para serviço de terceiros.'],
    ha: ['O centro da casa', 'Home Assistant', 'Recebe a telemetria de cada aparelho, mas nenhum depende dele para ficar seguro: a lógica crítica mora no próprio dispositivo.'],
    caixa: ['Água', "Caixa d'água", 'Bombeamento com dez estados, imune a apagão. Conversa com o Home Assistant, mas decide sozinha.'],
    ph: ['Água', 'pH e ORP', 'Um monitor que só funcionava pela nuvem do fabricante. Hoje fala direto com a casa, por engenharia reversa do protocolo.'],
    solar: ['Energia', 'Gerador solar', 'Backup de 1,1 kW para a rede crítica: câmeras, roteadores e a Portaria. No apagão, a troca de fonte é verificada.'],
    ampere: ['Oracle Cloud', 'Ampere ARM', 'Servidor ARM no plano gratuito, dimensionado exatamente no teto real da cota: 2 núcleos e 12 GB.'],
    pbs: ['Oracle Cloud', 'Proxmox Backup Server', 'A cópia do servidor de casa, fora de casa: incremental e deduplicada, por uma rede privada. A porta do backup não fica exposta.'],
  };
  const painel = $('#painel');
  if (painel) {
    const [tag, tit, txt] = [$('#painel-tag'), $('#painel-titulo'), $('#painel-texto')];
    const nos = $$('.no');
    const escolhe = no => {
      const d = NOS[no.dataset.no]; if (!d) return;
      nos.forEach(n => n.classList.toggle('ativo', n === no));
      [tag.textContent, tit.textContent, txt.textContent] = d;
      painel.classList.remove('troca'); void painel.offsetWidth; painel.classList.add('troca');
      vibra(6);
      if (matchMedia('(max-width: 900px)').matches) {
        const r = painel.getBoundingClientRect();
        if (r.bottom > innerHeight) painel.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'nearest' });
      }
    };
    nos.forEach(n => {
      n.setAttribute('aria-label', NOS[n.dataset.no]?.[1] ?? '');
      n.addEventListener('click', () => escolhe(n));
      n.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); escolhe(n); } });
    });
  }
})();
