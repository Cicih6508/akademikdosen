/* =========================================================
   Data Jabatan Akademik Dosen (JAD)
   Ringkasan dari:
   - Permendiktisaintek No. 52 Tahun 2025
   - Kepmendiktisaintek No. 39/M/KEP/2026
   ========================================================= */

const JAD = {
  updated: "November 2026",

  auth: { user: "admin", pass: "admin" },

  cs: {
    email: "ciciparamita6508@gmail.com",
    jenis: [
      "Error / halaman tidak berfungsi",
      "Hasil perhitungan tampak keliru",
      "Data regulasi perlu diperbarui",
      "Gagal ekspor PDF / Word / kalender",
      "Saran pengembangan",
      "Lainnya"
    ]
  },

  kategoriAgenda: {
    "BKD / SKP": "#3f7fcb",
    "Publikasi": "#1ea672",
    "Uji Kompetensi": "#f08a24",
    "Tenggat BUP": "#e0475b",
    "Lainnya": "#8b6fd6"
  },

  liburConfig: {
    autoSync: true,
    cacheHours: 12,
    googleApiKey: ""
  },

  libur: {
    "2026-01-01": { nama: "Tahun Baru 2026 Masehi", jenis: "Libur Nasional" },
    "2026-01-16": { nama: "Isra Mikraj Nabi Muhammad SAW", jenis: "Libur Nasional" },
    "2026-02-17": { nama: "Tahun Baru Imlek 2577 Kongzili", jenis: "Libur Nasional" },
    "2026-03-19": { nama: "Hari Suci Nyepi (Tahun Baru Saka 1948)", jenis: "Libur Nasional" },
    "2026-03-21": { nama: "Hari Raya Idulfitri 1447 Hijriah", jenis: "Libur Nasional" },
    "2026-03-22": { nama: "Hari Raya Idulfitri 1447 Hijriah", jenis: "Libur Nasional" },
    "2026-04-03": { nama: "Wafat Yesus Kristus", jenis: "Libur Nasional" },
    "2026-04-05": { nama: "Kebangkitan Yesus Kristus (Paskah)", jenis: "Libur Nasional" },
    "2026-05-01": { nama: "Hari Buruh Internasional", jenis: "Libur Nasional" },
    "2026-05-14": { nama: "Kenaikan Yesus Kristus", jenis: "Libur Nasional" },
    "2026-05-27": { nama: "Hari Raya Iduladha 1447 Hijriah", jenis: "Libur Nasional" },
    "2026-05-31": { nama: "Hari Raya Waisak 2570 BE", jenis: "Libur Nasional" },
    "2026-06-01": { nama: "Hari Lahir Pancasila", jenis: "Libur Nasional" },
    "2026-06-16": { nama: "1 Muharam Tahun Baru Islam 1448 Hijriah", jenis: "Libur Nasional" },
    "2026-08-17": { nama: "Proklamasi Kemerdekaan Republik Indonesia", jenis: "Libur Nasional" },
    "2026-08-25": { nama: "Maulid Nabi Muhammad SAW", jenis: "Libur Nasional" },
    "2026-12-25": { nama: "Kelahiran Yesus Kristus (Hari Raya Natal)", jenis: "Libur Nasional" }
  },

  peringatanNasional: {
    "01-15": "Hari Dharma Samudera",
    "01-25": "Hari Gizi Nasional",
    "02-09": "Hari Pers Nasional (HPN)",
    "03-09": "Hari Musik Nasional",
    "03-30": "Hari Film Nasional",
    "04-21": "Hari Kartini",
    "04-22": "Hari Bumi",
    "05-02": "Hari Pendidikan Nasional (Hardiknas)",
    "05-20": "Hari Kebangkitan Nasional (Harkitnas)",
    "05-29": "Hari Lanjut Usia Nasional",
    "06-29": "Hari Keluarga Nasional (Harganas)",
    "07-22": "Hari Kejaksaan (Hari Bhakti Adhyaksa)",
    "07-23": "Hari Anak Nasional",
    "08-10": "Hari Kebangkitan Teknologi Nasional",
    "08-14": "Hari Pramuka",
    "09-09": "Hari Olahraga Nasional (Haornas)",
    "09-24": "Hari Tani Nasional",
    "09-28": "Hari Kereta Api Nasional",
    "10-01": "Hari Kesaktian Pancasila",
    "10-02": "Hari Batik Nasional",
    "10-05": "Hari Tentara Nasional Indonesia (TNI)",
    "10-22": "Hari Santri Nasional",
    "10-28": "Hari Sumpah Pemuda",
    "10-30": "Hari Keuangan Nasional",
    "11-10": "Hari Pahlawan",
    "11-12": "Hari Kesehatan Nasional",
    "11-25": "Hari Guru Nasional & HUT PGRI",
    "11-29": "Hari KORPRI",
    "12-13": "Hari Nusantara",
    "12-19": "Hari Bela Negara",
    "12-22": "Hari Ibu Nasional"
  },

  rulerMax: 1100,

  jenjang: [
    {
      id: "aa",
      nama: "Asisten Ahli",
      singkat: "AA",
      ak: [150],
      pangkat: { 150: "III/b" },
      konversiBaik: 12.5,
      konversiSangatBaik: 18.75,
      prestasiMaks: 27.5,
      prestasiMaksSB: 21.25,
      maksPerTahun: 40,
      ringkas:
        "Jabatan akademik pertama bagi dosen tetap. Di sini dosen mulai mengumpulkan angka kredit dari kinerja tahunan dan luaran penelitian.",
      syarat: [
        "Berstatus dosen tetap",
        "Angka kredit kumulatif 150",
        "Penilaian jabatan pertama oleh PTN, PTN BH, LLDIKTI, K/L, atau PTS berakreditasi Unggul"
      ],
      publikasi: null,
      ujiKompetensi: "PTN, PTN BH, LLDIKTI, K/L, atau PTS berakreditasi Unggul",
      tunjangan: "Tunjangan profesi 1× gaji pokok bagi dosen bersertifikat pendidik"
    },
    {
      id: "l",
      nama: "Lektor",
      singkat: "L",
      ak: [200, 300],
      pangkat: { 200: "III/c", 300: "III/d" },
      konversiBaik: 25,
      konversiSangatBaik: 37.5,
      prestasiMaks: 55,
      prestasiMaksSB: 42.5,
      maksPerTahun: 80,
      proporsiPenelitian: 0.35,
      ringkas:
        "Jenjang kedua. Dosen mulai dituntut punya publikasi sebagai penulis pertama dan lulus uji kompetensi jabatan akademik.",
      syarat: [
        "Minimal 2 tahun menduduki jabatan Asisten Ahli",
        "BKD terpenuhi 4 semester berturut-turut di perguruan tinggi yang sama",
        "Predikat SKP minimal Baik 2 tahun berturut-turut",
        "Minimal 35% kekurangan AK berasal dari penelitian",
        "Memenuhi indikator kinerja dosen (IKD) jenjang Lektor",
        "Lulus uji kompetensi",
        "Dosen PNS: pangkat minimal III/b"
      ],
      publikasi: [
        "1 artikel di jurnal nasional terakreditasi minimal peringkat 4 sebagai penulis pertama, atau",
        "1 artikel di jurnal internasional bereputasi minimal Q4 (SJR > 0,1 atau IF > 0,05) sebagai penulis pertama, atau",
        "1 karya seni yang diakui dan bereputasi nasional/internasional"
      ],
      ujiKompetensi: "PTN, PTN BH, LLDIKTI, atau K/L",
      tunjangan: "Tunjangan profesi 1× gaji pokok bagi dosen bersertifikat pendidik"
    },
    {
      id: "lk",
      nama: "Lektor Kepala",
      singkat: "LK",
      ak: [400, 550, 700],
      pangkat: { 400: "IV/a", 550: "IV/b", 700: "IV/c" },
      konversiBaik: 37.5,
      konversiSangatBaik: 56.25,
      prestasiMaks: 82.5,
      prestasiMaksSB: 63.75,
      maksPerTahun: 120,
      proporsiPenelitian: 0.4,
      ringkas:
        "Jenjang ketiga. Publikasi syarat khusus naik kelas: penulis pertama sekaligus korespondensi di jurnal Q3 atau nasional peringkat 2.",
      syarat: [
        "Minimal 2 tahun menduduki jabatan Lektor",
        "BKD terpenuhi 4 semester berturut-turut di perguruan tinggi yang sama",
        "Predikat SKP minimal Baik 2 tahun berturut-turut",
        "Minimal 40% kekurangan AK berasal dari penelitian",
        "Memenuhi indikator kinerja dosen (IKD) jenjang Lektor Kepala",
        "Lulus uji kompetensi",
        "Dosen PNS: pangkat minimal III/d"
      ],
      publikasi: [
        "1 artikel di jurnal internasional bereputasi minimal Q3 (SJR > 0,2 atau IF > 0,05) sebagai penulis pertama dan korespondensi, atau",
        "1 artikel di jurnal nasional terakreditasi peringkat 2 sebagai penulis pertama dan korespondensi, atau",
        "1 karya seni bereputasi internasional"
      ],
      ujiKompetensi: "Kemdiktisaintek atau PTN BH yang ditetapkan Menteri",
      tunjangan: "Tunjangan profesi 1× gaji pokok bagi dosen bersertifikat pendidik"
    },
    {
      id: "prof",
      nama: "Profesor",
      singkat: "Prof",
      ak: [850, 1050],
      pangkat: { 850: "IV/d", 1050: "IV/e" },
      konversiBaik: 50,
      konversiSangatBaik: 75,
      prestasiMaks: 110,
      prestasiMaksSB: 85,
      maksPerTahun: 160,
      proporsiPenelitian: 0.45,
      ringkas:
        "Jabatan akademik tertinggi. Selain angka kredit dan publikasi, rekam jejak akademik dinilai secara menyeluruh melalui PDDikti, SINTA, dan sumber resmi lain.",
      syarat: [
        "Berijazah doktor, doktor terapan, atau subspesialis",
        "Pengalaman minimal 10 tahun sebagai dosen tetap (masa calon dosen dan dosen tidak tetap tidak dihitung)",
        "Memiliki sertifikat pendidik",
        "BKD terpenuhi 4 semester berturut-turut di perguruan tinggi yang sama",
        "Predikat SKP minimal Baik 2 tahun berturut-turut",
        "Minimal 45% kekurangan AK berasal dari penelitian",
        "Memenuhi indikator kinerja dosen (IKD) jenjang Profesor",
        "Lulus uji kompetensi"
      ],
      publikasi: [
        "1 artikel di jurnal internasional bereputasi minimal Q2 (SJR > 0,25 atau IF > 0,05) sebagai penulis pertama dan korespondensi, dan",
        "1 artikel di jurnal internasional bereputasi minimal Q3 (SJR > 0,2 atau IF > 0,05) sebagai penulis pertama atau korespondensi, atau di jurnal nasional terakreditasi peringkat 1",
        "Dosen seni: 2 karya seni bereputasi internasional"
      ],
      tambahan: [
        "Menguji minimal 3 mahasiswa doktor, salah satunya dari luar institusi",
        "Promotor mahasiswa doktor (1 luar negeri atau 2 dalam negeri), atau ko-promotor 3 mahasiswa doktor dalam negeri",
        "Mitra bestari di minimal 2 jurnal internasional bereputasi (minimal Q3) di luar institusi",
        "Penanggung jawab kerja sama penelitian dengan profesor luar negeri",
        "Ketua hibah penelitian/pengabdian yang didanai pihak di luar perguruan tinggi sendiri"
      ],
      ujiKompetensi: "Kemdiktisaintek",
      tunjangan: "Tunjangan profesi 1× gaji pokok dan tunjangan kehormatan 2× gaji pokok"
    }
  ],

  komponenAK: [
    {
      nama: "AK Integrasi / Penyetaraan",
      isi: "Sisa angka kredit dari kinerja sampai Desember 2022, dihitung dari nilai AK saat itu dikurangi nilai dasar jabatan. Contoh: Lektor Kepala dengan AK 550 memperoleh 550 − 400 = 150."
    },
    {
      nama: "AK Konversi",
      isi: "Dihitung tiap tahun dari predikat SKP. Predikat Baik memberi 100% koefisien jenjang, Sangat Baik memberi 150%."
    },
    {
      nama: "AK Pendidikan Formal",
      isi: "Diberikan atas ijazah pendidikan formal yang diperoleh dari studi lanjut."
    },
    {
      nama: "AK Prestasi",
      isi: "Berasal dari luaran penelitian, dinilai setiap akhir tahun melalui SISTER dan dibatasi per tahun sesuai jenjang. Komponen inilah yang memenuhi proporsi penelitian."
    }
  ],

  alur: [
    {
      judul: "Lapor BKD di SISTER",
      isi: "Isi beban kerja dosen setiap semester. Usulan baru bisa diajukan bila BKD terpenuhi 4 semester berturut-turut."
    },
    {
      judul: "Cek status eligibilitas",
      isi: "SISTER menampilkan apakah Anda sudah layak mengusulkan. Bila belum, lengkapi BKD dan syarat yang kurang."
    },
    {
      judul: "Penilaian AK Prestasi",
      isi: "Luaran penelitian dinilai setiap akhir tahun. Untuk PTS, tim penilai ditugaskan Kepala LLDIKTI; untuk PTN, oleh pemimpin perguruan tinggi."
    },
    {
      judul: "Uji kompetensi",
      isi: "Ikuti uji kompetensi sesuai jenjang tujuan. Yang lulus memperoleh Sertifikat Uji Kompetensi Jabatan Akademik Dosen."
    },
    {
      judul: "Senat dan Komite Integritas",
      isi: "Usulan yang disetujui diteruskan ke Senat dan Komite Integritas perguruan tinggi untuk pertimbangan."
    },
    {
      judul: "Penetapan jabatan",
      isi: "Jabatan akademik baru ditetapkan sesuai kewenangan dan tercatat di SISTER."
    }
  ],

  loncat: [
    {
      dari: "Asisten Ahli",
      ke: "Lektor Kepala",
      lewati: "Lektor",
      syarat: [
        "Minimal 2 tahun sebagai Asisten Ahli",
        "Berijazah doktor, doktor terapan, atau subspesialis",
        "Memenuhi syarat reguler kenaikan ke Lektor Kepala",
        "4 artikel di jurnal internasional bereputasi minimal Q2: 2 sebagai penulis pertama dan korespondensi, 2 sebagai penulis pertama (atau 4 karya seni monumental yang diakui internasional)"
      ]
    },
    {
      dari: "Lektor",
      ke: "Profesor",
      lewati: "Lektor Kepala",
      syarat: [
        "Minimal 2 tahun sebagai Lektor dan 10 tahun sebagai dosen tetap",
        "Berijazah doktor, doktor terapan, atau subspesialis",
        "Memenuhi syarat khusus dan syarat khusus tambahan Profesor",
        "4 artikel di jurnal internasional bereputasi: 2 di jurnal Q1 sebagai penulis pertama dan korespondensi (salah satunya IF minimal 7), 2 lainnya minimal Q2 sebagai penulis pertama"
      ]
    }
  ],

  loncatUmum: [
    "Predikat SKP Sangat Baik minimal 2 tahun terakhir",
    "Capaian kinerja melampaui target perguruan tinggi",
    "Bukti prestasi luar biasa, salah satunya: membimbing mahasiswa berprestasi internasional, buku terbitan lembaga resmi, karya kreatif yang diakui internasional, paten, atau penghargaan IPTEKS, budaya, atau olahraga minimal tingkat nasional"
  ],

  berkas: [
    "Ijazah dan transkrip terakhir",
    "SK jabatan akademik terakhir",
    "Laporan BKD 4 semester terakhir berstatus memenuhi",
    "Dokumen SKP 2 tahun terakhir",
    "Rekap angka kredit kumulatif terakhir",
    "Artikel syarat khusus beserta bukti indeksasi (SINTA/Scopus/WoS)",
    "Bukti korespondensi dengan pengelola jurnal",
    "Sertifikat Uji Kompetensi Jabatan Akademik Dosen",
    "Sertifikat pendidik (wajib untuk Profesor)",
    "Surat pernyataan keabsahan karya ilmiah"
  ],

  faq: [
    {
      q: "Apa saja jenjang jabatan akademik dosen saat ini?",
      a: "Ada empat: Asisten Ahli, Lektor, Lektor Kepala, dan Profesor. Jenjang ini hanya dimiliki dosen tetap. Permendiktisaintek 52/2025 menyebut kenaikan jenjang dengan istilah promosi dosen."
    },
    {
      q: "Berapa angka kredit kumulatif tiap jenjang?",
      a: "Asisten Ahli 150; Lektor 200 atau 300; Lektor Kepala 400, 550, atau 700; Profesor 850 atau 1.050. Nilai yang Anda tuju menentukan besar kekurangan AK yang harus dipenuhi."
    },
    {
      q: "Bagaimana proporsi AK penelitian dihitung?",
      a: "Persentasenya (35% ke Lektor, 40% ke Lektor Kepala, 45% ke Profesor) dikalikan dengan selisih antara AK jenjang yang dituju dan AK jabatan terakhir, bukan dengan total AK. Contoh: Lektor Kepala AK 550 yang menuju Profesor 850 butuh minimal 45% × 300 = 135 AK dari penelitian. AK penelitian yang dipakai belum boleh digunakan untuk kenaikan jabatan sebelumnya."
    },
    {
      q: "Berapa AK yang bisa diperoleh dalam setahun?",
      a: "AK Konversi dari SKP Baik: Asisten Ahli 12,5, Lektor 25, Lektor Kepala 37,5, Profesor 50 (Sangat Baik 150% dari angka itu). Ditambah AK Prestasi, total per tahun dibatasi 40, 80, 120, dan 160 sesuai jenjang."
    },
    {
      q: "Apakah boleh naik dua jenjang sekaligus?",
      a: "Boleh melalui loncat jabatan, khusus Asisten Ahli ke Lektor Kepala dan Lektor ke Profesor. Syaratnya berat: SKP Sangat Baik 2 tahun terakhir, bergelar doktor, minimal 2 tahun di jabatan saat ini, prestasi luar biasa, dan 4 artikel jurnal internasional bereputasi."
    },
    {
      q: "Siapa penyelenggara uji kompetensi?",
      a: "Ke Lektor: PTN, PTN BH, LLDIKTI, atau K/L. Ke Lektor Kepala: Kemdiktisaintek atau PTN BH yang ditetapkan Menteri. Ke Profesor: Kemdiktisaintek. Untuk rumpun ilmu agama, penyelenggaranya Kementerian Agama."
    },
    {
      q: "Bagaimana dengan dosen PTS?",
      a: "Jalurnya sama. Penilaian AK Prestasi dosen PTS dilakukan tim penilai yang ditugaskan Kepala LLDIKTI, dan hasilnya disahkan setiap tahun serta tercatat di SISTER."
    },
    {
      q: "Adakah kelonggaran publikasi untuk usulan Profesor tahun 2026?",
      a: "Ada. Khusus pengusul Lektor Kepala ke Profesor periode 2026, artikel syarat khusus kedua (jurnal internasional bereputasi minimal Q3 atau nasional terakreditasi peringkat 1) boleh dengan peran sebagai penulis anggota."
    },
    {
      q: "Kapan batas akhir usulan bagi dosen yang mendekati pensiun?",
      a: "Mulai 2026, usulan kenaikan jabatan akademik paling lambat diajukan satu tahun sebelum batas usia pensiun."
    }
  ],

  regulasi: [
    {
      nama: "Permendiktisaintek No. 52 Tahun 2025",
      ket: "Profesi, Karier, dan Penghasilan Dosen. Diundangkan 24 Desember 2025, menggantikan Permendikbudristek No. 44 Tahun 2024."
    },
    {
      nama: "Kemendiktisaintek No. 39/M/KEP/2026",
      ket: "Petunjuk Teknis Layanan Pengembangan Profesi dan Karier Dosen. Ditetapkan 26 Januari 2026, mencabut Kepmendiktisaintek No. 63/M/KEP/2025."
    }
  ]
};