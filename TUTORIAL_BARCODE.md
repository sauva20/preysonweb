# Panduan Lengkap: Menghubungkan & Menggunakan Barcode Scanner

Sistem inventory Preyson kini telah mendukung penuh penggunaan alat *Barcode Scanner* fisik untuk mempercepat proses keluar masuk barang.

Alat barcode scanner modern (baik USB maupun Wireless/Bluetooth) pada dasarnya bekerja sebagai **keyboard virtual otomatis**. Jadi, Anda tidak memerlukan *driver* atau aplikasi khusus. Saat Anda menembak barcode, alat tersebut akan "mengetik" nomor/huruf dengan sangat cepat dan diakhiri dengan tombol `Enter`.

Berikut adalah panduan lengkap cara mengatur dan menggunakannya di toko:

---

## Tahap 1: Pemasangan Alat (Plug & Play)

1. **Hubungkan Scanner:** 
   - Jika menggunakan **kabel USB** atau **Wireless Dongle**, colokkan langsung ke port USB komputer/laptop toko Anda.
   - Jika menggunakan **Bluetooth**, lakukan *pairing* Bluetooth di pengaturan OS Windows/Mac Anda seperti menyambungkan speaker/mouse biasa.
2. **Tes Alat:** 
   Buka aplikasi *Notepad* atau *Microsoft Word* di komputer. Tembak barcode sembarang (misalnya barcode di botol minum). Jika angka barcode langsung muncul di layar dan kursor berpindah ke baris baru (seperti menekan Enter), maka alat **sudah siap digunakan!**

> [!WARNING]
> **Penting (Auto-Enter):** 
> Jika saat menembak barcode di *Notepad* angkanya muncul TAPI kursor tidak pindah ke bawah (tidak otomatis *Enter*), Anda harus mengaktifkan mode **Suffix Enter / CR**. 
> - Cari buku panduan manual kertas bawaan di dalam dus scanner Anda.
> - Cari halaman yang membahas **Suffix** atau **Terminator**.
> - Tembak barcode bertuliskan `"Add Enter Suffix"` atau `"Carriage Return (CR)"` dari buku tersebut.

---

## Tahap 2: Cara Mencetak Barcode (Barcode Printer)

Agar bisa di-scan, produk fisik Anda harus ditempel stiker barcode terlebih dahulu.

1. Buka halaman **Admin > Products** di web Preyson.
2. Pastikan produk yang ingin dicetak barcodenya **sudah diisi kolom SKU-nya** (klik Edit produk, lihat di bagian *STOCK & SKU PER SIZE*, ketikkan SKU secara manual seperti `GLV-AOS-M`, klik Save).
3. Di tabel produk, klik tombol berlambang **Printer** di kolom *Actions*.
4. Masukkan jumlah (`Qty`) stiker yang ingin dicetak untuk masing-masing ukuran.
5. Klik **Print**.
6. Akan muncul jendela pop-up. Hubungkan komputer Anda dengan **Printer Thermal Barcode** (misal: Xprinter, Zebra), pilih printernya, sesuaikan ukuran kertas (Paper Size), lalu cetak stiker. Tempelkan stiker ke plastik/tag produk Anda.

---

## Tahap 3: Cara Scan Masuk Stok (Scan-In Stock)

Sekarang, saat barang baru tiba dari vendor, Anda tidak perlu lagi mencari produknya satu persatu di web secara manual.

1. Buka halaman **Admin > Products** di web Preyson.
2. Klik tombol hijau **SCAN IN STOCK** di pojok kanan atas.
3. Akan muncul jendela popup berlogo scanner hijau. **Perhatikan bahwa kursor ketikan sudah otomatis berkedip di dalam kotak "SKU Barcode".**
4. Biarkan `Quantity per scan` di angka `1` (atau ubah jika Anda mau 1 tembakan langsung masuk 5 stok).
5. **Ambil Scanner Fisik Anda, lalu tembak barcode di produk!**
6. Scanner akan mengetikkan SKU secara kilat dan menekan tombol *Submit/Enter* dengan sendirinya.
7. Sistem web Preyson akan langsung mencari produk tersebut, menambah stoknya, dan memunculkan notifikasi sukses hijau. 
8. **Kursor akan otomatis kembali berkedip** di dalam kotak. Anda tinggal tembak barang kedua, ketiga, dan seterusnya tanpa perlu memegang mouse komputer sama sekali! Sangat cepat!

> [!TIP]
> Jika terdengar bunyi *beep* dari scanner tapi muncul kotak merah di web (Error), artinya SKU dari barcode tersebut belum terdaftar di produk manapun di dalam website Anda. Pastikan SKU di web dan barcode sama persis huruf besar/kecilnya!
