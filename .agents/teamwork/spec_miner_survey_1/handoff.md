# Handoff Report — spec_miner_survey_1
**Task**: Menu Specification & Asset Survey (`MENU-REGULER.pdf`)  
**Timestamp**: 2026-11-01T01:02:00Z  
**Type**: Hard Handoff (Complete)

---

## 1. Observation
- **Original Dispatch Request**:
  - `DISPATCH.md`: "Investigate the menu specification and assets, specifically searching for MENU-REGULER.pdf or any menu documentation/files in the project workspace (C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi and surrounding directories). Extract and enumerate all 105 menu items, their categories, variants (M/L/Panas/Dingin), prices, and structure to prepare the database seed requirements. Output your comprehensive findings in survey_report.md in your working directory."
- **File Discovery & Exact File Paths**:
  - Found official menu PDF file in system:
    1. Primary Active Location:  
       `C:\Users\Asus\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\2D018F2FC604EE0E17A2CBF350B0532EA22815F2\transfers\2026-44\e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`
    2. Mirror Location:  
       `D:\ASUS\Documents\Tugas\Tugas Semester 7\Crm\e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`
  - File size: 1,093,468 bytes.
  - Page structure: 4 pages (1754 x 1241 pixels per page):
    - Page 1: Cover "MENU x bumi upi x - HAYU KA BUPI!"
    - Page 2: Makanan & Camilan (48 items)
    - Page 3: Minuman, Kopi, Jamu & Jus (39 items)
    - Page 4: Roti Bakar & Pisang Bakar (18 items)
- **Item Count Observations**:
  - Page 2 (Makanan):
    - Cemilan Cepuluh: 18 items (Sate Aci s/d Tuangeun Bocil)
    - Ber Pepes An: 4 items (Pepes Goreng Ayam Bule, Pepes Ayam Bule, Pepes Ayam Kampung, Pepes Goreng Ayam Kampung)
    - Emih - Emihan: 6 items (Mie Kasep, Mie Racing, Mie Ebroh, Mie Chili Oil, Mie Anak Sekolah, Bihun Kuwah)
    - Pemadam Kelaparan: 7 items (Nasgor Upiwan, Upiwati, Cumi Upi, Bunda Kornet, Peda Kemangi, Omah, Kecombrang)
    - Tuntutan Masyarakat: 8 items (Nasi Galo Bumi Upi, Nasi Paru Serundeng, Nasi Dangdutan, Nasi Buntut Rewel, Nasi Buntut Kebakaran, Nasi Ghewlaa, Lidah Sambel Hejo, Buntut Goreng Sambal Hejo)
    - Sumber Protein: 5 items (Nasi Ayam Ajep-Ajep, Nasi Ayam Omongan Tetangga, Nasi Ayam Kalasan, Nasi Kulit Serundeng, Bebek Sambel Hejo)
    - Subtotal Makanan = 18 + 4 + 6 + 7 + 8 + 5 = **48 items**.
  - Page 3 (Minuman):
    - Seger Adem: 9 items (Es Cincau Jadoel, Es Limun, Es Soda Gembira, Es Cincau Hijau, Es Jeruk, Es Kelapa Muda, Es Kelapa Jeruk, Es Kelapa Nangka, Es Cendol)
    - Es Esan: 3 items (Es Krim Bumi Upi, Es ABC, Es Teller)
    - Teh & Susu: 10 items (Teh Tawar Jumbo, Teh Manis Jumbo, Teh Manis, Teh Lemon, Teh Sereh, Es Cokelat Malt Dinosaurus, Cokelat Malt Panas, Es Goyobod Alun - Alun, Teh Susu Tolak Angin, Teh Tarik)
    - Jejamuan: 3 items (Es Beras Kencur, Es Kunyit Asem, Es Beras Kencur Jeruk)
    - Kopi: 6 items (Kopi Hitam, Kopi Susu, Kopi Susu Butter, Kopi Susu Santan, Kopi Susu Kecap, Kopi Krim Soda)
    - Jus 4 U: 8 items (Jus Tomat, Sirsak, Semangka, Mangga, Alpukat, Tape, Stroberi, Jambu)
    - Subtotal Minuman = 9 + 3 + 10 + 3 + 6 + 8 = **39 items**.
  - Page 4 (Roti & Pisang Bakar):
    - Satu Rasa Cukup: 6 items (Roti Bakar Cokelat, Keju, Gula Klasik, Nanas, Srikaya, Burger Gulai Upi)
    - Roti Bakar Gurih: 6 items (Roti Bakar Telur, Telur Keju, Kornet, Kornet Telur Keju, Kornet Telur, Kornet Keju)
    - Dua Lebih Spesial: 2 items (Roti Bakar 2 rasa, Roti Bakar Mocca nougat)
    - Pisang Bakar: 4 items (Pisang Bakar Cokelat, Keju, Cokelat Keju, Double Cokelat)
    - Subtotal Roti & Pisang = 6 + 6 + 2 + 4 = **18 items**.
  - Grand Total = 48 + 39 + 18 = **105 items**.
