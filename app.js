'use strict';
/* Personal Brand OS · aksi, import file, boot */
const DEMO = {
  Ide: [
    { id: 'd1', judul: 'Contoh: gaji naik vs skill naik di awal karier', pilar: 'Career & Work', tujuan: 'Personal', format: 'Carousel', tanggal: '', status: 'Mentah' }
  ],
  Post: [
    { id: 'dp1', judul: 'Contoh post carousel', tanggal: '', pilar: 'Career & Work', format: 'Carousel', tujuan: 'Personal', tayangan: '2500', reaksi: '30' }
  ],
  Ritme: [], Orang: [], Review: [], Metrik: [{ id: 'dm1', tanggal: '', pengikut: '1000', pengunjung_profil_7h: '10', tayangan_7h: '500' }],
  Profil: [
    { key: 'target_bulanan', value: '8' },
    { key: 'gaya_tulisan', value: 'Bahasa Indonesia campur English, santai, emoji secukupnya, hook kuat di baris pertama.' },
    { key: 'gaya_linkedin', value: 'Sedikit lebih profesional.' }, { key: 'gaya_threads', value: 'Kalem dan pendek.' }
  ]
};

const ACT = {
  demo() {
    S.demo = true;
    let d = null; try { d = JSON.parse(localStorage.getItem('pbos_demo') || 'null'); } catch (e) {}
    const t = new Date(); const td = today();
    TABS.forEach((k) => { S.db[k] = (d && d[k]) || JSON.parse(JSON.stringify(DEMO[k] || [])); });
    if (!d) { S.db.Post[0].tanggal = iso(addDays(t, -20)); S.db.Metrik[0].tanggal = td; }
    render();
  },
  settings() { S.modal = 'settings'; render(); },
  metrik() { S.modal = 'metrik'; render(); },
  addPost() { S.modal = 'addPost'; render(); },
  addOrang() { S.modal = 'addOrang'; render(); },
  closeModal(el, ev) { if (ev && el.classList.contains('modal') && ev.target !== el) return; S.modal = ''; render(); },
  logout() { localStorage.removeItem('pbos_key'); S.key = ''; S.demo = false; S.modal = ''; render(); },
  ritme(el) { const id = el.dataset.id; save('Ritme', { id: id, selesai: ritmeDone(id) ? '0' : '1' }, true); },
  /* ide */
  copyRekom() { copy(promptRekom(), 'Prompt disalin. Tempel di ChatGPT ✨'); },
  readRekom() {
    try {
      const a = parseBlock($('#pasteRekom').value);
      S.recs = (Array.isArray(a) ? a : a.ide || []).filter((x) => x && x.judul);
      if (!S.recs.length) throw new Error('kosong');
      try { localStorage.setItem('pbos_recs', JSON.stringify(S.recs)); } catch (e) {}
      $('#pasteRekom').value = '';
      render(); toast(S.recs.length + ' rekomendasi terbaca');
    } catch (e) { toast('Belum bisa dibaca: ' + e.message, true); }
  },
  addRec(el) {
    const r = S.recs[+el.dataset.i];
    save('Ide', { id: uid('i'), judul: r.judul, pilar: r.pilar, tujuan: r.tujuan, format: r.format, tanggal: r.tanggal || '', status: r.tanggal ? 'Terjadwal' : 'Mentah', catatan: r.alasan ? 'Alasan: ' + r.alasan : '', dibuat: today() });
    S.recs.splice(+el.dataset.i, 1); try { localStorage.setItem('pbos_recs', JSON.stringify(S.recs)); } catch (e) {}
    render();
  },
  calPrev() { const k = S.cal || mkey(new Date()); S.cal = mkey(new Date(+k.slice(0, 4), +k.slice(5, 7) - 2, 1)); render(); },
  calNext() { const k = S.cal || mkey(new Date()); S.cal = mkey(new Date(+k.slice(0, 4), +k.slice(5, 7), 1)); render(); },
  ideF(el) { S.ideF = el.dataset.id; render(); },
  cycle(el) {
    const i = S.db.Ide.find((x) => x.id === el.dataset.id); if (!i) return;
    const n = STATUS[(STATUS.indexOf(i.status || 'Mentah') + 1) % 3];
    const row = { id: i.id, status: n };
    if (n === 'Terjadwal' && !i.tanggal) row.tanggal = nextSlot();
    save('Ide', row, true);
  },
  delIdea(el) { const id = el.dataset.id; if (S.confirm !== id) { S.confirm = id; render(); return; } S.confirm = ''; del('Ide', [id]); },
  toStudio(el) { S.studio.id = el.dataset.id; location.hash = 'studio'; },
  /* studio */
  setFmt(el) { const i = curIdea(); save('Ide', { id: i.id, format: el.dataset.id }, true); },
  setTuj(el) { const i = curIdea(); save('Ide', { id: i.id, tujuan: el.dataset.id }, true); },
  copyDraft() { const i = curIdea(); if (!i.format || !i.tujuan) toast('Tips: pilih format & tujuan dulu biar draft lebih tepat'); copy(promptDraft(i), 'Prompt draft disalin. Tempel di ChatGPT ✨'); },
  readDraft() {
    try {
      const j = parseBlock($('#pasteDraft').value);
      const opsi = (Array.isArray(j) ? j : j.opsi || []).filter((o) => o && (o.linkedin || o.threads));
      if (!opsi.length) throw new Error('opsi kosong');
      $('#pasteDraft').value = '';
      save('Ide', { id: curIdea().id, opsi_json: JSON.stringify(opsi) });
    } catch (e) { toast('Belum bisa dibaca: ' + e.message, true); }
  },
  pickOpt(el) {
    const i = curIdea(); const o = jparse(i.opsi_json, [])[+el.dataset.i];
    const li = o.linkedin + (o.slides && o.slides.length ? '\n\n— Slide carousel —\n' + o.slides.map((s, k) => (k + 1) + '. ' + s).join('\n') : '');
    save('Ide', { id: i.id, draft_li: li, draft_th: o.threads || '' });
  },
  tab(el) { S.studio.tab = el.dataset.id; render(); },
  copyText(el) { const i = curIdea(); const t = el.dataset.id === 'li' ? i.draft_li : i.draft_th; if (!t) { toast('Draft masih kosong', true); return; } copy(t, 'Teks ' + (el.dataset.id === 'li' ? 'LinkedIn' : 'Threads') + ' disalin ✓'); },
  copyCek() { const i = curIdea(); if (!i.draft_li && !i.draft_th) { toast('Isi draft dulu', true); return; } copy(promptCek(i), 'Prompt cek tulisan disalin ✨'); },
  readCek() {
    try { const j = parseBlock($('#pasteCek').value); if (!j.aspek) throw new Error('format cek tidak sesuai'); $('#pasteCek').value = ''; save('Ide', { id: curIdea().id, cek_json: JSON.stringify(j) }); }
    catch (e) { toast('Belum bisa dibaca: ' + e.message, true); }
  },
  /* log */
  selPost(el) { S.log.sel = el.dataset.id; S.confirm = ''; render(); },
  delPost(el) { const id = el.dataset.id; if (S.confirm !== id) { S.confirm = id; render(); return; } S.confirm = ''; S.log.sel = ''; del('Post', [id]); },
  saveImp() {
    const imp = S.imp; if (!imp) return;
    S.imp = null;
    if (imp.posts.length) save('Post', imp.posts, true);
    if (imp.metrik) save('Metrik', imp.metrik, true);
    toast('Data export tersimpan ✓');
  },
  cancelImp() { S.imp = null; render(); },
  /* review */
  copyReview() { copy(promptReview(), 'Prompt review disalin ✨'); },
  readReview() {
    try {
      const j = parseBlock($('#pasteReview').value);
      if (!j.berhasil && !j.judul) throw new Error('format review tidak sesuai');
      $('#pasteReview').value = '';
      save('Review', { id: uid('r'), tanggal: today(), periode: 'Mingguan', judul: j.judul || '', berhasil: (j.berhasil || []).join(' | '), kurang: (j.kurang || []).join(' | '), eksperimen: j.eksperimen || '', ide: (j.ide || []).map((x) => x.judul).join(' | '), json: JSON.stringify(j) });
    } catch (e) { toast('Belum bisa dibaca: ' + e.message, true); }
  },
  revIde(el) {
    const r = S.db.Review.slice().sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)))[0];
    const x = jparse(r.json, {}).ide[+el.dataset.i];
    save('Ide', { id: uid('i'), judul: x.judul, pilar: x.pilar || '', tujuan: x.tujuan || '', format: x.format || '', status: 'Mentah', dibuat: today(), catatan: 'Dari review ' + r.tanggal });
  },
  /* networking */
  netLv(el) { S.net.lv = el.dataset.id; S.net.n = 50; render(); },
  netPot(el) { S.net.pot = el.dataset.id; S.net.n = 50; render(); },
  netMore() { S.net.n += 50; render(); },
  copyRiset() { const q = $('#rq').value.trim(); if (!q) { toast('Isi kriteria orang yang dicari dulu', true); return; } copy(promptRiset(q, $('#rlv').value), 'Prompt riset disalin. Aktifkan web search di ChatGPT ✨'); },
  readOrang() {
    try {
      const a = parseBlock($('#pasteOrang').value);
      const rows = (Array.isArray(a) ? a : a.orang || []).filter((o) => o && o.nama).map((o) => ({
        id: 'o' + hash(o.link || o.nama), nama: o.nama, peran: o.peran || '', perusahaan: o.perusahaan || '', level: String(num(o.level) || autoLevel(o.peran)),
        tahun_pengalaman: String(o.tahun_pengalaman || ''), potensi: POTENSI.indexOf(o.potensi) >= 0 ? o.potensi : autoPot(o.peran, num(o.level)), sumber: 'Riset GPT', kenapa: o.kenapa || '', link: o.link || ''
      }));
      if (!rows.length) throw new Error('kosong');
      $('#pasteOrang').value = '';
      S.netImp = { rows: rows, msg: rows.length + ' orang dari riset. Cek link-nya sebelum reach-out ya.', preview: rows.map((o) => '<div class="row between" style="padding:6px 0"><span><b>' + esc(o.nama) + '</b> · ' + esc(o.peran) + (o.perusahaan ? ' @ ' + esc(o.perusahaan) : '') + ' <span class="lv lv' + o.level + '">L' + o.level + '</span></span>' + (o.link ? '<a href="' + esc(o.link) + '" target="_blank" rel="noopener">cek ↗</a>' : '<span class="chip bad">tanpa link</span>') + '</div>').join('') };
      render();
    } catch (e) { toast('Belum bisa dibaca: ' + e.message, true); }
  },
  saveNet() { const r = S.netImp; S.netImp = null; if (r) save('Orang', r.rows); },
  cancelNet() { S.netImp = null; render(); },
  pesan(el) { const o = S.db.Orang.find((x) => x.id === el.dataset.id); copy(promptPesan(o), 'Prompt pesan disalin. Tempel di ChatGPT ✨'); },
  kontak(el) { save('Orang', { id: el.dataset.id, kontak_terakhir: today() }); }
};

