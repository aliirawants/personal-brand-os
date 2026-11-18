'use strict';
/* Personal Brand OS · core: state, API, util, prompt helpers */
const API = 'https://script.google.com/macros/s/AKfycbx3jYEEAab8E7cnv9Wr7rtc0sta5Z45vzrNd6IGgy1VxAUaM9u1WhcrUl0AxfKO8UuV/exec';
const FENCE = '```';
const TABS = ['Ide', 'Post', 'Ritme', 'Orang', 'Review', 'Metrik', 'Profil'];
const PILAR = ['Career & Work', 'Building Things', 'Personal Philosophy', 'Tools & Systems', 'Promosi Pakarify', 'Lainnya'];
const TUJUAN = [
  { n: 'Edukasi', t: 35, why: 'Biar dipercaya & disimpan', ukur: 'simpan, repost' },
  { n: 'Personal', t: 25, why: 'Biar orang kenal & merasa dekat', ukur: 'kunjungan profil, koneksi baru' },
  { n: 'Opini', t: 15, why: 'Biar ada diskusi', ukur: 'jumlah komentar' },
  { n: 'Building in public', t: 15, why: 'Buka peluang kolaborasi', ukur: 'DM & tawaran' },
  { n: 'Selling', t: 10, why: 'Arahkan ke produk/kelas, soft', ukur: 'klik link, leads' }
];
const FORMAT = [
  { n: 'Carousel', why: 'Insight berurutan atau cerita bertahap.' },
  { n: 'Teks', why: 'Cepat dibuat, pas untuk opini & memancing komentar.' },
  { n: 'Teks + gambar', why: 'Momen nyata: event, kantor, kelas.' },
  { n: 'Polling', why: 'Sesekali, untuk riset audiens.' },
  { n: 'Video pendek', why: 'Opsional, kalau sempat.' }
];
const STATUS = ['Mentah', 'Terjadwal', 'Uploaded'];
const LEVELS = {
  4: { n: 'L4 · Direksi / C-level / Founder', s: 'Jauh di atasmu', how: 'Jangan langsung pitch atau minta. Engage 2–3× di post-nya dulu dengan komentar yang berisi. Lalu DM singkat: satu kalimat konteks, satu hal spesifik dari karyanya, satu permintaan kecil (15 menit atau pendapat). Sopan-profesional.' },
  3: { n: 'L3 · Senior / Manager / Head', s: 'Di atasmu', how: 'Minta insight soal topik spesifik atau ajak jadi narasumber. Tunjukkan kamu sudah baca kontennya. Sopan tapi hangat.' },
  2: { n: 'L2 · Setara', s: 'Selevel denganmu', how: 'Santai. Tukar insight, ajak kolaborasi konten, ngopi virtual, saling support post.' },
  1: { n: 'L1 · Junior / Mahasiswa', s: 'Di bawahmu', how: 'Tawarkan bantuan atau sharing pengalaman, ajak gabung komunitas atau talent pool. Jadi mentor ringan.' }
};
const POTENSI = ['Narasumber', 'Kolaborator', 'Mentor', 'Partner / klien', 'Jaga relasi'];
const RITME = { 1: 'Pilih 2 ide minggu ini', 2: 'Posting #1 + balas komen', 3: 'Draft post #2', 4: 'Edit + cek log post #1', 5: 'Posting #2 + balas komen', 6: 'Buat & baca review mingguan', 0: 'Libur' };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const S = {
  key: '', demo: false, db: {}, page: 'beranda', modal: '', confirm: '',
  cal: '', ideF: 'all', studio: { id: '', tab: 'li' }, log: { sel: '' },
  net: { lv: 'all', pot: 'all', q: '', n: 50 }, recs: [], imp: null, netImp: null
};
TABS.forEach((t) => { S.db[t] = []; });

