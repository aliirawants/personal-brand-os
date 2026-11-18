'use strict';
/* Personal Brand OS · halaman */
const NAV = [['beranda', 'Beranda'], ['ide', 'Ide'], ['studio', 'Studio'], ['log', 'Log'], ['review', 'Review'], ['networking', 'Networking']];

function header() {
  const d = new Date();
  return '<header class="top"><div class="pill brand"><i></i>Personal Brand OS</div>' +
    '<nav class="pill nav" aria-label="Menu utama">' + NAV.map((n) => '<a href="#' + n[0] + '" class="' + (S.page === n[0] ? 'on' : '') + '">' + n[1] + '</a>').join('') + '</nav>' +
    '<div class="tr">' + (S.demo ? '<span class="pill demo">Mode contoh</span>' : '') +
    '<span class="pill">' + HARI[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear() + '</span>' +
    '<button class="iconbtn" data-act="settings" aria-label="Pengaturan"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button></div></header>';
}

function lockScreen() {
  return '<div class="lock"><form class="card" data-sub="login"><img src="linkedin.png" alt="LinkedIn" style="height:44px;width:auto;align-self:flex-start">' +
    '<div class="h2">Personal Brand OS</div><div class="mut">Masukkan passcode untuk membuka data dari Google Sheet.</div>' +
    '<label for="pass" class="small" style="font-weight:600">Passcode</label><input id="pass" type="password" autocomplete="current-password" required>' +
    '<button class="btn" type="submit">Masuk</button><button class="btn ghost" type="button" data-act="demo">Coba mode contoh</button></form></div>';
}

/* ================= BERANDA ================= */
function pBeranda() {
  const now = new Date();
  const m = latestMetrik();
  const fol = num(m.cur.pengikut);
  const folD = m.prev ? fol - num(m.prev.pengikut) : null;
  const five = new Date(now.getFullYear(), now.getMonth() - 4, 1);
  const p5 = S.db.Post.filter((p) => p.tanggal && pd(p.tanggal) >= five);
  const total = Math.max(num(prof('total_post', 0)), S.db.Post.length);
  const byP = {}; p5.forEach((p) => { byP[p.pilar || 'Lainnya'] = (byP[p.pilar || 'Lainnya'] || 0) + 1; });
  const months = lastMonths(6);
  const mx = Math.max(1, ...months.map((x) => x.avg));
  const withData = months.filter((x) => x.avg > 0);
  let mom = '';
  if (withData.length >= 2) {
    const a = withData[withData.length - 1], b = withData[withData.length - 2];
    const pct = Math.round((a.avg / b.avg - 1) * 100);
    mom = '<span class="chip ' + (pct >= 0 ? 'okl' : 'bad') + '">' + a.n + ' vs ' + b.n + ': ' + (pct >= 0 ? '+' : '') + pct + '%</span>';
  }
  const target = num(prof('target_bulanan', 8)) || 8;
  const thisM = S.db.Post.filter((p) => String(p.tanggal).slice(0, 7) === mkey(now)).length;
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const sisa = last - now.getDate();
  const next = S.db.Ide.filter((i) => i.status === 'Terjadwal' && i.tanggal >= today()).sort((a, b) => a.tanggal.localeCompare(b.tanggal))[0];
  const ws = weekStart(now);
  const done = weekScore(ws);
  const hist = [3, 2, 1].map((k) => Math.round(weekScore(addDays(ws, -7 * k)) / 6 * 100));
  let days = '';
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i); const id = iso(d); const dw = d.getDay();
    const off = dw === 0; const ok = ritmeDone(id); const td = id === today();
    days += '<button class="day' + (ok ? ' done' : '') + (td ? ' today' : '') + (off ? ' off' : '') + '" ' + (off ? 'disabled' : 'data-act="ritme" data-id="' + id + '"') + ' aria-pressed="' + ok + '">' +
      '<span class="d">' + HARI[dw] + ' ' + d.getDate() + (td ? ' · hari ini' : '') + '</span><span class="t">' + esc(RITME[dw]) + '</span>' +
      '<span class="chip ' + (off ? '' : ok ? 'ok' : '') + '">' + (off ? 'Libur' : ok ? 'Sudah' : 'Belum') + '</span></button>';
  }
  return '<section class="hero"><div class="row" style="gap:24px"><img src="linkedin.png" alt="LinkedIn"><div><div class="h1">Daily Dashboard</div><div class="mut">Ali Irawan · cek 15 menit, lalu kerjakan satu hal.</div></div></div>' +
    '<div class="grid3" style="min-width:min(560px,100%)">' +
    '<div class="stat"><div class="small mut">Pengikut</div><b>' + fmt(fol) + '</b><div class="small ' + (folD > 0 ? '' : 'mut') + '" style="' + (folD > 0 ? 'color:var(--ok);font-weight:600' : '') + '">' + (folD == null ? 'per ' + nice(m.cur.tanggal) : (folD >= 0 ? '+' : '') + fmt(folD) + ' sejak update lalu') + '</div></div>' +
    '<div class="stat"><div class="small mut">Pengunjung profil</div><b>' + fmt(m.cur.pengunjung_profil_7h) + '</b><div class="small mut">7 hari</div></div>' +
    '<div class="stat"><div class="small mut">Tayangan post</div><b>' + fmt(m.cur.tayangan_7h) + '</b><div class="small mut">7 hari · <button class="btn sm ghost" style="min-height:24px;padding:0 8px" data-act="metrik">Update</button></div></div></div></section>' +
    '<section style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr) minmax(0,1fr);gap:16px" class="g3r">' +
    '<div class="card"><div class="h3">Post 5 bulan terakhir</div><div class="row" style="align-items:baseline;gap:8px"><span class="big">' + p5.length + '</span><span class="mut">dari ' + total + ' total post</span></div>' +
    '<div class="list small">' + Object.keys(byP).sort((a, b) => byP[b] - byP[a]).map((k) => '<div class="row between" style="padding:5px 0"><span class="mut">' + esc(k) + '</span><b>' + byP[k] + '</b></div>').join('') + '</div></div>' +
    '<div class="card"><div class="row between"><div class="h3">Rata-rata tayangan per bulan</div>' + mom + '</div>' +
    '<div class="bars" style="grid-template-columns:repeat(6,minmax(0,1fr));height:170px">' + months.map((x) => '<div class="b"><span>' + (x.avg ? fmt(x.avg) : '—') + '</span><i class="' + (x.avg ? '' : 'z') + '" style="height:' + Math.max(4, Math.round(x.avg / mx * 130)) + 'px"></i></div>').join('') + '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px;text-align:center">' + months.map((x) => '<div><div style="font-weight:600">' + x.n + '</div><div class="tiny mut">' + x.count + ' post</div></div>').join('') + '</div></div>' +
    '<div class="card dark"><div class="h3">Target ' + MON[now.getMonth()] + '</div><div class="row" style="align-items:baseline;gap:8px"><span class="big">' + thisM + '</span><span class="mut">/ ' + target + ' post</span></div>' +
    '<div class="prog" style="background:#1E3354"><i style="width:' + Math.min(100, Math.round(thisM / target * 100)) + '%;background:#60A5FA"></i></div>' +
    '<div class="small mut row between"><span>Sisa hari</span><b style="color:#fff">' + sisa + '</b></div>' +
    '<div class="small mut row between"><span>Tercapai</span><b style="color:#fff">' + Math.round(thisM / target * 100) + '%</b></div>' +
    '<div class="small mut row between"><span>Post berikutnya</span><b style="color:#fff">' + (next ? nice(next.tanggal) : 'belum dijadwalkan') + '</b></div></div></section>' +
    '<section class="card"><div class="row between"><div><div class="h3" style="font-size:16px">Ritme harian · ' + ws.getDate() + ' ' + MON[ws.getMonth()] + '–' + addDays(ws, 6).getDate() + ' ' + MON[addDays(ws, 6).getMonth()] + '</div><div class="small mut">Klik kartu kalau sudah dikerjakan. Minggu libur, tidak dihitung.</div></div>' +
    '<div class="row"><span class="small mut">3 minggu lalu: ' + hist.map((h) => h + '%').join(' · ') + '</span><span class="small mut">Konsistensi minggu ini</span><span style="font-size:28px;font-weight:800;color:var(--blue-d)">' + Math.round(done / 6 * 100) + '%</span><span class="small mut">' + done + ' dari 6</span></div></div>' +
    '<div class="days">' + days + '</div></section>';
}

