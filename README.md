# Anniversary Interactive Experience

PIN → Mograph "Drop Dead" (kinetic typography) → Ending Experience (falling
stars, floating photos, kata-kata, envelope, long letter).

## Deploy (tanpa install manual di sisi user)

1. Push folder ini ke GitHub.
2. Import repo ke Vercel.
3. Deploy — Vercel otomatis detect Vite dan build (`npm run build` → `dist`).

Tidak butuh Python/PHP/database/Docker. Murni static site hasil build Vite.

## Yang WAJIB lo isi sebelum deploy

Semua ada di satu file: **`src/data/config.js`**

| Apa | Di mana |
|---|---|
| PIN | `ACCESS_PIN` |
| Lirik Mograph (`text` masih kosong `""`) | `lyrics` — cari komentar `// <-- ISI BARIS...` |
| Kata-kata Ending | `endingMessages` |
| Isi surat panjang | `letterContent` |
| 15 foto Mograph | `MOGRAPH_PHOTOS` |
| 10 foto Ending | `ENDING_PHOTOS` |

Taruh foto asli di `public/images/` — lihat `public/images/README.txt` untuk
nama file yang diharapkan.

## Audio

- `public/audio/drop-dead.mp3` — sudah terisi (dari file yang lo upload,
  sudah dicek: MP3 asli 128kbps/44.1kHz, durasi 33.3 detik, bukan DASH
  stream palsu).
- `public/audio/anniversary.mp3` — **belum ada**, tinggal lo taruh file
  audio ending di sini dengan nama persis itu.

Audio dikontrol dari satu tempat (`src/hooks/useAudioController.js`) supaya
drop-dead.mp3 dan anniversary.mp3 nggak akan pernah overlap — begitu Mograph
selesai, audio 1 stop dulu baru audio 2 mulai.

## Local dev (opsional, kalau mau preview sebelum push)

```
npm install
npm run dev
```

Tidak wajib — Vercel akan build otomatis sendiri saat import repo.