const SUB = {
  async login(f) {
    const v = f.querySelector('#pass').value.trim();
    S.key = v;
    try { await load(); localStorage.setItem('pbos_key', v); boot2(); }
    catch (e) { S.key = ''; toast(e.message === 'passcode' ? 'Passcode salah' : 'Gagal terhubung: ' + e.message, true); }
  },
  insidental(f) { const t = f.querySelector('#ins').value.trim(); if (!t) return; save('Ide', { id: uid('i'), judul: t, pilar: f.querySelector('#insP').value, status: 'Terjadwal', tanggal: nextSlot(), catatan: 'Insidental', dibuat: today() }); f.querySelector('#ins').value = ''; },
  addIdea(f) { const t = f.querySelector('#newIdea').value.trim(); if (!t) return; save('Ide', { id: uid('i'), judul: t, pilar: f.querySelector('#newPilar').value, status: 'Mentah', dibuat: today() }); f.querySelector('#newIdea').value = ''; },
  publish(f) {
    const i = curIdea(); const url = f.querySelector('#pubUrl').value.trim(); const d = f.querySelector('#pubDate').value || today();
    save('Post', { id: uid('p'), judul: i.judul, tanggal: d, url: url, pilar: i.pilar || '', format: i.format || '', tujuan: i.tujuan || '' }, true);
    save('Ide', { id: i.id, status: 'Uploaded', tanggal: d, post_url: url });
    toast('Mantap! Tercatat di Log 🎉');
  },
  editPost(f) {
    const v = (id) => f.querySelector('#' + id).value.trim();
    save('Post', { id: f.dataset.id, judul: v('pJ'), tanggal: v('pT'), format: v('pF'), pilar: v('pP'), tujuan: v('pTu'), tayangan: v('m_tayangan'), reaksi: v('m_reaksi'), komentar: v('m_komentar'), repost: v('m_repost'), url: v('pU'), peluang: v('pO') });
  },
  settings(f) { S.modal = ''; save('Profil', PROFIL_FIELDS.map((x) => ({ key: x[0], value: f.querySelector('#pf_' + x[0]).value.trim() }))); },
  metrik(f) {
    const v = (id) => f.querySelector('#mt_' + id).value.trim();
    S.modal = ''; save('Metrik', { id: 'm' + today().replace(/-/g, ''), tanggal: today(), pengikut: v('pengikut'), pengunjung_profil_7h: v('pengunjung_profil_7h'), tayangan_7h: v('tayangan_7h'), sumber: 'Manual' });
  },
  addPost(f) { const v = (id) => f.querySelector('#' + id).value.trim(); S.modal = ''; save('Post', { id: uid('p'), judul: v('ap_j'), tanggal: v('ap_t'), url: v('ap_u'), pilar: v('ap_p') }); },
  addOrang(f) {
    const v = (id) => f.querySelector('#ao_' + id).value.trim(); const lv = autoLevel(v('peran'));
    S.modal = ''; save('Orang', { id: 'o' + hash(v('link') || v('nama')), nama: v('nama'), peran: v('peran'), perusahaan: v('perusahaan'), link: v('link'), kenapa: v('kenapa'), level: String(lv), potensi: autoPot(v('peran'), lv), sumber: 'Manual' });
  }
};