/* ================= IDE ================= */
function nextSlot() {
  const taken = S.db.Ide.filter((i) => i.status !== 'Mentah').map((i) => i.tanggal);
  for (let k = 1; k < 28; k++) { const d = addDays(new Date(), k); if ((d.getDay() === 2 || d.getDay() === 5) && taken.indexOf(iso(d)) < 0) return iso(d); }
  return iso(addDays(new Date(), 1));
}
function promptRekom() {
  const bank = S.db.Ide.filter((i) => i.status !== 'Uploaded').map((i) => '- ' + i.judul + (i.tanggal ? ' (' + i.tanggal + ')' : '')).join('\n') || '-';
  return 'Kamu content strategist LinkedIn untuk penulis di bawah ini.\n\n' + brandCtx() + '\n\n' + perfCtx(15) +
    '\n\nIDE YANG SUDAH ADA (jangan duplikat):\n' + bank +
    '\n\nTUGAS: Rekomendasikan 4 ide post untuk 2 minggu ke depan mulai ' + today() + '. Slot utama Selasa dan Jumat. Prioritaskan pola yang terbukti perform di data, isi pilar/tujuan yang masih kosong atau kurang, dan jaga porsi Selling maksimal 10%. Setiap ide harus spesifik dan bisa diceritakan dari pengalaman nyata penulis. Sampel data kecil, jadi alasanmu jangan berlebihan.' +
    '\n\nBalas HANYA dengan satu code block berlabel pbos-ide:\n' + FENCE + 'pbos-ide\n[{"judul":"...","pilar":"salah satu: ' + PILAR.join(' / ') + '","tujuan":"salah satu: ' + TUJUAN.map((t) => t.n).join(' / ') + '","format":"salah satu: ' + FORMAT.map((f) => f.n).join(' / ') + '","tanggal":"YYYY-MM-DD","alasan":"1 kalimat berbasis data"}]\n' + FENCE;
}
function pIde() {
  const ms = lastMonths(6); const mx = Math.max(1, ...ms.map((x) => x.avg));
  const k = S.cal || mkey(new Date());
  const y = +k.slice(0, 4), mo = +k.slice(5, 7) - 1;
  const first = new Date(y, mo, 1); const lead = (first.getDay() + 6) % 7; const nd = new Date(y, mo + 1, 0).getDate();
  let cells = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((h) => '<div class="h">' + h + '</div>').join('');
  for (let i = 0; i < lead; i++) cells += '<div class="cell blank"></div>';
  for (let d = 1; d <= nd; d++) {
    const id = k + '-' + pad(d);
    const ev = S.db.Ide.filter((i) => i.tanggal === id && i.status !== 'Uploaded').map((i) => '<button class="ev ' + (i.status === 'Mentah' ? 'raw' : '') + '" data-act="toStudio" data-id="' + i.id + '" title="' + esc(i.judul) + '">' + esc(i.judul) + '</button>').join('') +
      S.db.Post.filter((p) => p.tanggal === id).map((p) => p.url ? '<a class="ev up" href="' + esc(p.url) + '" target="_blank" rel="noopener" title="' + esc(p.judul) + '" style="text-decoration:none">✓ ' + esc(p.judul) + '</a>' : '<span class="ev up" title="' + esc(p.judul) + '">✓ ' + esc(p.judul) + '</span>').join('');
    cells += '<div class="cell' + (id === today() ? ' today' : '') + '"><span class="n">' + d + '</span>' + ev + '</div>';
  }
  const f = S.ideF;
  const ideas = S.db.Ide.filter((i) => f === 'all' || i.status === f).sort((a, b) => (a.tanggal || '9999').localeCompare(b.tanggal || '9999'));
  const cnt = (s) => S.db.Ide.filter((i) => i.status === s).length;
  const recs = S.recs.length ? '<div class="grid4">' + S.recs.map((r, i) => '<div class="card" style="gap:8px;border:' + (i === 0 ? '2px solid var(--blue)' : '') + '"><div class="row between small" style="font-weight:700"><span style="color:var(--blue-d)">' + nice(r.tanggal) + '</span><span class="mut">' + esc(r.tujuan) + ' · ' + esc(r.format) + '</span></div><div style="font-size:16px;font-weight:700;line-height:1.4">' + esc(r.judul) + '</div><div class="small mut">' + esc(r.alasan) + '</div><button class="btn sm soft" data-act="addRec" data-i="' + i + '" style="margin-top:auto">+ Ke bank ide</button></div>').join('') + '</div>' : '';
  return '<div class="row between" style="align-items:flex-end"><div><h1 class="h1">Bank Ide &amp; Kalender</h1><div class="mut">Simpan ide, jadwalkan, tandai kalau sudah di-upload.</div></div>' +
    '<div class="card" style="padding:12px 16px;gap:8px;min-width:min(380px,100%)"><div class="row between small"><b>Growth per bulan</b><span class="mut">post · rata-rata tayangan</span></div>' +
    '<div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;align-items:end;height:44px">' + ms.map((x) => '<div style="height:' + Math.max(2, Math.round(x.avg / mx * 44)) + 'px;background:' + (x.avg ? '#93B4F8' : '#E2E8F0') + ';border-radius:4px"></div>').join('') + '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;text-align:center" class="tiny mut">' + ms.map((x) => '<span>' + x.n + '<br>' + x.count + ' · ' + (x.avg ? (x.avg >= 1000 ? (x.avg / 1000).toFixed(1).replace('.', ',') + 'rb' : x.avg) : '—') + '</span>').join('') + '</div></div></div>' +
    '<section class="card"><div class="row between"><div class="row"><div class="h2">Rekomendasi post</div><span class="chip blue">ChatGPT · dari data post-mu</span></div><span class="small mut">Prompt → ChatGPT → tempel jawabannya di sini</span></div>' +
    '<div class="grid2" style="align-items:start"><div class="steps"><div class="step"><span class="no">1</span><div style="flex:1"><button class="btn" data-act="copyRekom">Salin prompt rekomendasi</button><div class="small mut" style="margin-top:6px">Sudah berisi data post, pilar, dan gaya tulisanmu.</div></div></div>' +
    '<div class="step"><span class="no">2</span><div style="flex:1;display:flex;flex-direction:column;gap:8px"><label for="pasteRekom" class="small" style="font-weight:600">Tempel jawaban ChatGPT</label><textarea id="pasteRekom" class="paste" placeholder="' + FENCE + 'pbos-ide ..."></textarea><button class="btn darkb" data-act="readRekom">Baca rekomendasi</button></div></div></div>' +
    '<form class="card" data-sub="insidental" style="background:var(--warn-l);border:1px dashed #E8B04B"><div class="eyebrow" style="color:#92400E">Slot insidental</div><label for="ins" style="font-weight:600">Ada kejadian yang pengin di-post?</label><input id="ins" placeholder="Event, momen kantor, berita…" required><div class="row"><select id="insP" aria-label="Pilar">' + PILAR.map((p) => '<option>' + p + '</option>').join('') + '</select><button class="btn darkb" type="submit">Jadwalkan di slot terdekat</button></div><div class="small mut">Slot kosong berikutnya: ' + nice(nextSlot()) + '</div></form></div>' + recs + '</section>' +
    '<div class="flex"><section class="card side" style="flex:1 1 440px"><div class="row between"><button class="btn sm ghost" data-act="calPrev" aria-label="Bulan sebelumnya">‹</button><div class="h3">' + MON[mo] + ' ' + y + '</div><button class="btn sm ghost" data-act="calNext" aria-label="Bulan berikutnya">›</button></div>' +
    '<div class="row small mut" style="gap:14px"><span><span class="ev" style="display:inline;width:auto">Terjadwal</span></span><span><span class="ev raw" style="display:inline;width:auto">Mentah</span></span><span><span class="ev up" style="display:inline;width:auto">Uploaded</span></span></div><div class="cal">' + cells + '</div></section>' +
    '<section class="card main"><div class="row between"><div class="h3" style="font-size:16px">Bank ide</div><div class="chips">' + [['all', 'Semua ' + S.db.Ide.length]].concat(STATUS.map((s) => [s, s + ' ' + cnt(s)])).map((c) => '<button class="' + (f === c[0] ? 'on' : '') + '" data-act="ideF" data-id="' + c[0] + '">' + c[1] + '</button>').join('') + '</div></div>' +
    '<form class="row" data-sub="addIdea"><label for="newIdea" class="sr">Ide baru</label><input id="newIdea" placeholder="Tulis ide satu kalimat…" required style="flex:1 1 260px;width:auto"><select id="newPilar" aria-label="Pilar" style="width:auto">' + PILAR.map((p) => '<option>' + p + '</option>').join('') + '</select><button class="btn" type="submit">Simpan</button></form>' +
    '<div class="list">' + (ideas.length ? ideas.map((i) => '<div style="display:grid;grid-template-columns:minmax(0,1fr) 150px 110px auto;gap:10px;align-items:center;padding:10px 0">' +
      '<div><div style="font-weight:600;line-height:1.4">' + esc(i.judul) + '</div><div class="small mut">' + esc([i.pilar, i.tujuan, i.format].filter(Boolean).join(' · ')) + '</div></div>' +
      '<input type="date" value="' + esc(i.tanggal) + '" data-ch="ideDate" data-id="' + i.id + '" aria-label="Tanggal post" style="padding:7px 8px">' +
      '<button class="chip ' + (i.status === 'Uploaded' ? 'ok' : i.status === 'Terjadwal' ? 'blue' : '') + '" style="border:0;min-height:34px;justify-content:center" data-act="cycle" data-id="' + i.id + '">' + esc(i.status || 'Mentah') + '</button>' +
      '<div class="row" style="gap:6px"><button class="btn sm soft" data-act="toStudio" data-id="' + i.id + '">Studio</button><button class="btn sm danger" data-act="delIdea" data-id="' + i.id + '">' + (S.confirm === i.id ? 'Yakin?' : 'Hapus') + '</button></div></div>').join('') : '<div class="empty">Belum ada ide di filter ini.</div>') + '</div></section></div>' +
    '<section class="card dark"><div class="row between"><div class="h2">Gaya tulisanku · dipakai di setiap prompt</div><button class="btn sm ghost" data-act="settings">Edit</button></div>' +
    '<div class="grid3 small" style="line-height:1.65"><div style="background:#13284A;border-radius:14px;padding:16px"><b style="color:#93B4F8">Gaya umum</b><div>' + esc(prof('gaya_tulisan')) + '</div></div>' +
    '<div style="background:#13284A;border-radius:14px;padding:16px"><b style="color:#93B4F8">LinkedIn</b><div>' + esc(prof('gaya_linkedin')) + '</div></div>' +
    '<div style="background:#13284A;border-radius:14px;padding:16px"><b style="color:#93B4F8">Threads</b><div>' + esc(prof('gaya_threads')) + '</div></div></div></section>';
}