- **Variant Observations**:
  - Size variants (Medium & Large): 9 beverage items (Es Cincau Jadoel, Teh Lemon, Es Cokelat Malt Dinosaurus, Teh Susu Tolak Angin, Teh Tarik, Kopi Hitam, Kopi Susu, Kopi Susu Santan, Kopi Susu Kecap).
  - Temperature variants (Panas & Dingin): 10 beverage items have both red & blue indicators. 3 items are strictly Panas. 26 items are strictly Dingin.
  - Badges/Icons: 9 items marked Rekomendasi, 5 items marked Favorit, 8 items marked Pedas, 2 items marked Untuk Anak.
- **Output Artifacts Created**:
  - `survey_report.md` (22.8 KB) at `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\spec_miner_survey_1\survey_report.md`

---

## 2. Logic Chain
1. The user request in `ORIGINAL_REQUEST.md` (point 5) explicitly demands: "Katalog Menu: 105 item dari MENU-REGULER.pdf di-seed lengkap."
2. The initial codebase in `supabase/migrations/20261031000004_seed_data.sql` and `public/app.js` only contained 16–18 hardcoded placeholder items, leaving a significant gap of ~87 items.
3. System-wide file discovery located `MENU-REGULER.pdf` in user transfer/documents directory.
4. Binary extraction and image inspection revealed 4 pages containing 16 categories.
5. Systematic enumeration across Page 2 (48 items), Page 3 (39 items), and Page 4 (18 items) yields exactly 105 unique menu items.
6. Beverage item notations explicitly mark Medium (M) vs Large (L) pricing (typically a +Rp 4.000–5.000 increment) and temperature versatility (Panas/Dingin dots).
7. Food items contain specialized tags (Rekomendasi, Favorit, Pedas, Untuk Anak) and descriptions matching authentic Garut/Sunda culinary persona.
8. Therefore, all 105 items are fully discovered, cataloged, and formatted with schema-ready attributes in `survey_report.md`.

---

## 3. Caveats
- No caveats regarding item enumeration: 105 items have been 100% matched and verified from the physical menu layout.
- The database schema in Milestone 2 needs to support variant price overrides (M vs L) and temperature selection options (Panas vs Dingin) so that the POS cart and online ordering reflect the exact choices available in the restaurant.

---

## 4. Conclusion
The specification mining for the 105 menu items of Rumah Tamah Bumi Upi is complete. All 105 items, their 16 categories, descriptions, prices, size variants (M/L), temperature variants (Panas/Dingin), and cultural badges have been documented in `survey_report.md`. This fulfills all requirements for the upcoming database seed migration (`packages/db`) and mock API fallback.

---

## 5. Verification Method
To independently verify:
1. Inspect the extracted report file:
   `C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\spec_miner_survey_1\survey_report.md`
2. Check item count verification command:
   ```powershell
   (Get-Content "C:\Users\Asus\.gemini\antigravity\scratch\bumi-upi\.agents\teamwork\spec_miner_survey_1\survey_report.md" | Select-String "\| \d+ \|").Count
   ```
   (Must equal 105).
3. Inspect the original reference file at:
   `D:\ASUS\Documents\Tugas\Tugas Semester 7\Crm\e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`
   or
   `C:\Users\Asus\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\2D018F2FC604EE0E17A2CBF350B0532EA22815F2\transfers\2026-44\e95949cc-0357-4daf-939b-eabaa606b5eb_MENU-REGULER.pdf`
