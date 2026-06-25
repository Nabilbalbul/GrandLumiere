/* =========================================================
   GRAND LUMIÈRE CINEMA — script.js
   Dipakai bersama oleh index.html, detail.html, booking.html
   ========================================================= */

/* ===================== DATA FILM (FIKTIF) ===================== */
const FILMS = [
  {
    id: 'velvet-noir',
    title: 'Velvet Noir',
    genre: 'Drama Misteri',
    rating: '17+',
    runtime: '2j 08m',
    tags: ['Drama', 'Misteri', 'Tahun 1962'],
    synopsis: 'Di sebuah teater tua Paris, seorang detektif pensiunan dipanggil kembali untuk memecahkan kasus yang telah ia tutup tiga dekade lalu — kasus yang ternyata belum pernah benar-benar selesai.',
    cast: ['R. Dubois', 'M. Lefevre', 'A. Norwood'],
    showtimes: ['13:30', '16:15', '19:00', '21:45'],
    price: 65000
  },
  {
    id: 'golden-hour-waltz',
    title: 'Golden Hour Waltz',
    genre: 'Romansa Musikal',
    rating: '13+',
    runtime: '1j 54m',
    tags: ['Musikal', 'Romansa', 'Tahun 1958'],
    synopsis: 'Seorang pianis muda dan penari balet bertemu di sebuah aula dansa yang akan dirobohkan minggu depan, dan menghabiskan satu malam terakhir menciptakan lagu yang belum pernah ditulis siapapun.',
    cast: ['C. Hartley', 'E. Moreau', 'J. Lindqvist'],
    showtimes: ['14:00', '17:30', '20:15'],
    price: 70000
  },
  {
    id: 'the-last-reel',
    title: 'The Last Reel',
    genre: 'Petualangan Epik',
    rating: '13+',
    runtime: '2j 31m',
    tags: ['Petualangan', 'Epik', 'Tahun 1947'],
    synopsis: 'Seorang proyeksionis muda menemukan gulungan film terlarang di ruang bawah tanah bioskop, dan harus memutuskan apakah akan memutarnya untuk seluruh kota — meski itu berarti membuka rahasia yang dikubur pemiliknya.',
    cast: ['T. Okafor', 'V. Castellano', 'S. Petrov'],
    showtimes: ['12:45', '15:30', '18:45', '22:00'],
    price: 75000
  },
  {
    id: 'midnight-marquee',
    title: 'Midnight Marquee',
    genre: 'Thriller Klasik',
    rating: '17+',
    runtime: '1j 47m',
    tags: ['Thriller', 'Klasik', 'Tahun 1965'],
    synopsis: 'Setiap malam pukul dua belas, lampu marquee sebuah bioskop tua menyala sendiri. Seorang jurnalis muda menyelidikinya — dan menemukan bahwa pertunjukan tengah malam itu memutar lebih dari sekadar film.',
    cast: ['N. Albright', 'D. Saito', 'F. Marchetti'],
    showtimes: ['15:00', '18:00', '21:30'],
    price: 68000
  }
];

const ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEATS_PER_ROW = 8;

/* ===================== HELPERS PENYIMPANAN ANTAR HALAMAN ===================== */
function saveSelection(data) {
  sessionStorage.setItem('glc_selection', JSON.stringify(data));
}
function loadSelection() {
  try {
    return JSON.parse(sessionStorage.getItem('glc_selection')) || {};
  } catch (e) {
    return {};
  }
}
function getFilmById(id) {
  return FILMS.find(f => f.id === id);
}
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ===================== POSTER ARTISTIK (CSS, tanpa gambar luar) ===================== */
function renderPosterArt(film, extraClass) {
  return `
    <div class="poster-art poster-${film.id} ${extraClass || ''}">
      <div class="art-bg"></div>
      <div class="art-motif"></div>
      <div class="art-vignette"></div>
      <div class="art-title">${film.title}<span class="sub">${film.genre}</span></div>
    </div>
  `;
}

