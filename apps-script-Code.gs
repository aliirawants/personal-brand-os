/**
 * Personal Brand OS — backend (Apps Script, terikat ke Sheet "Personal Brand OS — Database").
 * Semua aksi butuh passcode yang disimpan di tab Profil (key = passcode).
 * Deploy: Web app · Execute as: Me · Who has access: Anyone.
 */
var TABS = {
  Ide: ['id','judul','pilar','tujuan','format','tanggal','status','catatan','draft_li','draft_th','opsi_json','cek_json','post_url','dibuat'],
  Post: ['id','judul','tanggal','url','pilar','format','tujuan','tayangan','reaksi','komentar','repost','simpan','kunjungan_profil','pengikut_baru','peluang','catatan'],
  Ritme: ['id','selesai','catatan'],
  Orang: ['id','nama','peran','perusahaan','level','tahun_pengalaman','potensi','sumber','kenapa','link','kontak_terakhir','aksi_berikutnya','catatan'],
  Review: ['id','tanggal','periode','judul','berhasil','kurang','eksperimen','ide','json'],
  Metrik: ['id','tanggal','pengikut','pengunjung_profil_7h','tayangan_7h','members_reached','sumber'],
  Profil: ['key','value']
};

function doGet(e) { return handle_((e && e.parameter) || {}); }

function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (err) {}
  return handle_(p);
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function passcode_() {
  var rows = sheet_('Profil').getDataRange().getDisplayValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === 'passcode') return String(rows[i][1]);
  return '';
}

function handle_(p) {
  var pass = passcode_();
  if (!pass || p.key !== pass) return out_({ ok: false, error: 'passcode' });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (p.action === 'ping') return out_({ ok: true });
    if (p.action === 'all') return out_({ ok: true, data: readAll_() });
    if (p.action === 'upsert') { upsert_(p.tab, p.rows || []); return out_({ ok: true }); }
    if (p.action === 'delete') { delete_(p.tab, p.ids || []); return out_({ ok: true }); }
    return out_({ ok: false, error: 'action' });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActive();
  var s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
    s.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]);
  }
  return s;
}

function readAll_() {
  var data = {};
  Object.keys(TABS).forEach(function (t) {
    var v = sheet_(t).getDataRange().getDisplayValues();
    var h = v[0] || [];
    var rows = [];
    for (var i = 1; i < v.length; i++) {
      if (!v[i][0]) continue;
      var o = {};
      for (var j = 0; j < h.length; j++) if (h[j]) o[h[j]] = v[i][j];
      if (t === 'Profil' && o.key === 'passcode') continue;
      rows.push(o);
    }
    data[t] = rows;
  });
  return data;
}

function upsert_(tab, rows) {
  if (!TABS[tab]) throw new Error('tab');
  var s = sheet_(tab);
  var keyCol = tab === 'Profil' ? 'key' : 'id';
  var v = s.getDataRange().getDisplayValues();
  var h = v[0].filter(function (x) { return x !== ''; });
  rows.forEach(function (r) {
    Object.keys(r).forEach(function (k) { if (h.indexOf(k) < 0) h.push(k); });
  });
  if (tab === 'Profil') rows = rows.filter(function (r) { return r.key !== 'passcode'; });
  s.getRange(1, 1, 1, h.length).setNumberFormat('@').setValues([h]);
  var ki = h.indexOf(keyCol);
  var body = [];
  var index = {};
  for (var i = 1; i < v.length; i++) {
    var row = h.map(function (_, j) { return v[i][j] !== undefined ? v[i][j] : ''; });
    body.push(row);
    if (row[ki]) index[row[ki]] = body.length - 1;
  }
  rows.forEach(function (r) {
    var id = String(r[keyCol] || '');
    if (!id) return;
    var pos = index[id];
    if (pos === undefined) {
      body.push(h.map(function () { return ''; }));
      pos = body.length - 1;
      index[id] = pos;
    }
    h.forEach(function (k, j) { if (r[k] !== undefined && r[k] !== null) body[pos][j] = String(r[k]); });
  });
  if (body.length) s.getRange(2, 1, body.length, h.length).setNumberFormat('@').setValues(body);
}

function delete_(tab, ids) {
  if (!TABS[tab] || tab === 'Profil') throw new Error('tab');
  var s = sheet_(tab);
  var v = s.getDataRange().getDisplayValues();
  for (var i = v.length - 1; i >= 1; i--) {
    if (ids.indexOf(v[i][0]) >= 0) s.deleteRow(i + 1);
  }
}

/** Jalankan sekali dari editor untuk memberi izin akses Sheet. */
function cekAkses() {
  Logger.log(Object.keys(readAll_()));
}
