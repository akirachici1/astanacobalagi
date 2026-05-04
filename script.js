/* =============================================
   ASTANA HAJJ & UMROH TRAVEL — script.js
   ============================================= */

'use strict';

/* ══════════════════════════════════════════
   UTILS
══════════════════════════════════════════ */
const formatRupiah = (n) =>
  'Rp ' + Number(n).toLocaleString('id-ID');

const generateInvoiceNumber = () => {
  const now = new Date();
  const pad = (v, l = 2) => String(v).padStart(l, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `AHU-${date}-${rand}`;
};

const LS = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k) => localStorage.removeItem(k),
};

/* ══════════════════════════════════════════
   NAVBAR — hamburger + active link
══════════════════════════════════════════ */
function initNavbar() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.navbar-nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    // Close on link click
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Mark active
  const links = document.querySelectorAll('.navbar-nav a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ══════════════════════════════════════════
   PAKET PAGE — select package
══════════════════════════════════════════ */
function initPaket() {
  const btns = document.querySelectorAll('.btn-pilih-paket');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pkg = {
        id: btn.dataset.id,
        tanggal: btn.dataset.tanggal,
        harga: parseInt(btn.dataset.harga),
        label: btn.dataset.label,
      };
      LS.set('selectedPackage', pkg);
      window.location.href = 'daftar.html';
    });
  });
}

/* ══════════════════════════════════════════
   DAFTAR PAGE — registration form
══════════════════════════════════════════ */
function initDaftar() {
  const pkg = LS.get('selectedPackage');
  const infoEl = document.getElementById('selected-pkg-info');
  const paymentRadios = document.querySelectorAll('input[name="pembayaran"]');
  const summaryEl = document.getElementById('payment-summary');
  const form = document.getElementById('form-daftar');

  if (pkg && infoEl) {
    document.getElementById('pkg-tanggal').textContent = pkg.tanggal;
    document.getElementById('pkg-harga').textContent = formatRupiah(pkg.harga);
    infoEl.style.display = 'flex';
  } else if (infoEl) {
    infoEl.style.display = 'none';
  }

  // Update payment summary on change
  function updateSummary() {
    if (!pkg) return;
    const method = document.querySelector('input[name="pembayaran"]:checked')?.value;
    if (!method || !summaryEl) return;

    const harga = pkg.harga;
    let totalBayar = 0;
    let keterangan = '';
    let rows = '';

    if (method === 'dp') {
      totalBayar = Math.ceil(harga * 0.5);
      keterangan = 'DP 50%';
      rows = `
        <div class="ps-row"><span class="ps-label">Harga Paket</span><span class="ps-value">${formatRupiah(harga)}</span></div>
        <div class="ps-row"><span class="ps-label">DP (50%)</span><span class="ps-value">${formatRupiah(totalBayar)}</span></div>
        <div class="ps-row"><span class="ps-label">Sisa (dibayar kemudian)</span><span class="ps-value">${formatRupiah(harga - totalBayar)}</span></div>
      `;
    } else if (method === 'cicilan') {
      totalBayar = Math.ceil(harga / 3);
      keterangan = 'Cicilan ke-1 dari 3';
      rows = `
        <div class="ps-row"><span class="ps-label">Harga Paket</span><span class="ps-value">${formatRupiah(harga)}</span></div>
        <div class="ps-row"><span class="ps-label">Cicilan 1 (dari 3×)</span><span class="ps-value">${formatRupiah(totalBayar)}</span></div>
        <div class="ps-row"><span class="ps-label">Per cicilan</span><span class="ps-value">${formatRupiah(totalBayar)}</span></div>
      `;
    } else {
      totalBayar = harga;
      keterangan = 'Lunas';
      rows = `
        <div class="ps-row"><span class="ps-label">Harga Paket</span><span class="ps-value">${formatRupiah(harga)}</span></div>
        <div class="ps-row"><span class="ps-label">Metode</span><span class="ps-value">Pelunasan Penuh</span></div>
      `;
    }

    summaryEl.innerHTML = `
      ${rows}
      <div class="ps-row ps-total">
        <span class="ps-label">Yang Harus Dibayar Sekarang</span>
        <strong class="ps-value">${formatRupiah(totalBayar)}</strong>
      </div>
    `;
    summaryEl.classList.add('visible');
  }

  paymentRadios.forEach(r => r.addEventListener('change', updateSummary));

  // Form submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!pkg) {
        alert('Paket belum dipilih. Silakan pilih paket terlebih dahulu.');
        window.location.href = 'paket.html';
        return;
      }

      const method = document.querySelector('input[name="pembayaran"]:checked')?.value;
      if (!method) {
        alert('Pilih metode pembayaran terlebih dahulu.');
        return;
      }

      const harga = pkg.harga;
      let totalBayar, keterangan;

      if (method === 'dp') {
        totalBayar = Math.ceil(harga * 0.5);
        keterangan = 'DP 50%';
      } else if (method === 'cicilan') {
        totalBayar = Math.ceil(harga / 3);
        keterangan = 'Cicilan 3× (Pembayaran ke-1)';
      } else {
        totalBayar = harga;
        keterangan = 'Pelunasan Penuh';
      }

      const invoiceNumber = generateInvoiceNumber();
      const jamaah = {
        nama: document.getElementById('nama').value.trim(),
        ktp: document.getElementById('ktp').value.trim(),
        lahir: document.getElementById('lahir').value,
        alamat: document.getElementById('alamat').value.trim(),
        wa: document.getElementById('wa').value.trim(),
      };

      const invoiceData = {
        invoiceNumber,
        jamaah,
        paket: pkg,
        metodePembayaran: method,
        keterangan,
        totalBayar,
        hargaPenuh: harga,
        status: 'Menunggu Pembayaran',
        tanggalDaftar: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      };

      LS.set('currentInvoice', invoiceData);

      try {
        await fetch('http://localhost:3000/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData)
        });
      } catch (error) {
        console.error('Error saving invoice:', error);
      }

      window.location.href = 'invoice.html';
    });
  }
}

