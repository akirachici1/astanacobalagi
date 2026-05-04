const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ADMIN ROUTES ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// --- PACKAGES ROUTES ---
app.get('/api/packages', (req, res) => {
  db.all('SELECT * FROM packages', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const packages = rows.map(r => ({
      ...r,
      fasilitas: r.fasilitas ? JSON.parse(r.fasilitas) : []
    }));
    res.json(packages);
  });
});

app.post('/api/packages', (req, res) => {
  const packages = req.body; // Expects array of packages
  
  db.serialize(() => {
    db.run('DELETE FROM packages');
    const stmt = db.prepare('INSERT INTO packages (id, tanggal, harga, label, fasilitas) VALUES (?, ?, ?, ?, ?)');
    packages.forEach(p => {
      stmt.run(p.id, p.tanggal, p.harga, p.label, JSON.stringify(p.fasilitas || []));
    });
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Packages saved successfully' });
    });
  });
});

// --- INVOICES ROUTES ---
app.get('/api/invoices', (req, res) => {
  db.all('SELECT * FROM invoices', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const invoices = rows.map(r => ({
      ...r,
      jamaah: r.jamaah ? JSON.parse(r.jamaah) : null,
      paket: r.paket ? JSON.parse(r.paket) : null
    }));
    res.json(invoices);
  });
});

app.post('/api/invoices', (req, res) => {
  const inv = req.body;
  
  const stmt = db.prepare(`
    INSERT INTO invoices 
    (invoiceNumber, jamaah, paket, metodePembayaran, keterangan, totalBayar, hargaPenuh, status, tanggalDaftar, nominalTransfer, bankPengirim) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    inv.invoiceNumber,
    JSON.stringify(inv.jamaah || {}),
    JSON.stringify(inv.paket || {}),
    inv.metodePembayaran,
    inv.keterangan,
    inv.totalBayar,
    inv.hargaPenuh,
    inv.status,
    inv.tanggalDaftar,
    inv.nominalTransfer || null,
    inv.bankPengirim || null,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Invoice saved successfully' });
    }
  );
  stmt.finalize();
});

app.put('/api/invoices/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Build dynamic update query
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    if (['jamaah', 'paket'].includes(key)) {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else if (['invoiceNumber'].includes(key)) {
      // skip primary key
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (fields.length === 0) return res.json({ success: true });
  
  values.push(id);
  const query = `UPDATE invoices SET ${fields.join(', ')} WHERE invoiceNumber = ?`;
  
  db.run(query, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Invoice updated successfully' });
  });
});

app.delete('/api/invoices/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM invoices WHERE invoiceNumber = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
