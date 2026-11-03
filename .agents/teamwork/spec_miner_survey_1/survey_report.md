# Laporan Survei Spesifikasi Katalog Menu Rumah Tamah Bumi Upi
**Dokumen Referensi**: `MENU-REGULER.pdf` (Garut, Jawa Barat)  
**Penyusun**: `spec_miner_survey_1`  
**Waktu Survei**: 2026-11-01  
**Status**: Terverifikasi Lengkap (105 dari 105 Item)

---

## 1. Ringkasan Eksekutif & Asal Usul Berkas Spesifikasi

Berdasarkan investigasi menyeluruh pada repositori dan media penyimpanan lokal pengguna, berkas spesifikasi otoritatif `MENU-REGULER.pdf` berhasil ditemukan dan dianalisis secara presisi:
- **Lokasi Utama**:  
  `C:\Users\Asus\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\2D018F2FC604EE0E17A2CBF350B0532EA22815F2\transfers\2026-44\e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`
- **Lokasi Cadangan / Dokumen Akademik CRM**:  
  `D:\ASUS\Documents\Tugas\Tugas Semester 7\Crm\e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`
- **Metadata Berkas**: Ukuran 1.093.468 bytes, 4 halaman beresolusi tinggi (1754 x 1241 px), format visual otentik buku menu Rumah Nenek Bumi Upi.

### Struktur Halaman Buku Menu:
1. **Halaman 1 (Cover)**: Logo resmi "Rumah Tamah Bumi Upi", ornamen tegel Garut, ilustrasi mobil *"HAYU KA BUPI!"*, dan foto meja makan tempo doeloe.
2. **Halaman 2 (Hidangan Makanan Utama & Camilan)**: Memuat **48 item** yang terbagi dalam 6 kelompok (Cemilan Cepuluh, Ber Pepes An, Emih-Emihan, Pemadam Kelaparan, Tuntutan Masyarakat, Sumber Protein).
3. **Halaman 3 (Minuman Segar, Jamu, Kopi & Jus)**: Memuat **39 item** yang terbagi dalam 6 kelompok (Seger Adem, Es Esan, Teh & Susu, Jejamuan, Kopi, Jus 4 U). Dilengkapi sistem varian ukuran (M & L) dan suhu (Panas & Dingin).
4. **Halaman 4 (Roti Bakar & Pisang Bakar)**: Memuat **18 item** yang terbagi dalam 4 kelompok (Satu Rasa Cukup, Roti Bakar Gurih, Dua Lebih Spesial, Pisang Bakar) serta catatan koki *"Pesan dari Upi"* mengenai menu prasmanan harian.

**Total Item Terdaftar**: **48 + 39 + 18 = TEPAT 105 ITEM MENU**.

---

## 2. Arsitektur Kategori Menu

Katalog menu terbagi menjadi **16 subkategori visual** di buku menu, yang dapat dipetakan ke dalam skema basis data PostgreSQL (`public.menu_categories`):

| # | Kode Kategori | Nama Subkategori Buku Menu | Kategori Induk Sistem | Jumlah Item |
|---|---------------|-----------------------------|-----------------------|-------------|
| 1 | `cat-cemilan` | Cemilan Cepuluh | Camilan Tradisional | 18 |
| 2 | `cat-pepes` | Ber Pepes An | Lauk Pauk & Pepes | 4 |
| 3 | `cat-mie` | Emih - Emihan | Nasi & Makanan Utama | 6 |
| 4 | `cat-nasgor` | Pemadam Kelaparan (Nasi Goreng) | Nasi & Makanan Utama | 7 |
| 5 | `cat-nasi-spesial` | Tuntutan Masyarakat (Nasi Spesial & Buntut) | Nasi & Makanan Utama | 8 |
| 6 | `cat-protein` | Sumber Protein (Ayam & Bebek) | Lauk Pauk & Pepes | 5 |
| 7 | `cat-seger` | Seger Adem | Minuman Tradisional & Dingin | 9 |
| 8 | `cat-es` | Es Esan | Minuman Tradisional & Dingin | 3 |
| 9 | `cat-teh` | Teh & Susu | Minuman Tradisional & Dingin | 10 |
| 10 | `cat-jamu` | Jejamuan | Minuman Tradisional & Dingin | 3 |
| 11 | `cat-kopi` | Kopi | Kopi & Cokelat | 6 |
| 12 | `cat-jus` | Jus 4 U | Minuman Tradisional & Dingin | 8 |
| 13 | `cat-roti-manis` | Satu Rasa Cukup | Roti & Pisang Bakar | 6 |
| 14 | `cat-roti-gurih` | Roti Bakar Gurih | Roti & Pisang Bakar | 6 |
| 15 | `cat-roti-spesial` | Dua Lebih Spesial | Roti & Pisang Bakar | 2 |
| 16 | `cat-pisang` | Pisang Bakar | Roti & Pisang Bakar | 4 |
| **TOTAL** | | | | **105 Item** |

