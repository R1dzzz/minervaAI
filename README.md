🧠 MinervaAI — Intelligent Chat Platform

MinervaAI adalah aplikasi web AI chat yang memanfaatkan teknologi Gemini AI untuk menghasilkan respons percakapan yang cepat, kontekstual, dan modern. Project ini dibuat sebagai eksplorasi pengembangan aplikasi AI berbasis web dengan pendekatan vibe coding, yaitu metode membangun produk dengan kolaborasi langsung antara developer dan AI assistant untuk mempercepat proses development.

Project ini dibangun oleh:

FARID ALFIYANSAH
18 Tahun
SMK TAMTAMA KARANGANYAR
Jurusan Teknik Jaringan Komputer dan Telekomunikasi (TJKT)

---

🚀 Tentang Project

MinervaAI adalah platform percakapan AI yang menggabungkan:

- Frontend Web App
- Authentication System
- Serverless AI Proxy
- AI Model Integration

Aplikasi ini memungkinkan user untuk:

- membuat akun
- login dengan sistem autentikasi
- berinteraksi dengan AI
- mendapatkan respon dari model Gemini

Tujuan utama project ini adalah membangun AI chat platform yang ringan namun modern menggunakan teknologi web sederhana tetapi dengan arsitektur yang scalable.

---

🧠 AI Engine

MinervaAI menggunakan model dari:

Google Gemini API

AI ini dipanggil melalui serverless proxy agar API Key tidak terekspos ke frontend.

Flow komunikasi AI:

User
↓
Frontend Chat UI
↓
Serverless API (/api/chat)
↓
Gemini API
↓
AI Response
↓
User Interface

Dengan metode ini, keamanan API Key tetap terjaga.

---

🏗️ Metode Development

Project ini dibuat menggunakan pendekatan Vibe Coding.

Vibe Coding adalah metode development dimana developer bekerja secara iteratif bersama AI assistant untuk:

- merancang arsitektur
- membuat kode
- debugging
- mempercepat development workflow

Dalam project ini AI assistant yang digunakan adalah:

Claude AI

AI membantu dalam:

- merancang struktur project
- membuat sistem authentication
- integrasi Gemini API
- membuat UI logic
- debugging error

Pendekatan ini memungkinkan developer untuk fokus pada konsep dan arsitektur, sementara AI membantu mempercepat implementasi teknis.

---

🧩 Tech Stack

MinervaAI menggunakan stack sederhana namun powerful:

Frontend

- HTML5
- CSS3
- Vanilla JavaScript

Authentication

- Supabase Auth

AI Integration

- Google Gemini API

Backend Proxy

- Serverless Function

Deployment

- Vercel

Pendekatan ini membuat project tetap ringan namun scalable.

---

📁 Project Structure

minervaAI
│
├── api
│   └── chat.js          # Serverless AI proxy
│
├── assets               # Logo dan image
│
├── css
│   └── style.css
│
├── js
│   ├── api.js           # komunikasi AI
│   ├── auth.js          # authentication logic
│   ├── chat.js          # chat controller
│   └── ui.js            # UI rendering
│
├── index.html           # main chat page
├── login.html           # login page
├── register.html        # register page
└── SETUP.md             # setup guide

---

🔐 Authentication System

MinervaAI menggunakan Supabase Authentication untuk:

- user login
- user register
- session management
- profile data

Saat user melakukan registrasi:

1. akun dibuat di Supabase
2. profile user dibuat di database
3. session authentication dibuat otomatis

---

⚡ Serverless AI Proxy

Agar Gemini API Key tidak terekspos di frontend, MinervaAI menggunakan serverless proxy.

Endpoint:

/api/chat

Proxy ini:

1. menerima request dari frontend
2. meneruskan ke Gemini API
3. mengirim kembali response AI ke client

Metode ini menjaga keamanan API key.

---

💬 Chat System

Chat system bekerja dengan konsep conversation history.

Setiap pesan user akan:

User message
↓
disimpan ke conversation history
↓
dikirim ke Gemini
↓
AI menghasilkan response
↓
response ditampilkan di UI

Dengan metode ini AI bisa memahami konteks percakapan.

---

🎯 Tujuan Project

Project ini dibuat untuk:

- belajar integrasi AI dalam aplikasi web
- memahami sistem authentication modern
- mempelajari arsitektur serverless
- eksplorasi metode AI assisted development

Project ini juga menjadi bagian dari eksplorasi pribadi dalam bidang:

AI Development
Web Engineering
Cloud Architecture

---

👨‍💻 Developer

Farid Alfiyansah

18 years old
Student at SMK Tamtama Karanganyar

Major:
Teknik Jaringan Komputer dan Telekomunikasi (TJKT)

MinervaAI adalah salah satu project eksplorasi dalam mempelajari:

- Artificial Intelligence
- Web Development
- Cloud Infrastructure

---

📌 Future Development

Beberapa fitur yang direncanakan untuk pengembangan berikutnya:

- Chat history storage
- Streaming AI responses
- User profile customization
- Dark / light theme
- AI conversation memory
- Mobile UI optimization

---

⭐ Final Notes

MinervaAI adalah contoh bagaimana developer individu dapat membangun aplikasi AI modern menggunakan kombinasi:

- AI assistant
- serverless infrastructure
- web technologies

Project ini menunjukkan bahwa dengan pendekatan yang tepat, developer independen dapat menciptakan AI powered applications secara efisien.

---

MinervaAI v2.0

Built with curiosity, experimentation, and AI collaboration.