const CH = {
  ideDate(el) { const i = S.db.Ide.find((x) => x.id === el.dataset.id); const row = { id: el.dataset.id, tanggal: el.value }; if (el.value && i && i.status === 'Mentah') row.status = 'Terjadwal'; save('Ide', row, true); },
  pickIdea(el) { S.studio.id = el.value; render(); },
  ideNote(el) { save('Ide', { id: curIdea().id, catatan: el.value }, true); },
  ed(el) { const k = S.studio.tab === 'li' ? 'draft_li' : 'draft_th'; save('Ide', { id: curIdea().id, [k]: el.value }, true); },
  oLevel(el) { save('Orang', { id: el.dataset.id, level: el.value }, true); },
  oPot(el) { save('Orang', { id: el.dataset.id, potensi: el.value }, true); },
  logFile(el) { const f = el.files[0]; if (f) readFile(f, importLinkedIn); el.value = ''; },
  netFile(el) { const f = el.files[0]; if (f) readFile(f, importConnections, true); el.value = ''; }
};

/* ---------- file import ---------- */
function readFile(file, fn, asText) {
  if (!window.XLSX) { toast('Pembaca file belum siap, coba lagi sebentar', true); return; }
  const r = new FileReader();
  r.onload = () => { try { fn(r.result, file.name); } catch (e) { console.error(e); toast('Gagal membaca file: ' + e.message, true); } };
  if (asText || /\.csv$/i.test(file.name)) r.readAsText(file); else r.readAsArrayBuffer(file);
}
function toISO(v) {
  if (v instanceof Date) return iso(v);
  if (typeof v === 'number' && v > 20000 && v < 80000) { const d = XLSX.SSF.parse_date_code(v); return d.y + '-' + pad(d.m) + '-' + pad(d.d); }
  const s = String(v || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (m) return m[3] + '-' + pad(m[1]) + '-' + pad(m[2]);
  const d = new Date(s); return isNaN(d) ? '' : iso(d);
}
function importLinkedIn(buf, name) {
  const wb = typeof buf === 'string' ? XLSX.read(buf, { type: 'string' }) : XLSX.read(buf, { type: 'array', cellDates: true });
  const found = {}; const met = {}; const series = {};
  wb.SheetNames.forEach((sn) => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: true, defval: '' });
    rows.forEach((r) => {
      for (let i = 0; i < r.length; i++) {
        const s = String(r[i]).toLowerCase().trim();
        const m = s.match(/(total followers|total pengikut)[^:]*:\s*([\d.,]+)/);
        if (m) met.pengikut = num(m[2]);
        const nx = r[i + 1];
        if (nx !== undefined && nx !== '' && !isNaN(num(nx))) {
          if (/^(total followers|total pengikut)/.test(s)) met.pengikut = num(nx);
          if (/^(impressions|tayangan)$/.test(s)) met.impr = num(nx);
          if (/members reached|anggota.*dijangkau|jangkauan/.test(s)) met.members_reached = num(nx);
        }
      }
    });
    let hi = -1;
    for (let i = 0; i < Math.min(rows.length, 20); i++) { if (rows[i].some((c) => /url|tautan/i.test(String(c)))) { hi = i; break; } }
    if (hi >= 0) {
      const h = rows[hi].map((c) => String(c).toLowerCase());
      const groups = []; h.forEach((c, j) => { if (/url|tautan/.test(c)) groups.push(j); });
      groups.forEach((j, gi) => {
        const end = groups[gi + 1] || h.length;
        let dc = -1; const mc = [];
        for (let k = j + 1; k < end; k++) { if (!h[k]) continue; if (/date|tanggal/.test(h[k])) dc = k; else mc.push([k, h[k]]); }
        for (let i = hi + 1; i < rows.length; i++) {
          const u = String(rows[i][j] || '').trim(); if (!/linkedin\.com/.test(u)) continue;
          const p = found[u] || (found[u] = { url: u });
          if (dc >= 0 && rows[i][dc] !== '') p.tanggal = toISO(rows[i][dc]);
          mc.forEach((x) => {
            const v = num(rows[i][x[0]]);
            if (/impression|tayangan/.test(x[1])) p.tayangan = v;
            else if (/engagement|interaksi|keterlibatan/.test(x[1])) p.engagement = v;
            else if (/reaction|reaksi/.test(x[1])) p.reaksi = v;
            else if (/comment|komentar/.test(x[1])) p.komentar = v;
            else if (/repost|share|dibagikan/.test(x[1])) p.repost = v;
          });
        }
      });
    } else {
      let di = -1;
      for (let i = 0; i < Math.min(rows.length, 20); i++) { if (rows[i].some((c) => /^(date|tanggal)$/i.test(String(c).trim()))) { di = i; break; } }
      if (di >= 0) {
        const h = rows[di].map((c) => String(c).toLowerCase().trim());
        const dc = h.findIndex((c) => /^(date|tanggal)$/.test(c));
        for (let i = di + 1; i < rows.length; i++) {
          const d = toISO(rows[i][dc]); if (!d) continue;
          h.forEach((c, k) => { if (k === dc || !c) return; (series[c] = series[c] || []).push([d, num(rows[i][k])]); });
        }
      }
    }
  });
  const sum7 = (re) => {
    const key = Object.keys(series).find((k) => re.test(k)); if (!key) return null;
    const s = series[key]; const mx = s.map((x) => x[0]).sort().pop(); const from = iso(addDays(pd(mx), -6));
    return s.filter((x) => x[0] >= from).reduce((a, b) => a + b[1], 0);
  };
  const t7 = sum7(/impression|tayangan/);
  const f7 = sum7(/new followers|pengikut baru/);
  const list = Object.keys(found).map((u) => found[u]);
  const rows = []; let baru = 0, update = 0;
  list.forEach((p) => {
    let ex = S.db.Post.find((x) => x.url && x.url.split('?')[0] === p.url.split('?')[0]);
    if (!ex && p.tanggal) ex = S.db.Post.find((x) => !x.url && x.tanggal === p.tanggal);
    const row = { id: ex ? ex.id : 'p' + hash(p.url), url: p.url };
    ['tanggal', 'tayangan', 'engagement', 'reaksi', 'komentar', 'repost'].forEach((k) => { if (p[k] !== undefined && p[k] !== '') row[k] = String(p[k]); });
    if (ex && ex.tanggal) delete row.tanggal;
    if (!ex) { row.judul = 'Post ' + (p.tanggal ? nice(p.tanggal) : 'baru') + ' (ganti judul)'; baru++; } else update++;
    rows.push(row);
  });
  const prev = latestMetrik().cur;
  const metrik = (met.pengikut || t7 != null) ? { id: 'm' + today().replace(/-/g, ''), tanggal: today(), pengikut: String(met.pengikut || prev.pengikut || ''), tayangan_7h: String(t7 != null ? t7 : (prev.tayangan_7h || '')), members_reached: String(met.members_reached || ''), pengunjung_profil_7h: String(prev.pengunjung_profil_7h || ''), sumber: 'Export ' + name } : null;
  if (!rows.length && !metrik) { toast('Tidak menemukan data post atau pengikut di file ini. Pastikan ini file export analitik LinkedIn.', true); return; }
  S.imp = {
    posts: rows, metrik: metrik,
    msg: 'Dari <b>' + esc(name) + '</b>: ' + rows.length + ' post dengan link (' + update + ' cocok dengan post yang ada, ' + baru + ' baru)' +
      (met.pengikut ? ' · pengikut <b>' + fmt(met.pengikut) + '</b>' : '') + (t7 != null ? ' · tayangan 7 hari <b>' + fmt(t7) + '</b>' : '') + (f7 != null ? ' · pengikut baru 7 hari <b>' + fmt(f7) + '</b>' : '') +
      (baru ? '<br><span class="mut">Post baru diberi judul sementara. Ganti judulnya di panel detail.</span>' : '')
  };
  render();
}
function importConnections(text) {
  const lines = String(text).split(/\r?\n/);
  const hi = lines.findIndex((l) => /first name/i.test(l));
  if (hi < 0) { toast('Ini bukan Connections.csv dari LinkedIn (kolom First Name tidak ada)', true); return; }
  const wb = XLSX.read(lines.slice(hi).join('\n'), { type: 'string', raw: true });
  const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const g = (r, re) => { const k = Object.keys(r).find((x) => re.test(x)); return k ? String(r[k]).trim() : ''; };
  const rows = []; let baru = 0;
  data.forEach((r) => {
    const url = g(r, /^url$/i); const nama = (g(r, /first name/i) + ' ' + g(r, /last name/i)).trim();
    if (!nama) return;
    const id = 'o' + hash(url || nama); const peran = g(r, /position/i); const ex = S.db.Orang.find((x) => x.id === id);
    const row = { id: id, nama: nama, peran: peran, perusahaan: g(r, /company/i), link: url };
    if (!ex) { const lv = autoLevel(peran); row.level = String(lv); row.potensi = autoPot(peran, lv); row.sumber = 'Koneksi'; row.catatan = 'Terhubung ' + g(r, /connected on/i); baru++; }
    rows.push(row);
  });
  const cnt = { 4: 0, 3: 0, 2: 0, 1: 0 }; rows.forEach((r) => { const l = r.level || (S.db.Orang.find((x) => x.id === r.id) || {}).level; cnt[l] = (cnt[l] || 0) + 1; });
  S.netImp = { rows: rows, msg: rows.length + ' koneksi terbaca (' + baru + ' baru) · L4 ' + cnt[4] + ' · L3 ' + cnt[3] + ' · L2 ' + cnt[2] + ' · L1 ' + cnt[1] + '. Email tidak disimpan.' };
  render();
}