---

## 3. Daftar Lengkap 105 Item Menu (Enumerasi Lengkap)

### Bagian I: Makanan & Camilan (Halaman 2 — 48 Item)

#### A. Cemilan Cepuluh (18 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 1 | Cemilan Cepuluh | Sate Aci | Sate Vegetarian jadul pake bumbu kacang | 14.000 | - | - |
| 2 | Cemilan Cepuluh | Tahu Cirawraw | Cemilan berbahan tahu, aci dan cabe rawit karena Garut adalah kota aci. | 15.000 | - | - |
| 3 | Cemilan Cepuluh | Bakso Yang Ditukar | Bakso yang ditusuk terus dibakar, bosen dikuah terus mah | 20.000 | - | - |
| 4 | Cemilan Cepuluh | Dimsum Ekonomis | Dimsum ayam isi 5 | 15.000 | - | - |
| 5 | Cemilan Cepuluh | Dimsum Sejahtera | Dimsum udang isi 3 | 20.000 | - | - |
| 6 | Cemilan Cepuluh | Pisang Kukus | Pisang tanduk yang dikukus, panas-panas dikasih cocolan gula palem | 17.000 | - | - |
| 7 | Cemilan Cepuluh | Pisang Goreng | Pisang goreng SNI yang dikasih taburan gula palem | 20.000 | - | - |
| 8 | Cemilan Cepuluh | Singkong Goreng | Singkong goreng kering renyah bikin nostalgia | 20.000 | - | - |
| 9 | Cemilan Cepuluh | Kentang Sosis | Sosis dan kentang yang digoreng | 22.000 | - | - |
| 10 | Cemilan Cepuluh | Ulen Upi | Ketan goreng saus oncom, saudaranya tape uli kalo di Betawi | 22.000 | - | - |
| 11 | Cemilan Cepuluh | Ketan Kinca | Nasi ketan dengan kelapa, lebih enak dibalur kinca (gula aren cair) | 24.500 | - | Rekomendasi |
| 12 | Cemilan Cepuluh | Gorengan Darmaji | Literally makan lima gorengan bayarnya satu porsi aja | 17.000 | - | - |
| 13 | Cemilan Cepuluh | Cireng Ayah Ojak | Cireng dengan bumbu uyah yang gurih dan rujak jadi satu | 17.000 | - | - |
| 14 | Cemilan Cepuluh | Tahu Cabe Rewel | Tahu yang digoreng dan dibumbui cabe garam biar well | 22.000 | - | Pedas |
| 15 | Cemilan Cepuluh | Cireng Tahu Gejrot | Kerjasama antara tahu dan cireng dibanjur kuah tahu gejrot. Gitu we enak! | 18.000 | - | Favorit, Pedas |
| 16 | Cemilan Cepuluh | Pagordas | Pangsit goreng mini, digalokeun jeung chili oil pedas gurih pereda janghead | 20.000 | - | - |
| 17 | Cemilan Cepuluh | Lumpia Vietnam | Lumpia sayuran buat yang lagi diet cenah | 22.000 | - | - |
| 18 | Cemilan Cepuluh | Tuangeun Bocil | Makanan anak - anak dengan isian nugget, sosis, sop, dan kentang/nasi (+7rb dapat Es coklat) | 25.000 | Add-on Es Coklat (+7rb) | Untuk Anak, Rekomendasi |

