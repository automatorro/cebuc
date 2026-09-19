/* ==========================================================
   cebuc.ro — animații pentru pachetele 03, 04 și 05
   Fără librării, fără video. Folosire (mod la cerere):
     <div class="cbc-anim" data-scene="grow"    data-mode="ondemand"></div>  (Pachet 03, scurtă)
     <div class="cbc-anim" data-scene="ai"      data-mode="ondemand"></div>  (Pachet 04)
     <div class="cbc-anim" data-scene="digital" data-mode="ondemand"></div>  (Pachet 05)
   Fără data-mode="ondemand", scena pornește singură când apare pe ecran.
   Cu "prefers-reduced-motion" se afișează direct cadrul final.
   Doar Telegram apare în animații (fără alte canale de mesagerie).
   ========================================================== */
(function () {
  'use strict';

  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- utilitare ---------- */

  var ICONS = {
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    grid: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
    form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/>',
    play: '<path d="M8 5v14l11-7z"/>'
  };
  function ico(name, size) {
    size = size || 18;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function q(root, sel) { return root.querySelector(sel); }
  function qa(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  /* Timeline: programează pași la momente absolute (ms).
     În modul "instant" execută totul pe loc, în ordine (cadrul final). */
  function Timeline() { this.timers = []; this.ivs = []; this.instant = false; }
  Timeline.prototype.at = function (ms, fn) {
    if (this.instant) { fn(); return; }
    this.timers.push(setTimeout(fn, ms));
  };
  Timeline.prototype.type = function (node, text, dur) {
    if (this.instant) { node.textContent = text; return; }
    var start = performance.now(), n = text.length;
    node.textContent = '';
    node.classList.add('cbc-caret');
    var id = setInterval(function () {
      var p = Math.min(1, (performance.now() - start) / dur);
      node.textContent = text.slice(0, Math.ceil(p * n));
      if (p >= 1) { clearInterval(id); node.classList.remove('cbc-caret'); }
    }, 30);
    this.ivs.push(id);
  };
  Timeline.prototype.clear = function () {
    this.timers.forEach(clearTimeout);
    this.ivs.forEach(clearInterval);
    this.timers = []; this.ivs = [];
  };

  function bubble(msgs, who) {
    var b = el('div', 'cbc-b cbc-b-' + who);
    msgs.appendChild(b);
    void b.offsetWidth;
    b.classList.add('in');
    return b;
  }
  var DOTS = '<span class="cbc-dots"><i></i><i></i><i></i></span>';

  /* ==========================================================
     Scena 04 — Asistent AI pe date verificate
     ========================================================== */

  function buildAI(root) {
    root.innerHTML =
      '<div class="cbc-stage" role="img" aria-label="Simulare: noaptea, un client întreabă despre stoc și livrare. Asistentul AI răspunde din datele verificate ale firmei, iar la întrebarea la care nu are răspuns trimite mesaj echipei pe Telegram.">' +
        '<p class="cbc-note">Simulare ilustrativă, cu date fictive</p>' +
        '<div class="cbc-ai-grid">' +
          '<div class="cbc-chat">' +
            '<div class="cbc-chat-head"><span class="cbc-dot"></span>Asistent AI pentru firma ta<span class="cbc-clock">23:40</span></div>' +
            '<div class="cbc-msgs"></div>' +
          '</div>' +
          '<div class="cbc-side">' +
            '<p class="cbc-side-title">Datele verificate ale firmei</p>' +
            '<div class="cbc-src">' + ico('doc') + '<div><b>Listă de prețuri</b><small>actualizată luna aceasta</small></div><span class="cbc-ok">' + ico('check', 16) + '</span></div>' +
            '<div class="cbc-src">' + ico('grid') + '<div><b>Stoc curent</b><small>actualizat azi</small></div><span class="cbc-ok">' + ico('check', 16) + '</span></div>' +
            '<div class="cbc-src">' + ico('form') + '<div><b>Livrare și zone</b><small>condiții de transport</small></div><span class="cbc-ok">' + ico('check', 16) + '</span></div>' +
            '<div class="cbc-generic"><span class="cbc-gl">Un AI generic, fără datele tale, ar fi zis:</span><span class="cbc-gt">Da, avem. 39 lei. Livrăm oricând, oriunde.</span><span class="cbc-bad">inventat</span></div>' +
            '<div class="cbc-tg"><span class="cbc-tg-ico">' + ico('send', 15) + '</span><div><b>Telegram: întrebare nouă de la client</b><span>„Montaj la etajul 7, fără lift?” nu are răspuns în date.</span></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="cbc-foot">' +
          '<div class="cbc-result"><b>Răspuns în 4 secunde</b>, la 23:40, fără nimeni la telefon.</div>' +
          '<button type="button" class="cbc-btn">Rulează din nou</button>' +
        '</div>' +
      '</div>';
    return {
      msgs: q(root, '.cbc-msgs'),
      src: qa(root, '.cbc-src'),
      gen: q(root, '.cbc-generic'),
      tg: q(root, '.cbc-tg'),
      res: q(root, '.cbc-result'),
      btn: q(root, '.cbc-btn')
    };
  }

  function runAI(R, tl, done) {
    var c1, a1, c2, a2;

    tl.at(400, function () {
      c1 = bubble(R.msgs, 'u');
      tl.type(c1, 'Aveți în stoc adeziv C2 pentru gresie, 25 kg? Livrați și la Arad?', 1500);
    });
    tl.at(2100, function () { a1 = bubble(R.msgs, 'a'); a1.innerHTML = DOTS; });

    tl.at(2500, function () { R.src[0].classList.add('on'); });
    tl.at(2950, function () { R.src[1].classList.add('on'); });
    tl.at(3400, function () { R.src[2].classList.add('on'); });

    tl.at(3900, function () {
      a1.textContent = '';
      tl.type(a1, 'Da, adezivul C2 de 25 kg e în stoc. Livrăm la Arad în 24 de ore, cu transport gratuit peste 1.500 lei.', 2000);
    });
    tl.at(6000, function () {
      a1.appendChild(el('div', 'cbc-chips',
        '<span class="cbc-chip">' + ico('check', 12) + 'Stoc actualizat azi</span>' +
        '<span class="cbc-chip">' + ico('check', 12) + 'Livrare și zone</span>'));
    });

    tl.at(6500, function () { R.gen.classList.add('on'); });
    tl.at(7300, function () { R.gen.classList.add('strike'); });

    tl.at(8000, function () {
      c2 = bubble(R.msgs, 'u');
      tl.type(c2, 'Faceți și montaj la etajul 7, fără lift?', 1100);
    });
    tl.at(9300, function () { a2 = bubble(R.msgs, 'a'); a2.innerHTML = DOTS; });
    tl.at(9800, function () {
      a2.textContent = '';
      tl.type(a2, 'Nu am informația asta în datele firmei, așa că nu ghicesc. Am trimis întrebarea echipei pe Telegram; vei primi răspunsul de la un om.', 2200);
    });
    tl.at(11000, function () { R.tg.classList.add('on'); });

    tl.at(12300, function () { R.res.classList.add('on'); R.btn.classList.add('on'); done(); });
  }

  /* ==========================================================
     Piese comune pentru fluxurile din scenele 03 și 05
     ========================================================== */

  function nForm() {
    return '<div class="cbc-node"><div class="cbc-node-h">' + ico('form') + 'Cerere nouă<span class="cbc-tick">' + ico('check', 16) + '</span></div>' +
      '<div class="cbc-field"><small>Nume</small><span data-f="0"></span></div>' +
      '<div class="cbc-field"><small>Serviciu</small><span data-f="1"></span></div>' +
      '<div class="cbc-field"><small>Suprafață</small><span data-f="2"></span></div>' +
      '<div class="cbc-fbtn">Trimite cererea</div></div>';
  }
  function nDash() {
    return '<div class="cbc-node"><div class="cbc-node-h">' + ico('grid') + 'Dashboard<span class="cbc-tick">' + ico('check', 16) + '</span></div>' +
      '<div class="cbc-rows">' +
        '<div class="cbc-row"><em>Vlad Ciobanu<small>#0146</small></em><span class="cbc-pill ok">Câștigat</span></div>' +
        '<div class="cbc-row"><em>Ana Marin<small>#0147</small></em><span class="cbc-pill ok">Ofertat</span></div>' +
        '<div class="cbc-row new"><em>Ion Popescu<small>#0148</small></em><span class="cbc-pill hot">Nou</span></div>' +
      '</div></div>';
  }
  function nTg() {
    return '<div class="cbc-node"><div class="cbc-node-h">' + ico('send') + 'Telegram<span class="cbc-tick">' + ico('check', 16) + '</span></div>' +
      '<div class="cbc-phone"><div class="cbc-notif"><span class="cbc-tg-ico">' + ico('send', 13) + '</span><div><b>Cerere nouă #0148</b><span>Ion Popescu, tencuială, 320 mp</span></div></div></div></div>';
  }
  function nMail() {
    return '<div class="cbc-node"><div class="cbc-node-h">' + ico('mail') + 'Email client<span class="cbc-tick">' + ico('check', 16) + '</span></div>' +
      '<div class="cbc-mail"><small>Confirmare trimisă automat</small><q>Am primit cererea ta. Revenim azi cu oferta.</q></div></div>';
  }
  function nInv() {
    return '<div class="cbc-node"><div class="cbc-node-h">' + ico('receipt') + 'Proformă<span class="cbc-tick">' + ico('check', 16) + '</span></div>' +
      '<div class="cbc-inv"><small>PF-0148, generată automat</small>' +
        '<div class="cbc-inv-line"><span>Tencuială mecanizată</span><span>320 mp</span></div>' +
        '<div class="cbc-inv-line"><span>Preț per mp</span><span>15 lei</span></div>' +
        '<div class="cbc-inv-line total"><span>Total</span><span>4.800 lei</span></div>' +
      '</div></div>';
  }
  function flowStage(aria, nodes, counters, btnLabel) {
    return '<div class="cbc-stage" role="img" aria-label="' + aria + '">' +
      '<p class="cbc-note">Simulare ilustrativă, cu date fictive</p>' +
      '<div class="cbc-flow" data-n="' + nodes.length + '">' + nodes.join('<div class="cbc-link"><i></i></div>') + '</div>' +
      '<div class="cbc-foot"><div class="cbc-counters">' + counters + '</div>' +
      '<button type="button" class="cbc-btn">' + btnLabel + '</button></div></div>';
  }
  function flowRefs(root) {
    return {
      nodes: qa(root, '.cbc-node'),
      links: qa(root, '.cbc-link'),
      fields: qa(root, '[data-f]'),
      fbtn: q(root, '.cbc-fbtn'),
      newRow: q(root, '.cbc-row.new'),
      pill: q(root, '.cbc-row.new .cbc-pill'),
      phone: q(root, '.cbc-phone'),
      notif: q(root, '.cbc-notif'),
      mail: q(root, '.cbc-mail'),
      inv: qa(root, '.cbc-inv, .cbc-inv-line'),
      counters: q(root, '.cbc-counters'),
      btn: q(root, '.cbc-btn')
    };
  }
  function flowHelpers(R, tl) {
    return {
      act: function (i) {
        if (i > 0) { R.nodes[i - 1].classList.remove('on'); R.nodes[i - 1].classList.add('done'); }
        R.nodes[i].classList.add('on');
      },
      pulse: function (i, startMs) {
        tl.at(startMs, function () { R.links[i].classList.add('go'); });
        tl.at(startMs + 700, function () { R.links[i].classList.add('done'); });
      },
      fillForm: function () {
        tl.at(500, function () { tl.type(R.fields[0], 'Ion Popescu', 600); });
        tl.at(1200, function () { tl.type(R.fields[1], 'Tencuială mecanizată', 800); });
        tl.at(2100, function () { tl.type(R.fields[2], '320 mp', 350); });
        tl.at(2700, function () { R.fbtn.classList.add('press'); });
        tl.at(2950, function () { R.fbtn.classList.remove('press'); });
      }
    };
  }

  /* ---------- Scena 05 — Sistem digital (5 pași, ~12 s) ---------- */

  function buildDig(root) {
    root.innerHTML = flowStage(
      'Simulare: o cerere nouă din formular apare în dashboard, ajunge pe Telegram, clientul primește email de confirmare și se generează automat proforma.',
      [nForm(), nDash(), nTg(), nMail(), nInv()],
      '<span><b>0</b>mesaje pierdute</span><span><b>0</b>retastări</span><span><b>4</b>acțiuni automate dintr-o singură cerere</span>',
      'Trimite o cerere de test');
    return flowRefs(root);
  }

  function runDig(R, tl, done) {
    var H = flowHelpers(R, tl);

    tl.at(200, function () { H.act(0); });
    H.fillForm();

    H.pulse(0, 3000);
    tl.at(3800, function () { H.act(1); R.newRow.classList.add('on'); });

    H.pulse(1, 4700);
    tl.at(5500, function () { H.act(2); R.notif.classList.add('on'); R.phone.classList.add('buzz'); });

    H.pulse(2, 6600);
    tl.at(7400, function () { H.act(3); R.mail.classList.add('on'); });

    H.pulse(3, 8400);
    tl.at(9200, function () { H.act(4); R.inv[0].classList.add('on'); });
    tl.at(9500, function () { R.inv[1].classList.add('on'); });
    tl.at(9800, function () { R.inv[2].classList.add('on'); });
    tl.at(10100, function () { R.inv[3].classList.add('on'); });

    // statusul din dashboard se actualizează singur
    tl.at(10800, function () {
      R.nodes[1].classList.add('on');
      R.pill.textContent = 'Ofertat';
      R.pill.className = 'cbc-pill ok';
    });
    tl.at(11500, function () {
      R.nodes[1].classList.remove('on');
      R.nodes[4].classList.remove('on');
      R.nodes[4].classList.add('done');
      R.counters.classList.add('on');
    });
    tl.at(12200, function () { R.btn.classList.add('on'); done(); });
  }

  /* ---------- Scena 03 — GROW, versiune scurtă (3 pași, ~7 s) ---------- */

  function buildGrow(root) {
    root.innerHTML = flowStage(
      'Simulare: o cerere nouă din formular apare în dashboard și ajunge imediat pe Telegram, pe telefonul tău.',
      [nForm(), nDash(), nTg()],
      '<span><b>0</b>mesaje pierdute</span><span><b>Instant</b>pe Telegram, pe telefonul tău</span>',
      'Trimite o cerere de test');
    return flowRefs(root);
  }

  function runGrow(R, tl, done) {
    var H = flowHelpers(R, tl);

    tl.at(200, function () { H.act(0); });
    H.fillForm();

    H.pulse(0, 3000);
    tl.at(3800, function () { H.act(1); R.newRow.classList.add('on'); });

    H.pulse(1, 4700);
    tl.at(5500, function () { H.act(2); R.notif.classList.add('on'); R.phone.classList.add('buzz'); });

    tl.at(6600, function () {
      R.nodes[2].classList.remove('on');
      R.nodes[2].classList.add('done');
      R.counters.classList.add('on');
    });
    tl.at(7200, function () { R.btn.classList.add('on'); done(); });
  }

  /* ==========================================================
     Montare
     ========================================================== */

  var SCENES = {
    ai: { build: buildAI, run: runAI },
    digital: { build: buildDig, run: runDig },
    grow: { build: buildGrow, run: runGrow }
  };

  /* Controller: construiește, pornește și oprește o scenă într-un container */
  function controller(box, S) {
    var state = 'idle', tl = new Timeline(), R;
    var c = {
      reset: function () {
        tl.clear();
        tl = new Timeline();
        R = S.build(box);
        R.btn.addEventListener('click', function () { c.reset(); c.play(); });
        state = 'idle';
      },
      play: function () {
        if (state === 'playing') return;
        state = 'playing';
        tl.instant = RM;
        S.run(R, tl, function () { state = 'done'; });
      },
      stop: function () {
        tl.clear();
        tl = new Timeline();
        box.innerHTML = '';
        state = 'idle';
      },
      state: function () { return state; }
    };
    return c;
  }

  /* Mod automat: pornește la apariția pe ecran, resetează la ieșire */
  function mountAuto(root, S) {
    var c = controller(root, S);
    c.reset();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && c.state() === 'idle') c.play();
          else if (!e.isIntersecting && c.state() === 'playing') c.reset();
        });
      }, { threshold: 0.3 }).observe(root);
    } else {
      c.play();
    }
  }

  /* Mod la cerere: un buton deschide scena, același buton o închide */
  function mountOnDemand(root, S) {
    var label = root.getAttribute('data-label') || 'Vezi cum funcționează';
    root.innerHTML =
      '<button type="button" class="cbc-open" aria-expanded="false">' + ico('play', 14) + '<span>' + label + '</span></button>' +
      '<div class="cbc-panel" hidden></div>';
    var btn = q(root, '.cbc-open'), panel = q(root, '.cbc-panel'), txt = q(btn, 'span');
    var c = controller(panel, S), open = false;

    btn.addEventListener('click', function () {
      open = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        panel.hidden = false;
        txt.textContent = 'Închide simularea';
        c.reset();
        c.play();
        var r = panel.getBoundingClientRect();
        if (r.bottom > window.innerHeight || r.top < 0) {
          btn.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
        }
      } else {
        c.stop();
        panel.hidden = true;
        txt.textContent = label;
      }
    });
  }

  function mount(root) {
    if (root.__cbc) return;
    var S = SCENES[root.getAttribute('data-scene')];
    if (!S) return;
    root.__cbc = true;
    if (root.getAttribute('data-mode') === 'ondemand') mountOnDemand(root, S);
    else mountAuto(root, S);
  }

  function init() { qa(document, '.cbc-anim[data-scene]').forEach(mount); }
  window.CebucAnim = { init: init };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