/* ===================== RIWAYAT TIKET (localStorage, permanen) ===================== */
const TICKETS_KEY = 'glc_tickets';

function getAllTickets() {
  try {
    return JSON.parse(localStorage.getItem(TICKETS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveAllTickets(tickets) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

function getTicketById(ticketId) {
  return getAllTickets().find(t => t.id === ticketId) || null;
}

// Kursi yang sudah "terisi" di studio, gabungan dari seed dasar + semua tiket
// yang sudah tersimpan untuk film & jadwal yang sama (kecuali tiket yang
// sedang diedit, supaya kursinya bisa dipilih ulang).
function getOccupiedSeats(filmId, showtime, excludeTicketId) {
  const seed = filmId ? filmId.length * 7 : 3;
  const base = [];
  ROWS.forEach((r, ri) => {
    for (let i = 1; i <= SEATS_PER_ROW; i++) {
      if ((ri * SEATS_PER_ROW + i + seed) % 5 === 0) {
        base.push(r + i);
      }
    }
  });

  const fromTickets = getAllTickets()
    .filter(t => t.filmId === filmId && t.showtime === showtime && t.id !== excludeTicketId)
    .flatMap(t => t.seats);

  return Array.from(new Set([...base, ...fromTickets]));
}

function addTicket(ticket) {
  const tickets = getAllTickets();
  tickets.unshift(ticket);
  saveAllTickets(tickets);
}

function updateTicket(ticketId, newData) {
  const tickets = getAllTickets().map(t => t.id === ticketId ? { ...t, ...newData } : t);
  saveAllTickets(tickets);
}

function deleteTicket(ticketId) {
  const tickets = getAllTickets().filter(t => t.id !== ticketId);
  saveAllTickets(tickets);
}

function generateTicketId() {
  return 'GLC-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);
}

function formatTicketDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/* ===================== CURTAIN INTRO (semua halaman) ===================== */
function initCurtain() {
  const wrap = document.getElementById('curtainWrap');
  if (!wrap) return;
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      wrap.classList.add('open');
      setTimeout(() => wrap.classList.add('hidden'), 1800);
    }, 400);
  });
}

/* ===================== INDEX.HTML — DAFTAR FILM ===================== */
function renderFilmGrid() {
  const grid = document.getElementById('filmGrid');
  if (!grid) return;
  grid.innerHTML = FILMS.map(f => `
    <a class="film-card" href="detail.html?film=${f.id}">
      <div class="poster-frame">
        ${renderPosterArt(f)}
        <div class="poster-spotlight"></div>
        <div class="poster-genre-tag">${f.genre.split(' ')[0]}</div>
        <div class="poster-rating">${f.rating}</div>
        <div class="poster-overlay-info"><div class="runtime">${f.runtime}</div></div>
      </div>
      <div class="film-meta">
        <h3>${f.title}</h3>
        <div class="genre-line">${f.genre}</div>
      </div>
    </a>
  `).join('');
}

function scrollToShowing() {
  const target = document.getElementById('now-showing-section');
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}

