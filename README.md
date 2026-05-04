# Astana Hajj & Umroh Travel - Backend Integration

Proyek ini adalah versi *upgrade* dari frontend murni HTML/CSS/JS yang sebelumnya menggunakan `localStorage` menjadi menggunakan **Node.js + Express** dan **SQLite** sebagai backend database persisten. Seluruh tampilan dan fungsionalitas dipertahankan 100% sama, dengan penyimpanan data yang lebih aman dan siap *deploy*.

## Persyaratan (Prerequisites)
Sebelum menjalankan atau mem-*publish* project ini, pastikan sistem Anda telah memiliki:
1. [Node.js](https://nodejs.org/en/download/) (Versi 16 atau lebih baru)
2. NPM (Node Package Manager - bawaan saat instalasi Node.js)

## Struktur Direktori Baru
- `backend/server.js` - Server Express API.
- `backend/db.js` - Koneksi ke SQLite database.
- `backend/init.js` - Script untuk membuat tabel dan data awal (Admin & Paket).
- `.env` - Konfigurasi port.
- `package.json` - Daftar dependency Node.js.

## Cara Menjalankan Secara Lokal (Development)

1. **Buka Terminal/Command Prompt** di dalam folder project ini (di mana file `package.json` berada).
2. **Install Dependensi**
   Jalankan perintah berikut untuk mengunduh library yang dibutuhkan (Express, SQLite3, CORS, Dotenv):
   ```bash
   npm install
   ```
3. **Inisialisasi Database**
   Buat tabel database dan masukkan data default (Admin login & data Paket awal) dengan menjalankan:
   ```bash
   npm run init-db
   ```
   *Anda akan melihat file `database.sqlite` terbuat di dalam folder `backend/`.*
4. **Jalankan Server Backend**
   ```bash
   npm start
   ```
   *Server akan berjalan di http://localhost:3000.*
5. **Akses Website**
   Anda sekarang dapat membuka file `index.html` langsung di browser Anda, atau menggunakan *Live Server* / web server lokal (seperti XAMPP, Nginx). Aplikasi akan otomatis berkomunikasi dengan API di port `3000`.

## Kredensial Admin Default
- **Username:** `faris`
- **Password:** `farisganteng123`

## Cara Melakukan Deployment (Publishing)

Untuk mem-*publish* website ini secara live ke internet, Anda tidak bisa lagi hanya menggunakan hosting static (seperti GitHub Pages atau Vercel statis), karena sekarang project ini membutuhkan server Node.js.

### Opsi 1: Menggunakan VPS (Virtual Private Server) / VM (Disarankan)
Contoh: Niagahoster VPS, DigitalOcean, AWS EC2, atau Hostinger VPS.
1. Upload semua file project ke dalam VPS (via FTP atau Git Clone).
2. Install Node.js di dalam VPS.
3. Jalankan `npm install` dan `npm run init-db`.
4. Install `pm2` untuk menjaga server tetap hidup:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "astana-backend"
   ```
5. Konfigurasi **Nginx** sebagai *Reverse Proxy* untuk meneruskan trafik dari IP public / Domain (port 80/443) ke port `3000` internal.
6. Letakkan file frontend (`*.html`, `*.css`, `script.js`) di folder public Nginx dan ubah URL API dari `http://localhost:3000` di dalam `script.js` & `admin.html` menjadi domain API Anda (misal: `https://api.domainanda.com`).

### Opsi 2: Menggunakan Platform as a Service (PaaS)
Contoh: **Render.com**, **Railway.app**, atau **Heroku**
1. Buat repository di GitHub berisi seluruh project ini.
2. Di Render / Railway, buat *New Web Service* dan hubungkan ke repository Anda.
3. Atur *Build Command* menjadi `npm install` dan *Start Command* menjadi `npm start`.
4. **CATATAN PENTING**: SQLite menyimpan data dalam bentuk *file* lokal (`database.sqlite`). Pada layanan PaaS seperti Render/Heroku, sistem file bersifat *ephemeral* (hilang saat restart). 
   - **Solusi**: Pastikan Anda menautkan *Persistent Disk / Volume* ke folder `backend` agar file database tidak ter-reset, **atau** migrasikan SQLite ke PostgreSQL/MySQL (yang disediakan gratis oleh layanan-layanan tersebut).

---

### Keamanan (Security Notes)
1. Query telah menggunakan metode **Parameterized Queries** melalui SQLite bawaan untuk meminimalisasi risiko serangan *SQL Injection*.
2. Apabila sudah di-deploy ke production, pastikan Anda memperbarui konfigurasi CORS di `backend/server.js` untuk membatasi asal domain (origin) yang dapat melakukan request ke API.