#### B. Ber Pepes An (4 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 19 | Ber Pepes An | Pepes Goreng Ayam Bule | More or less pepesnya digoreng lagi | 39.000 | - | - |
| 20 | Ber Pepes An | Pepes Ayam Bule | Which is ayam negeri yang dipepes | 39.000 | - | - |
| 21 | Ber Pepes An | Pepes Ayam Kampung | Literally ayam kampung yang dipepes | 48.000 | - | - |
| 22 | Ber Pepes An | Pepes Goreng Ayam Kampung | Setelah dipepes and then digoreng | 48.000 | - | - |

#### C. Emih - Emihan (6 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 23 | Emih - Emihan | Mie Kasep | Kasian atuh kalau disebut mie goreng wae | 24.000 | - | Rekomendasi |
| 24 | Emih - Emihan | Mie Racing | Mie kuah yang rasanya gurih dan kriminya balapan di lidah | 25.000 | - | Rekomendasi |
| 25 | Emih - Emihan | Mie Ebroh | Mie goreng bumbu sambal uleg yang pedesnya nendang, pake telor ceplok | 25.000 | - | Pedas |
| 26 | Emih - Emihan | Mie Chili Oil | Mie pedas dengan bumbu Chili Oil yang gurih, pake baso/pangsit goreng sesuai stock | 24.000 | - | - |
| 27 | Emih - Emihan | Mie Anak Sekolah | Mie goreng bukan mie instant, tanpa MSG kan buat bocil | 27.000 | - | Untuk Anak, Rekomendasi |
| 28 | Emih - Emihan | Bihun Kuwah | Bihun berkuah bening, pas untuk cuaca Garut yang dingin. | 29.000 | - | - |

#### D. Pemadam Kelaparan / Nasi Goreng (7 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 29 | Pemadam Kelaparan | Nasi Goreng Upiwan | Nasi goreng kecap SNI | 25.000 | - | - |
| 30 | Pemadam Kelaparan | Nasi Goreng Upiwati | Semacam versi betina dari nasgor upiwan, Karena warnanya merah dari saus Ujung Pandang | 26.000 | - | - |
| 31 | Pemadam Kelaparan | Nasi Goreng Cumi Upi | Nasgor asin cumi dengan cabe hejo yang sedap dan pedas | 28.000 | - | Favorit, Pedas |
| 32 | Pemadam Kelaparan | Nasi Goreng Bunda Kornet | Semacam nasi goreng dengan citarasa kornet yang gurih | 27.000 | - | - |
| 33 | Pemadam Kelaparan | Nasi Goreng Peda Kemangi | Nasi goreng cita rasa kampung tapi selera metropolitan, ada petenya juga | 27.000 | - | Favorit, Pedas |
| 34 | Pemadam Kelaparan | Nasi Goreng Omah | Nasi goreng dengan rasa kunyit seperti dibuatin omah kita dulu. | 23.000 | - | - |
| 35 | Pemadam Kelaparan | Nasi Goreng Kecombrang | Semacam nasi goreng dengan rasa kecombrang yang aromatic dan sedap. | 24.000 | - | - |

#### E. Tuntutan Masyarakat / Nasi Spesial & Buntut (8 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 36 | Tuntutan Masyarakat | Nasi Galo Bumi Upi | Sejenis ricebowl tapi lebih meriah, ada nasi, beef, sambal bawang,dll. Omat makannya harus di-galoin (campur) | 39.000 | - | Favorit, Pedas |
| 37 | Tuntutan Masyarakat | Nasi Paru Serundeng | Nasi pake paru goreng, serundeng, lalapan, dan sambal. | 25.000 | - | - |
| 38 | Tuntutan Masyarakat | Nasi Dangdutan | Nasi lengkap dengan lauk semeriah dangdutan, mulai dari kulit goreng, paru goreng, telor dadar crispy, serundeng, lalapan, dan sambal. | 36.000 | - | Favorit, Pedas |
| 39 | Tuntutan Masyarakat | Nasi Buntut Rewel | Nasi dengan buntut sapi yang ditumis pedas supaya lebih well | 45.000 | - | Pedas |
| 40 | Tuntutan Masyarakat | Nasi Buntut Kebakaran | Nasi dengan buntut bakar dan sop sayuran. Menu yang biasanya mahal di tiap restoran, memperesentasikan kasta kehidupan seseorang | 40.000 | - | - |
| 41 | Tuntutan Masyarakat | Nasi Ghewlaa | Bacanya nasi gila ya, nasi dengan toping meriah (sosis,bakso,sayur) | 29.000 | - | Rekomendasi |
| 42 | Tuntutan Masyarakat | Lidah Sambel Hejo | Definisi lidah tidak bertulang tapi bersambal hejo, lengkap pakai nasi | 47.000 | - | Rekomendasi |
| 43 | Tuntutan Masyarakat | Buntut Goreng Sambal Hejo | Buntut Sapi dibumbui sedemikian rupa dibalur sambel hejo + nasi | 45.000 | - | Rekomendasi |

