# NOVA BUILDER Studio + Magic Link

## Fitur
- Dashboard responsif, code studio HTML/CSS/JS, preview lokal, autosave, riwayat lokal, dan deployment Vercel.
- Halaman Magic Link yang memanggil endpoint server-side `/api/magic-link`.
- API key AxzyDev dibaca dari environment variable `AXZYEDEV_API_KEY`, tidak ditanam di frontend.

## Deploy ke Vercel
1. Upload/deploy folder proyek ini ke Vercel.
2. Di Project Settings → Environment Variables, tambahkan `AXZYEDEV_API_KEY` dengan **API key baru yang sudah dirotasi**.
3. Untuk fitur deploy website bawaan, set juga `VERCEL_TOKEN`.
4. Redeploy setelah menambahkan environment variables.

## Kontrak API Magic Link
Proxy ini saat ini mengasumsikan `POST https://axzyedev.biz.id/api/v1/send-magic-link` dengan `Authorization: Bearer <key>`, `Content-Type: application/json`, dan body `{"email":"user@example.com"}`. Endpoint tidak dapat diverifikasi dari dokumentasi yang tersedia saat pembuatan; jika AxzyDev mengharuskan nama header/body berbeda, sesuaikan `api/magic-link.js` berdasarkan dokumentasi resminya.

Jangan pernah menaruh API key dalam `app.js`, HTML, atau mengirimkannya dari browser. Gunakan hanya untuk alamat email yang berizin.
