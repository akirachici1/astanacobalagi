const db = require('./db');

const initDB = () => {
  db.serialize(() => {
    // 1. Create Admins Table
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // 2. Create Packages Table
    db.run(`
      CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY,
        tanggal TEXT,
        harga INTEGER,
        label TEXT,
        fasilitas TEXT
      )
    `);

    // 3. Create Invoices Table
    db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        invoiceNumber TEXT PRIMARY KEY,
        jamaah TEXT,
        paket TEXT,
        metodePembayaran TEXT,
        keterangan TEXT,
        totalBayar INTEGER,
        hargaPenuh INTEGER,
        status TEXT,
        tanggalDaftar TEXT,
        nominalTransfer TEXT,
        bankPengirim TEXT
      )
    `);

    // Seed default admin
    db.get('SELECT * FROM admins WHERE username = ?', ['faris'], (err, row) => {
      if (!row) {
        db.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['faris', 'farisganteng123']);
        console.log('Inserted default admin: faris');
      }
    });

    // Seed default packages
    db.get('SELECT count(*) as count FROM packages', (err, row) => {
      if (row && row.count === 0) {
        const defaultPackages = [
          { id: 'PKT01', tanggal: '01 Juli 2026', harga: 28500000, label: 'Paket 01', fasilitas: '["Tiket Pesawat PP Jakarta–Jeddah", "Hotel Bintang 4 Makkah (5 malam)", "Hotel Bintang 4 Madinah (4 malam)", "Pembimbing & Muthawif Berpengalaman", "Visa Umroh Resmi", "Perlengkapan Jamaah Lengkap", "Asuransi Perjalanan"]' },
          { id: 'PKT02', tanggal: '15 Juli 2026', harga: 29500000, label: 'Populer', fasilitas: '["Tiket Pesawat PP Jakarta–Jeddah", "Hotel Bintang 4 Makkah (5 malam)", "Hotel Bintang 4 Madinah (4 malam)", "Pembimbing & Muthawif Berpengalaman", "Visa Umroh Resmi", "Perlengkapan + City Tour Jeddah", "Asuransi Perjalanan"]' },
          { id: 'PKT03', tanggal: '01 Agustus 2026', harga: 31500000, label: 'Paket 03', fasilitas: '["Tiket Pesawat PP Jakarta–Jeddah", "Hotel Bintang 4 Makkah (6 malam)", "Hotel Bintang 4 Madinah (4 malam)", "Pembimbing & Muthawif Berpengalaman", "Visa Umroh Resmi", "Perlengkapan + Ziarah Makkah", "Asuransi Perjalanan"]' },
          { id: 'PKT04', tanggal: '05 September 2026', harga: 34500000, label: 'Eksklusif', fasilitas: '["Tiket Pesawat PP Jakarta–Jeddah", "Hotel Bintang 5 Makkah (6 malam)", "Hotel Bintang 5 Madinah (5 malam)", "Pembimbing & Muthawif Senior", "Visa Umroh Resmi", "Paket Eksklusif Full Service", "Asuransi Perjalanan Premium"]' }
        ];

        const stmt = db.prepare('INSERT INTO packages (id, tanggal, harga, label, fasilitas) VALUES (?, ?, ?, ?, ?)');
        defaultPackages.forEach(p => {
          stmt.run(p.id, p.tanggal, p.harga, p.label, p.fasilitas);
        });
        stmt.finalize();
        console.log('Seeded default packages');
      }
    });

    console.log('Database initialized successfully.');
  });
};

initDB();