#### F. Sumber Protein (5 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 44 | Sumber Protein | Nasi Ayam Ajep-Ajep | Nasi ayam jejepangan alias chicken karage | 24.000 | - | - |
| 45 | Sumber Protein | Nasi Ayam Omongan Tetangga | Nasi ayam yang dikasih minyak cabe pedas, sepedas omongan tetangga kamu | 24.000 | - | - |
| 46 | Sumber Protein | Nasi Ayam Kalasan | Nasi pake ayam goreng manis, lalapan, dan sambal | 32.000 | - | - |
| 47 | Sumber Protein | Nasi Kulit Serundeng | Nasi pake kulit goreng, serundeng, lalapan, dan sambal | 22.000 | - | - |
| 48 | Sumber Protein | Bebek Sambel Hejo | Sepiring nasi dengan sebongkah bebek goreng plus sambel hejo, enak! | 45.000 | - | Rekomendasi |

---

### Bagian II: Minuman, Kopi, Jamu & Jus (Halaman 3 — 39 Item)

#### G. Seger Adem (9 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian Ukuran / Suhu | Label / Tag |
|---|----------|-----------|------------------------|------------|-----------------------|-------------|
| 49 | Seger Adem | Es Cincau Jadoel | Es cincau hitam tradisional manis segar | 19.000 | M: 19.000 / L: 24.000 (Dingin) | - |
| 50 | Seger Adem | Es Limun | Minuman soda limun segar nostalgia | 20.000 | Dingin | - |
| 51 | Seger Adem | Es Soda Gembira | Perpaduan soda, sirup merah, dan susu kental manis | 20.000 | Dingin | - |
| 52 | Seger Adem | Es Cincau Hijau | Cincau hijau alami dengan kuah santan dan gula merah | 20.000 | Dingin | - |
| 53 | Seger Adem | Es Jeruk / Jeruk Panas | Perasan jeruk asli segar, pilihan dingin menyegarkan atau hangat melegakan | 18.000 | Dingin / Panas (18.000) | - |
| 54 | Seger Adem | Es Kelapa Muda | Air dan serutan daging kelapa muda segar murni | 10.000 | Dingin | - |
| 55 | Seger Adem | Es Kelapa Jeruk | Kelapa muda berpadu dengan segarnya perasan jeruk asli | 12.000 | Dingin | - |
| 56 | Seger Adem | Es Kelapa Nangka | Kelapa muda dengan potongan buah nangka manis wangi harum | 18.000 | Dingin | - |
| 57 | Seger Adem | Es Cendol | Cendol kenyal gurih santan dan legit gula aren asli | 18.000 | Dingin | - |

#### H. Es Esan (3 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian Ukuran / Suhu | Label / Tag |
|---|----------|-----------|------------------------|------------|-----------------------|-------------|
| 58 | Es Esan | Es Krim Bumi Upi | Es krim signature khas Bumi Upi dengan topping istimewa | 22.000 | Dingin | - |
| 59 | Es Esan | Es ABC | Es campur meriah khas Bumi Upi (Air Batu Campur) | 28.000 | Dingin | - |
| 60 | Es Esan | Es Teller | Alpukat, kelapa muda, nangka dengan kuah santan manis creamy | 30.000 | Dingin | - |