/* ---------- util ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const n = Number(String(v == null ? '' : v).replace(/[^\d-]/g, '')); return isFinite(n) ? n : 0; };
const fmt = (n) => Number(n || 0).toLocaleString('id-ID');
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => iso(new Date());
const pd = (s) => new Date(String(s).slice(0, 10) + 'T00:00:00');
const mkey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const nice = (s) => { if (!s) return '—'; const d = pd(s); return isNaN(d) ? s : HARI[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()]; };
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h).toString(36); };
const prof = (k, d) => { const r = S.db.Profil.find((x) => x.key === k); return r && r.value !== '' ? r.value : (d == null ? '' : d); };
const avg = (a) => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0;
const words = (s) => (String(s || '').trim().match(/\S+/g) || []).length;

function toast(msg, err) {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), err ? 5000 : 2200);
}

async function copy(text, msg) {
  try { await navigator.clipboard.writeText(text); } catch (e) {
    const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
  }
  toast(msg || 'Disalin ✓');
}

function parseBlock(txt) {
  let s = String(txt || '').trim();
  const m = s.match(/```[a-zA-Z0-9_-]*[ \t]*\n?([\s\S]*?)```/);
  if (m) s = m[1].trim();
  const a = s.search(/[\[{]/);
  const b = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  if (a < 0 || b < a) throw new Error('Tidak menemukan JSON di jawaban ChatGPT');
  return JSON.parse(s.slice(a, b + 1));
}

/* ---------- API ---------- */
async function api(action, extra) {
  if (S.demo) return { ok: true, data: S.db };
  const r = await fetch(API, { method: 'POST', body: JSON.stringify(Object.assign({ key: S.key, action: action }, extra || {})) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'gagal');
  return j;
}

async function load() {
  const j = await api('all');
  TABS.forEach((t) => { S.db[t] = (j.data && j.data[t]) || []; });
}

function persistDemo() { try { localStorage.setItem('pbos_demo', JSON.stringify(S.db)); } catch (e) {} }

async function save(tab, rows, quiet) {
  rows = [].concat(rows);
  const k = tab === 'Profil' ? 'key' : 'id';
  rows.forEach((r) => {
    const i = S.db[tab].findIndex((x) => x[k] === r[k]);
    if (i >= 0) S.db[tab][i] = Object.assign({}, S.db[tab][i], r); else S.db[tab].push(Object.assign({}, r));
  });
  render();
  if (S.demo) { persistDemo(); if (!quiet) toast('Tersimpan di browser (mode contoh)'); return true; }
  try {
    for (let i = 0; i < rows.length; i += 300) await api('upsert', { tab: tab, rows: rows.slice(i, i + 300) });
    if (!quiet) toast('Tersimpan ✓');
    return true;
  } catch (e) { toast('Gagal simpan: ' + e.message, true); return false; }
}

async function del(tab, ids) {
  S.db[tab] = S.db[tab].filter((r) => ids.indexOf(r.id) < 0);
  render();
  if (S.demo) { persistDemo(); return; }
  try { await api('delete', { tab: tab, ids: ids }); toast('Dihapus'); } catch (e) { toast('Gagal hapus: ' + e.message, true); }
}

/* ---------- data helpers ---------- */
function posts() { return S.db.Post.slice().sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal))); }
function lastMonths(n) {
  const out = []; const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = mkey(d);
    const ps = S.db.Post.filter((p) => String(p.tanggal).slice(0, 7) === k);
    const vs = ps.map((p) => num(p.tayangan)).filter((v) => v > 0);
    out.push({ k: k, n: MON[d.getMonth()], count: ps.length, avg: avg(vs) });
  }
  return out;
}
function groupAvg(field, list) {
  const g = {};
  (list || S.db.Post).forEach((p) => { const k = p[field] || 'Lainnya'; (g[k] = g[k] || []).push(num(p.tayangan)); });
  return Object.keys(g).map((k) => ({ k: k, n: g[k].length, avg: avg(g[k].filter((v) => v > 0)) })).sort((a, b) => b.avg - a.avg);
}
function latestMetrik() {
  const m = S.db.Metrik.slice().sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
  return { cur: m[m.length - 1] || {}, prev: m[m.length - 2] || null };
}
function weekStart(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const w = (x.getDay() + 6) % 7; return addDays(x, -w); }
function ritmeDone(dateIso) { const r = S.db.Ritme.find((x) => x.id === dateIso); return !!(r && r.selesai === '1'); }
function weekScore(start) { let n = 0; for (let i = 0; i < 6; i++) if (ritmeDone(iso(addDays(start, i)))) n++; return n; }

function brandCtx() {
  return [
    'KONTEKS PENULIS',
    'Nama: Ali Irawan. Kerja di People Development (L&D) sebuah perusahaan, sambil membangun Pakarify (platform kelas online). Early-career, Indonesia.',
    'Positioning: ' + prof('positioning'),
    'Audiens: ' + prof('audiens'),
    'Pilar konten: ' + prof('pilar'),
    'Target porsi tujuan: ' + prof('tujuan_mix'),
    'GAYA TULISAN (WAJIB DIIKUTI): ' + prof('gaya_tulisan'),
    'Khusus LinkedIn: ' + prof('gaya_linkedin'),
    'Khusus Threads: ' + prof('gaya_threads'),
    'Hindari topik: ' + prof('topik_hindari')
  ].join('\n');
}
function perfCtx(limit) {
  const ps = posts().slice(0, limit || 20);
  const lines = ps.map((p) => '- ' + [p.judul, p.tanggal, p.pilar, p.format, p.tujuan, 'tayangan ' + (p.tayangan || '?'), 'reaksi ' + (p.reaksi || '?'), 'komentar ' + (p.komentar || '?')].join(' | '));
  const g = (f) => groupAvg(f).map((x) => x.k + ' ' + fmt(x.avg) + ' (' + x.n + ' post)').join('; ');
  return 'DATA PERFORMA (' + ps.length + ' post terbaru):\n' + lines.join('\n') +
    '\nRata-rata tayangan per pilar: ' + g('pilar') + '\nPer format: ' + g('format') + '\nPer tujuan: ' + g('tujuan');
}