/* ══════════════════════════════════════════
   INVOICE PAGE
══════════════════════════════════════════ */
function initInvoice() {
  const data = LS.get('currentInvoice');
  if (!data) {
    document.getElementById('invoice-content').innerHTML = `
      <div class="alert alert-info" style="margin:40px auto;max-width:500px;justify-content:center;">
        ℹ️ Tidak ada data invoice. Silakan <a href="daftar.html" style="color:var(--blue);font-weight:600;">daftar terlebih dahulu</a>.
      </div>`;
    return;
  }

  const { invoiceNumber, jamaah, paket, keterangan, totalBayar, hargaPenuh, status, tanggalDaftar } = data;

  // Populate
  setText('inv-number', invoiceNumber);
  setText('inv-date', tanggalDaftar);
  setText('inv-status', status);
  setStatus('inv-status', status);

  setText('inv-nama', jamaah.nama);
  setText('inv-ktp', jamaah.ktp);
  setText('inv-lahir', jamaah.lahir ? new Date(jamaah.lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-');
  setText('inv-alamat', jamaah.alamat);
  setText('inv-wa', jamaah.wa);

  setText('inv-pkg-tanggal', paket.tanggal);
  setText('inv-pkg-harga', formatRupiah(hargaPenuh));

  // Totals
  const totalsEl = document.getElementById('inv-totals-body');
  if (totalsEl) {
    let rows = `
      <div class="inv-total-row"><span>Harga Paket</span><strong>${formatRupiah(hargaPenuh)}</strong></div>
      <div class="inv-total-row"><span>Metode Bayar</span><strong>${keterangan}</strong></div>
      <div class="inv-total-row inv-total-main"><span>Total Dibayar Sekarang</span><strong>${formatRupiah(totalBayar)}</strong></div>
    `;
    totalsEl.innerHTML = rows;
  }

  // Print button
  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // Confirm payment
  const confirmBtn = document.getElementById('btn-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      LS.set('confirmInvoiceNumber', invoiceNumber);
      window.location.href = 'konfirmasi.html';
    });
  }

  // Download (print to PDF hint)
  const downloadBtn = document.getElementById('btn-download');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      alert('Gunakan fitur "Print → Save as PDF" di browser Anda untuk menyimpan invoice sebagai file PDF.');
    });
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '-';
}

function setStatus(id, status) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'inv-status';
  if (status === 'Menunggu Pembayaran') el.classList.add('status-pending');
  else if (status === 'Menunggu Verifikasi') el.classList.add('status-waiting');
  else el.classList.add('status-verified');
}