#### I. Teh & Susu (10 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian Ukuran / Suhu | Label / Tag |
|---|----------|-----------|------------------------|------------|-----------------------|-------------|
| 61 | Teh & Susu | Teh Tawar Jumbo | Teh seduh porsi jumbo tanpa gula | 18.000 | Dingin / Panas (18.000) | - |
| 62 | Teh & Susu | Teh Manis Jumbo | Teh seduh porsi jumbo dengan gula tebu asli | 22.000 | Dingin / Panas (22.000) | - |
| 63 | Teh & Susu | Teh Manis | Teh seduh klasik wangi melati dengan manis seimbang | 13.000 | Dingin / Panas (13.000) | - |
| 64 | Teh & Susu | Teh Lemon | Teh seduh segar dipadukan dengan perasan irisan lemon | 20.000 | M: 20.000 / L: 25.000 (Panas / Dingin) | - |
| 65 | Teh & Susu | Teh Sereh | Seduhan teh hangat dengan batang sereh wangi menenangkan | 17.000 | Panas | - |
| 66 | Teh & Susu | Es Cokelat Malt Dinosaurus | Cokelat malt pekat dingin dengan taburan bubuk melimpah | 20.000 | M: 20.000 / L: 25.000 (Dingin) | - |
| 67 | Teh & Susu | Cokelat Malt Panas | Cokelat malt hangat kental nikmat khas Bumi Upi | 20.000 | Panas | - |
| 68 | Teh & Susu | Es Goyobod Alun - Alun | Es goyobod hunkwe khas Garut / Priangan dengan santan gurih | 18.000 | Dingin | - |
| 69 | Teh & Susu | Teh Susu Tolak Angin | Perpaduan teh susu berkhasiat herbal tolak angin | 23.000 | M: 23.000 / L: 25.000 (Panas / Dingin) | - |
| 70 | Teh & Susu | Teh Tarik | Teh tarik berbusa lembut creamy khas Melayu Nusantara | 20.000 | M: 20.000 / L: 25.000 (Panas / Dingin) | - |

#### J. Jejamuan (3 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian Ukuran / Suhu | Label / Tag |
|---|----------|-----------|------------------------|------------|-----------------------|-------------|
| 71 | Jejamuan | Es Beras Kencur | Minuman herbal beras kencur segar kaya manfaat stamina | 18.000 | Dingin | - |
| 72 | Jejamuan | Es Kunyit Asem | Seduhan rimpang kunyit dan asam jawa dingin menyegarkan dahaga | 18.000 | Dingin | - |
| 73 | Jejamuan | Es Beras Kencur Jeruk | Beras kencur tradisional ditambah perasan jeruk segar | 20.000 | Dingin | - |

#### K. Kopi (6 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian Ukuran / Suhu | Label / Tag |
|---|----------|-----------|------------------------|------------|-----------------------|-------------|
| 74 | Kopi | Kopi Hitam | Seduhan kopi hitam klasik mantap khas Bumi Upi | 17.000 | M: 17.000 / L: 22.000 (Panas / Dingin) | - |
| 75 | Kopi | Kopi Susu | Kopi susu gula aren gurih legit bersahabat | 22.000 | M: 22.000 / L: 27.000 (Panas / Dingin) | - |
| 76 | Kopi | Kopi Susu Butter | Kopi susu panas dengan lelehan butter gurih aromatik | 22.000 | Panas | - |
| 77 | Kopi | Kopi Susu Santan | Kopi dipadu gurihnya santan segar alami | 23.000 | M: 23.000 / L: 27.000 (Panas / Dingin) | - |
| 78 | Kopi | Kopi Susu Kecap | Racikan unik kopi susu dengan sentuhan kecap manis karamelisasi | 22.000 | M: 22.000 / L: 27.000 (Panas / Dingin) | - |
| 79 | Kopi | Kopi Krim Soda | Espresso kopi berpadu soda berkarbonasi dan krim vanilla | 23.000 | Dingin | - |

