# 🔔 Sistem Bel Sekolah Otomatis

> Solusi modern untuk manajemen jadwal bel sekolah yang akurat, otomatis, dan mudah dikonfigurasi.

**🌐 Live Demo → [bell-auto.vercel.app](https://bell-auto.vercel.app)**

---

## Tentang Proyek

**Sistem Bel Sekolah Otomatis** adalah aplikasi web yang dirancang untuk menggantikan bel sekolah manual dengan sistem terjadwal berbasis waktu secara otomatis. Sekolah dapat mengatur jadwal bel untuk setiap sesi — dari bel masuk, pergantian pelajaran, istirahat, hingga bel pulang — tanpa perlu intervensi manual setiap harinya.

---

## Fitur Utama

- **Jadwal Otomatis** — Bel berbunyi secara otomatis sesuai jadwal yang telah dikonfigurasi
- **Manajemen Jadwal** — Tambah, edit, dan hapus jadwal bel dengan mudah melalui antarmuka yang intuitif
- **Multi-Sesi** — Dukung berbagai sesi bel dalam satu hari (masuk, istirahat, pulang, dll.)
- **Real-time** — Tampilan waktu aktual dan status bel berikutnya secara langsung
- **Responsif** — Dapat diakses dari perangkat apa pun, termasuk tablet dan smartphone

---

## Tech Stack

| Teknologi | Kegunaan |
|---|---|
| **Next.js 16** | Framework React untuk aplikasi web |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Styling dan desain antarmuka |
| **shadcn/ui** | Komponen UI yang accessible dan konsisten |
| **Prisma** | ORM untuk manajemen database |
| **NextAuth.js** | Autentikasi pengguna |
| **TanStack Query** | Data fetching dan state sinkronisasi |
| **Zustand** | State management global |
| **Zod + React Hook Form** | Validasi form |

---

## Memulai

### Prasyarat

Pastikan sudah terinstal:
- [Node.js](https://nodejs.org) `>= 18`
- [Bun](https://bun.sh) (package manager yang digunakan)

### Instalasi

```bash
# Clone repositori
git clone https://github.com/username/bell-auto.git
cd bell-auto

# Install dependensi
bun install

# Salin file environment
cp .env.example .env.local
```

### Konfigurasi Environment

Isi variabel berikut di file `.env.local`:

```env
DATABASE_URL=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

### Menjalankan Aplikasi

```bash
# Generate Prisma client & migrasi database
bun prisma migrate dev

# Jalankan development server
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Struktur Proyek

```
src/
├── app/              # Halaman & routing (Next.js App Router)
├── components/
│   └── ui/           # Komponen shadcn/ui
├── hooks/            # Custom React hooks
└── lib/              # Utilitas, konfigurasi, dan helpers
```

---

## Deployment

Aplikasi ini di-deploy menggunakan **[Vercel](https://vercel.com)**. Untuk deploy mandiri:

```bash
# Build untuk produksi
bun run build

# Jalankan server produksi
bun start
```

Atau hubungkan repositori GitHub ke Vercel untuk continuous deployment otomatis.

---

## Lisensi

Didistribusikan di bawah lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.