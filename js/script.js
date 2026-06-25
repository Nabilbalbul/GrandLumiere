/* =========================================================
   GRAND LUMIÈRE CINEMA — script.js
   Dipakai bersama oleh index.html, detail.html, booking.html
   ========================================================= */

/* ===================== DATA FILM (FIKTIF) ===================== */
const FILMS = [
  {
    id:'velvet-noir',
    title:'Velvet Noir',
    genre:'Drama Misteri',
    rating:'17+',
    runtime:'2j 08m',
    tags:['Drama','Misteri','Tahun 1962'],
    synopsis:'Di sebuah teater tua Paris, seorang detektif pensiunan dipanggil kembali untuk memecahkan kasus yang telah ia tutup tiga dekade lalu — kasus yang ternyata belum pernah benar-benar selesai.',
    cast:['R. Dubois','M. Lefevre','A. Norwood'],
    showtimes:['13:30','16:15','19:00','21:45'],
    price:65000
  },
  {
    id:'golden-hour-waltz',
    title:'Golden Hour Waltz',
    genre:'Romansa Musikal',
    rating:'13+',
    runtime:'1j 54m',
    tags:['Musikal','Romansa','Tahun 1958'],
    synopsis:'Seorang pianis muda dan penari balet bertemu di sebuah aula dansa yang akan dirobohkan minggu depan, dan menghabiskan satu malam terakhir menciptakan lagu yang belum pernah ditulis siapapun.',
    cast:['C. Hartley','E. Moreau','J. Lindqvist'],
    showtimes:['14:00','17:30','20:15'],
    price:70000
  },
  {
    id:'the-last-reel',
    title:'The Last Reel',
    genre:'Petualangan Epik',
    rating:'13+',
    runtime:'2j 31m',
    tags:['Petualangan','Epik','Tahun 1947'],
    synopsis:'Seorang proyeksionis muda menemukan gulungan film terlarang di ruang bawah tanah bioskop, dan harus memutuskan apakah akan memutarnya untuk seluruh kota — meski itu berarti membuka rahasia yang dikubur pemiliknya.',
    cast:['T. Okafor','V. Castellano','S. Petrov'],
    showtimes:['12:45','15:30','18:45','22:00'],
    price:75000
  },
  {
    id:'midnight-marquee',
    title:'Midnight Marquee',
    genre:'Thriller Klasik',
    rating:'17+',
    runtime:'1j 47m',
    tags:['Thriller','Klasik','Tahun 1965'],
    synopsis:'Setiap malam pukul dua belas, lampu marquee sebuah bioskop tua menyala sendiri. Seorang jurnalis muda menyelidikinya — dan menemukan bahwa pertunjukan tengah malam itu memutar lebih dari sekadar film.',
    cast:['N. Albright','D. Saito','F. Marchetti'],
    showtimes:['15:00','18:00','21:30'],
    price:68000
  }
];

const ROWS = ['A','B','C','D','E'];
const SEATS_PER_ROW = 8;

/* ===================== HELPERS PENYIMPANAN ANTAR HALAMAN ===================== */
function saveSelection(data){
  sessionStorage.setItem('glc_selection', JSON.stringify(data));
}
function loadSelection(){
  try{
    return JSON.parse(sessionStorage.getItem('glc_selection')) || {};
  }catch(e){
    return {};
  }
}
function getFilmById(id){
  return FILMS.find(f => f.id === id);
}
function getQueryParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

/* ===================== POSTER ARTISTIK (CSS, tanpa gambar luar) ===================== */
function renderPosterArt(film, extraClass){
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

function getAllTickets(){
  try{
    return JSON.parse(localStorage.getItem(TICKETS_KEY)) || [];
  }catch(e){
    return [];
  }
}

function saveAllTickets(tickets){
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

function getTicketById(ticketId){
  return getAllTickets().find(t => t.id === ticketId) || null;
}

// Kursi yang sudah "terisi" di studio, gabungan dari seed dasar + semua tiket
// yang sudah tersimpan untuk film & jadwal yang sama (kecuali tiket yang
// sedang diedit, supaya kursinya bisa dipilih ulang).
function getOccupiedSeats(filmId, showtime, excludeTicketId){
  const seed = filmId ? filmId.length * 7 : 3;
  const base = [];
  ROWS.forEach((r, ri) => {
    for(let i = 1; i <= SEATS_PER_ROW; i++){
      if((ri * SEATS_PER_ROW + i + seed) % 5 === 0){
        base.push(r + i);
      }
    }
  });

  const fromTickets = getAllTickets()
    .filter(t => t.filmId === filmId && t.showtime === showtime && t.id !== excludeTicketId)
    .flatMap(t => t.seats);

  return Array.from(new Set([...base, ...fromTickets]));
}