/* ══════════════════════════════════════════
   KONFIRMASI PAGE
══════════════════════════════════════════ */
function initKonfirmasi() {
  const invoiceNumEl = document.getElementById('konfirm-invoice-num');
  const savedNum = LS.get('confirmInvoiceNumber');
  const currentInv = LS.get('currentInvoice');

  if (invoiceNumEl && savedNum) {
    invoiceNumEl.value = savedNum;
  } else if (invoiceNumEl && currentInv) {
    invoiceNumEl.value = currentInv.invoiceNumber;
  }

  // Image preview
  const fileInput = document.getElementById('bukti-transfer');
  const preview = document.getElementById('upload-preview');
  const previewImg = document.getElementById('preview-img');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          previewImg.src = ev.target.result;
          preview.classList.add('visible');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Form submit
  const form = document.getElementById('form-konfirmasi');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const invoiceNum = document.getElementById('konfirm-invoice-num').value.trim();
      const nominal = document.getElementById('nominal-transfer').value.trim();

      if (!invoiceNum || !nominal) {
        alert('Mohon lengkapi semua data.');
        return;
      }

      // Update invoice status
      const inv = LS.get('currentInvoice');
      if (inv && inv.invoiceNumber === invoiceNum) {
        inv.status = 'Menunggu Verifikasi';
        inv.nominalTransfer = nominal;
        LS.set('currentInvoice', inv);

        try {
          await fetch(`http://localhost:3000/api/invoices/${invoiceNum}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Menunggu Verifikasi', nominalTransfer: nominal })
          });
        } catch (error) {
          console.error('Error updating invoice:', error);
        }
      }

      // Show success
      const successEl = document.getElementById('konfirm-success');
      if (successEl) {
        successEl.style.display = 'block';
        form.style.display = 'none';
      }
    });
  }
}

/* ══════════════════════════════════════════
   INIT — detect page and call correct fn
══════════════════════════════════════════ */
async function loadAndRenderFrontPackages() {
  const grid = document.querySelector('.packages-grid');
  if (!grid) return;
  
  const page = location.pathname.split('/').pop();
  const isIndex = page === 'index.html' || page === '';
  const isPaket = page === 'paket.html';
  if (!isIndex && !isPaket) return;

  try {
    const res = await fetch('http://localhost:3000/api/packages');
    if (!res.ok) return;
    const packages = await res.json();
    
    if (packages && packages.length > 0) {
      grid.innerHTML = packages.map((pkg, idx) => {
        const isFeatured = pkg.label && pkg.label.toLowerCase() === 'populer';
        
        let headerContent = '';
        if (pkg.label && pkg.label !== '-' && pkg.label !== `Paket ${pkg.id.replace('PKT', '')}`) {
           headerContent += `<div class="package-badge">${pkg.label}</div>`;
        } else if (isPaket && idx === 0) {
           headerContent += `<div class="package-badge">Paket 01</div>`;
        }
        
        headerContent += `
          <div class="package-date">${pkg.tanggal}</div>
          <div class="package-price">${formatRupiah(pkg.harga)} <span>/orang</span></div>
        `;
        
        const listItems = (pkg.fasilitas || []).map(f => `<li><span class="check-icon">✓</span>${f}</li>`).join('');
        
        let actionBtn = '';
        if (isIndex) {
          const btnClass = isFeatured ? 'btn-primary' : 'btn-navy';
          actionBtn = `<a href="paket.html" class="btn ${btnClass} btn-block">Lihat Detail</a>`;
        } else {
          const btnClass = isFeatured ? 'btn-primary' : 'btn-navy';
          actionBtn = `
            <button class="btn ${btnClass} btn-block btn-pilih-paket"
              data-id="${pkg.id}"
              data-tanggal="${pkg.tanggal}"
              data-harga="${pkg.harga}"
              data-label="${pkg.label || pkg.id} — ${pkg.tanggal}">
              👉 &nbsp;Pilih Paket
            </button>`;
        }

        return `
          <div class="package-card ${isFeatured ? 'featured' : ''}">
            <div class="package-card-header">
              ${headerContent}
            </div>
            <div class="package-card-body">
              <ul class="package-includes">
                ${listItems}
              </ul>
              ${actionBtn}
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (e) {
    console.error('Failed to load packages from API', e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();

  await loadAndRenderFrontPackages();

  const page = location.pathname.split('/').pop();

  if (page === 'paket.html') initPaket();
  else if (page === 'daftar.html') initDaftar();
  else if (page === 'invoice.html') initInvoice();
  else if (page === 'konfirmasi.html') initKonfirmasi();
});

/* ══════════════════════════════════════════
   ADMIN DASHBOARD FUNCTIONS
══════════════════════════════════════════ */

// Storage keys for admin
const ADMIN_STORAGE = {
  INVOICE_HISTORY: 'invoiceHistory',
  ADMIN_PACKAGES: 'adminPackages'
};

// Default packages
const DEFAULT_ADMIN_PACKAGES = [
  { id: 'PKT01', tanggal: '01 Juli 2026', harga: 28500000, label: 'Paket 01', fasilitas: ['Tiket Pesawat PP Jakarta–Jeddah', 'Hotel Bintang 4 Makkah (5 malam)', 'Hotel Bintang 4 Madinah (4 malam)', 'Pembimbing & Muthawif Berpengalaman', 'Visa Umroh Resmi', 'Perlengkapan Jamaah Lengkap', 'Asuransi Perjalanan'] },
  { id: 'PKT02', tanggal: '15 Juli 2026', harga: 29500000, label: 'Populer', fasilitas: ['Tiket Pesawat PP Jakarta–Jeddah', 'Hotel Bintang 4 Makkah (5 malam)', 'Hotel Bintang 4 Madinah (4 malam)', 'Pembimbing & Muthawif Berpengalaman', 'Visa Umroh Resmi', 'Perlengkapan + City Tour Jeddah', 'Asuransi Perjalanan'] },
  { id: 'PKT03', tanggal: '01 Agustus 2026', harga: 31500000, label: 'Paket 03', fasilitas: ['Tiket Pesawat PP Jakarta–Jeddah', 'Hotel Bintang 4 Makkah (6 malam)', 'Hotel Bintang 4 Madinah (4 malam)', 'Pembimbing & Muthawif Berpengalaman', 'Visa Umroh Resmi', 'Perlengkapan + Ziarah Makkah', 'Asuransi Perjalanan'] },
  { id: 'PKT04', tanggal: '05 September 2026', harga: 34500000, label: 'Eksklusif', fasilitas: ['Tiket Pesawat PP Jakarta–Jeddah', 'Hotel Bintang 5 Makkah (6 malam)', 'Hotel Bintang 5 Madinah (5 malam)', 'Pembimbing & Muthawif Senior', 'Visa Umroh Resmi', 'Paket Eksklusif Full Service', 'Asuransi Perjalanan Premium'] }
];

async function adminLoadPackages() {
  try {
    const res = await fetch('http://localhost:3000/api/packages');
    if (res.ok) return await res.json();
  } catch (e) { console.error(e); }
  return [...DEFAULT_ADMIN_PACKAGES];
}

async function adminSavePackages(packages) {
  try {
    await fetch('http://localhost:3000/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packages)
    });
  } catch (e) { console.error(e); }
}

async function adminLoadInvoices() {
  try {
    const res = await fetch('http://localhost:3000/api/invoices');
    if (res.ok) return await res.json();
  } catch (e) { console.error(e); }
  return [];
}

async function adminSaveInvoices(invoices) {
  // Deprecated: updates handled by specific endpoints
}

function adminUpdateCurrentInvoice(invoiceNum, updates) {
  const current = localStorage.getItem('currentInvoice');
  if (current) {
    const currInv = JSON.parse(current);
    if (currInv.invoiceNumber === invoiceNum) {
      Object.assign(currInv, updates);
      localStorage.setItem('currentInvoice', JSON.stringify(currInv));
    }
  }
}

function adminGetStatusClass(status) {
  if (status === 'Menunggu Pembayaran') return 'badge-pending';
  if (status === 'Menunggu Verifikasi') return 'badge-waiting';
  return 'badge-verified';
}

async function adminRenderDashboard() {
  const invoices = await adminLoadInvoices();
  const total = invoices.length;
  const pending = invoices.filter(i => i.status === 'Menunggu Pembayaran').length;
  const waiting = invoices.filter(i => i.status === 'Menunggu Verifikasi').length;
  const verified = invoices.filter(i => i.status === 'Terverifikasi').length;
  
  const totalEl = document.getElementById('totalPendaftaran');
  const pendingEl = document.getElementById('pendingPayment');
  const waitingEl = document.getElementById('waitingVerify');
  const verifiedEl = document.getElementById('verifiedCount');
  
  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (waitingEl) waitingEl.textContent = waiting;
  if (verifiedEl) verifiedEl.textContent = verified;
  
  const recent = [...invoices].reverse().slice(0, 5);
  const tbody = document.getElementById('recentRegistrations');
  if (tbody) {
    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada data</td></tr>';
      return;
    }
    tbody.innerHTML = recent.map(inv => `
      <tr>
        <td>${inv.invoiceNumber}</td>
        <td>${inv.jamaah?.nama || '-'}</td>
        <td>${inv.paket?.tanggal || '-'}</td>
        <td><span class="badge-status ${adminGetStatusClass(inv.status)}">${inv.status}</span></td>
        <td>${inv.tanggalDaftar || '-'}</td>
      </tr>
    `).join('');
  }
}

async function adminRenderPendaftaran() {
  const invoices = await adminLoadInvoices();
  const tbody = document.getElementById('pendaftaranTableBody');
  if (tbody) {
    if (invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Belum ada data pendaftaran</td></tr>';
      return;
    }
    tbody.innerHTML = invoices.map(inv => `
      <tr>
        <td>${inv.invoiceNumber}</td>
        <td>${inv.jamaah?.nama || '-'}</td>
        <td>${inv.jamaah?.wa || '-'}</td>
        <td>${inv.paket?.tanggal || '-'}</td>
        <td><span class="badge-status ${adminGetStatusClass(inv.status)}">${inv.status}</span></td>
        <td>
          <button class="action-btn action-view" onclick="adminViewDetail('${inv.invoiceNumber}')">Detail</button>
          <button class="action-btn action-delete" onclick="adminDeleteRegistration('${inv.invoiceNumber}')">Hapus</button>
        </td>
      </tr>
    `).join('');
  }
}

async function adminRenderPaket() {
  const packages = await adminLoadPackages();
  const tbody = document.getElementById('paketTableBody');
  if (tbody) {
    if (packages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada paket</td></tr>';
      return;
    }
    tbody.innerHTML = packages.map(pkg => `
      <tr>
        <td>${pkg.id}</td>
        <td>${pkg.tanggal}</td>
        <td>Rp ${pkg.harga.toLocaleString('id-ID')}</td>
        <td>${pkg.label || '-'}</td>
        <td>
          <button class="action-btn action-edit" onclick="adminEditPaket('${pkg.id}')">Edit</button>
          <button class="action-btn action-delete" onclick="adminDeletePaket('${pkg.id}')">Hapus</button>
        </td>
      </tr>
    `).join('');
  }
}

async function adminRenderKonfirmasi() {
  const invoices = await adminLoadInvoices();
  const pendingConfirm = invoices.filter(i => i.status === 'Menunggu Verifikasi' || (i.nominalTransfer && i.status !== 'Terverifikasi'));
  const tbody = document.getElementById('konfirmasiTableBody');
  if (tbody) {
    if (pendingConfirm.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Tidak ada konfirmasi pembayaran</td></tr>';
      return;
    }
    tbody.innerHTML = pendingConfirm.map(inv => `
      <tr>
        <td>${inv.invoiceNumber}</td>
        <td>${inv.jamaah?.nama || '-'}</td>
        <td>${inv.nominalTransfer ? 'Rp ' + Number(inv.nominalTransfer).toLocaleString('id-ID') : '-'}</td>
        <td>${inv.bankPengirim || '-'}</td>
        <td><span class="badge-status ${adminGetStatusClass(inv.status)}">${inv.status}</span></td>
        <td>
          <button class="action-btn action-view" onclick="adminViewDetail('${inv.invoiceNumber}')">Detail</button>
          <button class="action-btn action-edit" onclick="adminVerifyPayment('${inv.invoiceNumber}')">Verifikasi</button>
        </td>
      </tr>
    `).join('');
  }
}

window.adminViewDetail = async function(invoiceNum) {
  const invoices = await adminLoadInvoices();
  const inv = invoices.find(i => i.invoiceNumber === invoiceNum);
  if (!inv) return;
  
  const modalBody = document.getElementById('modalDetailBody');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="detail-row"><div class="detail-label">Nomor Invoice</div><div class="detail-value">${inv.invoiceNumber}</div></div>
      <div class="detail-row"><div class="detail-label">Nama Lengkap</div><div class="detail-value">${inv.jamaah?.nama || '-'}</div></div>
      <div class="detail-row"><div class="detail-label">No. KTP/Paspor</div><div class="detail-value">${inv.jamaah?.ktp || '-'}</div></div>
      <div class="detail-row"><div class="detail-label">Tanggal Lahir</div><div class="detail-value">${inv.jamaah?.lahir || '-'}</div></div>
      <div class="detail-row"><div class="detail-label">Alamat</div><div class="detail-value">${inv.jamaah?.alamat || '-'}</div></div>
      <div class="detail-row"><div class="detail-label">No. WhatsApp</div><div class="detail-value">${inv.jamaah?.wa || '-'}</div></div>
      <div class="detail-row"><div class="detail-label">Paket</div><div class="detail-value">${inv.paket?.tanggal || '-'} (Rp ${inv.hargaPenuh?.toLocaleString('id-ID') || '-'})</div></div>
      <div class="detail-row"><div class="detail-label">Metode Pembayaran</div><div class="detail-value">${inv.keterangan || '-'}</div></div>
      <div class="detail-row"><div class="detail-label">Total Dibayar</div><div class="detail-value">Rp ${inv.totalBayar?.toLocaleString('id-ID') || '-'}</div></div>
      <div class="detail-row"><div class="detail-label">Status</div><div class="detail-value"><span class="badge-status ${adminGetStatusClass(inv.status)}">${inv.status}</span></div></div>
      ${inv.nominalTransfer ? `<div class="detail-row"><div class="detail-label">Nominal Transfer</div><div class="detail-value">Rp ${Number(inv.nominalTransfer).toLocaleString('id-ID')}</div></div>` : ''}
      ${inv.bankPengirim ? `<div class="detail-row"><div class="detail-label">Bank Pengirim</div><div class="detail-value">${inv.bankPengirim}</div></div>` : ''}
    `;
  }
  const modal = document.getElementById('modalDetail');
  if (modal) modal.classList.add('active');
};

window.adminDeleteRegistration = async function(invoiceNum) {
  if (confirm('Yakin ingin menghapus pendaftaran ini?')) {
    try {
      await fetch(`http://localhost:3000/api/invoices/${invoiceNum}`, { method: 'DELETE' });
    } catch(e) { console.error(e); }
    
    const current = localStorage.getItem('currentInvoice');
    if (current) {
      const currInv = JSON.parse(current);
      if (currInv.invoiceNumber === invoiceNum) {
        localStorage.removeItem('currentInvoice');
      }
    }
    adminRefreshAll();
  }
};