/* ================= STUDIO ================= */
function curIdea() {
  const list = S.db.Ide;
  let i = list.find((x) => x.id === S.studio.id);
  if (!i) i = list.filter((x) => x.status !== 'Uploaded').sort((a, b) => (a.tanggal || '9999').localeCompare(b.tanggal || '9999'))[0];
  if (i) S.studio.id = i.id;
  return i;
}
function promptDraft(i) {
  const t = TUJUAN.find((x) => x.n === i.tujuan);
  return 'Kamu ghostwriter yang meniru gaya penulis di bawah ini dengan sangat dekat. Tulisan harus terasa ditulis manusia, bukan AI.\n\n' + brandCtx() +
    '\n\nIDE: ' + i.judul + '\nPILAR: ' + (i.pilar || '-') + '\nTUJUAN KONTEN: ' + (i.tujuan || '-') + (t ? ' (' + t.why + '; diukur dari ' + t.ukur + ')' : '') + '\nFORMAT: ' + (i.format || 'Teks') +
    '\nCerita/catatan dari penulis: ' + (i.catatan || '(tidak ada. JANGAN mengarang kejadian spesifik, angka, atau nama. Pakai sudut pandang umum: kita, kalian, banyak orang.)') +
    '\n\nTUGAS: Buat 3 opsi tulisan dengan angle berbeda (misalnya pengalaman/cerita, kontrarian, framework/edukasi). Untuk tiap opsi:\n' +
    '- linkedin: 120–220 kata. Hook kuat di baris pertama. Satu insight jelas. Baris pendek. Emoji secukupnya. Sekitar 10% kata dipanjangin hurufnya (jujurr, yaaa, bangett). Boleh tidak sempurna. Penutup pertanyaan spesifik yang gampang dijawab.\n' +
    '- threads: 2–4 baris, kalem, boleh huruf kecil.\n' +
    (i.format === 'Carousel' ? '- slides: 5–7 judul slide carousel yang singkat dan nendang.\n' : '') +
    'Jangan pakai kata gua/gue, jangan "menurut penulis", jangan pola "Dua tahun lalu aku merasa..., lalu..., itu yang aku sebut...". "Aku" seperlunya saja.\n\n' +
    'Balas HANYA dengan satu code block berlabel pbos-draft (pakai \\n untuk baris baru di dalam string):\n' + FENCE + 'pbos-draft\n{"opsi":[{"angle":"...","hook":"baris pertama","linkedin":"...","threads":"...","slides":["..."],"kenapa":"1 kalimat kenapa opsi ini kuat"}]}\n' + FENCE;
}
function promptCek(i) {
  const t = TUJUAN.find((x) => x.n === i.tujuan);
  return 'Kamu editor LinkedIn yang jujur, spesifik, dan tidak basa-basi. Nilai tulisan berikut sesuai gaya penulisnya.\n\n' + brandCtx() +
    '\n\nTUJUAN KONTEN: ' + (i.tujuan || '-') + (t ? ' (' + t.why + ')' : '') + '\nFORMAT: ' + (i.format || '-') +
    '\n\nTULISAN LINKEDIN:\n"""\n' + (i.draft_li || '') + '\n"""\n\nTULISAN THREADS:\n"""\n' + (i.draft_th || '') + '\n"""\n\n' +
    'Nilai 12 aspek (skor 1–10 + catatan spesifik, kutip bagian tulisannya bila perlu): Hook pembuka; Bahasa campur ID–EN natural; Kesan manusia (tidak terlalu sempurna); Emoji; Insight utama; Satu ide saja; Bukti/momen nyata; Relevan buat audiens; Sesuai tujuan konten; Keterbacaan; Bebas frasa generik/AI; Penutup & potensi komentar.\n' +
    'Lalu beri 3 perbaikan paling berdampak (spesifik, jangan menulis ulang seluruh tulisan), 2 hook alternatif, dan 1 catatan untuk versi Threads.\n\n' +
    'Balas HANYA dengan satu code block berlabel pbos-cek:\n' + FENCE + 'pbos-cek\n{"skor":80,"aspek":[{"nama":"Hook pembuka","skor":8,"catatan":"..."}],"perbaikan":["..."],"hook_alternatif":["...","..."],"threads_catatan":"..."}\n' + FENCE;
}
function jparse(s, d) { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } }
function pStudio() {
  const i = curIdea();
  if (!i) return '<h1 class="h1">Studio</h1><div class="empty">Belum ada ide. Tambahkan dulu di halaman <a href="#ide">Ide</a>.</div>';
  const fAvg = groupAvg('format').filter((x) => x.n >= 2);
  const best = fAvg[0] ? fAvg[0].k : '';
  const cntT = {}; S.db.Post.forEach((p) => { cntT[p.tujuan] = (cntT[p.tujuan] || 0) + 1; });
  const opsi = jparse(i.opsi_json, []);
  const cek = jparse(i.cek_json, null);
  const tab = S.studio.tab;
  const text = tab === 'li' ? (i.draft_li || '') : (i.draft_th || '');
  const sel = S.db.Ide.filter((x) => x.status !== 'Uploaded' || x.id === i.id);
  const sc = (v) => v >= 8 ? 'var(--ok)' : v >= 6 ? 'var(--warn)' : 'var(--bad)';
  return '<section class="card" style="padding:16px 20px"><div class="row between"><div style="flex:1;min-width:260px"><label for="pickIdea" class="eyebrow">Ide dari bank · ' + esc(i.status) + (i.tanggal ? ' · ' + nice(i.tanggal) : '') + '</label>' +
    '<select id="pickIdea" data-ch="pickIdea" style="font-size:17px;font-weight:700;border:0;padding:4px 0">' + sel.map((x) => '<option value="' + x.id + '"' + (x.id === i.id ? ' selected' : '') + '>' + esc(x.judul) + '</option>').join('') + '</select></div>' +
    '<div class="row"><label for="ideNote" class="sr">Catatan cerita</label></div></div>' +
    '<textarea id="ideNote" data-ch="ideNote" rows="2" placeholder="Cerita atau momen nyata pendukung (opsional, bikin draft jauh lebih kuat). Contoh: waktu di DPR RI…">' + esc(i.catatan) + '</textarea></section>' +
    '<div class="flex"><aside class="side" style="flex:1 1 300px;display:flex;flex-direction:column;gap:16px">' +
    '<section class="card"><div class="h3">Format</div>' + FORMAT.map((f) => '<button class="opt' + (i.format === f.n ? ' on' : '') + '" data-act="setFmt" data-id="' + f.n + '"><span class="row between" style="font-weight:700"><span>' + f.n + '</span>' + (f.n === best ? '<span class="tiny" style="color:var(--ok)">Terbaik di data-mu</span>' : '') + '</span><span class="small mut">' + f.why + '</span></button>').join('') + '</section>' +
    '<section class="card"><div class="h3">Tujuan konten</div><div class="small mut">Target porsi vs post yang sudah ada</div>' + TUJUAN.map((t) => '<button class="opt' + (i.tujuan === t.n ? ' on' : '') + '" data-act="setTuj" data-id="' + t.n + '"><span class="row between" style="font-weight:700"><span>' + t.n + '</span><span class="small mut">' + t.t + '% · kini ' + (cntT[t.n] || 0) + '/' + S.db.Post.length + '</span></span><span class="small mut">' + t.why + '. Ukur: ' + t.ukur + '.</span></button>').join('') + '</section></aside>' +
    '<section class="main" style="display:flex;flex-direction:column;gap:16px">' +
    '<div class="card"><div class="row between"><div class="h3">Bikin draft dengan ChatGPT</div><span class="chip blue">3 opsi → pilih 1 → edit</span></div>' +
    '<div class="steps"><div class="step"><span class="no">1</span><div><button class="btn" data-act="copyDraft">Salin prompt draft</button><div class="small mut" style="margin-top:6px">Tempel di ChatGPT. Isi catatan cerita di atas dulu biar lebih personal.</div></div></div>' +
    '<div class="step"><span class="no">2</span><div style="flex:1;display:flex;flex-direction:column;gap:8px"><label for="pasteDraft" class="small" style="font-weight:600">Tempel jawaban ChatGPT</label><textarea id="pasteDraft" class="paste" placeholder="' + FENCE + 'pbos-draft ..."></textarea><button class="btn darkb" data-act="readDraft">Baca opsi</button></div></div></div>' +
    (opsi.length ? '<div class="grid3">' + opsi.map((o, k) => '<div class="card" style="gap:8px;background:var(--bg2)"><div class="eyebrow">Opsi ' + (k + 1) + ' · ' + esc(o.angle) + '</div><div style="font-weight:700;line-height:1.45">' + esc(o.hook) + '</div><div class="small mut" style="white-space:pre-wrap;max-height:160px;overflow:auto">' + esc(o.linkedin) + '</div>' + (o.slides && o.slides.length ? '<div class="tiny mut">Slide: ' + esc(o.slides.join(' · ')) + '</div>' : '') + '<div class="small" style="color:var(--blue-d)">' + esc(o.kenapa) + '</div><button class="btn sm" data-act="pickOpt" data-i="' + k + '" style="margin-top:auto">Pakai opsi ini</button></div>').join('') + '</div>' : '') + '</div>' +
    '<div class="card"><div class="row between"><div class="seg" role="tablist"><button role="tab" aria-selected="' + (tab === 'li') + '" class="' + (tab === 'li' ? 'on' : '') + '" data-act="tab" data-id="li">LinkedIn</button><button role="tab" aria-selected="' + (tab === 'th') + '" class="' + (tab === 'th' ? 'on' : '') + '" data-act="tab" data-id="th">Threads</button></div>' +
    '<span class="small mut">' + words(text) + ' kata · ' + String(text).length + ' karakter</span></div>' +
    '<label for="ed" class="small" style="font-weight:600">Draft ' + (tab === 'li' ? 'LinkedIn: santai, sedikit profesional' : 'Threads: kalem, pendek') + '</label>' +
    '<textarea id="ed" class="draft" data-ch="ed" placeholder="Pilih opsi dari ChatGPT, atau tulis langsung di sini…">' + esc(text) + '</textarea>' +
    '<div class="row" style="justify-content:flex-end"><button class="btn ghost" data-act="copyText" data-id="th">Salin Threads</button><button class="btn" data-act="copyText" data-id="li">Salin LinkedIn</button></div></div>' +
    '<div class="card"><div class="h3">Tandai sudah di-upload</div><form class="row" data-sub="publish"><label for="pubUrl" class="sr">Link post</label><input id="pubUrl" type="url" placeholder="Tempel link post LinkedIn" style="flex:1 1 300px;width:auto"><input id="pubDate" type="date" value="' + today() + '" aria-label="Tanggal upload" style="width:auto"><button class="btn li" type="submit">Uploaded ✓</button></form><div class="small mut">Ide pindah ke status Uploaded dan otomatis masuk ke Log.</div></div></section>' +
    '<aside class="card side" style="flex:1 1 360px"><div class="row between"><div class="h3">Cek tulisan · 12 sisi</div>' + (cek ? '<span style="font-size:26px;font-weight:800;color:var(--blue-d)">' + esc(cek.skor) + '</span>' : '') + '</div>' +
    '<div class="steps"><div class="step"><span class="no">1</span><div><button class="btn soft" data-act="copyCek">Salin prompt cek tulisan</button><div class="small mut" style="margin-top:6px">Draft LinkedIn + Threads ikut tersalin.</div></div></div>' +
    '<div class="step"><span class="no">2</span><div style="flex:1;display:flex;flex-direction:column;gap:8px"><label for="pasteCek" class="sr">Tempel hasil cek</label><textarea id="pasteCek" class="paste" style="min-height:80px" placeholder="' + FENCE + 'pbos-cek ..."></textarea><button class="btn darkb sm" data-act="readCek">Baca hasil cek</button></div></div></div>' +
    (cek ? '<div class="list">' + (cek.aspek || []).map((a) => '<div class="check"><div class="row between small"><b>' + esc(a.nama) + '</b><b style="color:' + sc(num(a.skor)) + '">' + esc(a.skor) + '/10</b></div><div class="small mut">' + esc(a.catatan) + '</div></div>').join('') + '</div>' +
      '<div style="background:var(--warn-l);border-radius:14px;padding:14px" class="small"><b style="color:#92400E">Perbaikan paling berdampak</b>' + (cek.perbaikan || []).map((p, k) => '<div>' + (k + 1) + '. ' + esc(p) + '</div>').join('') + '</div>' +
      ((cek.hook_alternatif || []).length ? '<div class="small"><b>Hook alternatif</b>' + cek.hook_alternatif.map((h) => '<div class="mut">• ' + esc(h) + '</div>').join('') + '</div>' : '') +
      (cek.threads_catatan ? '<div class="small"><b>Threads</b><div class="mut">' + esc(cek.threads_catatan) + '</div></div>' : '')
      : '<div class="empty small">Belum dicek. Selesaikan draft, lalu salin prompt cek.</div>') + '</aside></div>';
}

