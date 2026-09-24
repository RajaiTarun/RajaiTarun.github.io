/* tarun.rajai · main.js
   Plain JS, no build step.
   1 helpers  2 entrance & reveals  3 nav + yarn progress  4 Mutex (hero cat)
   5 box rush  6 terminal  7 skills toggle  8 real cats  9 LeetCode
   10 contact  11 paw trail, peek, cat rain */

(() => {
  'use strict';

  /* ───────── 1. helpers ───────── */
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  $('#year').textContent = new Date().getFullYear();

  /* ───────── 2. entrance, reveals, count-ups ───────── */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const to = parseFloat(el.dataset.to);
    const from = parseFloat(el.dataset.from || 0);
    const dec = parseInt(el.dataset.dec || 0, 10);
    if (reduced) { el.textContent = to.toFixed(dec); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1500);
      el.textContent = (from + (to - from) * (1 - Math.pow(1 - k, 4))).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Stagger reveals that sit next to each other in the same grid.
  $$('.reveal').forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const i = sibs.indexOf(el);
    if (sibs.length > 1 && i > 0) el.style.setProperty('--d', Math.min(i, 5) * 0.08 + 's');
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      $$('.count', en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), sleep(900)]).then(() => requestAnimationFrame(() => {
    html.classList.add('ready');
    setTimeout(() => $$('.mini-stats .count').forEach(countUp), 500);
  }));

  /* ───────── 3. nav: active link + yarn-ball progress ───────── */
  const yarn = $('.yarn-track');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      yarn.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav-links a');
  const NAV_FOR = { leetcode: 'about', stats: 'skills', top: '', footer: 'contact' };
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id in NAV_FOR ? NAV_FOR[en.target.id] : en.target.id;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['top', 'about', 'leetcode', 'projects', 'skills', 'stats', 'contact', 'footer'].forEach((id) => secIO.observe(document.getElementById(id)));

  /* ───────── 4. Mutex, the hero cat ───────── */
  const mutexBtn = $('#mutex');
  const mutex = $('.mutex', mutexBtn);
  const bubble = $('#bubble');
  const pupils = $$('.pupil', mutex);
  const EYES = [{ x: 146, y: 146 }, { x: 214, y: 146 }];
  const IDLE_LINES = ['mrrp?', 'pet me.', 'is that a race condition?', 'if I fits, I sits.', 'SET NX PX 🐾', 'LGTM.', 'no thoughts. only locks.', 'feed me, then deploy.'];
  const PET_LINES = ['purrrr', 'prrrp ♥', 'more.', 'acceptable.', 'you may continue', 'purr purr'];
  let mood = 'idle';
  let pets = [];
  let quietUntil = 0;

  function say(text, hold = 0) {
    bubble.classList.add('swap');
    setTimeout(() => { bubble.textContent = text; bubble.classList.remove('swap'); }, 160);
    quietUntil = performance.now() + 5200 + hold;
  }
  setInterval(() => {
    if (mood === 'idle' && performance.now() > quietUntil) say(pick(IDLE_LINES.filter((l) => l !== bubble.textContent)));
  }, 1000);

  // Eyes follow the pointer.
  let lookRaf = 0;
  addEventListener('pointermove', (e) => {
    cancelAnimationFrame(lookRaf);
    lookRaf = requestAnimationFrame(() => {
      const r = mutex.getBoundingClientRect();
      if (r.bottom < 0) return;
      const s = r.width / 360;
      EYES.forEach((eye, i) => {
        const dx = e.clientX - (r.left + eye.x * s), dy = e.clientY - (r.top + eye.y * s);
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(7, d / 40);
        pupils[i].style.transform = `translate(${(dx / d) * m}px, ${(dy / d) * m * 0.8}px)`;
      });
    });
  }, { passive: true });

  // Blinks and ear twitches, like a real cat pretending not to care.
  (function blinkLoop() {
    setTimeout(() => {
      if (mood === 'idle') { mutex.classList.add('blink'); setTimeout(() => mutex.classList.remove('blink'), 150); }
      blinkLoop();
    }, 2400 + Math.random() * 3200);
  })();
  (function twitchLoop() {
    setTimeout(() => {
      const ear = $(Math.random() < 0.5 ? '.ear-l' : '.ear-r', mutex);
      if (mood === 'idle') { ear.classList.add('twitch'); setTimeout(() => ear.classList.remove('twitch'), 520); }
      twitchLoop();
    }, 3500 + Math.random() * 4000);
  })();

  function burst(x, y, n, glyphs) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'heart';
      h.textContent = pick(glyphs);
      h.style.left = x + (Math.random() - 0.5) * 40 + 'px';
      h.style.top = y + (Math.random() - 0.5) * 20 + 'px';
      h.style.setProperty('--dx', (Math.random() - 0.5) * 90 + 'px');
      h.style.setProperty('--rot', (Math.random() - 0.5) * 50 + 'deg');
      h.style.animationDelay = i * 60 + 'ms';
      document.body.append(h);
      setTimeout(() => h.remove(), 1400 + i * 60);
    }
  }

  mutexBtn.addEventListener('click', (e) => {
    const r = mutex.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 3;
    if (mood === 'mad') {
      // She's holding the lock. Come back later.
      say('EBUSY. lock held.', 1500);
      burst(x, y, 2, ['💢']);
      return;
    }
    const now = performance.now();
    pets = pets.filter((t) => now - t < 3500).concat(now);
    if (pets.length >= 6) {
      pets = [];
      mood = 'mad';
      mutex.classList.remove('happy');
      mutex.classList.add('mad');
      say('HISS. too many requests.', 2500);
      burst(x, y, 4, ['💢', '💢', '⚡']);
      setTimeout(() => { mutex.classList.remove('mad'); mood = 'idle'; say('…fine. lock released.', 2000); }, 3200);
      return;
    }
    mood = 'happy';
    mutex.classList.add('happy');
    say(pick(PET_LINES), 1500);
    burst(x, y, 3, ['❤️', '💕', '💖', '🐾']);
    clearTimeout(mutexBtn._t);
    mutexBtn._t = setTimeout(() => { mutex.classList.remove('happy'); if (mood === 'happy') mood = 'idle'; }, 1100);
  });

  /* ───────── 5. The Great Box Rush (MerchFlow's race condition, with cats) ───────── */
  (function rush() {
    const root = $('#rush');
    const N = 200, BOXES = 50, SCALE = 1.8;
    const boxesEl = $('#boxes'), leftEl = $('#rush-left'), overEl = $('#rush-over'), awayEl = $('#rush-away');
    const msg = $('#rush-msg'), runBtn = $('#rush-run'), seg = $$('.seg button', root);
    const BOX_SVG = `<svg viewBox="0 0 60 52">
      <rect x="8" y="16" width="44" height="10" fill="#7a4d22"/>
      <g class="cat cat2" style="color:#b6aea6"><use href="#cathead-mad" x="13" y="-11" width="34" height="31"/></g>
      <g class="cat cat1" style="color:#ff8a35"><use href="#cathead" x="13" y="-11" width="34" height="31"/></g>
      <path d="M8 24 1 14h22l7 10ZM52 24l7-10H37l-7 10Z" fill="#e8b57a" stroke="#221c18" stroke-width="2" stroke-linejoin="round"/>
      <rect class="front" x="8" y="24" width="44" height="26" rx="2" fill="#d99a5b" stroke="#221c18" stroke-width="2.2"/>
      <path d="M24 31h12" stroke="#221c18" stroke-width="2" opacity=".35"/></svg>`;
    const boxes = Array.from({ length: BOXES }, () => {
      const b = document.createElement('div');
      b.className = 'box';
      b.innerHTML = BOX_SVG;
      boxesEl.append(b);
      return b;
    });
    let mode = 'race', runId = 0, hasRun = false;

    // Same timeline as a naive checkout: read the stock, decide, write later.
    function plan(m) {
      const rnd = mulberry32(m === 'race' ? 7 : 11);
      const cats = Array.from({ length: N }, (_, i) => ({ t: i * 11 + rnd() * 60, lat: 90 + rnd() * 200 }))
        .sort((a, b) => a.t - b.t);
      const ev = [];
      let stock = BOXES;
      if (m === 'race') {
        const pending = [];
        const flush = (t) => {
          pending.sort((a, b) => a.t - b.t);
          while (pending.length && pending[0].t <= t) {
            const c = pending.shift();
            stock--;
            ev.push({ t: c.t, type: stock < 0 ? 'over' : 'sold', stock });
          }
        };
        cats.forEach((c) => {
          flush(c.t);
          if (stock > 0) pending.push({ t: c.t + c.lat });
          else ev.push({ t: c.t + 40, type: 'away' });
        });
        flush(Infinity);
      } else {
        // SET NX PX: one cat holds the lock, checks, jumps in, releases.
        let freeAt = 0;
        cats.forEach((c) => {
          freeAt = Math.max(c.t, freeAt) + 9;
          if (stock > 0) { stock--; ev.push({ t: freeAt, type: 'sold', stock }); }
          else ev.push({ t: freeAt, type: 'away' });
        });
      }
      return ev.sort((a, b) => a.t - b.t);
    }

    function reset() {
      boxes.forEach((b) => (b.className = 'box'));
      leftEl.textContent = BOXES;
      leftEl.parentElement.classList.remove('neg');
      overEl.textContent = 0;
      awayEl.textContent = 0;
      msg.className = '';
    }

    function setMode(m) {
      mode = m;
      seg.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === m)));
      runId++;
      reset();
    }

    async function run() {
      const id = ++runId;
      hasRun = true;
      reset();
      runBtn.textContent = 'Rushing…';
      msg.textContent = mode === 'race' ? 'Cats incoming. Nobody is checking twice…' : '🔒 One cat holds the lock at a time…';
      const ev = plan(mode);
      let k = 0, sold = 0, over = 0, away = 0;
      const t0 = performance.now();
      await new Promise((done) => {
        const frame = (now) => {
          if (id !== runId) return done();
          const t = (now - t0) / SCALE;
          while (k < ev.length && ev[k].t <= t) {
            const e = ev[k++];
            if (e.type === 'sold') {
              const b = boxes[sold++];
              b.classList.add('one');
              if (mode === 'lock') { b.classList.add('locked'); setTimeout(() => b.classList.remove('locked'), 260); }
            } else if (e.type === 'over') {
              boxes[(over * 17 + 3) % BOXES].classList.add('two');
              over++;
            } else {
              away++;
            }
            if (e.stock !== undefined) {
              leftEl.textContent = e.stock;
              leftEl.parentElement.classList.toggle('neg', e.stock < 0);
            }
            overEl.textContent = over;
            awayEl.textContent = away;
          }
          if (k < ev.length) requestAnimationFrame(frame); else done();
        };
        requestAnimationFrame(frame);
      });
      if (id !== runId) return;
      runBtn.textContent = 'Again! ▶';
      if (mode === 'race') {
        msg.className = 'bad';
        msg.textContent = `${over} boxes got a second cat. There was hissing. (In MerchFlow terms: oversold by ${over}.) Try the lock →`;
        $('[data-mode="lock"]', root).animate([{ transform: 'none' }, { transform: 'translateY(-4px)' }, { transform: 'none' }], { duration: 450, iterations: 3 });
      } else {
        msg.className = 'good';
        msg.textContent = `One cat per box, zero hissing. The other ${away} are sulking, which is normal cat behaviour.`;
      }
    }

    seg.forEach((b) => b.addEventListener('click', () => { setMode(b.dataset.mode); run(); }));
    runBtn.addEventListener('click', run);
    new IntersectionObserver(([en], obs) => {
      if (en.isIntersecting && !hasRun) { obs.disconnect(); setTimeout(run, 600); }
    }, { threshold: 0.55 }).observe(boxesEl);
  })();

  /* ───────── 6. terminal (POSIX shell reenactment) ───────── */
  (function terminal() {
    const pre = $('#posix-term');
    let cursor;
    const add = (text, cls) => {
      const s = document.createElement('span');
      if (cls) s.className = cls;
      s.textContent = text;
      pre.insertBefore(s, cursor);
      return s;
    };
    const clear = () => { pre.textContent = ''; cursor = document.createElement('span'); cursor.className = 'cur'; pre.append(cursor); };
    let visible = false, started = false;
    const gate = async () => { while (!visible) await sleep(250); };
    const P = '<tarun@iiith:~/POSIX> : ';
    const steps = [
      { cmd: 'cat treats.txt | grep tuna | sort | uniq -c > stash.txt' },
      { cmd: 'sleep 16h &' },
      { out: '[1] 48213', cls: 'dim' },
      { cmd: 'pinfo 48213' },
      { out: 'pid -- 48213\nProcess Status -- S   (napping, obviously)\nExecutable Path -- /usr/bin/sleep', cls: 'dim' },
      { cmd: 'history 2' },
      { out: '  sleep 16h &\n  pinfo 48213', cls: 'dim' },
      { pause: 700 },
      { out: '… 16 hours later …', cls: 'dim' },
      { out: '[1] done sleep 16h', cls: 'ok' },
      { cmd: 'exit' },
      { out: 'history saved → ~/.historyState.txt', cls: 'dim' },
      { pause: 3600 },
    ];
    async function play() {
      for (;;) {
        clear();
        for (const st of steps) {
          await gate();
          if (st.pause) { await sleep(st.pause); continue; }
          if (st.cmd !== undefined) {
            add(P, 'p');
            const span = add('');
            for (const ch of st.cmd) { await gate(); span.textContent += ch; if (!reduced) await sleep(22 + Math.random() * 40); }
            await sleep(reduced ? 0 : 280);
            add('\n');
          } else {
            add(st.out + '\n', st.cls);
            await sleep(reduced ? 0 : 90);
          }
        }
      }
    }
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !started) { started = true; play(); }
    }, { threshold: 0.25 }).observe(pre);
  })();

  /* ───────── 7. skills: human mode / cat mode ───────── */
  (function skills() {
    const groups = $('#skill-groups');
    const items = $$('.skill-chips li, .skill-group h3', groups);
    items.forEach((el, i) => { el.dataset.human = el.textContent; el.style.setProperty('--i', i % 8); });
    const btns = $$('.skills-head .seg button');
    btns.forEach((b) => b.addEventListener('click', () => {
      const cat = b.dataset.view === 'cat';
      if (groups.classList.contains('cat-mode') === cat) return;
      btns.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      groups.classList.add('flipping');
      setTimeout(() => {
        items.forEach((el) => (el.textContent = cat ? el.dataset.cat : el.dataset.human));
        groups.classList.toggle('cat-mode', cat);
        groups.classList.remove('flipping');
      }, reduced ? 0 : 380);
    }));
  })();

  /* ───────── 8. real cats (The Cat API, with cataas.com as backup) ───────── */
  async function fetchJSON(url, ms = 7000) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }

  async function catPhotos(n) {
    try {
      const d = await fetchJSON(`https://api.thecatapi.com/v1/images/search?limit=${Math.max(n, 3)}&mime_types=jpg,png`);
      const urls = d.map((x) => x.url).filter(Boolean);
      if (urls.length >= n) return urls.slice(0, n);
      throw new Error('not enough cats');
    } catch (e) {
      return Array.from({ length: n }, (_, i) => `https://cataas.com/cat?width=640&r=${Date.now()}${i}`);
    }
  }

  function showCat(fig, url) {
    const frame = $('.catpic-frame', fig);
    const img = $('img', frame);
    let retried = false;
    frame.classList.remove('loaded', 'failed');
    img.onload = () => frame.classList.add('loaded');
    img.onerror = () => {
      if (!retried) { retried = true; img.src = `https://cataas.com/cat?width=640&r=${Date.now()}`; }
      else frame.classList.add('failed');
    };
    img.src = url;
  }

  const aboutCat = $('#about-cat');
  catPhotos(1).then(([u]) => showCat(aboutCat, u));
  $('[data-reroll="about-cat"]').addEventListener('click', () => catPhotos(1).then(([u]) => showCat(aboutCat, u)));

  const polaroids = $$('.polaroid');
  const loadBoard = () => catPhotos(3).then((urls) => polaroids.forEach((p, i) => showCat(p, urls[i])));
  new IntersectionObserver(([en], obs) => { if (en.isIntersecting) { obs.disconnect(); loadBoard(); } }, { rootMargin: '400px' }).observe($('.board'));
  $('#reshuffle').addEventListener('click', loadBoard);

  // Cat break: a random GIF, on demand.
  (function catBreak() {
    const dlg = $('#gif-modal'), img = $('#gif-img'), frame = $('.gif-frame', dlg), cap = $('#gif-caption');
    const CAPTIONS = ['this one reviews pull requests', 'production at 3am', 'me after fixing a race condition', "Mutex's cousin. Also named Mutex.",
      'a thread, waiting on a lock', 'the on-call rotation, visualised', 'when the saga rolls back', 'senior engineer energy'];
    // Keep a small queue of GIF URLs and warm the next one, so the break starts instantly.
    let queue = [];
    let warm = null;
    async function refill() {
      try {
        const d = await fetchJSON('https://api.thecatapi.com/v1/images/search?mime_types=gif&limit=10');
        queue.push(...d.map((x) => x.url).filter((u) => /\.gif$/i.test(u)));
      } catch (e) { /* fall back to cataas below */ }
    }
    async function nextUrl() {
      if (queue.length < 2) await refill();
      return queue.shift() || `https://cataas.com/cat/gif?r=${Date.now()}`;
    }
    async function prefetch() {
      warm = await nextUrl();
      new Image().src = warm;
    }
    async function next() {
      frame.classList.remove('loaded');
      cap.textContent = pick(CAPTIONS.filter((c) => c !== cap.textContent));
      const url = warm || (await nextUrl());
      warm = null;
      let fellBack = false;
      img.onload = () => { frame.classList.add('loaded'); prefetch(); };
      img.onerror = () => {
        if (fellBack) { frame.classList.add('loaded'); cap.textContent = 'the cats are napping. try again?'; return; }
        fellBack = true;
        img.src = `https://cataas.com/cat/gif?r=${Date.now()}`;
      };
      img.src = url;
    }
    setTimeout(prefetch, 6000);
    $('#cat-break').addEventListener('click', () => { dlg.showModal(); next(); });
    $('#gif-next').addEventListener('click', next);
    $('#gif-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  })();

  /* ───────── 9. LeetCode (live, with a snapshot fallback) ───────── */
  // Snapshot taken 25 Sep 2026, used if the live APIs are unreachable.
  const LC_SNAPSHOT = {
    total: 363, easy: 83, med: 232, hard: 48, totE: 966, totM: 2117, totH: 977,
    cal: {"1759017600":5,"1760054400":3,"1760227200":1,"1760313600":3,"1761696000":3,"1761868800":1,"1762041600":8,"1763251200":12,"1764115200":5,"1764201600":4,"1764288000":2,"1767139200":4,"1767657600":1,"1767830400":4,"1767916800":2,"1768089600":8,"1768262400":11,"1768521600":6,"1768608000":20,"1768694400":6,"1768780800":14,"1768953600":3,"1769126400":3,"1769299200":6,"1769472000":3,"1769644800":2,"1769817600":18,"1769904000":16,"1769990400":3,"1770076800":12,"1770163200":14,"1770249600":1,"1770336000":4,"1770422400":4,"1770508800":3,"1770595200":7,"1770681600":1,"1770768000":15,"1770854400":5,"1770940800":3,"1771027200":10,"1771113600":2,"1771200000":4,"1771286400":9,"1771372800":2,"1771459200":13,"1771545600":1,"1771632000":7,"1771718400":12,"1771804800":9,"1771891200":4,"1771977600":6,"1772064000":3,"1772150400":2,"1772236800":4,"1772323200":8,"1772409600":2,"1772496000":5,"1772582400":1,"1772668800":5,"1772755200":1,"1772841600":2,"1773014400":3,"1773100800":1,"1773273600":2,"1773792000":13,"1773964800":5,"1774310400":5,"1774569600":1,"1775174400":4,"1775347200":5,"1776470400":2,"1776729600":11,"1776988800":2,"1777420800":1,"1778544000":7,"1778630400":10,"1778716800":10,"1778803200":11,"1778889600":6,"1778976000":17,"1779062400":12,"1779148800":3,"1779235200":21,"1779321600":2,"1779408000":1,"1779494400":7,"1779580800":5,"1779667200":4,"1779753600":5,"1779840000":27,"1779926400":21,"1780012800":13,"1780099200":4,"1780185600":15,"1780272000":4,"1780358400":17,"1780444800":13,"1780531200":5,"1780704000":24,"1780790400":4,"1780876800":23,"1780963200":10,"1781049600":5,"1781136000":26,"1781222400":8,"1781308800":11,"1781395200":7,"1781481600":13,"1781568000":37,"1781654400":1,"1781740800":18,"1781827200":2,"1781913600":25,"1782000000":6,"1782086400":10,"1782172800":3,"1782259200":6,"1782345600":2,"1782432000":3,"1782518400":13,"1782777600":17,"1782864000":5,"1782950400":17,"1783036800":16,"1783123200":27,"1783209600":84,"1783296000":6,"1783382400":5,"1783641600":8,"1783728000":23,"1783814400":20,"1783987200":17,"1784073600":37,"1784332800":8,"1784505600":14,"1784764800":15,"1784851200":8,"1784937600":32,"1785024000":12,"1785110400":4,"1785196800":14,"1785369600":9,"1785628800":9,"1785715200":17,"1785801600":18,"1785888000":9,"1785974400":22,"1786060800":8,"1786147200":2,"1786233600":9,"1786320000":13,"1786406400":17,"1786579200":13,"1786665600":17,"1786752000":3,"1786838400":16,"1786924800":3,"1787011200":30,"1787184000":1,"1787270400":6,"1787356800":4,"1787443200":23,"1787529600":14,"1787616000":11,"1787702400":8,"1787788800":12,"1788048000":1,"1788220800":1,"1788307200":5,"1788566400":16,"1788652800":28,"1788739200":3,"1788825600":16,"1788912000":10,"1789084800":29,"1789171200":15,"1789257600":12,"1789344000":3,"1789430400":18,"1789603200":25,"1789689600":10,"1789776000":8,"1789862400":28,"1789948800":1,"1790208000":11},
  };
  const LC_SOURCES = [
    'https://leetcode-api-faisalshohag.vercel.app/rajaiTarun',
    'https://leetcode-stats.tashif.codes/rajaiTarun',
  ];

  async function fetchLC() {
    for (const url of LC_SOURCES) {
      try {
        const d = await fetchJSON(url, 8000);
        if (d.totalSolved == null) continue;
        return { total: d.totalSolved, easy: d.easySolved, med: d.mediumSolved, hard: d.hardSolved,
          totE: d.totalEasy, totM: d.totalMedium, totH: d.totalHard, cal: d.submissionCalendar, live: true };
      } catch (e) { /* try the next one */ }
    }
    return { ...LC_SNAPSHOT, live: false };
  }

  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  function renderLC(d) {
    ['lc-total', 'hero-lc'].forEach((id) => {
      const el = document.getElementById(id);
      el.dataset.to = d.total;
      if (el.dataset.done) el.textContent = d.total;
    });
    setText('lc-easy', d.easy); setText('lc-med', d.med); setText('lc-hard', d.hard);
    const bar = (id, a, b) => { if (b) document.getElementById(id).style.setProperty('--p', (a / b).toFixed(3)); };
    bar('lc-easy-bar', d.easy, d.totE); bar('lc-med-bar', d.med, d.totM); bar('lc-hard-bar', d.hard, d.totH);
    setText('lc-status', d.live ? '· live' : '· last snapshot');

    let cal = d.cal || {};
    if (typeof cal === 'string') { try { cal = JSON.parse(cal); } catch (e) { cal = {}; } }
    const byDay = new Map();
    Object.entries(cal).forEach(([k, v]) => {
      const dt = new Date(Number(k) * 1000);
      byDay.set(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()), v);
    });
    const DAY = 86400000;
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const start = today - new Date(today).getUTCDay() * DAY - 25 * 7 * DAY;
    const grid = $('#heatmap');
    grid.textContent = '';
    for (let i = 0, t = start; i < 26 * 7; i++, t += DAY) {
      const c = document.createElement('i');
      c.style.setProperty('--i', i);
      if (t > today) c.style.visibility = 'hidden';
      else {
        const n = byDay.get(t) || 0;
        const lvl = n === 0 ? 0 : n < 4 ? 1 : n < 10 ? 2 : n < 20 ? 3 : 4;
        if (lvl) c.className = 'l' + lvl;
        c.title = `${n} submission${n === 1 ? '' : 's'} · ${new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`;
      }
      grid.append(c);
    }
    setText('lc-days', [...byDay.entries()].filter(([t, n]) => t > today - 365 * DAY && n > 0).length);
  }

  renderLC({ ...LC_SNAPSHOT, live: false });
  setText('lc-status', '· checking…');
  fetchLC().then(renderLC);

  /* ───────── 10. contact form → mail app ───────── */
  (function contact() {
    const form = $('#mail-form'), note = $('#form-note');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      const field = (n) => form.elements.namedItem(n);
      const bad = [];
      if (!f.name.trim()) bad.push(field('name'));
      if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) bad.push(field('email'));
      if (!f.message.trim()) bad.push(field('message'));
      $$('input, textarea', form).forEach((el) => el.classList.toggle('invalid', bad.includes(el)));
      if (bad.length) {
        note.textContent = 'Mutex says: a name, an email and a message, please.';
        note.classList.add('err');
        bad[0].focus();
        return;
      }
      const body = `${f.message.trim()}\n\n— ${f.name.trim()} (${f.email.trim()})`;
      location.href = `mailto:tarunkrajai@gmail.com?subject=${encodeURIComponent('Hi Tarun, from ' + f.name.trim())}&body=${encodeURIComponent(body)}`;
      note.classList.remove('err');
      note.textContent = 'Your mail app should open now. (Mutex pressed the button.)';
    });
  })();

  /* ───────── 11. paw trail, peeking cat, cat rain ───────── */
  if (finePointer && !reduced) {
    let lx = null, ly = null, acc = 0, side = 1, alive = 0;
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (lx === null) { lx = e.clientX; ly = e.clientY; return; }
      const dx = e.clientX - lx, dy = e.clientY - ly;
      acc += Math.hypot(dx, dy);
      lx = e.clientX; ly = e.clientY;
      if (acc < 64) return;
      acc = 0;
      if (alive > 14) return;
      const ang = Math.atan2(dy, dx);
      side *= -1;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      p.setAttribute('class', 'pawprint');
      p.innerHTML = '<use href="#paw"/>';
      const tf = `translate(-50%, -50%) rotate(${(ang * 180) / Math.PI + 90}deg)`;
      p.style.left = e.clientX + Math.cos(ang + Math.PI / 2) * 7 * side + 'px';
      p.style.top = e.clientY + Math.sin(ang + Math.PI / 2) * 7 * side + 'px';
      p.style.transform = tf;
      p.style.setProperty('--t', tf);
      document.body.append(p);
      alive++;
      setTimeout(() => { p.remove(); alive--; }, 1300);
    }, { passive: true });

    // A cat peeks in if you sit still for a while.
    const peek = $('#peek');
    let idle;
    const wake = () => { peek.classList.remove('show'); clearTimeout(idle); idle = setTimeout(() => peek.classList.add('show'), 14000); };
    ['pointermove', 'scroll', 'keydown'].forEach((ev) => addEventListener(ev, wake, { passive: true }));
    wake();
  }

  // Type "meow" anywhere.
  let typed = '';
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    typed = (typed + (e.key || '').toLowerCase()).slice(-4);
    if (typed !== 'meow') return;
    typed = '';
    say('MEOW.', 2500);
    if (reduced) return;
    const glyphs = ['🐈', '🐱', '😺', '😸', '😻', '🐈‍⬛', '🐾'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('span');
      const dur = 2 + Math.random() * 2;
      c.className = 'raincat';
      c.textContent = pick(glyphs);
      c.style.left = Math.random() * 100 + 'vw';
      c.style.fontSize = 24 + Math.random() * 30 + 'px';
      c.style.setProperty('--spin', (Math.random() - 0.5) * 720 + 'deg');
      c.style.animationDuration = dur + 's';
      c.style.animationDelay = Math.random() * 1.2 + 's';
      document.body.append(c);
      setTimeout(() => c.remove(), (dur + 1.4) * 1000);
    }
  });
})();