window.adminVerifyPayment = async function(invoiceNum) {
  if (confirm('Verifikasi pembayaran ini? Status akan diubah menjadi Terverifikasi.')) {
    try {
      await fetch(`http://localhost:3000/api/invoices/${invoiceNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Terverifikasi' })
      });
    } catch(e) { console.error(e); }
    adminUpdateCurrentInvoice(invoiceNum, { status: 'Terverifikasi' });
    adminRefreshAll();
    alert('Pembayaran berhasil diverifikasi!');
  }
};

window.adminEditPaket = async function(pkgId) {
  const packages = await adminLoadPackages();
  const pkg = packages.find(p => p.id === pkgId);
  if (pkg) {
    const titleEl = document.getElementById('modalPaketTitle');
    const tanggalEl = document.getElementById('paketTanggal');
    const hargaEl = document.getElementById('paketHarga');
    const labelEl = document.getElementById('paketLabel');
    const fasilitasEl = document.getElementById('paketFasilitas');
    const editIdEl = document.getElementById('paketEditId');
    
    if (titleEl) titleEl.textContent = 'Edit Paket';
    if (tanggalEl) tanggalEl.value = pkg.tanggal;
    if (hargaEl) hargaEl.value = pkg.harga;
    if (labelEl) labelEl.value = pkg.label || '';
    if (fasilitasEl) fasilitasEl.value = pkg.fasilitas ? pkg.fasilitas.join(', ') : '';
    if (editIdEl) editIdEl.value = pkg.id;
    
    const modal = document.getElementById('modalPaket');
    if (modal) modal.classList.add('active');
  }
};

window.adminDeletePaket = async function(pkgId) {
  if (confirm('Yakin ingin menghapus paket ini?')) {
    let packages = await adminLoadPackages();
    packages = packages.filter(p => p.id !== pkgId);
    await adminSavePackages(packages);
    adminRenderPaket();
  }
};

function adminCloseModal() {
  const modal = document.getElementById('modalDetail');
  if (modal) modal.classList.remove('active');
}

function adminClosePaketModal() {
  const modal = document.getElementById('modalPaket');
  if (modal) modal.classList.remove('active');
  const form = document.getElementById('paketForm');
  if (form) form.reset();
  const editId = document.getElementById('paketEditId');
  if (editId) editId.value = '';
}

async function adminRefreshAll() {
  await adminRenderDashboard();
  await adminRenderPendaftaran();
  await adminRenderPaket();
  await adminRenderKonfirmasi();
}

function adminInit() {
  // Only run if we're on admin page (has admin elements)
  if (!document.querySelector('.admin-sidebar')) return;
  
  adminRefreshAll();
  
  // Tab navigation
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.section-content').forEach(section => section.classList.remove('active'));
      
      if (tab === 'dashboard') {
        const dashSection = document.getElementById('dashboard-section');
        if (dashSection) dashSection.classList.add('active');
      } else if (tab === 'pendaftaran') {
        const pendSection = document.getElementById('pendaftaran-section');
        if (pendSection) pendSection.classList.add('active');
        adminRenderPendaftaran();
      } else if (tab === 'paket') {
        const paketSection = document.getElementById('paket-section');
        if (paketSection) paketSection.classList.add('active');
        adminRenderPaket();
      } else if (tab === 'konfirmasi') {
        const konfSection = document.getElementById('konfirmasi-section');
        if (konfSection) konfSection.classList.add('active');
        adminRenderKonfirmasi();
      }
    });
  });
  
  // Tambah Paket button
  const tambahBtn = document.getElementById('btnTambahPaket');
  if (tambahBtn) {
    tambahBtn.addEventListener('click', () => {
      const titleEl = document.getElementById('modalPaketTitle');
      const tanggalEl = document.getElementById('paketTanggal');
      const hargaEl = document.getElementById('paketHarga');
      const labelEl = document.getElementById('paketLabel');
      const fasilitasEl = document.getElementById('paketFasilitas');
      const editIdEl = document.getElementById('paketEditId');
      
      if (titleEl) titleEl.textContent = 'Tambah Paket';
      if (tanggalEl) tanggalEl.value = '';
      if (hargaEl) hargaEl.value = '';
      if (labelEl) labelEl.value = '';
      if (fasilitasEl) fasilitasEl.value = '';
      if (editIdEl) editIdEl.value = '';
      
      const modal = document.getElementById('modalPaket');
      if (modal) modal.classList.add('active');
    });
  }
  
  // Paket Form Submit
  const paketForm = document.getElementById('paketForm');
  if (paketForm) {
    paketForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tanggal = document.getElementById('paketTanggal')?.value || '';
      const harga = parseInt(document.getElementById('paketHarga')?.value || '0');
      const label = document.getElementById('paketLabel')?.value || '';
      const fasilitasText = document.getElementById('paketFasilitas')?.value || '';
      const fasilitas = fasilitasText.split(',').map(f => f.trim()).filter(f => f);
      const editId = document.getElementById('paketEditId')?.value || '';
      
      let packages = await adminLoadPackages();
      
      if (editId) {
        const index = packages.findIndex(p => p.id === editId);
        if (index !== -1) {
          packages[index] = { ...packages[index], tanggal, harga, label, fasilitas: fasilitas.length ? fasilitas : packages[index].fasilitas };
        }
      } else {
        const newId = 'PKT' + String(packages.length + 5).padStart(2, '0');
        packages.push({ id: newId, tanggal, harga, label, fasilitas: fasilitas.length ? fasilitas : ['Tiket Pesawat', 'Hotel', 'Pembimbing', 'Visa'] });
      }
      
      await adminSavePackages(packages);
      adminClosePaketModal();
      adminRenderPaket();
      alert('Paket berhasil disimpan!');
    });
  }
  
  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('adminToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
  
  // Close modal on overlay click
  const modalDetail = document.getElementById('modalDetail');
  const modalPaket = document.getElementById('modalPaket');
  
  if (modalDetail) {
    modalDetail.addEventListener('click', (e) => {
      if (e.target === modalDetail) adminCloseModal();
    });
  }
  if (modalPaket) {
    modalPaket.addEventListener('click', (e) => {
      if (e.target === modalPaket) adminClosePaketModal();
    });
  }
}

// Call adminInit after DOMContentLoaded along with existing init
// Add this to the existing DOMContentLoaded listener
const originalDOMListener = document.addEventListener;
document.addEventListener('DOMContentLoaded', () => {
  // Original init from existing script will run first
  // Then admin init
  adminInit();
});