/* ================= LOG ================= */
function pLog() {
  const ps = posts();
  const sel = ps.find((p) => p.id === S.log.sel) || ps[0];
  const av = avg(ps.map((p) => num(p.tayangan)).filter((v) => v > 0));
  const imp = S.imp;
  return '<div class="row between" style="align-items:flex-end"><div><h1 class="h1">Log Performa</h1><div class="mut">Upload file export LinkedIn, angka masuk sendiri. Klik post untuk detail.</div></div>' +
    '<button class="btn ghost" data-act="addPost">+ Tambah post manual</button></div>' +
    '<section class="card"><div class="grid2" style="align-items:center"><label class="drop" for="file"><b style="font-size:15px">Upload export analitik LinkedIn (.xlsx / .csv)</b><span class="small mut">LinkedIn › Analitik › Konten › Ekspor. Pilih rentang 365 hari biar semua post masuk.</span><span class="btn sm" aria-hidden="true">Pilih file</span><input id="file" type="file" accept=".xlsx,.xls,.csv" data-ch="logFile" class="sr"></label>' +
    '<div class="steps small"><div class="step"><span class="no">1</span><div>Seminggu sekali (misalnya Senin), ekspor analitik dari LinkedIn.</div></div><div class="step"><span class="no">2</span><div>Upload di sini. Tools membaca post, link, tayangan, interaksi, dan pengikut.</div></div><div class="step"><span class="no">3</span><div>Cek ringkasannya, klik Simpan. Beranda, Log, dan Review ikut ter-update.</div></div></div></div>' +
    (imp ? '<div class="card" style="background:var(--bg2)"><div class="h3">Hasil baca file</div><div class="small">' + imp.msg + '</div><div class="row"><button class="btn" data-act="saveImp">Simpan ke database</button><button class="btn ghost" data-act="cancelImp">Batal</button></div></div>' : '') + '</section>' +
    '<div class="flex"><section class="card main"><div class="row between"><div class="h3" style="font-size:16px">Semua post</div><span class="small mut">' + ps.length + ' post · rata-rata ' + fmt(av) + ' tayangan</span></div>' +
    '<div class="scroll"><table class="tbl"><thead><tr><th>Post</th><th>Pilar</th><th class="num">Tayangan</th><th class="num">Reaksi / interaksi</th><th class="num">Link</th></tr></thead><tbody>' +
    ps.map((p) => '<tr class="click' + (sel && p.id === sel.id ? ' sel' : '') + '" data-act="selPost" data-id="' + p.id + '"><td><div style="font-weight:600">' + esc(p.judul) + '</div><div class="small mut">' + nice(p.tanggal) + ' · ' + esc(p.format || '-') + '</div></td><td class="small mut">' + esc(p.pilar || '-') + '</td><td class="num" style="font-weight:700">' + (p.tayangan ? fmt(p.tayangan) : '—') + '</td><td class="num">' + (p.reaksi ? fmt(p.reaksi) : p.engagement ? fmt(p.engagement) : '—') + '</td><td class="num">' + (p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">Buka ↗</a>' : '<span class="small mut">—</span>') + '</td></tr>').join('') +
    '</tbody></table></div></section>' +
    (sel ? '<aside class="card side"><div class="eyebrow">Detail post</div><form data-sub="editPost" data-id="' + sel.id + '" style="display:flex;flex-direction:column;gap:10px">' +
      '<label class="small" for="pJ" style="font-weight:600">Judul</label><input id="pJ" value="' + esc(sel.judul) + '">' +
      '<div class="grid2"><div><label class="small" for="pT" style="font-weight:600">Tanggal</label><input id="pT" type="date" value="' + esc(sel.tanggal) + '"></div><div><label class="small" for="pF" style="font-weight:600">Format</label><select id="pF">' + FORMAT.map((f) => f.n).concat(['Repost', 'Teks + link']).map((f) => '<option' + (sel.format === f ? ' selected' : '') + '>' + f + '</option>').join('') + '</select></div></div>' +
      '<div class="grid2"><div><label class="small" for="pP" style="font-weight:600">Pilar</label><select id="pP">' + PILAR.map((f) => '<option' + (sel.pilar === f ? ' selected' : '') + '>' + f + '</option>').join('') + '</select></div><div><label class="small" for="pTu" style="font-weight:600">Tujuan</label><select id="pTu">' + TUJUAN.map((t) => t.n).concat(['Engagement']).map((f) => '<option' + (sel.tujuan === f ? ' selected' : '') + '>' + f + '</option>').join('') + '</select></div></div>' +
      '<div class="grid2">' + [['tayangan', 'Tayangan'], ['reaksi', 'Reaksi'], ['komentar', 'Komentar'], ['repost', 'Repost']].map((f) => '<div><label class="small" for="m_' + f[0] + '" style="font-weight:600">' + f[1] + '</label><input id="m_' + f[0] + '" inputmode="numeric" value="' + esc(sel[f[0]]) + '"></div>').join('') + '</div>' +
      '<div class="small mut">vs rata-rata: ' + (num(sel.tayangan) && av ? ((num(sel.tayangan) / av - 1) * 100 > 0 ? '+' : '') + Math.round((num(sel.tayangan) / av - 1) * 100) + '%' : '—') + (sel.engagement ? ' · interaksi ' + fmt(sel.engagement) : '') + '</div>' +
      '<label class="small" for="pU" style="font-weight:600">Link post</label><input id="pU" type="url" value="' + esc(sel.url) + '" placeholder="https://www.linkedin.com/…">' +
      '<label class="small" for="pO" style="font-weight:600">Ada peluang dari post ini?</label><input id="pO" value="' + esc(sel.peluang) + '" placeholder="DM, tawaran kolaborasi, kenalan baru…">' +
      '<div class="row"><button class="btn" type="submit">Simpan</button>' + (sel.url ? '<a class="btn li" href="' + esc(sel.url) + '" target="_blank" rel="noopener">Buka di LinkedIn ↗</a>' : '') + '<button class="btn sm danger" type="button" data-act="delPost" data-id="' + sel.id + '">' + (S.confirm === sel.id ? 'Yakin hapus?' : 'Hapus') + '</button></div></form></aside>' : '') + '</div>';
}

/* ================= REVIEW ================= */
function promptReview() {
  const since = iso(addDays(new Date(), -14));
  const recent = S.db.Post.filter((p) => p.tanggal >= since).map((p) => '- ' + p.judul + ' | ' + p.tanggal + ' | ' + p.pilar + ' | ' + p.format + ' | tayangan ' + (p.tayangan || '?')).join('\n') || '- (tidak ada post 14 hari terakhir)';
  const ws = weekStart(new Date());
  const kons = [3, 2, 1, 0].map((k) => Math.round(weekScore(addDays(ws, -7 * k)) / 6 * 100) + '%').join(', ');
  const m = latestMetrik().cur;
  return 'Kamu analis konten LinkedIn yang jujur. Buat review mingguan untuk penulis ini.\n\n' + brandCtx() + '\n\nPeriode: minggu yang berakhir ' + today() +
    '\nPost 14 hari terakhir:\n' + recent + '\n\n' + perfCtx(30) + '\n\nKonsistensi ritme 4 minggu terakhir: ' + kons + '\nMetrik terbaru: pengikut ' + (m.pengikut || '?') + ', pengunjung profil 7 hari ' + (m.pengunjung_profil_7h || '?') + ', tayangan 7 hari ' + (m.tayangan_7h || '?') +
    '\nTarget: ' + prof('target_bulanan', 8) + ' post/bulan.\n\nATURAN: jangan menyimpulkan berlebihan dari sampel kecil, sebut bila tentatif. Rekomendasi harus berbasis data penulis, bukan saran umum. Bahasa Indonesia santai.\n\n' +
    'Balas HANYA dengan satu code block berlabel pbos-review:\n' + FENCE + 'pbos-review\n{"judul":"1 kalimat kesimpulan","berhasil":["..."],"kurang":["..."],"eksperimen":"1 eksperimen minggu depan","ide":[{"judul":"...","pilar":"...","tujuan":"...","format":"..."}]}\n' + FENCE;
}
function hbars(list, max) {
  return list.map((x) => '<div class="hbar small"><span style="font-weight:500">' + esc(x.k) + '</span><span class="t"><i style="width:' + Math.round(x.avg / max * 100) + '%"></i></span><span class="num mut"><b style="color:var(--ink)">' + fmt(x.avg) + '</b> · ' + x.n + ' post</span></div>').join('');
}
function pReview() {
  const P = S.db.Post;
  const av = avg(P.map((p) => num(p.tayangan)).filter((v) => v > 0));
  const ar = avg(P.map((p) => num(p.reaksi)).filter((v) => v > 0));
  const ms = lastMonths(6);
  const perM = (ms.reduce((a, b) => a + b.count, 0) / 6).toFixed(1).replace('.', ',');
  const gp = groupAvg('pilar'), gf = groupAvg('format'), gt = groupAvg('tujuan');
  const max = Math.max(1, ...gp.concat(gf, gt).map((x) => x.avg));
  const rv = S.db.Review.slice().sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));
  const cur = rv[0]; const j = cur ? jparse(cur.json, {}) : null;
  const list = (a) => (a || []).map((x) => '<li>' + esc(x) + '</li>').join('');
  return '<div><div class="eyebrow">Review · dari ' + P.length + ' post</div><h1 class="h1">' + esc(j && j.judul ? j.judul : 'Review performa') + '</h1></div>' +
    (P.length < 20 ? '<div class="card small" style="background:#FDF3DC;border:0;color:#7A4A06;padding:12px 16px">Sampel masih kecil (' + P.length + ' post). Pilar, format, dan bahasa saling tumpang tindih, jadi kesimpulan masih tentatif.</div>' : '') +
    '<div class="grid4"><div class="stat"><div class="small mut">Post per bulan (6 bln)</div><b>' + perM + '</b><div class="small mut">target ' + prof('target_bulanan', 8) + '</div></div><div class="stat"><div class="small mut">Tayangan per post</div><b>' + fmt(av) + '</b></div><div class="stat"><div class="small mut">Reaksi per post</div><b>' + fmt(ar) + '</b></div><div class="stat"><div class="small mut">Konsistensi minggu lalu</div><b>' + Math.round(weekScore(addDays(weekStart(new Date()), -7)) / 6 * 100) + '%</b></div></div>' +
    '<section class="card"><div class="h3">Rata-rata tayangan per pilar</div>' + hbars(gp, max) + '<div class="h3" style="margin-top:8px">Per format</div>' + hbars(gf, max) + '<div class="h3" style="margin-top:8px">Per tujuan</div>' + hbars(gt, max) + '</section>' +
    '<section class="card"><div class="row between"><div class="h3">Buat review mingguan dengan ChatGPT</div><span class="small mut">Idealnya tiap Sabtu</span></div><div class="grid2" style="align-items:start"><div class="step"><span class="no">1</span><div><button class="btn" data-act="copyReview">Salin prompt review</button><div class="small mut" style="margin-top:6px">Sudah berisi semua angka, ritme, dan metrik.</div></div></div>' +
    '<div class="step"><span class="no">2</span><div style="flex:1;display:flex;flex-direction:column;gap:8px"><label for="pasteReview" class="sr">Tempel review</label><textarea id="pasteReview" class="paste" style="min-height:80px" placeholder="' + FENCE + 'pbos-review ..."></textarea><button class="btn darkb" data-act="readReview">Simpan review</button></div></div></div></section>' +
    (j ? '<div class="grid2"><section class="card"><div class="h3" style="color:var(--ok)">Yang berhasil</div><ul style="margin:0;padding-left:18px;line-height:1.7">' + list(j.berhasil) + '</ul></section><section class="card"><div class="h3" style="color:var(--bad)">Yang kurang</div><ul style="margin:0;padding-left:18px;line-height:1.7">' + list(j.kurang) + '</ul></section></div>' +
      '<section class="card dark"><div class="small" style="color:#93B4F8;font-weight:600">Eksperimen minggu depan · review ' + nice(cur.tanggal) + '</div><div style="font-size:18px;font-weight:600;line-height:1.5">' + esc(j.eksperimen) + '</div>' +
      ((j.ide || []).length ? '<div class="list" style="border-top:1px solid #2A4270">' + j.ide.map((x, k) => '<div class="row between" style="padding:8px 0;border-color:#2A4270"><span><b>' + esc(x.judul) + '</b> <span class="mut small">' + esc([x.pilar, x.tujuan, x.format].join(' · ')) + '</span></span><button class="btn sm ghost" data-act="revIde" data-i="' + k + '">+ Ke bank ide</button></div>').join('') + '</div>' : '') + '</section>' : '') +
    (rv.length > 1 ? '<section class="card"><div class="h3">Riwayat review</div><div class="list">' + rv.slice(1).map((r) => '<div class="row between" style="padding:8px 0"><span>' + esc(r.judul) + '</span><span class="small mut">' + nice(r.tanggal) + '</span></div>').join('') + '</div></section>' : '');
}