/* ---------- events & boot ---------- */
document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'A') ev.preventDefault();
  fn(el, ev);
});
document.addEventListener('submit', (ev) => {
  const f = ev.target.closest('[data-sub]'); if (!f) return;
  ev.preventDefault(); const fn = SUB[f.dataset.sub]; if (fn) fn(f);
});
document.addEventListener('change', (ev) => { const el = ev.target.closest('[data-ch]'); if (el && CH[el.dataset.ch]) CH[el.dataset.ch](el); });
let qT = null;
document.addEventListener('input', (ev) => {
  const el = ev.target; if (el.dataset && el.dataset.in === 'netQ') { clearTimeout(qT); qT = setTimeout(() => { S.net.q = el.value; S.net.n = 50; render(); }, 250); }
});
window.addEventListener('hashchange', () => { S.page = (location.hash || '#beranda').slice(1); S.confirm = ''; render(); window.scrollTo(0, 0); });
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && S.modal) { S.modal = ''; render(); } });

function boot2() { S.page = (location.hash || '#beranda').slice(1); render(); }
(async function boot() {
  try { S.recs = JSON.parse(localStorage.getItem('pbos_recs') || '[]'); } catch (e) { S.recs = []; }
  S.key = localStorage.getItem('pbos_key') || '';
  if (S.key) {
    try { await load(); } catch (e) { if (e.message === 'passcode') { S.key = ''; localStorage.removeItem('pbos_key'); } else toast('Gagal memuat data: ' + e.message, true); }
  }
  boot2();
})();