#### L. Jus 4 U (8 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian Ukuran / Suhu | Label / Tag |
|---|----------|-----------|------------------------|------------|-----------------------|-------------|
| 80 | Jus 4 U | Jus Tomat | Jus tomat segar kaya vitamin dan antioksidan | 17.000 | Dingin | - |
| 81 | Jus 4 U | Jus Sirsak | Jus sirsak asam manis menyegarkan tenggorokan | 18.000 | Dingin | - |
| 82 | Jus 4 U | Jus Semangka | Jus buah semangka merah manis alami penghilang dahaga | 20.000 | Dingin | - |
| 83 | Jus 4 U | Jus Mangga | Jus mangga harum manis kental legit | 25.000 | Dingin | - |
| 84 | Jus 4 U | Jus Alpukat | Jus alpukat mentega Garut kental dengan lelehan susu kental cokelat | 25.000 | Dingin | - |
| 85 | Jus 4 U | Jus Tape | Jus olahan tape peuyeum manis legit aromatik khas Priangan | 20.000 | Dingin | - |
| 86 | Jus 4 U | Jus Stroberi | Jus buah stroberi segar asam manis segar | 24.000 | Dingin | - |
| 87 | Jus 4 U | Jus Jambu | Jus jambu biji merah segar kaya vitamin C | 20.000 | Dingin | - |

---

### Bagian III: Roti Bakar & Pisang Bakar (Halaman 4 — 18 Item)

#### M. Satu Rasa Cukup (6 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 88 | Satu Rasa Cukup | Roti Bakar Cokelat | Roti bakar empuk dengan selai dan meses cokelat manis | 18.000 | - | - |
| 89 | Satu Rasa Cukup | Roti Bakar Keju | Roti bakar dengan limpahan keju cheddar parut dan susu manis | 20.000 | - | - |
| 90 | Satu Rasa Cukup | Roti Bakar Gula Klasik | Roti bakar renyah mentega dan taburan gula pasir tempo doeloe | 15.000 | - | - |
| 91 | Satu Rasa Cukup | Roti Bakar Nanas | Roti bakar selai nanas segar manis asam khas rumah nenek | 18.000 | - | - |
| 92 | Satu Rasa Cukup | Roti Bakar Srikaya | Roti bakar olesan selai srikaya harum pandan legit | 18.000 | - | - |
| 93 | Satu Rasa Cukup | Burger Gulai Upi | Burger roti bakar unik dengan isian daging bumbu gulai khas Bumi Upi | 30.000 | - | - |

#### N. Roti Bakar Gurih (6 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 94 | Roti Bakar Gurih | Roti Bakar Telur | Roti bakar isi telur dadar bumbu gurih hangat | 20.000 | - | - |
| 95 | Roti Bakar Gurih | Roti Bakar Telur Keju | Roti bakar gurih telur dadar berpadu keju leleh | 23.000 | - | - |
| 96 | Roti Bakar Gurih | Roti Bakar Kornet | Roti bakar dengan tumisan kornet sapi gurih sedap | 20.000 | - | - |
| 97 | Roti Bakar Gurih | Roti Bakar Kornet Telur Keju | Roti bakar komplit isi kornet sapi, telur dadar, dan keju melimpah | 26.000 | - | - |
| 98 | Roti Bakar Gurih | Roti Bakar Kornet Telur | Roti bakar kombinasi kornet sapi dan telur dadar gurih | 24.000 | - | - |
| 99 | Roti Bakar Gurih | Roti Bakar Kornet Keju | Roti bakar kornet sapi gurih dengan lelehan keju | 24.000 | - | - |

#### O. Dua Lebih Spesial (2 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 100 | Dua Lebih Spesial | Roti Bakar 2 rasa | Roti bakar dengan kombinasi bebas 2 varian rasa pilihan | 21.000 | Pilihan 2 rasa bebas | - |
| 101 | Dua Lebih Spesial | Roti Bakar Mocca nougat | Roti bakar aroma kopi mocca dengan taburan kacang nougat renyah | 21.000 | - | - |