/* ===================== UPDATE BADGE JUMLAH RIWAYAT DI NAVBAR ===================== */
function updateHistoryBadge() {
  const badge = document.getElementById('historyBadge');
  if (!badge) return;
  const count = getAllTickets().length;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

/* ===================== DETAIL.HTML — DETAIL FILM ===================== */
let currentFilm = null;
let currentShowtime = null;

function initDetailPage() {
  const filmId = getQueryParam('film');
  currentFilm = getFilmById(filmId) || FILMS[0];

  document.getElementById('detailPoster').innerHTML = renderPosterArt(currentFilm) + '<div class="art-frame-line"></div>';
  document.getElementById('detailGenre').textContent = currentFilm.genre;
  document.getElementById('detailTitle').textContent = currentFilm.title;
  document.getElementById('detailSynopsis').textContent = currentFilm.synopsis;
  document.title = currentFilm.title + ' — Grand Lumière Cinema';

  document.getElementById('detailTags').innerHTML = currentFilm.tags
    .map(t => `<span class="tag-pill">${t}</span>`).join('') +
    `<span class="tag-pill">${currentFilm.runtime}</span><span class="tag-pill">${currentFilm.rating}</span>`;

  document.getElementById('showtimeGrid').innerHTML = currentFilm.showtimes.map(t => `
    <button class="showtime-btn" onclick="selectShowtime('${t}', this)" type="button">
      ${t} <small>STUDIO 1</small>
    </button>
  `).join('');

  document.getElementById('castRow').innerHTML = currentFilm.cast.map(c => `
    <div class="cast-chip">
      <div class="cast-avatar">${c.charAt(0)}</div>
      <span>${c}</span>
    </div>
  `).join('');
}

function selectShowtime(time, el) {
  currentShowtime = time;
  document.querySelectorAll('.showtime-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');

  const cta = document.getElementById('continueBtn');
  if (cta) cta.classList.remove('disabled');
}

function goToBooking() {
  if (!currentShowtime) {
    alert('Silakan pilih jadwal tayang terlebih dahulu.');
    return;
  }
  saveSelection({ filmId: currentFilm.id, showtime: currentShowtime, editTicketId: null });
  window.location.href = 'booking.html';
}

/* ===================== BOOKING.HTML — PILIH KURSI & PESAN ===================== */
let selectedSeats = [];
let occupiedSeats = [];
let editingTicketId = null; // null = buat tiket baru, terisi = sedang mengedit tiket ini

function initBookingPage() {
  const sel = loadSelection();
  editingTicketId = sel.editTicketId || null;

  if (editingTicketId) {
    // MODE EDIT: muat data dari tiket yang tersimpan
    const ticket = getTicketById(editingTicketId);
    if (!ticket) {
      alert('Tiket tidak ditemukan. Mungkin sudah dihapus.');
      window.location.href = 'history.html';
      return;
    }
    currentFilm = getFilmById(ticket.filmId) || FILMS[0];
    currentShowtime = ticket.showtime;
    selectedSeats = [...ticket.seats];

    document.getElementById('bookingTitle').textContent = currentFilm.title + ' (Mengedit Tiket)';
    document.getElementById('buyerName').value = ticket.buyerName || '';
    document.getElementById('buyerPhone').value = ticket.buyerPhone || '';

    const cetakBtn = document.getElementById('issueBtnLabel');
    if (cetakBtn) cetakBtn.textContent = 'Simpan Perubahan';
  } else {
    // MODE BARU
    currentFilm = getFilmById(sel.filmId) || FILMS[0];
    currentShowtime = sel.showtime || currentFilm.showtimes[0];
    selectedSeats = [];

    document.getElementById('bookingTitle').textContent = currentFilm.title;
  }

  document.getElementById('bookingShowtime').textContent = 'JADWAL ' + currentShowtime + ' · ' + currentFilm.genre.toUpperCase();
  document.title = (editingTicketId ? 'Edit Tiket — ' : 'Pesan Tiket — ') + currentFilm.title;

  renderShowtimeSwitcher();
  renderSeatMap();
  updateTotal();
}

function renderShowtimeSwitcher() {
  const wrap = document.getElementById('bookingShowtimeSwitch');
  if (!wrap) return;
  wrap.innerHTML = currentFilm.showtimes.map(t => `
    <button type="button" class="showtime-btn ${t === currentShowtime ? 'selected' : ''}" onclick="switchShowtime('${t}', this)">
      ${t} <small>STUDIO 1</small>
    </button>
  `).join('');
}

function switchShowtime(time, el) {
  currentShowtime = time;
  document.getElementById('bookingShowtime').textContent = 'JADWAL ' + currentShowtime + ' · ' + currentFilm.genre.toUpperCase();
  document.querySelectorAll('#bookingShowtimeSwitch .showtime-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  // Saat ganti jadwal, kursi yang dipilih sebelumnya tidak relevan lagi di studio ini
  selectedSeats = [];
  renderSeatMap();
  updateTotal();
}

function renderSeatMap() {
  occupiedSeats = getOccupiedSeats(currentFilm.id, currentShowtime, editingTicketId);
  const map = document.getElementById('seatMap');
  map.innerHTML = ROWS.map(r => `
    <div class="seat-row">
      <span class="row-label">${r}</span>
      ${Array.from({ length: SEATS_PER_ROW }, (_, i) => {
    const code = r + (i + 1);
    const isTaken = occupiedSeats.includes(code);
    const isSelected = selectedSeats.includes(code);
    const cls = isTaken ? 'taken' : (isSelected ? 'selected' : '');
    return `<div class="seat ${cls}" data-seat="${code}" onclick="${isTaken ? '' : `toggleSeat('${code}', this)`}"></div>`;
  }).join('')}
      <span class="row-label">${r}</span>
    </div>
  `).join('');
}

function toggleSeat(code, el) {
  if (selectedSeats.includes(code)) {
    selectedSeats = selectedSeats.filter(s => s !== code);
    el.classList.remove('selected');
  } else {
    selectedSeats.push(code);
    el.classList.add('selected');
  }
  updateTotal();
}

function updateTotal() {
  const total = selectedSeats.length * (currentFilm ? currentFilm.price : 0);
  document.getElementById('totalPrice').textContent = 'Rp ' + total.toLocaleString('id-ID');
}

function issueTicket() {
  const name = document.getElementById('buyerName').value.trim();
  const phone = document.getElementById('buyerPhone').value.trim();

  if (!name) {
    alert('Mohon isi nama lengkap Anda.');
    return;
  }
  if (selectedSeats.length === 0) {
    alert('Silakan pilih minimal satu kursi.');
    return;
  }

  const total = selectedSeats.length * currentFilm.price;
  const sortedSeats = [...selectedSeats].sort();

  if (editingTicketId) {
    updateTicket(editingTicketId, {
      showtime: currentShowtime,
      seats: sortedSeats,
      buyerName: name,
      buyerPhone: phone,
      total: total,
      updatedAt: new Date().toISOString()
    });
    showTicketModal({
      movieTitle: currentFilm.title,
      buyerName: name,
      showtime: currentShowtime,
      seats: sortedSeats,
      total: total
    }, true);
  } else {
    const ticket = {
      id: generateTicketId(),
      filmId: currentFilm.id,
      movieTitle: currentFilm.title,
      showtime: currentShowtime,
      seats: sortedSeats,
      buyerName: name,
      buyerPhone: phone,
      total: total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addTicket(ticket);
    showTicketModal(ticket, false);
  }
}

function showTicketModal(data, wasEdited) {
  document.getElementById('ticketMovie').textContent = data.movieTitle;
  document.getElementById('ticketName').textContent = data.buyerName;
  document.getElementById('ticketTime').textContent = data.showtime + ' · Hari Ini';
  document.getElementById('ticketSeats').textContent = data.seats.join(', ');
  document.getElementById('ticketTotal').textContent = 'Rp ' + data.total.toLocaleString('id-ID');

  const noteEl = document.getElementById('ticketNote');
  if (noteEl) noteEl.textContent = wasEdited ? 'Tiket ini telah diperbarui.' : 'Tiket baru berhasil dibuat.';

  document.getElementById('ticketOverlay').classList.add('show');
}

function closeTicket() {
  document.getElementById('ticketOverlay').classList.remove('show');
  // setelah ditutup, arahkan ke riwayat supaya hasilnya langsung terlihat
  window.location.href = 'history.html';
}