/* ================= NETWORKING ================= */
function autoLevel(t) {
  const s = ' ' + String(t || '').toLowerCase() + ' ';
  if (/\b(ceo|cto|coo|cfo|cmo|chro|chief|founder|co-founder|cofounder|owner|president|presiden|direktur|director|vp|vice president|komisaris|general manager|managing partner|partner)\b/.test(s)) return 4;
  if (/\b(manager|manajer|head|lead|kepala|principal|senior|sr\.?|dosen|lecturer|supervisor|spv|professor|profesor)\b/.test(s)) return 3;
  if (/\b(intern|internship|magang|student|mahasiswa|fresh graduate|trainee|junior|jr\.?|asisten|assistant)\b/.test(s)) return 1;
  return 2;
}
function autoPot(t, lv) {
  const s = String(t || '').toLowerCase();
  if (/trainer|learning|l&d|instructional|dosen|lecturer|teacher|guru|coach|mentor|facilitator|fasilitator|speaker|educator|instruktur/.test(s)) return lv >= 3 ? 'Narasumber' : 'Kolaborator';
  if (/hr|human|people|talent|recruit|culture/.test(s)) return lv >= 4 ? 'Partner / klien' : lv === 3 ? 'Mentor' : 'Jaga relasi';
  if (lv === 4) return 'Partner / klien';
  if (/content|creator|marketing|community|komunitas|media|brand/.test(s)) return 'Kolaborator';
  return '';
}
function promptRiset(q, lv) {
  return 'Kamu peneliti networking. WAJIB gunakan web search. Cari 8–10 orang NYATA yang sesuai kriteria dan aktif berbagi ilmu (LinkedIn, YouTube, blog, podcast, mengajar).\n\nKriteria: ' + q + '\nTarget level: ' + (lv === 'all' ? 'campuran' : LEVELS[lv].n) +
    '\nKonteks pencari: Ali Irawan, People Development (L&D) early-career di Indonesia, juga membangun Pakarify (platform kelas online). Mencari narasumber, mentor, kolaborator, dan partner.\n\n' +
    'ATURAN: hanya masukkan orang yang bisa diverifikasi dari sumber publik dan sertakan link profil atau sumbernya. JANGAN mengarang nama atau link. Kalau tidak yakin, jangan dimasukkan.\nTentukan level dari pengalaman: 4 = direksi/C-level/founder/VP/director; 3 = senior/manager/head/lead/dosen; 2 = setara (staf/officer/spesialis 1–4 tahun); 1 = junior/mahasiswa.\nPotensi pilih salah satu: ' + POTENSI.join(' / ') + '.\n\n' +
    'Balas HANYA dengan satu code block berlabel pbos-orang:\n' + FENCE + 'pbos-orang\n[{"nama":"...","peran":"...","perusahaan":"...","tahun_pengalaman":"±8","level":3,"potensi":"...","kenapa":"bukti dia rutin sharing","link":"https://..."}]\n' + FENCE;
}
function promptPesan(o) {
  const L = LEVELS[num(o.level) || 2];
  return 'Bantu tulis pesan reach-out LinkedIn dari Ali Irawan (People Development, early-career, juga membangun Pakarify) ke orang ini:\n\nNama: ' + o.nama + '\nPeran: ' + o.peran + (o.perusahaan ? ' di ' + o.perusahaan : '') + '\nLevel: ' + L.n + ' (' + L.s + ')\nPendekatan untuk level ini: ' + L.how + '\nPotensi: ' + (o.potensi || '-') + '\nKenapa menarik: ' + (o.kenapa || '-') + '\nKontak terakhir: ' + (o.kontak_terakhir || 'belum pernah') +
    '\n\nBuat 2 versi: (1) catatan connect maks 280 karakter, (2) DM 3–5 kalimat. Bahasa Indonesia natural, boleh sedikit English, sopan sesuai level, tidak lebay, tidak terdengar template, tanpa gua/gue. Sisakan [isi: hal spesifik dari karyanya] bila belum ada info.';
}
function pNet() {
  const N = S.net;
  const all = S.db.Orang;
  const q = N.q.toLowerCase();
  const list = all.filter((o) => (N.lv === 'all' || String(o.level) === N.lv) && (N.pot === 'all' || (N.pot === 'none' ? !o.potensi : o.potensi === N.pot)) && (!q || (o.nama + ' ' + o.peran + ' ' + o.perusahaan).toLowerCase().indexOf(q) >= 0))
    .sort((a, b) => num(b.level) - num(a.level) || String(a.nama).localeCompare(String(b.nama)));
  const care = all.filter((o) => o.potensi).sort((a, b) => String(a.kontak_terakhir || '').localeCompare(String(b.kontak_terakhir || '')) || num(b.level) - num(a.level)).slice(0, 3);
  const lc = (l) => all.filter((o) => String(o.level) === l).length;
  const imp = S.netImp;
  return '<div class="row between" style="align-items:flex-end"><div><h1 class="h1">Networking</h1><div class="mut">Temukan orang yang rajin sharing, lihat levelnya, sesuaikan cara reach-out, jaga koneksinya.</div></div><button class="btn ghost" data-act="addOrang">+ Tambah manual</button></div>' +
    '<section class="grid4">' + [4, 3, 2, 1].map((l) => '<div class="card" style="gap:6px"><div class="row between"><span class="lv lv' + l + '">' + LEVELS[l].n.split(' · ')[0] + '</span><span class="small mut">' + lc(String(l)) + ' orang</span></div><div style="font-weight:700">' + LEVELS[l].n.split(' · ')[1] + '</div><div class="tiny mut" style="font-weight:600">' + LEVELS[l].s + '</div><div class="small mut">' + LEVELS[l].how + '</div></div>').join('') + '</section>' +
    '<div class="grid2" style="align-items:start"><section class="card"><div class="eyebrow">Sumber 1 · Koneksimu</div><label class="drop" for="cfile"><b>Upload Connections.csv</b><span class="small mut">LinkedIn › Settings › Data privacy › Get a copy of your data › Connections. Level & potensi diisi otomatis dari jabatan.</span><span class="btn sm" aria-hidden="true">Pilih file</span><input id="cfile" type="file" accept=".csv" data-ch="netFile" class="sr"></label></section>' +
    '<section class="card"><div class="eyebrow">Sumber 2 · Di luar jaringan (riset ChatGPT)</div><div class="row"><label for="rq" class="sr">Kriteria</label><input id="rq" placeholder="Contoh: praktisi L&D Indonesia yang rutin sharing soal onboarding" style="flex:1 1 260px;width:auto"><select id="rlv" aria-label="Target level" style="width:auto"><option value="all">Semua level</option>' + [4, 3, 2, 1].map((l) => '<option value="' + l + '">' + LEVELS[l].n.split(' · ')[0] + '</option>').join('') + '</select></div>' +
    '<button class="btn" data-act="copyRiset">Salin prompt riset</button><label for="pasteOrang" class="sr">Tempel hasil riset</label><textarea id="pasteOrang" class="paste" style="min-height:70px" placeholder="' + FENCE + 'pbos-orang ..."></textarea><button class="btn darkb" data-act="readOrang">Baca hasil riset</button></section></div>' +
    (imp ? '<section class="card" style="background:var(--bg2)"><div class="h3">' + imp.msg + '</div>' + (imp.preview ? '<div class="list small">' + imp.preview + '</div>' : '') + '<div class="row"><button class="btn" data-act="saveNet">Simpan</button><button class="btn ghost" data-act="cancelNet">Batal</button></div></section>' : '') +
    '<div class="flex"><section class="card main"><div class="row between"><div class="h3" style="font-size:16px">Orang (' + list.length + ')</div><label for="nq" class="sr">Cari</label><input id="nq" data-in="netQ" value="' + esc(N.q) + '" placeholder="Cari nama, jabatan, perusahaan…" style="max-width:300px"></div>' +
    '<div class="chips">' + [['all', 'Semua level']].concat([4, 3, 2, 1].map((l) => [String(l), 'L' + l])).map((c) => '<button class="' + (N.lv === c[0] ? 'on' : '') + '" data-act="netLv" data-id="' + c[0] + '">' + c[1] + '</button>').join('') + '</div>' +
    '<div class="chips">' + [['all', 'Semua potensi']].concat(POTENSI.map((p) => [p, p]), [['none', 'Belum ditandai']]).map((c) => '<button class="' + (N.pot === c[0] ? 'on' : '') + '" data-act="netPot" data-id="' + c[0] + '">' + c[1] + '</button>').join('') + '</div>' +
    '<div class="scroll"><table class="tbl" style="min-width:860px"><thead><tr><th>Orang</th><th>Level</th><th>Potensi</th><th>Kontak terakhir</th><th class="num">Aksi</th></tr></thead><tbody>' +
    (list.length ? list.slice(0, N.n).map((o) => '<tr><td><div style="font-weight:600">' + (o.link ? '<a href="' + esc(o.link) + '" target="_blank" rel="noopener">' + esc(o.nama) + ' ↗</a>' : esc(o.nama)) + '</div><div class="small mut">' + esc([o.peran, o.perusahaan].filter(Boolean).join(' @ ')) + '</div>' + (o.kenapa ? '<div class="tiny mut">' + esc(o.kenapa) + '</div>' : '') + '</td>' +
      '<td><select data-ch="oLevel" data-id="' + o.id + '" aria-label="Level" class="lv lv' + (num(o.level) || 2) + '" style="border:0;width:auto">' + [4, 3, 2, 1].map((l) => '<option value="' + l + '"' + (num(o.level) === l ? ' selected' : '') + '>L' + l + '</option>').join('') + '</select></td>' +
      '<td><select data-ch="oPot" data-id="' + o.id + '" aria-label="Potensi" style="width:auto;padding:6px 8px;font-size:13px"><option value="">—</option>' + POTENSI.map((p) => '<option' + (o.potensi === p ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></td>' +
      '<td class="small mut">' + (o.kontak_terakhir ? nice(o.kontak_terakhir) : 'Belum') + '</td>' +
      '<td class="num"><div class="row" style="justify-content:flex-end;gap:6px"><button class="btn sm soft" data-act="pesan" data-id="' + o.id + '">Prompt pesan</button><button class="btn sm ghost" data-act="kontak" data-id="' + o.id + '">✓ Kontak</button></div></td></tr>').join('') : '<tr><td colspan="5"><div class="empty">Belum ada orang. Upload Connections.csv atau riset dengan ChatGPT.</div></td></tr>') +
    '</tbody></table></div>' + (list.length > N.n ? '<button class="btn ghost" data-act="netMore">Tampilkan 50 lagi</button>' : '') + '</section>' +
    '<aside class="card dark side"><div class="h3">Jaga koneksi minggu ini</div>' + (care.length ? care.map((o) => '<div style="background:#13284A;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:6px"><div class="row between"><b>' + esc(o.nama) + '</b><span class="lv lv' + (num(o.level) || 2) + '">L' + (num(o.level) || 2) + '</span></div><div class="small mut">' + esc(o.potensi) + ' · kontak terakhir ' + (o.kontak_terakhir ? nice(o.kontak_terakhir) : 'belum pernah') + '</div><div class="small mut">' + esc(LEVELS[num(o.level) || 2].how.split('. ')[0]) + '.</div><div class="row"><button class="btn sm ghost" data-act="pesan" data-id="' + o.id + '">Prompt pesan</button><button class="btn sm" data-act="kontak" data-id="' + o.id + '">✓ Sudah kontak</button></div></div>').join('') : '<div class="small mut">Tandai potensi di tabel, nanti 3 orang yang paling lama tidak dikontak muncul di sini.</div>') + '</aside></div>';
}

/* ================= MODAL ================= */
const PROFIL_FIELDS = [['target_bulanan', 'Target post per bulan', 1], ['total_post', 'Total semua post (sepanjang waktu)', 1], ['positioning', 'Positioning', 2], ['audiens', 'Audiens', 2], ['pilar', 'Pilar konten', 2], ['tujuan_mix', 'Target porsi tujuan', 2], ['gaya_tulisan', 'Gaya tulisan umum', 6], ['gaya_linkedin', 'Gaya LinkedIn', 3], ['gaya_threads', 'Gaya Threads', 3], ['topik_hindari', 'Topik dihindari', 2]];
function modalHtml() {
  if (S.modal === 'settings') {
    return '<div class="modal" data-act="closeModal"><form class="card" data-sub="settings"><div class="row between"><div class="h2">Pengaturan & profil brand</div><button type="button" class="btn sm ghost" data-act="closeModal">Tutup</button></div>' +
      PROFIL_FIELDS.map((f) => '<label class="small" style="font-weight:600" for="pf_' + f[0] + '">' + f[1] + '</label>' + (f[2] === 1 ? '<input id="pf_' + f[0] + '" value="' + esc(prof(f[0])) + '">' : '<textarea id="pf_' + f[0] + '" rows="' + f[2] + '">' + esc(prof(f[0])) + '</textarea>')).join('') +
      '<div class="row"><button class="btn" type="submit">Simpan</button><button class="btn ghost" type="button" data-act="logout">Keluar</button></div></form></div>';
  }
  if (S.modal === 'metrik') {
    const m = latestMetrik().cur;
    return '<div class="modal" data-act="closeModal"><form class="card" data-sub="metrik"><div class="h2">Update angka dari dasbor LinkedIn</div><div class="small mut">Ambil dari linkedin.com/dashboard. Upload export di Log juga mengisi pengikut otomatis.</div>' +
      [['pengikut', 'Total pengikut'], ['pengunjung_profil_7h', 'Pengunjung profil (7 hari)'], ['tayangan_7h', 'Tayangan post (7 hari)']].map((f) => '<label class="small" style="font-weight:600" for="mt_' + f[0] + '">' + f[1] + '</label><input id="mt_' + f[0] + '" inputmode="numeric" value="' + esc(m[f[0]]) + '">').join('') +
      '<div class="row"><button class="btn" type="submit">Simpan</button><button type="button" class="btn ghost" data-act="closeModal">Batal</button></div></form></div>';
  }
  if (S.modal === 'addPost') {
    return '<div class="modal" data-act="closeModal"><form class="card" data-sub="addPost"><div class="h2">Tambah post manual</div>' +
      '<label class="small" style="font-weight:600" for="ap_j">Judul</label><input id="ap_j" required><label class="small" style="font-weight:600" for="ap_t">Tanggal</label><input id="ap_t" type="date" value="' + today() + '" required><label class="small" style="font-weight:600" for="ap_u">Link post</label><input id="ap_u" type="url"><label class="small" style="font-weight:600" for="ap_p">Pilar</label><select id="ap_p">' + PILAR.map((p) => '<option>' + p + '</option>').join('') + '</select>' +
      '<div class="row"><button class="btn" type="submit">Simpan</button><button type="button" class="btn ghost" data-act="closeModal">Batal</button></div></form></div>';
  }
  if (S.modal === 'addOrang') {
    return '<div class="modal" data-act="closeModal"><form class="card" data-sub="addOrang"><div class="h2">Tambah orang</div>' +
      [['nama', 'Nama', 1], ['peran', 'Jabatan / peran', 0], ['perusahaan', 'Perusahaan', 0], ['link', 'Link profil', 0], ['kenapa', 'Kenapa menarik', 0]].map((f) => '<label class="small" style="font-weight:600" for="ao_' + f[0] + '">' + f[1] + '</label><input id="ao_' + f[0] + '"' + (f[2] ? ' required' : '') + '>').join('') +
      '<div class="row"><button class="btn" type="submit">Simpan</button><button type="button" class="btn ghost" data-act="closeModal">Batal</button></div></form></div>';
  }
  return '';
}

/* ================= RENDER ================= */
function render() {
  const app = $('#app');
  if (!S.key && !S.demo) { app.innerHTML = lockScreen(); return; }
  const fa = document.activeElement;
  const keep = fa && fa.id && (fa.tagName === 'TEXTAREA' || fa.tagName === 'INPUT') ? { id: fa.id, s: fa.selectionStart, e: fa.selectionEnd } : null;
  const pastes = {}; document.querySelectorAll('.paste,#ins,#newIdea,#rq,#pubUrl').forEach((el) => { pastes[el.id] = el.value; });
  const P = { beranda: pBeranda, ide: pIde, studio: pStudio, log: pLog, review: pReview, networking: pNet }[S.page] || pBeranda;
  app.innerHTML = '<div class="wrap">' + header() + P() + '</div>' + modalHtml();
  Object.keys(pastes).forEach((id) => { const el = document.getElementById(id); if (el && pastes[id] && !el.value) el.value = pastes[id]; });
  if (keep) { const el = document.getElementById(keep.id); if (el) { el.focus(); try { el.setSelectionRange(keep.s, keep.e); } catch (e) {} } }
}