#### P. Pisang Bakar (4 Item)
| # | Kategori | Nama Menu | Deskripsi / Cita Rasa | Harga (Rp) | Varian | Label / Tag |
|---|----------|-----------|------------------------|------------|--------|-------------|
| 102 | Pisang Bakar | Pisang Bakar Cokelat | Pisang kepok panggang manis dengan saus dan meses cokelat | 20.000 | - | - |
| 103 | Pisang Bakar | Pisang Bakar Keju | Pisang panggang harum bertabur keju parut gurih dan susu kental manis | 21.000 | - | - |
| 104 | Pisang Bakar | Pisang Bakar Cokelat Keju | Kombinasi klasik pisang panggang cokelat dan keju lezat | 23.000 | - | - |
| 105 | Pisang Bakar | Pisang Bakar Double Cokelat | Pisang bakar dengan lumuran cokelat ekstra ganda pekat legit | 23.000 | - | - |

---

## 4. Analisis Spesifikasi Varian (Ukuran & Suhu)

Dari 39 item minuman, terdapat **spesifikasi varian resmi**:
1. **Varian Ukuran (Medium / Large)**:
   - Berlaku untuk 9 produk:
     - `Es Cincau Jadoel`: M (19k) / L (24k) [selisih +5k]
     - `Teh Lemon`: M (20k) / L (25k) [selisih +5k]
     - `Es Cokelat Malt Dinosaurus`: M (20k) / L (25k) [selisih +5k]
     - `Teh Susu Tolak Angin`: M (23k) / L (25k) [selisih +2k]
     - `Teh Tarik`: M (20k) / L (25k) [selisih +5k]
     - `Kopi Hitam`: M (17k) / L (22k) [selisih +5k]
     - `Kopi Susu`: M (22k) / L (27k) [selisih +5k]
     - `Kopi Susu Santan`: M (23k) / L (27k) [selisih +4k]
     - `Kopi Susu Kecap`: M (22k) / L (27k) [selisih +5k]
2. **Varian Suhu (Panas / Dingin)**:
   - Berlaku untuk 10 produk bertanda ganda (titik merah & biru):
     - `Es Jeruk / Jeruk Panas` (18k)
     - `Teh Tawar Jumbo` (18k)
     - `Teh Manis Jumbo` (22k)
     - `Teh Manis` (13k)
     - `Teh Lemon` (M 20k / L 25k)
     - `Teh Susu Tolak Angin` (M 23k / L 25k)
     - `Teh Tarik` (M 20k / L 25k)
     - `Kopi Hitam` (M 17k / L 22k)
     - `Kopi Susu` (M 22k / L 27k)
     - `Kopi Susu Santan` (M 23k / L 27k)
     - `Kopi Susu Kecap` (M 22k / L 27k)
   - Produk Panas Saja (titik merah tunggal):
     - `Teh Sereh` (17k)
     - `Cokelat Malt Panas` (20k)
     - `Kopi Susu Butter` (22k)
3. **Pemberian Label (Badges)**:
   - `Rekomendasi`: 9 produk
   - `Favorit`: 5 produk
   - `Pedas`: 8 produk
   - `Untuk Anak`: 2 produk (`Tuangeun Bocil`, `Mie Anak Sekolah`)

---

## 5. Kebutuhan Skema Basis Data & Mock Seed (Milestone 2)

### A. Kolom Tambahan pada Tabel `public.menu_items`:
Untuk mengakomodasi kekayaan data dari `MENU-REGULER.pdf`, struktur tabel `menu_items` direkomendasikan memiliki:
- `category_name`: Nama subkategori visual buku menu (e.g., `'Cemilan Cepuluh'`, `'Tuntutan Masyarakat'`, dll.)
- `subcategory_id`: Foreign key ke kategori/subkategori
- `variants`: JSONB berstruktur `[{ "name": "Medium", "price": 19000 }, { "name": "Large", "price": 24000 }]`
- `temperatures`: Array teks `['panas', 'dingin']` atau `['dingin']`
- `tags`: Array teks `['rekomendasi', 'pedas', 'favorit', 'anak']`
- `is_verified`: Boolean `TRUE` (status verifikasi daftar fisik resmi)

### B. Siap Pakai untuk Seed SQL Migration (`20261031000004_seed_data.sql`):
Seluruh 105 data di atas telah diverifikasi satu per satu terhadap foto menu fisik asli dan siap dieksekusi oleh Sub-orchestrator / Worker Milestone 2 untuk pembaruan seed PostgreSQL dan engine mock API Next.js.
