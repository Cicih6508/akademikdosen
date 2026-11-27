/* =========================================================
   JAD — Login & loading, routing SPA, penggaris AK, validator jurnal,
   simulasi poin, kalkulator & BUP, kalender (libur & peringatan
   nasional real-time), ekspor PDF/Word, serta layanan lapor kendala.
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const el = (tag, attrs = {}, html = "") => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "style") n.setAttribute("style", v);
      else n.setAttribute(k, v);
    }
    if (html) n.innerHTML = html;
    return n;
  };
  const fmt = (n, d = 2) => Number(n).toLocaleString("id-ID", { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch (e) {} },
    del(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };
  const session = {
    get(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch (e) {} },
    del(key) { try { sessionStorage.removeItem(key); } catch (e) {} }
  };
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast ---------- */
  let toastTimer;
  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
  };

  /* ---------- Efek riak tombol ---------- */
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".btn, .chip-btn, .icon-btn, .nav-links a");
    if (!b || reduceMotion) return;
    const r = b.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const rip = el("span", { class: "ripple", style: `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px` });
    b.appendChild(rip);
    setTimeout(() => rip.remove(), 700);
  });

  /* ---------- Penangkap error otomatis ---------- */
  let lastError = "";
  window.addEventListener("error", (e) => { lastError = `${e.message} @ ${(e.filename || "").split("/").pop()}:${e.lineno}`; });
  window.addEventListener("unhandledrejection", (e) => { lastError = "Promise: " + (e.reason && e.reason.message ? e.reason.message : e.reason); });

  const J = JAD.jenjang;
  const byId = Object.fromEntries(J.map((j, i) => [j.id, Object.assign(j, { index: i })]));
  const bandColor = { aa: "var(--j-aa)", l: "var(--j-l)", lk: "var(--j-lk)", prof: "var(--j-prof)" };
  const tiers = [];
  J.forEach((j) => j.ak.forEach((ak) => tiers.push({ ak, j })));

  /* ---------- Menu ponsel ---------- */
  const menuBtn = $("#menuBtn");
  const navbar = $(".navbar");
  const setMenu = (open) => {
    navbar.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  menuBtn.addEventListener("click", () => setMenu(!navbar.classList.contains("is-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  $("#navHelp").addEventListener("click", () => setMenu(false));

  /* ---------- SPA routing ---------- */
  const views = $$("main > section.view");
  const menuLinks = $$("#menu a[data-nav]");
  const viewTitles = {
    beranda: "Beranda", jenjang: "Jenjang", "angka-kredit": "Angka kredit", kalkulator: "Layanan Akademik", alur: "Alur", loncat: "Loncat jabatan", kalender: "Kalender", faq: "FAQ"
  };
  let currentView = "beranda";
  const panelAlias = { hitung: "hitung", berkas: "berkas", poin: "poin", publikasi: "poin", validator: "validator" };
  const svcPanels = $$(".svc-panel");
  const svcTabs = $$(".svc-tab");
  const showPanel = (id) => {
    const target = document.getElementById(id);
    if (target && target.hidden) staggerItems(target);
    svcPanels.forEach((pn) => { pn.hidden = pn.id !== id; });
    svcTabs.forEach((t) => { const on = t.dataset.nav === id; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", String(on)); });
  };
  let svcCurrent = "hitung";

  const staggerItems = (root) => {
    $$(".ak-table tbody tr, .tier-table tbody tr, .steps li, .berkas-list li, .faq-item, .komponen > div, .prop-row, .jump, .step, .detail, .calc-form fieldset, .kal-board, .kal-agenda, .kal-upcoming, .kal-stat, .validator-box, .pub-form, .bup-card", root)
      .forEach((node, idx) => node.style.setProperty("--i", idx));
  };

  const switchView = (targetId, pushHash = true) => {
    const panelId = panelAlias[targetId] || null;
    if (panelId) { svcCurrent = panelId; showPanel(panelId); }
    else if (targetId === "kalkulator") showPanel(svcCurrent);
    const subEl = panelId ? $("#svcTabs") : null;
    const sec = document.getElementById(panelId ? "kalkulator" : targetId);
    const activeId = sec && sec.classList.contains("view") ? sec.id : "beranda";
    if (subEl && currentView === activeId && !sec.hidden) {
      if (pushHash && location.hash !== "#" + panelId) history.replaceState(null, "", "#" + panelId);
      setMenu(false);
      window.scrollTo({ top: Math.max(0, subEl.getBoundingClientRect().top + window.scrollY - 170), behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    currentView = activeId;
    views.forEach((v) => {
      const isMatch = v.id === activeId;
      v.hidden = !isMatch;
      v.classList.remove("is-in");
      if (isMatch) { staggerItems(v); void v.offsetWidth; v.classList.add("is-in"); }
    });
    menuLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === activeId));
    if (activeId === "beranda") placeBubble(Number($("#akRange").value));
    const hashId = panelId || activeId;
    if (pushHash && location.hash !== "#" + hashId) history.replaceState(null, "", "#" + hashId);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    const h = $("#csHalaman");
    if (h) h.value = viewTitles[activeId];
  };

  $$("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.dataset.nav;
      if (id && (document.getElementById(id) || panelAlias[id])) { e.preventDefault(); switchView(id, true); }
    });
  });

  /* =========================================================
     1. PENGGARIS ANGKA KREDIT
     ========================================================= */
  const MAX = JAD.rulerMax;
  const pct = (v) => (v / MAX) * 100;
  const range = $("#akRange");
  const marker = $("#rulerMarker");
  const needle = $("#rulerNeedle");
  const bubble = $("#rulerBubble");
  const ruler = $("#ruler");

  const bandsWrap = $("#rulerBands");
  J.map((j, i) => ({ j, from: j.ak[0], to: i < J.length - 1 ? J[i + 1].ak[0] : MAX })).forEach((b) => {
    bandsWrap.appendChild(el("div", {
      class: "ruler-band" + (b.j.id === "aa" ? " is-right" : ""),
      style: `left:${pct(b.from)}%;width:${pct(b.to - b.from)}%;--band:${bandColor[b.j.id]}`,
      "data-id": b.j.id
    }, `<span><b class="nm-full">${b.j.nama}</b><b class="nm-short">${b.j.singkat}</b></span>`));
  });

  const ticksWrap = $("#rulerTicks");
  const tierSet = new Set(tiers.map((t) => t.ak));
  for (let v = 0; v <= MAX; v += 10) {
    const cls = tierSet.has(v) ? "tick is-major" : v % 50 === 0 ? "tick is-mid" : "tick";
    ticksWrap.appendChild(el("span", { class: cls, style: `left:${pct(v)}%` }));
  }
  const trackEl = $(".ruler-track");
  [0, ...tierSet].forEach((v) => {
    const lab = el("span", { class: "tick-label" + (v ? " is-tier" : ""), style: `left:${pct(v)}%` + (v === 0 ? ";transform:none" : "") }, fmt(v));
    trackEl.parentNode.appendChild(lab);
    lab.style.top = "auto";
    lab.style.bottom = "0.35rem";
  });

  const rulerInfo = (v) => {
    let cur = null;
    tiers.forEach((t) => { if (v >= t.ak) cur = t; });
    if (!cur) return { status: "Belum mencapai AK Asisten Ahli", next: "Asisten Ahli 150", gap: 150 - v, time: null, here: null };
    let next = null;
    if (cur.j.index < J.length - 1) {
      const nj = J[cur.j.index + 1];
      next = { j: nj, ak: nj.ak[0] };
    } else {
      const i = cur.j.ak.indexOf(cur.ak);
      if (i < cur.j.ak.length - 1) next = { j: cur.j, ak: cur.j.ak[i + 1] };
    }
    const status = `${cur.j.nama} ${fmt(cur.ak)} (${cur.j.pangkat[cur.ak]})`;
    if (!next) return { status, next: "Puncak tangga", gap: 0, time: null, here: cur.j.id, top: true };
    const gap = next.ak - v;
    return { status, next: `${next.j.nama} ${fmt(next.ak)}`, gap, time: { baik: gap / cur.j.konversiBaik, maks: gap / cur.j.maksPerTahun }, here: cur.j.id };
  };

  const placeBubble = (v) => {
    const w = ruler.clientWidth;
    if (!w) return;
    const x = (pct(v) / 100) * w;
    const bw = bubble.offsetWidth;
    bubble.style.left = Math.min(Math.max(x - bw / 2, 0), w - bw) + "px";
  };

  const renderRuler = (v) => {
    v = Number(v);
    marker.style.width = pct(v) + "%";
    needle.style.left = pct(v) + "%";
    bubble.textContent = fmt(v) + " AK";
    placeBubble(v);
    const info = rulerInfo(v);
    $("#rdValue").textContent = fmt(Math.round(v), 0);
    $("#rdStatus").textContent = info.status;
    $("#rdNext").textContent = info.next;
    $("#rdGap").textContent = info.top ? "–" : fmt(info.gap) + " AK";
    $("#rdTime").innerHTML = info.time
      ? `${fmt(info.time.baik, 1)} tahun<small>${fmt(info.time.maks, 1)} tahun bila AK tahunan maksimal</small>`
      : info.top ? "Tidak ada jenjang di atas Profesor" : "Mulai dari jabatan pertama";
    bandsWrap.querySelectorAll(".ruler-band").forEach((b) => b.classList.toggle("is-here", b.dataset.id === info.here));
  };

  range.addEventListener("input", () => renderRuler(range.value));
  window.addEventListener("resize", () => placeBubble(Number(range.value)));
  range.value = 320;
  renderRuler(320);

  /* =========================================================
     2. TANGGA JENJANG
     ========================================================= */
  const stairs = $("#stairs");
  const detail = $("#detail");
  const topAk = J[J.length - 1].ak[J[J.length - 1].ak.length - 1];

  J.forEach((j) => {
    const max = j.ak[j.ak.length - 1];
    const btn = el("button", {
      class: "step", type: "button", role: "tab", id: "tab-" + j.id, "data-id": j.id,
      "aria-selected": "false", style: `--h:${(max / topAk) * 100}%;--bar:${bandColor[j.id]}`
    });
    const notches = j.ak.slice(0, -1).map((a) => `<span class="step-notch" style="bottom:${(a / max) * 100}%"><span>${fmt(a)}</span></span>`).join("");
    const akText = j.ak.length > 1 ? `AK ${fmt(j.ak[0])} – ${fmt(max)}` : `AK ${fmt(max)}`;
    btn.innerHTML = `<span class="step-bar"><span class="step-top"><span class="step-name">${j.nama}</span><span class="step-ak">${akText}</span></span>${notches}</span>`;
    stairs.appendChild(btn);
  });

  const renderDetail = (j) => {
    const prev = j.index > 0 ? J[j.index - 1] : null;
    const tierRows = j.ak.map((a, idx) => `<tr style="--i:${idx}"><td><span class="hl">${fmt(a)}</span></td><td>${j.pangkat[a]}</td></tr>`).join("");
    const pub = j.publikasi ? `<ul class="ticks ticks-plain">${j.publikasi.map((p) => `<li>${p}</li>`).join("")}</ul>` : `<p>Tidak ada syarat publikasi khusus untuk jabatan pertama.</p>`;
    const tambahan = j.tambahan ? `<h4>Syarat khusus tambahan</h4><ul class="ticks ticks-plain">${j.tambahan.map((p) => `<li>${p}</li>`).join("")}</ul>` : "";
    detail.innerHTML = `
      <div class="detail-col">
        <h3>${j.nama}</h3><p>${j.ringkas}</p>
        <h4>Angka kredit kumulatif</h4>
        <table class="tier-table"><thead><tr><th>AK</th><th>Setara pangkat</th></tr></thead><tbody>${tierRows}</tbody></table>
        <div class="meta-row"><span class="chip">SKP Baik: ${fmt(j.konversiBaik)} AK/thn</span><span class="chip">Maks. ${fmt(j.maksPerTahun)} AK/thn</span></div>
      </div>
      <div class="detail-col"><h4>${prev ? `Syarat naik dari ${prev.nama}` : "Syarat jabatan pertama"}</h4><ul class="ticks">${j.syarat.map((s) => `<li>${s}</li>`).join("")}</ul></div>
      <div class="detail-col"><h4>Publikasi syarat khusus</h4>${pub}${tambahan}<h4>Uji kompetensi</h4><p>${j.ujiKompetensi}</p><h4>Tunjangan</h4><p>${j.tunjangan}</p></div>`;
  };

  const selectStep = (id) => {
    stairs.querySelectorAll(".step").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === id)));
    renderDetail(byId[id]);
  };
  stairs.addEventListener("click", (e) => { const b = e.target.closest(".step"); if (b) selectStep(b.dataset.id); });
  selectStep("l");

  /* =========================================================
     3. ANGKA KREDIT
     ========================================================= */
  $("#komponen").innerHTML = JAD.komponenAK.map((k) => `<div><dt>${k.nama}</dt><dd>${k.isi}</dd></div>`).join("");
  $("#akTableBody").innerHTML = J.map((j) => `<tr><td><i style="--c:${bandColor[j.id]}"></i>${j.nama}</td><td>${fmt(j.konversiBaik)}</td><td>${fmt(j.konversiSangatBaik)}</td><td>${fmt(j.maksPerTahun)}</td></tr>`).join("");
  $("#proporsi").innerHTML = J.slice(1).map((j) => {
    const p = j.proporsiPenelitian * 100;
    return `<div class="prop-row"><span>${J[j.index - 1].nama} ke ${j.nama}</span><span class="prop-bar"><span style="--w:${p}%"></span></span><strong>${p}%</strong></div>`;
  }).join("");

  /* =========================================================
     4. VALIDATOR JURNAL & SIMULASI POIN
     ========================================================= */
  const checkJournalValidity = () => {
    const idx = $("#valIndex").value;
    const sjr = parseFloat($("#valSjr").value) || 0;
    const inf = parseFloat($("#valIf").value) || 0;
    const role = $("#valRole").value;

    const isFirst = role === "first-corr" || role === "first";
    const isFirstAndCorr = role === "first-corr";
    const isFirstOrCorr = role === "first-corr" || role === "first" || role === "corr";
    const isScopus = idx.startsWith("scopus");

    const okLektor = (idx.startsWith("sinta") && isFirst) || (isScopus && (sjr > 0.1 || inf > 0.05) && isFirst);
    const okLk =
      ((idx === "sinta-1" || idx === "sinta-2") && isFirstAndCorr) ||
      (["scopus-q1", "scopus-q2", "scopus-q3"].includes(idx) && (sjr > 0.2 || inf > 0.05) && isFirstAndCorr);
    const okProf1 = ["scopus-q1", "scopus-q2"].includes(idx) && (sjr > 0.25 || inf > 0.05) && isFirstAndCorr;
    const okProf2 =
      (idx === "sinta-1" && (isFirstOrCorr || role === "member")) ||
      (["scopus-q1", "scopus-q2", "scopus-q3"].includes(idx) && (sjr > 0.2 || inf > 0.05) && (isFirstOrCorr || role === "member"));

    $("#valOutput").innerHTML = `
      <strong>Status Kelayakan Syarat Khusus (Kepmen 39/M/KEP/2026):</strong>
      <div class="val-badges">
        <span class="val-badge ${okLektor ? "is-ok" : "is-no"}">${okLektor ? "✓ Memenuhi Lektor" : "✕ Belum untuk Lektor"}</span>
        <span class="val-badge ${okLk ? "is-ok" : "is-no"}">${okLk ? "✓ Memenuhi Lektor Kepala" : "✕ Belum untuk Lektor Kepala"}</span>
        <span class="val-badge ${okProf1 ? "is-ok" : "is-no"}">${okProf1 ? "✓ Syarat Utama Profesor (Q2)" : "✕ Bukan Utama Profesor"}</span>
        <span class="val-badge ${okProf2 ? "is-ok" : "is-no"}">${okProf2 ? "✓ Artikel ke-2 Profesor (2026)" : "✕ Bukan ke-2 Profesor"}</span>
      </div>`;
  };
  ["#valIndex", "#valSjr", "#valIf", "#valRole"].forEach((s) => $(s).addEventListener("input", checkJournalValidity));
  checkJournalValidity();

  const PUB_KEY = "jad-pub-list";
  let pubList = [];
  try {
    pubList = JSON.parse(store.get(PUB_KEY) || "null") || [
      { judul: "Model Evaluasi Kurikulum OBE Berbasis Web", jenis: "Jurnal Nasional Terakreditasi SINTA 1 / 2", maxAk: 25, peran: "Pertama & Korespondensi (60%)", totalPenulis: 3, tahun: 2025, ak: 15 },
      { judul: "Optimasi Sistem Informasi Akademik Perguruan Tinggi", jenis: "Jurnal Internasional Bereputasi (Q3/Q4)", maxAk: 30, peran: "Pertama & Korespondensi (60%)", totalPenulis: 2, tahun: 2026, ak: 18 }
    ];
  } catch (e) { pubList = []; }

  const calcPubAk = (maxAk, peranKey, totalPenulis) => {
    const n = Math.max(1, Number(totalPenulis) || 1);
    if (peranKey === "tunggal" || n === 1) return maxAk;
    if (peranKey === "utama_kor") return maxAk * 0.6;
    if (peranKey === "utama") return maxAk * 0.4;
    return (maxAk * 0.4) / Math.max(1, n - 1);
  };

  const renderPubList = () => {
    store.set(PUB_KEY, JSON.stringify(pubList));
    $("#pubTotalAk").textContent = fmt(pubList.reduce((acc, item) => acc + item.ak, 0));
    const tbody = $("#pubTableBody");
    if (pubList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);">Belum ada karya ilmiah ditambahkan.</td></tr>`;
      return;
    }
    tbody.innerHTML = pubList.map((p, idx) => `
      <tr>
        <td><strong>${esc(p.judul)}</strong><small>${esc(p.jenis)} (${p.tahun})</small></td>
        <td>${esc(p.peran)}<small>${p.totalPenulis} penulis</small></td>
        <td><strong>${fmt(p.ak)} AK</strong></td>
        <td><button type="button" class="kal-mini-btn kal-del-btn" data-pidx="${idx}">Hapus</button></td>
      </tr>`).join("");
  };

  $("#pubForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const judul = $("#pJudul").value.trim();
    if (!judul) return;
    const [maxStr, jenisLabel] = $("#pJenis").value.split("|");
    const maxAk = Number(maxStr);
    const peranSel = $("#pPeran");
    const totalPenulis = Number($("#pTotalPenulis").value) || 1;
    const tahun = Number($("#pTahun").value) || 2026;
    const ak = Number(calcPubAk(maxAk, peranSel.value, totalPenulis).toFixed(2));
    pubList.push({ judul, jenis: jenisLabel, maxAk, peran: peranSel.options[peranSel.selectedIndex].text, totalPenulis, tahun, ak });
    $("#pJudul").value = "";
    renderPubList();
    toast(`Karya ditambahkan (+${fmt(ak)} AK)`);
  });
  $("#pubTableBody").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pidx]");
    if (!btn) return;
    pubList.splice(Number(btn.dataset.pidx), 1);
    renderPubList();
    toast("Karya dihapus dari daftar");
  });
  $("#btnClearPub").addEventListener("click", () => { pubList = []; renderPubList(); toast("Daftar karya dikosongkan"); });
  $("#btnApplyPubToCalc").addEventListener("click", () => {
    const total = pubList.reduce((acc, item) => acc + item.ak, 0);
    $("#fAkRiset").value = Number(total.toFixed(2));
    calculate();
    switchView("hitung", true);
    toast(`${fmt(total)} AK penelitian dikirim ke kalkulator`);
  });
  renderPubList();

  /* =========================================================
     5. KALKULATOR KESIAPAN + BUP
     ========================================================= */
  const CALC_KEY = "jad-calc-state";
  const f = {
    nama: $("#fNamaDosen"), tglLahir: $("#fTglLahir"), jabatan: $("#fJabatan"),
    akSk: $("#fAkSk"), akNow: $("#fAkNow"), lama: $("#fLama"),
    target: $("#fTarget"), akRiset: $("#fAkRiset"), skp: $("#fSkp"), masa: $("#fMasa"),
    bkd: $("#fBkd"), pub: $("#fPub"), uji: $("#fUji"), doktor: $("#fDoktor"), serdos: $("#fSerdos")
  };
  f.jabatan.innerHTML = J.slice(0, -1).map((j) => `<option value="${j.id}">${j.nama}</option>`).join("");

  const fillDependent = (keepTarget) => {
    const j = byId[f.jabatan.value];
    const prevSk = f.akSk.value;
    f.akSk.innerHTML = j.ak.map((a) => `<option value="${a}">${fmt(a)}</option>`).join("");
    if (j.ak.map(String).includes(prevSk)) f.akSk.value = prevSk;

    const prevT = f.target.value;
    const opts = [];
    const nj = J[j.index + 1];
    nj.ak.forEach((a) => opts.push(`<option value="reg:${nj.id}:${a}">Reguler → ${nj.nama} ${fmt(a)}</option>`));
    if (j.index + 2 < J.length) {
      const jj = J[j.index + 2];
      jj.ak.forEach((a) => opts.push(`<option value="loncat:${jj.id}:${a}">Loncat Jabatan → ${jj.nama} ${fmt(a)}</option>`));
    }
    f.target.innerHTML = opts.join("");
    if (keepTarget && [...f.target.options].some((o) => o.value === prevT)) f.target.value = prevT;
  };

  const num = (input) => {
    const v = parseFloat(String(input.value).replace(",", "."));
    return Number.isFinite(v) && v >= 0 ? v : 0;
  };

  let lastBupDeadlineIso = "";
  let lastCalcSnapshot = {};

  const calculateBUP = (targetRankId) => {
    const dobVal = f.tglLahir.value;
    const grid = $("#bupDetails");
    const badge = $("#bupStatusBadge");
    if (!dobVal) {
      grid.innerHTML = `<div style="grid-column:1/-1;color:var(--muted);">Masukkan tanggal lahir untuk menghitung proyeksi pensiun.</div>`;
      return;
    }
    const [y, m, d] = dobVal.split("-").map(Number);
    const dob = new Date(y, m - 1, d);
    const now = new Date();

    let ageY = now.getFullYear() - dob.getFullYear();
    let ageM = now.getMonth() - dob.getMonth();
    let ageD = now.getDate() - dob.getDate();
    if (ageD < 0) { ageM--; ageD += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (ageM < 0) { ageY--; ageM += 12; }

    const isProf = f.jabatan.value === "prof" || targetRankId === "prof";
    const bupAge = isProf ? 70 : 65;
    const retireDate = new Date(y + bupAge, m, 1);
    const deadlineDate = new Date(retireDate.getFullYear() - 1, retireDate.getMonth(), retireDate.getDate());
    lastBupDeadlineIso = `${deadlineDate.getFullYear()}-${pad(deadlineDate.getMonth() + 1)}-${pad(deadlineDate.getDate())}`;

    const diffDays = Math.ceil((deadlineDate - now) / 86400000);
    const remYears = Math.max(0, Math.floor(diffDays / 365.25));
    const remMonths = Math.max(0, Math.floor((diffDays % 365.25) / 30.44));
    const fmtDate = (dt) => dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    badge.className = "bup-badge";
    if (diffDays < 0) { badge.classList.add("is-danger"); badge.textContent = "LEWAT TENGGAT 2026"; }
    else if (diffDays <= 540) { badge.classList.add("is-warn"); badge.textContent = "PRIORITAS TINGGI (< 1,5 THN)"; }
    else badge.textContent = "WAKTU TERSEDIA";

    grid.innerHTML = `
      <div><dt>Usia Saat Ini</dt><dd>${ageY} thn ${ageM} bln ${ageD} hr</dd></div>
      <div><dt>Ketentuan BUP (${isProf ? "Profesor" : "Non-Prof"})</dt><dd>${bupAge} Tahun</dd></div>
      <div><dt>TMT Pensiun</dt><dd>${fmtDate(retireDate)}</dd></div>
      <div><dt>Batas Akhir Usulan (H-1 Thn)</dt><dd style="color:var(--ink);">${fmtDate(deadlineDate)}</dd></div>
      <div style="grid-column:1/-1;"><dt>Sisa Waktu Pengajuan Usulan</dt><dd>${diffDays < 0 ? "Sudah melewati batas 1 tahun sebelum pensiun" : `${remYears} tahun ${remMonths} bulan (${fmt(diffDays, 0)} hari lagi)`}</dd></div>`;

    lastCalcSnapshot.bup = { usia: `${ageY} thn ${ageM} bln`, bupAge, tmtPensiun: fmtDate(retireDate), batasUsulan: fmtDate(deadlineDate), sisaHari: diffDays };
  };

  const ICON_OK = '<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24"><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/></svg>';

  function calculate() {
    const cur = byId[f.jabatan.value];
    const [mode, tid, takStr] = f.target.value.split(":");
    const tj = byId[tid];
    const tak = Number(takStr);
    const akSk = Number(f.akSk.value);
    const akNow = num(f.akNow);
    const akRiset = num(f.akRiset);
    const lama = num(f.lama);
    const masa = num(f.masa);
    const skp = f.skp.value;
    const isLoncat = mode === "loncat";

    $("#profOnly").hidden = tj.id !== "prof" && !isLoncat;

    const gapAk = Math.max(0, tak - akNow);
    const needRiset = tj.proporsiPenelitian * Math.max(0, tak - akSk);
    const gapRiset = Math.max(0, needRiset - akRiset);

    const checks = [
      { ok: gapAk === 0, text: `AK kumulatif mencapai ${fmt(tak)}`, hint: gapAk ? `Kurang ${fmt(gapAk)} AK` : "" },
      { ok: gapRiset === 0, text: `AK penelitian minimal ${fmt(needRiset)}`, hint: `${tj.proporsiPenelitian * 100}% × (${fmt(tak)} − ${fmt(akSk)})` + (gapRiset ? `. Kurang ${fmt(gapRiset)} AK` : "") },
      { ok: lama >= 2, text: `Minimal 2 tahun sebagai ${cur.nama}`, hint: lama < 2 ? `Masih kurang ${fmt(2 - lama, 1)} tahun` : "" },
      { ok: isLoncat ? skp === "sb" : skp !== "kurang", text: isLoncat ? "SKP Sangat Baik 2 tahun terakhir (wajib loncat)" : "Predikat SKP minimal Baik 2 tahun terakhir", hint: "" },
      { ok: f.bkd.checked, text: "BKD memenuhi 4 semester berturut-turut", hint: "" },
      { ok: f.pub.checked, text: isLoncat ? "4 artikel jurnal internasional bereputasi (syarat loncat)" : "Publikasi syarat khusus terpenuhi", hint: "" },
      { ok: f.uji.checked, text: "Lulus uji kompetensi", hint: "" }
    ];
    if (tj.id === "prof" || isLoncat) checks.push({ ok: f.doktor.checked, text: "Berijazah doktor (S3), doktor terapan, atau subspesialis", hint: "" });
    if (tj.id === "prof") {
      checks.push({ ok: f.serdos.checked, text: "Memiliki sertifikat pendidik", hint: "" });
      checks.push({ ok: masa >= 10, text: "Minimal 10 tahun sebagai dosen tetap", hint: masa < 10 ? `Masih kurang ${fmt(10 - masa, 0)} tahun` : "" });
    }

    const missing = checks.filter((c) => !c.ok).length;
    const ready = missing === 0;

    $("#calcResult").classList.toggle("is-ready", ready);
    $("#resKicker").textContent = `${cur.nama} (AK ${fmt(akSk)}) → ${isLoncat ? "Loncat ke " : ""}${tj.nama} ${fmt(tak)}`;
    $("#resTitle").textContent = ready ? "Siap diusulkan" : "Belum siap diusulkan";
    $("#resSub").textContent = ready ? "Semua syarat terpenuhi. Siapkan berkas untuk diajukan lewat SISTER." : `${missing} syarat belum terpenuhi.`;

    const pAk = tak ? Math.min(100, (akNow / tak) * 100) : 0;
    const pR = needRiset ? Math.min(100, (akRiset / needRiset) * 100) : 100;
    $("#mAk").style.width = pAk + "%";
    $("#mRiset").style.width = pR + "%";
    $("#mAk").classList.toggle("is-full", pAk >= 100);
    $("#mRiset").classList.toggle("is-full", pR >= 100);
    $("#mAkLabel").textContent = `${fmt(akNow)} / ${fmt(tak)}`;
    $("#mRisetLabel").textContent = `${fmt(akRiset)} / ${fmt(needRiset)}`;

    $("#resList").innerHTML = checks.map((c) => `<li class="${c.ok ? "ok" : "no"}">${c.ok ? ICON_OK : ICON_NO}<span>${c.text}${c.hint ? `<small>${c.hint}</small>` : ""}</span></li>`).join("");

    const t = $("#resTime");
    if (gapAk === 0 && gapRiset === 0) {
      t.innerHTML = `<p>Angka kredit Anda sudah mencukupi untuk <strong>${tj.nama} ${fmt(tak)}</strong>.</p>`;
    } else {
      const parts = [];
      if (gapAk > 0) parts.push(`<p>Kekurangan <strong>${fmt(gapAk)} AK</strong> tertutup dalam ± <strong>${fmt(gapAk / cur.konversiBaik, 1)} tahun</strong> (SKP Baik) atau <strong>${fmt(gapAk / cur.konversiSangatBaik, 1)} tahun</strong> (SKP Sangat Baik).</p>`);
      if (gapRiset > 0) parts.push(`<p>AK penelitian kurang <strong>${fmt(gapRiset)} AK</strong>.</p>`);
      t.innerHTML = parts.join("");
    }

    lastCalcSnapshot = {
      nama: f.nama.value.trim() || "Dosen Pengusul",
      dari: `${cur.nama} (AK ${fmt(akSk)})`,
      ke: `${isLoncat ? "Loncat ke " : ""}${tj.nama} ${fmt(tak)}`,
      akNow, tak, gapAk, akRiset, needRiset, gapRiset, ready, checks
    };

    calculateBUP(tj.id);
    store.set(CALC_KEY, JSON.stringify({
      nama: f.nama.value, tglLahir: f.tglLahir.value, jabatan: f.jabatan.value, akSk: f.akSk.value,
      akNow: f.akNow.value, lama: f.lama.value, target: f.target.value, akRiset: f.akRiset.value,
      skp: f.skp.value, masa: f.masa.value, bkd: f.bkd.checked, pub: f.pub.checked,
      uji: f.uji.checked, doktor: f.doktor.checked, serdos: f.serdos.checked
    }));
  }

  const initCalcState = () => {
    let saved = null;
    try { saved = JSON.parse(store.get(CALC_KEY) || "null"); } catch (e) {}
    f.jabatan.value = saved?.jabatan || "l";
    fillDependent(false);
    f.nama.value = saved?.nama || "";
    f.tglLahir.value = saved?.tglLahir || "1982-05-14";
    if (saved?.akSk) f.akSk.value = saved.akSk;
    f.akNow.value = saved?.akNow ?? 310;
    f.lama.value = saved?.lama ?? 3;
    if (saved?.target) f.target.value = saved.target;
    f.akRiset.value = saved?.akRiset ?? 60;
    f.skp.value = saved?.skp || "b";
    f.masa.value = saved?.masa ?? 8;
    f.bkd.checked = saved?.bkd ?? true;
    f.pub.checked = saved?.pub ?? false;
    f.uji.checked = saved?.uji ?? false;
    f.doktor.checked = saved?.doktor ?? false;
    f.serdos.checked = saved?.serdos ?? false;
  };

  f.jabatan.addEventListener("change", () => { fillDependent(false); calculate(); });
  $("#calcForm").addEventListener("input", calculate);
  $("#calcForm").addEventListener("change", calculate);
  $("#calcReset").addEventListener("click", () => { store.del(CALC_KEY); initCalcState(); calculate(); toast("Isian kalkulator diatur ulang"); });
  initCalcState();
  calculate();

  /* =========================================================
     6. ALUR, LONCAT, BERKAS
     ========================================================= */
  $("#steps").innerHTML = JAD.alur.map((s) => `<li><h3>${s.judul}</h3><p>${s.isi}</p></li>`).join("");

  const jumpSvg = (d, i) => `
    <svg viewBox="0 0 330 150"><defs><marker id="ah${i}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="jf-head"/></marker></defs>
    <rect class="jf-bar is-from" x="20" y="78" width="70" height="44" rx="6"/><rect class="jf-bar is-skip" x="130" y="54" width="70" height="68" rx="6"/><rect class="jf-bar is-to" x="240" y="22" width="70" height="100" rx="6"/>
    <path class="jf-arc" d="M55 70 Q165 -38 268 16" marker-end="url(#ah${i})"/>
    <text x="55" y="142" text-anchor="middle">${d.dari}</text><text x="165" y="142" text-anchor="middle" class="muted">${d.lewati}</text><text x="275" y="142" text-anchor="middle">${d.ke}</text></svg>`;
  $("#jumpGrid").innerHTML = JAD.loncat.map((d, i) => `<article class="jump"><figure class="jump-figure">${jumpSvg(d, i)}</figure><h3>${d.dari} ke ${d.ke}</h3><ul class="ticks">${d.syarat.map((s) => `<li>${s}</li>`).join("")}</ul></article>`).join("");
  $("#jumpCommon").innerHTML = JAD.loncatUmum.map((s) => `<li>${s}</li>`).join("");

  const BERKAS_KEY = "jad-berkas";
  let savedBerkas = [];
  try { savedBerkas = JSON.parse(store.get(BERKAS_KEY) || "[]"); } catch (e) {}
  const berkasList = $("#berkasList");
  berkasList.innerHTML = JAD.berkas.map((b, i) => `<li><label><input type="checkbox" data-i="${i}" ${savedBerkas.includes(i) ? "checked" : ""}/><span>${b}</span></label></li>`).join("");

  const syncBerkas = () => {
    const boxes = [...berkasList.querySelectorAll("input")];
    const done = boxes.filter((b) => b.checked).map((b) => Number(b.dataset.i));
    store.set(BERKAS_KEY, JSON.stringify(done));
    $("#berkasRing").style.setProperty("--p", Math.round((done.length / boxes.length) * 100));
    $("#berkasCount").textContent = `${done.length}/${boxes.length}`;
    $("#berkasText").textContent = done.length === 0 ? "Belum ada berkas yang dicentang." : done.length === boxes.length ? "Semua berkas siap!" : `${boxes.length - done.length} berkas lagi perlu disiapkan.`;
  };
  berkasList.addEventListener("change", syncBerkas);
  $("#berkasReset").addEventListener("click", () => { berkasList.querySelectorAll("input").forEach((b) => (b.checked = false)); syncBerkas(); toast("Centang berkas dikosongkan"); });
  syncBerkas();

  /* =========================================================
     7. KALENDER (Libur Nasional SKB & Hari Peringatan Real-Time)
     ========================================================= */
  const CATS = JAD.kategoriAgenda;
  const catColor = (c) => CATS[c] || "#8b6fd6";
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  $("#kalEventCat").innerHTML = Object.keys(CATS).map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  $("#kalLegend").innerHTML =
    Object.entries(CATS).map(([c, col]) => `<span style="--c:${col}"><i></i>${esc(c)}</span>`).join("") +
    `<span><i class="lib"></i>Libur Nasional / Cuti Bersama</span>` +
    `<span><i class="com"></i>Hari Peringatan Nasional</span>`;

  const updateClock = () => {
    const now = new Date();
    const h = now.getHours();
    $("#liveClockTime").textContent = `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    $("#liveClockDate").textContent = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("#kalGreeting").textContent = h < 11 ? "SELAMAT PAGI, DOSEN" : h < 15 ? "SELAMAT SIANG, DOSEN" : h < 18 ? "SELAMAT SORE, DOSEN" : "SELAMAT MALAM, DOSEN";
  };
  updateClock();
  setInterval(updateClock, 1000);

  const KAL_KEY = "jad-kalender-events";
  const LIBUR_CACHE_KEY = "jad-libur-realtime-v2";
  const toIsoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const normIso = (s) => String(s || "").slice(0, 10).split("-").map((v, i) => (i > 0 ? pad(v) : v)).join("-");

  const todayReal = new Date();
  const todayStr = toIsoDate(todayReal);
  let viewYear = todayReal.getFullYear();
  let viewMonth = todayReal.getMonth();
  let selectedDate = todayStr;

  const normalizeHolidayEntry = (val) => {
    if (!val) return null;
    if (typeof val === "string") {
      const isCuti = /cuti bersama/i.test(val);
      return { nama: val.replace(/\s*\(Cuti Bersama\)\s*/i, "").trim(), jenis: isCuti ? "Cuti Bersama Pemerintah" : "Libur Nasional Resmi" };
    }
    return { nama: val.nama, jenis: val.jenis || "Libur Nasional Resmi" };
  };

  let liburCache = { data: {}, fetchedYears: {} };
  Object.entries(JAD.libur || {}).forEach(([k, v]) => {
    const norm = normalizeHolidayEntry(v);
    if (norm) liburCache.data[k] = norm;
  });

  try {
    const savedLibur = JSON.parse(store.get(LIBUR_CACHE_KEY) || "null");
    if (savedLibur && savedLibur.data) {
      Object.entries(savedLibur.data).forEach(([k, v]) => {
        const norm = normalizeHolidayEntry(v);
        if (norm) liburCache.data[k] = norm;
      });
      liburCache.fetchedYears = savedLibur.fetchedYears || {};
    }
  } catch (e) {}

  const getDateCommemorations = (dateStr) => {
    const list = [];
    const hol = normalizeHolidayEntry(liburCache.data[dateStr]);
    if (hol) {
      list.push({ nama: hol.nama, jenis: hol.jenis, isHoliday: true });
    }
    const mmdd = dateStr.slice(5);
    const natDay = (JAD.peringatanNasional || {})[mmdd];
    if (natDay) {
      const alreadyListed = list.some((x) => x.nama.toLowerCase().includes(natDay.toLowerCase().replace(/\s*\(.*?\)/g, "")));
      if (!alreadyListed) {
        list.push({ nama: natDay, jenis: "Hari Peringatan Nasional", isHoliday: false });
      }
    }
    return list;
  };

  const setLiburStatus = (text, state = "ok") => {
    const elStatus = $("#liburSyncStatus");
    if (!elStatus) return;
    elStatus.textContent = text;
    elStatus.dataset.state = state;
  };

  const fetchHolidaysFromSources = async (year) => {
    const cfg = JAD.liburConfig || {};
    const result = {};

    if (cfg.googleApiKey) {
      try {
        const calId = encodeURIComponent("id.indonesian#holiday@group.v.calendar.google.com");
        const tMin = `${year}-01-01T00:00:00Z`;
        const tMax = `${year}-12-31T23:59:59Z`;
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${encodeURIComponent(cfg.googleApiKey)}&timeMin=${tMin}&timeMax=${tMax}&singleEvents=true`);
        if (res.ok) {
          const json = await res.json();
          (json.items || []).forEach((it) => {
            const dt = normIso(it.start?.date || it.start?.dateTime);
            if (dt && it.summary) {
              const isCuti = /cuti bersama/i.test(it.summary);
              result[dt] = { nama: it.summary, jenis: isCuti ? "Cuti Bersama Pemerintah" : "Libur Nasional Resmi" };
            }
          });
          if (Object.keys(result).length) return { map: result, source: "Google Calendar" };
        }
      } catch (e) {}
    }

    try {
      const res = await fetch(`https://dayoffapi.vercel.app/api?year=${year}`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length) {
          list.forEach((item) => {
            const dt = normIso(item.tanggal);
            if (dt && item.keterangan) {
              result[dt] = {
                nama: item.keterangan,
                jenis: item.is_cuti ? "Cuti Bersama Pemerintah" : "Libur Nasional (SKB Pemerintah)"
              };
            }
          });
          if (Object.keys(result).length) return { map: result, source: "SKB Pemerintah (Live)" };
        }
      }
    } catch (e) {}

    try {
      const res = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length) {
          list.forEach((item) => {
            const dt = normIso(item.holiday_date);
            if (dt && item.holiday_name) {
              result[dt] = { nama: item.holiday_name, jenis: "Libur Nasional Resmi" };
            }
          });
          if (Object.keys(result).length) return { map: result, source: "API Hari Libur ID" };
        }
      }
    } catch (e) {}

    try {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length) {
          list.forEach((item) => {
            const dt = normIso(item.date);
            if (dt && (item.localName || item.name)) {
              result[dt] = { nama: item.localName || item.name, jenis: "Libur Nasional Resmi" };
            }
          });
          if (Object.keys(result).length) return { map: result, source: "Nager Public Holiday" };
        }
      }
    } catch (e) {}

    return null;
  };

  let syncingYear = null;
  const syncHolidaysForYear = async (year, force = false) => {
    const cfg = JAD.liburConfig || {};
    if (cfg.autoSync === false && !force) return;
    const ttlMs = (cfg.cacheHours || 12) * 3600 * 1000;
    const lastFetched = liburCache.fetchedYears[year] || 0;

    if (!force && Date.now() - lastFetched < ttlMs) {
      setLiburStatus(`● Libur Nasional ${year}: Aktif & Tersinkron Real-Time`, "ok");
      return;
    }
    if (syncingYear === year) return;
    syncingYear = year;
    setLiburStatus(`◌ Menyinkronkan libur nasional ${year} dari server…`, "loading");

    const fetched = await fetchHolidaysFromSources(year);
    syncingYear = null;

    if (fetched) {
      Object.keys(liburCache.data).forEach((k) => {
        if (k.startsWith(`${year}-`)) delete liburCache.data[k];
      });
      Object.assign(liburCache.data, fetched.map);
      liburCache.fetchedYears[year] = Date.now();
      store.set(LIBUR_CACHE_KEY, JSON.stringify(liburCache));
      setLiburStatus(`● Libur Nasional ${year}: Real-Time (${fetched.source})`, "ok");
      renderKalender();
      if (force) toast(`Libur nasional ${year} diperbarui (${fetched.source})`);
    } else {
      setLiburStatus(`● Libur Nasional ${year}: Mode Offline / Data Bawaan`, "warn");
      if (force) toast("Gagal terhubung ke server libur, memakai data cadangan");
    }
  };

  let kalEvents = {};
  try {
    kalEvents = JSON.parse(store.get(KAL_KEY) || "null") || {
      [todayStr]: [{ title: "Evaluasi BKD & Rekap Angka Kredit SISTER", time: "09:30", cat: "BKD / SKP" }]
    };
  } catch (e) { kalEvents = {}; }
  const saveKalEvents = () => store.set(KAL_KEY, JSON.stringify(kalEvents));

  const renderTodayBanner = () => {
    const box = $("#kalTodayBanner");
    if (!box) return;
    const now = new Date();
    const todayIso = toIsoDate(now);
    const todayFmt = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const todayItems = getDateCommemorations(todayIso);

    if (todayItems.length > 0) {
      const hasHoliday = todayItems.some((i) => i.isHoliday);
      box.className = "kal-today-banner " + (hasHoliday ? "is-holiday" : "is-commem");
      box.innerHTML = `
        <span class="kal-today-badge">${hasHoliday ? "LIBUR NASIONAL HARI INI" : "PERINGATAN HARI INI"}</span>
        <div class="kal-today-text">
          <strong>${todayFmt} memperingati: ${todayItems.map((i) => esc(i.nama)).join(" • ")}</strong>
          <span>${todayItems.map((i) => esc(i.jenis)).join(" & ")}</span>
        </div>`;
      return;
    }

    let nextFound = null;
    for (let offset = 1; offset <= 90; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const iso = toIsoDate(d);
      const items = getDateCommemorations(iso);
      if (items.length > 0) {
        nextFound = { iso, d, offset, items };
        break;
      }
    }

    box.className = "kal-today-banner";
    if (nextFound) {
      const nextDateText = nextFound.d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      box.innerHTML = `
        <span class="kal-today-badge">INFO HARI INI</span>
        <div class="kal-today-text">
          <strong>${todayFmt} — Hari Kerja Aktif</strong>
          <span>Peringatan terdekat (${nextFound.offset} hari lagi): <button type="button" class="link-btn" data-go-banner="${nextFound.iso}">${nextDateText} — ${esc(nextFound.items[0].nama)}</button></span>
        </div>`;
    } else {
      box.innerHTML = `
        <span class="kal-today-badge">INFO HARI INI</span>
        <div class="kal-today-text">
          <strong>${todayFmt}</strong>
          <span>Tidak ada peringatan nasional dalam waktu dekat.</span>
        </div>`;
    }
  };

  $("#kalTodayBanner")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go-banner]");
    if (!b) return;
    selectedDate = b.dataset.goBanner;
    const d = parseIso(selectedDate);
    viewYear = d.getFullYear(); viewMonth = d.getMonth();
    renderKalender();
    syncHolidaysForYear(viewYear);
  });

  const renderStats = () => {
    const prefix = `${viewYear}-${pad(viewMonth + 1)}-`;
    let inMonth = 0;
    Object.entries(kalEvents).forEach(([dt, list]) => { if (dt.startsWith(prefix)) inMonth += list.length; });
    const holi = Object.keys(liburCache.data).filter((d) => d.startsWith(prefix)).length;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    let week = 0;
    Object.entries(kalEvents).forEach(([dt, list]) => { const d = parseIso(dt); if (d >= start && d <= end) week += list.length; });
    $("#kalStatMonth").textContent = inMonth;
    $("#kalStatWeek").textContent = week;
    $("#kalStatHoliday").textContent = holi;
  };

  const renderUpcoming = () => {
    const now = new Date();
    const items = [];
    Object.entries(kalEvents).forEach(([dt, list]) => list.forEach((ev) => {
      if (ev.done) return;
      const [hh, mm] = (ev.time || "00:00").split(":").map(Number);
      const when = parseIso(dt); when.setHours(hh || 0, mm || 0);
      if (when >= now) items.push({ dt, when, ev });
    }));
    items.sort((a, b) => a.when - b.when);
    const box = $("#kalUpcoming");
    box.innerHTML = items.length === 0
      ? `<li class="kal-empty-msg">Tidak ada agenda mendatang. Tambahkan lewat formulir di atas.</li>`
      : items.slice(0, 5).map((it) => `<li><button type="button" class="kal-up-item" data-go="${it.dt}" style="--c:${catColor(it.ev.cat)}"><span class="kal-up-date"><b>${it.when.getDate()}</b><small>${MONTHS[it.when.getMonth()].slice(0, 3)}</small></span><span class="kal-up-info"><strong>${esc(it.ev.title)}</strong><span>Pukul ${esc(it.ev.time)} • ${esc(it.ev.cat)}</span></span></button></li>`).join("");
  };

  const renderMonthCommemorations = () => {
    const box = $("#kalMonthCommemList");
    if (!box) return;
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const rows = [];
    for (let d = 1; d <= totalDays; d++) {
      const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
      const items = getDateCommemorations(iso);
      items.forEach((it) => {
        rows.push({ d, iso, ...it });
      });
    }
    if (rows.length === 0) {
      box.innerHTML = `<li class="kal-empty-msg">Tidak ada hari libur nasional atau peringatan khusus pada bulan ini.</li>`;
      return;
    }
    box.innerHTML = rows.map((r) => `
      <li>
        <button type="button" class="kal-commem-row ${r.isHoliday ? "is-holiday" : "is-commem"}" data-go-commem="${r.iso}">
          <span class="kal-commem-tgl">${r.d} ${MONTHS[viewMonth].slice(0, 3)}</span>
          <span class="kal-commem-name">${esc(r.nama)}</span>
          <span class="kal-commem-tag">${r.isHoliday ? "Libur Nasional" : "Peringatan"}</span>
        </button>
      </li>`).join("");
  };

  $("#kalMonthCommemList")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go-commem]");
    if (!b) return;
    selectedDate = b.dataset.goCommem;
    renderKalender();
  });

  const renderKalender = () => {
    $("#kalMonthLabel").textContent = MONTHS[viewMonth];
    $("#kalYearLabel").textContent = viewYear;
    const firstDayIdx = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysWrap = $("#kalDays");
    daysWrap.innerHTML = "";

    for (let i = 0; i < firstDayIdx; i++) daysWrap.appendChild(el("button", { type: "button", class: "kal-day is-empty", disabled: "true", tabindex: "-1" }));
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
      const evs = kalEvents[dateStr] || [];
      const commems = getDateCommemorations(dateStr);
      const isHoliday = commems.some((c) => c.isHoliday);
      const isCommem = !isHoliday && commems.length > 0;
      const commemTitle = commems.map((c) => `${c.nama} (${c.jenis})`).join(" • ");
      const dow = new Date(viewYear, viewMonth, d).getDay();
      const cats = [...new Set(evs.map((e) => e.cat))].slice(0, 3);
      const cls = ["kal-day",
        dateStr === todayStr ? "is-today" : "",
        dateStr === selectedDate ? "is-selected" : "",
        dateStr < todayStr ? "is-past" : "",
        dow === 0 ? "is-sun" : "",
        isHoliday ? "is-holiday" : "",
        isCommem ? "is-commem" : ""].filter(Boolean).join(" ");
      const dots = cats.length ? `<span class="kal-dots">${cats.map((c) => `<i style="--c:${catColor(c)}"></i>`).join("")}</span>` : "";
      const label = `${d} ${MONTHS[viewMonth]} ${viewYear}${commemTitle ? ", Memperingati: " + commemTitle : ""}${evs.length ? `, ${evs.length} agenda` : ""}`;
      daysWrap.appendChild(el("button", { type: "button", class: cls, "data-date": dateStr, title: commemTitle, "aria-label": label }, `<span>${d}</span>${dots}`));
    }
    renderTodayBanner();
    renderStats();
    renderUpcoming();
    renderMonthCommemorations();
    renderAgenda();
  };

  const renderAgenda = () => {
    const d = parseIso(selectedDate);
    $("#kalSelectedDateLabel").textContent = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const hol = $("#kalHoliday");
    const commems = getDateCommemorations(selectedDate);
    hol.hidden = commems.length === 0;
    if (commems.length > 0) {
      const hasHoliday = commems.some((c) => c.isHoliday);
      hol.className = "kal-holiday " + (hasHoliday ? "is-holiday" : "is-commem");
      hol.innerHTML = commems.map((c) => `
        <div class="kal-commem-detail">
          <span class="kal-commem-kicker">${esc(c.jenis).toUpperCase()}</span>
          <strong class="kal-commem-title">${esc(c.nama)}</strong>
        </div>`).join("");
    }
    const items = kalEvents[selectedDate] || [];
    $("#kalEventList").innerHTML = items.length === 0
      ? `<li class="kal-empty-msg">Belum ada kegiatan pada tanggal ini. Gunakan tombol isi cepat di atas atau tulis manual.</li>`
      : items.map((ev, idx) => `<li class="kal-event-item${ev.done ? " is-done" : ""}" style="--c:${catColor(ev.cat)}"><div class="kal-event-info"><strong>${esc(ev.title)}</strong><span>Pukul ${esc(ev.time)} • ${esc(ev.cat)}</span></div><div class="kal-event-btns"><button type="button" class="kal-mini-btn" data-act="done" data-idx="${idx}">${ev.done ? "Batal" : "Selesai"}</button><button type="button" class="kal-mini-btn kal-del-btn" data-act="del" data-idx="${idx}">Hapus</button></div></li>`).join("");
  };

  $("#kalDays").addEventListener("click", (e) => { const btn = e.target.closest(".kal-day[data-date]"); if (btn) { selectedDate = btn.dataset.date; renderKalender(); } });
  $("#kalPrev").addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderKalender();
    syncHolidaysForYear(viewYear);
  });
  $("#kalNext").addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderKalender();
    syncHolidaysForYear(viewYear);
  });
  $("#kalToday").addEventListener("click", () => {
    const n = new Date();
    viewYear = n.getFullYear(); viewMonth = n.getMonth(); selectedDate = toIsoDate(n);
    renderKalender();
    syncHolidaysForYear(viewYear);
  });
  $("#kalUpcoming").addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (!b) return;
    selectedDate = b.dataset.go;
    const d = parseIso(selectedDate);
    viewYear = d.getFullYear(); viewMonth = d.getMonth();
    renderKalender();
    syncHolidaysForYear(viewYear);
  });
  $("#btnSyncLibur")?.addEventListener("click", () => syncHolidaysForYear(viewYear, true));

  $$(".chip-btn[data-quick]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const [title, time, cat] = chip.dataset.quick.split("|");
      $("#kalEventTitle").value = title;
      $("#kalEventTime").value = time;
      $("#kalEventCat").value = cat;
      toast("Isian cepat dimasukkan. Tekan Simpan Kegiatan.");
    });
  });

  $("#kalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#kalEventTitle").value.trim();
    if (!title) return;
    if (!kalEvents[selectedDate]) kalEvents[selectedDate] = [];
    kalEvents[selectedDate].push({ title, time: $("#kalEventTime").value || "09:00", cat: $("#kalEventCat").value });
    kalEvents[selectedDate].sort((a, b) => a.time.localeCompare(b.time));
    saveKalEvents();
    $("#kalEventTitle").value = "";
    renderKalender();
    toast("Kegiatan disimpan");
  });

  $("#kalEventList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const idx = Number(b.dataset.idx);
    if (b.dataset.act === "del") {
      kalEvents[selectedDate].splice(idx, 1);
      if (kalEvents[selectedDate].length === 0) delete kalEvents[selectedDate];
      toast("Kegiatan dihapus");
    } else {
      kalEvents[selectedDate][idx].done = !kalEvents[selectedDate][idx].done;
    }
    saveKalEvents();
    renderKalender();
  });

  $("#btnSendBupToCal").addEventListener("click", () => {
    if (!lastBupDeadlineIso) { toast("Isi tanggal lahir terlebih dahulu"); return; }
    if (!kalEvents[lastBupDeadlineIso]) kalEvents[lastBupDeadlineIso] = [];
    kalEvents[lastBupDeadlineIso].push({ title: `Batas Akhir Usulan JAD (${lastCalcSnapshot.ke}) — H-1 Tahun BUP`, time: "08:00", cat: "Tenggat BUP" });
    saveKalEvents();
    const d = parseIso(lastBupDeadlineIso);
    viewYear = d.getFullYear(); viewMonth = d.getMonth(); selectedDate = lastBupDeadlineIso;
    renderKalender();
    syncHolidaysForYear(viewYear);
    switchView("kalender", true);
    toast("Tenggat usulan disimpan ke kalender");
  });

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  $("#btnExportIcs").addEventListener("click", () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//JAD Dosen//ID"];
    Object.entries(kalEvents).forEach(([dt, list]) => {
      const ymd = dt.replace(/-/g, "");
      list.forEach((ev, i) => {
        const hm = ev.time.replace(":", "") + "00";
        const summary = `[JAD - ${ev.cat}] ${ev.title}`.replace(/([,;\\])/g, "\\$1");
        lines.push("BEGIN:VEVENT", `UID:jad-${ymd}-${i}@jad.local`, `DTSTAMP:${stamp}`, `DTSTART:${ymd}T${hm}`, `SUMMARY:${summary}`, "END:VEVENT");
      });
    });
    lines.push("END:VCALENDAR");
    downloadBlob(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }), "agenda-jad-dosen.ics");
    toast("File kalender (.ics) diunduh");
  });
  $("#btnBackupKal").addEventListener("click", () => {
    downloadBlob(new Blob([JSON.stringify(kalEvents, null, 2)], { type: "application/json" }), "backup-kalender-jad.json");
    toast("Backup kalender diunduh");
  });
  $("#inputRestoreKal").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          kalEvents = parsed; saveKalEvents(); renderKalender(); toast("Jadwal kalender berhasil dimuat");
        } else throw new Error("format");
      } catch (err) { toast("Format file JSON tidak valid"); }
      e.target.value = "";
    };
    reader.readAsText(file);
  });

  renderKalender();
  syncHolidaysForYear(viewYear);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) syncHolidaysForYear(viewYear, false);
  });
  setInterval(() => syncHolidaysForYear(viewYear, false), 3600 * 1000);

  /* =========================================================
     8. EKSPOR PDF & WORD
     ========================================================= */
  const KALEXP_KEY = "jad-kal-export";
  let kalExport = store.get(KALEXP_KEY) !== "0";
  const kalToggle = $("#kalExportToggle");
  const syncKalExport = () => {
    kalToggle.checked = kalExport;
    $("#kalExportStateText").textContent = kalExport
      ? "ON: agenda kalender ikut tercetak di dokumen."
      : "OFF: kalender tidak dimasukkan ke dokumen.";
    $("#exportKalNote").textContent = kalExport
      ? "Agenda kalender ikut dimasukkan (ON)."
      : "Agenda kalender tidak dimasukkan (OFF).";
  };
  kalToggle.addEventListener("change", () => {
    kalExport = kalToggle.checked;
    store.set(KALEXP_KEY, kalExport ? "1" : "0");
    syncKalExport();
    toast(kalExport ? "Kalender akan ikut di PDF & Word" : "Kalender tidak akan ikut di PDF & Word");
  });
  syncKalExport();

  const buildDossierHtml = () => {
    const s = lastCalcSnapshot;
    const bup = s.bup || {};
    const doneIdx = [...berkasList.querySelectorAll("input")].filter((b) => b.checked).map((b) => Number(b.dataset.i));
    const totalPubAk = pubList.reduce((acc, p) => acc + p.ak, 0);
    const pubRows = pubList.length
      ? pubList.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.judul)}</td><td>${esc(p.jenis)} (${p.tahun})</td><td>${esc(p.peran)}</td><td><strong>${fmt(p.ak)}</strong></td></tr>`).join("")
      : `<tr><td colspan="5">Belum ada daftar karya ilmiah yang diinput pada simulasi.</td></tr>`;
    const checkRows = (s.checks || []).map((c) => `<tr><td>${c.ok ? "✓ Memenuhi" : "✕ Belum"}</td><td>${esc(c.text)} ${c.hint ? `(${esc(c.hint)})` : ""}</td></tr>`).join("");
    const berkasRows = JAD.berkas.map((b, i) => `<tr><td>${doneIdx.includes(i) ? "[✓] Siap" : "[ ] Belum"}</td><td>${esc(b)}</td></tr>`).join("");
    const agendaEntries = Object.entries(kalEvents).sort();
    const agendaRows = agendaEntries.length
      ? agendaEntries.flatMap(([dt, list]) => list.map((ev) => `<tr><td>${dt} (${esc(ev.time)})</td><td>${esc(ev.cat)}</td><td>${esc(ev.title)}${ev.done ? " (selesai)" : ""}</td></tr>`)).join("")
      : `<tr><td colspan="3">Belum ada agenda terjadwal.</td></tr>`;

    return `
      <h1>DOSSIER PERENCANAAN KENAIKAN JABATAN AKADEMIK DOSEN (JAD)</h1>
      <p><strong>Nama Pengusul:</strong> ${esc(s.nama)} &nbsp;|&nbsp; <strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
      <p><strong>Rencana Usulan:</strong> ${esc(s.dari)} menuju <strong>${esc(s.ke)}</strong> &nbsp;|&nbsp; <strong>Status Kesiapan:</strong> ${s.ready ? "SIAP DIUSULKAN" : "BELUM SIAP"}</p>
      <h2>1. Rekapitulasi Angka Kredit &amp; Proyeksi BUP</h2>
      <table>
        <tr><th>AK Kumulatif Saat Ini</th><td>${fmt(s.akNow)} AK (Target: ${fmt(s.tak)} AK • Kekurangan: ${fmt(s.gapAk)} AK)</td></tr>
        <tr><th>AK Penelitian Tersedia</th><td>${fmt(s.akRiset)} AK (Syarat Minimal: ${fmt(s.needRiset)} AK • Kekurangan: ${fmt(s.gapRiset)} AK)</td></tr>
        <tr><th>Usia &amp; Ketentuan BUP</th><td>${bup.usia || "-"} (Batas Usia Pensiun: ${bup.bupAge || "-"} Tahun)</td></tr>
        <tr><th>TMT Pensiun &amp; Batas Usulan 2026</th><td>TMT Pensiun: ${bup.tmtPensiun || "-"} | <strong>Batas Akhir Usulan: ${bup.batasUsulan || "-"}</strong></td></tr>
      </table>
      <h2>2. Evaluasi Syarat Kenaikan Jabatan</h2>
      <table><thead><tr><th>Status</th><th>Rincian Syarat (Permendiktisaintek 52/2025 &amp; Kepmen 39/2026)</th></tr></thead><tbody>${checkRows}</tbody></table>
      <h2>3. Rincian Simulasi Poin Publikasi (Total: ${fmt(totalPubAk)} AK)</h2>
      <table><thead><tr><th>No</th><th>Judul Karya</th><th>Kategori &amp; Tahun</th><th>Peran</th><th>AK</th></tr></thead><tbody>${pubRows}</tbody></table>
      <h2>4. Daftar Periksa Kelengkapan Berkas (${doneIdx.length}/${JAD.berkas.length} Siap)</h2>
      <table><thead><tr><th>Status</th><th>Nama Dokumen</th></tr></thead><tbody>${berkasRows}</tbody></table>
      ${kalExport ? `<h2>5. Jadwal &amp; Tenggat Agenda Akademik</h2>
      <table><thead><tr><th>Tanggal &amp; Jam</th><th>Kategori</th><th>Kegiatan</th></tr></thead><tbody>${agendaRows}</tbody></table>` : ""}`;
  };

  const triggerPdfPrint = () => {
    $("#printDossier").innerHTML = buildDossierHtml();
    toast("Membuka dialog cetak / simpan PDF…");
    setTimeout(() => window.print(), 250);
  };
  const triggerWordDownload = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Laporan JAD</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.45; }
        h1 { color: #2f6fb8; font-size: 16pt; border-bottom: 2px solid #2f6fb8; padding-bottom: 4pt; }
        h2 { color: #2f6fb8; font-size: 12pt; margin-top: 14pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 6pt; }
        th, td { border: 1px solid #666; padding: 5pt; text-align: left; }
        th { background-color: #eaf2fc; }
      </style></head><body>${buildDossierHtml()}</body></html>`;
    downloadBlob(new Blob(["\ufeff", htmlContent], { type: "application/msword" }), `Dossier-JAD-${(lastCalcSnapshot.nama || "Dosen").replace(/\s+/g, "_")}.doc`);
    toast("Dokumen Word (.doc) diunduh");
  };
  ["#btnExportPdfNav", "#btnExportPdfBerkas"].forEach((id) => $(id)?.addEventListener("click", triggerPdfPrint));
  ["#btnExportWordNav", "#btnExportWordBerkas"].forEach((id) => $(id)?.addEventListener("click", triggerWordDownload));

  /* =========================================================
     9. FAQ & FOOTER
     ========================================================= */
  const faqList = $("#faqList");
  faqList.innerHTML = JAD.faq.map((fq, i) => `<details class="faq-item" data-i="${i}"><summary>${esc(fq.q)}</summary><p>${esc(fq.a)}</p></details>`).join("");
  const faqItems = $$(".faq-item", faqList);
  $("#faqSearch").addEventListener("input", (e) => {
    const ql = e.target.value.trim().toLowerCase();
    let shown = 0;
    faqItems.forEach((it) => {
      const d = JAD.faq[Number(it.dataset.i)];
      const match = !ql || (d.q + " " + d.a).toLowerCase().includes(ql);
      it.hidden = !match;
      if (match) shown++;
      it.open = Boolean(ql) && match;
    });
    $("#faqEmpty").hidden = shown !== 0;
  });
  $("#updated").textContent = JAD.updated;

  /* =========================================================
     10. CUSTOMER SERVICE — LAPOR KENDALA KE EMAIL
     ========================================================= */
  $("#csJenis").innerHTML = JAD.cs.jenis.map((j) => `<option>${esc(j)}</option>`).join("");
  $("#csHalaman").innerHTML = Object.values(viewTitles).map((t) => `<option>${esc(t)}</option>`).join("") + "<option>Login / Loading</option><option>Lainnya</option>";
  $("#csHalaman").value = viewTitles.beranda;

  const csStatus = $("#csStatus");
  const setCsStatus = (type, msg) => { csStatus.hidden = false; csStatus.className = "cs-status is-" + type; csStatus.textContent = msg; };
  const emailConfigured = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(JAD.cs.email) && !/GANTI/i.test(JAD.cs.email);

  const collectReport = () => {
    const ticket = "JAD-" + Date.now().toString(36).toUpperCase().slice(-6);
    return {
      ticket,
      nama: $("#csNama").value.trim(),
      email: $("#csEmail").value.trim(),
      jenis: $("#csJenis").value,
      halaman: $("#csHalaman").value,
      pesan: $("#csPesan").value.trim(),
      info: `Layar: ${screen.width}x${screen.height} | Jendela: ${innerWidth}x${innerHeight} | Waktu: ${new Date().toString()} | URL: ${location.href} | Peramban: ${navigator.userAgent} | Log kesalahan terakhir: ${lastError || "tidak ada"}`
    };
  };
  const validReport = (r) => {
    if (!r.nama || !r.pesan) { setCsStatus("err", "Nama dan uraian kendala wajib diisi."); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) { setCsStatus("err", "Format email Anda belum benar."); return false; }
    return true;
  };

  $("#csForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if ($("#csHoney").value) return;
    const r = collectReport();
    if (!validReport(r)) return;
    if (!emailConfigured()) {
      setCsStatus("err", "Email tujuan belum diatur. Buka data.js lalu isi JAD.cs.email. Sementara itu gunakan tombol “Kirim lewat aplikasi email”.");
      return;
    }
    const btn = $("#csSubmit");
    if (btn) { btn.disabled = true; btn.textContent = "Mengirim…"; }
    setCsStatus("info", "Mengirim laporan Anda…");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(JAD.cs.email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `[${r.ticket}] ${r.jenis} — Portal JAD`,
          _template: "table",
          _captcha: "false",
          "Nomor Tiket": r.ticket,
          Nama: r.nama,
          "Email Pelapor": r.email,
          "Jenis Laporan": r.jenis,
          "Halaman Terkait": r.halaman,
          Uraian: r.pesan,
          "Info Perangkat & Log": r.info,
          _replyto: r.email
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.success !== true && data.success !== "true")) throw new Error(data.message || "gagal");
      setCsStatus("ok", `Laporan terkirim. Nomor tiket Anda: ${r.ticket}. Kami akan membalas lewat email.`);
      $("#csForm").reset();
      $("#csHalaman").value = viewTitles[currentView];
      toast("Laporan terkirim: " + r.ticket);
    } catch (err) {
      setCsStatus("err", "Laporan belum terkirim (periksa koneksi, atau aktivasi FormSubmit belum dilakukan). Coba tombol “Kirim lewat aplikasi email”.");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Kirim Laporan"; }
    }
  });

  $("#csMailto").addEventListener("click", () => {
    const r = collectReport();
    if (!validReport(r)) return;
    if (!emailConfigured()) { setCsStatus("err", "Email tujuan belum diatur di data.js (JAD.cs.email)."); return; }
    const body = `Nomor tiket: ${r.ticket}\nNama: ${r.nama}\nEmail: ${r.email}\nJenis: ${r.jenis}\nHalaman: ${r.halaman}\n\n${r.pesan}\n\n---\n${r.info}`;
    location.href = `mailto:${JAD.cs.email}?subject=${encodeURIComponent(`[${r.ticket}] ${r.jenis} — Portal JAD`)}&body=${encodeURIComponent(body)}`;
    toast("Membuka aplikasi email…");
  });

  /* =========================================================
     11. PORTAL LOGIN, LOADING, KELUAR
     ========================================================= */
  const AUTH_KEY = "jad-auth";
  const gate = $("#gate");
  const loader = $("#loader");
  const app = $("#app");
  const loginCard = $("#loginForm");

  const loadSteps = [
    [0, "Memuat data regulasi…"],
    [35, "Menyiapkan kalkulator & BUP…"],
    [65, "Menyusun kalender & peringatan nasional…"],
    [90, "Hampir selesai…"]
  ];

  const runLoader = (duration, done) => {
    loader.hidden = false;
    loader.classList.remove("is-out");
    const bar = $("#loaderBar");
    const pctEl = $("#loaderPct");
    const txt = $("#loaderText");
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 2.2);
      const v = Math.round(eased * 100);
      bar.style.width = v + "%";
      pctEl.textContent = v;
      loadSteps.forEach(([at, label]) => { if (v >= at) txt.textContent = label; });
      if (p < 1) requestAnimationFrame(tick);
      else {
        app.hidden = false;
        document.body.classList.remove("is-locked");
        loader.classList.add("is-out");
        setTimeout(() => { loader.hidden = true; }, 560);
        switchView(location.hash.replace("#", "") || "beranda", false);
        window.scrollTo(0, 0);
        placeBubble(Number(range.value));
        if (done) done();
      }
    };
    requestAnimationFrame(tick);
  };

  const showGate = () => {
    app.hidden = true;
    loader.hidden = true;
    gate.hidden = false;
    gate.classList.remove("is-out");
    document.body.classList.add("is-locked");
    $("#loginUser").value = "";
    $("#loginPass").value = "";
    $("#loginError").hidden = true;
  };

  $("#passToggle").addEventListener("click", () => {
    const p = $("#loginPass");
    const show = p.type === "password";
    p.type = show ? "text" : "password";
    $("#passToggle").textContent = show ? "Sembunyi" : "Lihat";
    $("#passToggle").setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
  });

  loginCard.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = $("#loginUser").value.trim();
    const p = $("#loginPass").value;
    if (u === JAD.auth.user && p === JAD.auth.pass) {
      session.set(AUTH_KEY, "1");
      $("#loginError").hidden = true;
      gate.classList.add("is-out");
      setTimeout(() => { gate.hidden = true; }, 520);
      runLoader(2600);
    } else {
      $("#loginError").hidden = false;
      loginCard.classList.remove("shake");
      void loginCard.offsetWidth;
      loginCard.classList.add("shake");
      $("#loginPass").select();
    }
  });

  $("#btnLogout").addEventListener("click", () => {
    session.del(AUTH_KEY);
    window.scrollTo(0, 0);
    showGate();
    toast("Anda telah keluar");
  });

  if (session.get(AUTH_KEY) === "1") {
    gate.hidden = true;
    runLoader(1400);
  } else {
    $("#loginUser").focus();
  }

  /* =========================================================
     12. iOS 26 BUBBLE, SCROLL PROGRESS, SLIDING PILL,
         VARIASI ANIMASI SCROLL, GLARE, BACK-TO-TOP & COUNTER
     ========================================================= */
  if (!reduceMotion) {
    document.addEventListener("pointerdown", (e) => {
      const barLink = e.target.closest("#menu a");
      if (!barLink) return;
      const rect = barLink.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.15;
      const bubble = el("span", {
        class: "ios26-bubble",
        style: `--bx:${e.clientX - rect.left}px;--by:${e.clientY - rect.top}px;--bs:${size}px`
      });
      barLink.appendChild(bubble);
      bubble.addEventListener("animationend", () => bubble.remove(), { once: true });
      setTimeout(() => { if (bubble.isConnected) bubble.remove(); }, 700);
    });

    const progressBar = el("div", { class: "scroll-progress", "aria-hidden": "true" });
    document.body.appendChild(progressBar);
    const updateScrollProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    };
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  const navWrap = $("#menu");
  const navPill = el("span", { class: "nav-pill", "aria-hidden": "true" });
  if (navWrap) {
    navWrap.prepend(navPill);
    navWrap.classList.add("has-pill");
  }

  const moveNavPill = () => {
    if (!navWrap || !navPill) return;
    if (window.innerWidth <= 1040) {
      navPill.style.opacity = "0";
      return;
    }
    const activeLink = navWrap.querySelector("a.is-active");
    if (!activeLink || !activeLink.offsetWidth) {
      navPill.style.opacity = "0";
      return;
    }
    navPill.style.width = activeLink.offsetWidth + "px";
    navPill.style.height = activeLink.offsetHeight + "px";
    navPill.style.transform = `translate3d(${activeLink.offsetLeft}px, ${activeLink.offsetTop}px, 0)`;
    navPill.style.opacity = "1";
  };

  if (navWrap && "MutationObserver" in window) {
    const navObs = new MutationObserver(() => requestAnimationFrame(moveNavPill));
    navObs.observe(navWrap, { subtree: true, attributes: true, attributeFilter: ["class"] });
  }
  window.addEventListener("resize", () => requestAnimationFrame(moveNavPill));

  const variedTargets = [
    { sel: ".komponen > div", mode: "left" },
    { sel: ".ak-table-wrap", mode: "right" },
    { sel: ".prop-row", mode: "up" },
    { sel: ".steps li", mode: "pop" },
    { sel: ".jump", mode: "up" },
    { sel: ".jump-common", mode: "pop" },
    { sel: ".faq-item", mode: "up" },
    { sel: ".cs-info-card", mode: "left" },
    { sel: ".cs-form", mode: "right" },
    { sel: ".calc-form fieldset", mode: "left" },
    { sel: ".calc-result", mode: "right" },
    { sel: ".bup-card", mode: "right" },
    { sel: ".kal-stat", mode: "pop" },
    { sel: ".kal-board", mode: "left" },
    { sel: ".kal-agenda", mode: "right" },
    { sel: ".kal-upcoming", mode: "right" }
  ];

  const multiObserver = ("IntersectionObserver" in window && !reduceMotion)
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            multiObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -32px 0px" })
    : null;

  const applyVariedScrollAnim = (root = document) => {
    variedTargets.forEach(({ sel, mode }) => {
      $$(sel, root).forEach((node, idx) => {
        const chosenMode = mode === "up" && idx % 3 === 1 ? "pop" : mode;
        node.setAttribute("data-scroll-anim", chosenMode);
        node.style.setProperty("--sd", `${Math.min(idx % 6, 5) * 60}ms`);

        const r = node.getBoundingClientRect();
        const visibleNow = !node.closest("[hidden]") && r.top < window.innerHeight * 0.96 && r.bottom > 0;
        if (visibleNow || !multiObserver) {
          node.classList.add("is-revealed");
        } else if (!node.classList.contains("is-revealed")) {
          multiObserver.observe(node);
        }
      });
    });
  };

  applyVariedScrollAnim(document);
  requestAnimationFrame(moveNavPill);

  if ("MutationObserver" in window && document.querySelector("main")) {
    const viewObs = new MutationObserver(() => {
      requestAnimationFrame(() => {
        applyVariedScrollAnim(document);
        moveNavPill();
      });
    });
    viewObs.observe(document.querySelector("main"), { subtree: true, attributes: true, attributeFilter: ["hidden"] });
  }

  if (!reduceMotion) {
    document.addEventListener("pointermove", (e) => {
      const glassCard = e.target.closest(".glass");
      $$(".glass").forEach((g) => {
        if (g === glassCard) {
          const r = g.getBoundingClientRect();
          g.style.setProperty("--gx", `${e.clientX - r.left}px`);
          g.style.setProperty("--gy", `${e.clientY - r.top}px`);
          g.style.setProperty("--glare-op", "1");
        } else {
          g.style.setProperty("--glare-op", "0");
        }
      });
    }, { passive: true });
  }

  const backTopBtn = el(
    "button",
    {
      type: "button",
      class: "back-top-btn",
      "aria-label": "Kembali ke atas",
      title: "Kembali ke atas"
    },
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>'
  );
  document.body.appendChild(backTopBtn);

  const toggleBackTop = () => {
    backTopBtn.classList.toggle("is-visible", window.scrollY > 320);
  };
  window.addEventListener("scroll", toggleBackTop, { passive: true });
  backTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  toggleBackTop();

  const animateNumberText = (node, targetVal, decimals = 0, duration = 380) => {
    if (!node || reduceMotion) return;
    const startVal = parseFloat(String(node.dataset.numVal ?? node.textContent).replace(/\./g, "").replace(",", ".")) || 0;
    node.dataset.numVal = String(targetVal);
    if (Math.abs(targetVal - startVal) < 0.01) {
      node.textContent = fmt(targetVal, decimals);
      return;
    }
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = startVal + (targetVal - startVal) * eased;
      node.textContent = fmt(decimals === 0 ? Math.round(cur) : cur, decimals);
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = fmt(targetVal, decimals);
    };
    requestAnimationFrame(step);
  };

  const pubTotalEl = $("#pubTotalAk");
  if (pubTotalEl) {
    pubTotalEl.dataset.numVal = String(pubList.reduce((acc, item) => acc + item.ak, 0));
    const pubObs = new MutationObserver(() => {
      const total = pubList.reduce((acc, item) => acc + item.ak, 0);
      if (Number(pubTotalEl.dataset.numVal) !== total) {
        animateNumberText(pubTotalEl, total, 2, 420);
      }
    });
    pubObs.observe(pubTotalEl, { childList: true });
  }
})();