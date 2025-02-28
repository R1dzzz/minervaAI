// Elemen DOM
const themeSwitcher = document.getElementById("themeSwitch");
const chatWindow = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendBtn");
const clearButton = document.getElementById("clearChatBtn");

// API Key Gemini
const apiKey = "AIzaSyC1wD55wwVac4E3uFgH4qIhq3Tnjl39Wfs";

// Array untuk menyimpan riwayat pesan
let conversationHistory = [];

let isDarkTheme = false;

// Tema Switch
themeSwitcher.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle("dark", isDarkTheme);
    themeSwitcher.innerHTML = isDarkTheme
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
});

// Kirim Pesan
sendButton.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (message) {
        addMessageToChat("user", message);
        userInput.value = "";
        fetchGeminiResponse(message);
    }
});

// Kirim Pesan dengan Enter
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendButton.click();
});

// Bersihkan Chat
clearButton.addEventListener("click", () => {
    chatWindow.innerHTML = "";
    conversationHistory = [];
});

// Fungsi untuk Menambahkan Pesan ke Chat dengan Animasi Mengetik dan Pemisahan Kode
async function addMessageToChat(sender, message) {
    const messageElement = document.createElement("p");
    messageElement.classList.add(sender);
    chatWindow.appendChild(messageElement);

    // Pisahkan teks dan kode berdasarkan tanda ```
    const parts = message.split(/(```[\s\S]*?```)/g);
    for (const part of parts) {
        if (part.startsWith('```') && part.endsWith('```')) {
            // Bagian ini adalah kode
            const code = part.slice(3, -3).trim();
            const codeBlock = document.createElement("pre");
            codeBlock.classList.add("code-block");
            const codeElement = document.createElement("code");
            codeElement.textContent = code;
            codeBlock.appendChild(codeElement);

            // Tambahkan tombol copy
            const copyBtn = document.createElement("button");
            copyBtn.classList.add("copy-btn");
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>'; // Ikon copy
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(code).then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>'; // Ikon centang
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>'; // Kembali ke copy
                    }, 2000);
                });
            });
            codeBlock.appendChild(copyBtn);

            messageElement.appendChild(codeBlock);
        } else {
            // Bagian ini adalah teks biasa, tampilkan dengan animasi mengetik
            const words = part.split(' ');
            for (let i = 0; i < words.length; i++) {
                const wordSpan = document.createElement("span");
                wordSpan.textContent = words[i] + ' ';
                messageElement.appendChild(wordSpan);
                await new Promise(resolve => setTimeout(resolve, 50)); // Jeda 50ms per kata
            }
        }
    }
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll ke bawah

    // Simpan pesan ke riwayat (format Gemini)
    conversationHistory.push({
        role: sender === "user" ? "user" : "model",
        parts: [{ text: message }]
    });
}

// Fungsi untuk Menambahkan Animasi Typing
function addTypingAnimation() {
    const typingElement = document.createElement("p");
    typingElement.classList.add("typing");
    typingElement.innerHTML = 'Minerva AI sedang mengetik <span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    chatWindow.appendChild(typingElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return typingElement;
}

// Fungsi untuk Mengambil Respons dari Gemini API
async function fetchGeminiResponse(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Tambahkan animasi typing
    const typingElement = addTypingAnimation();

    // Gabungkan riwayat dengan pesan baru
    const data = {
        contents: [...conversationHistory, { role: "user", parts: [{ text: userMessage }] }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Gagal konek ke API: " + response.status);
        }

        const result = await response.json();
        console.log('Respons dari API:', result);
        const answer = result.candidates[0].content.parts[0].text;

        // Hapus animasi typing
        chatWindow.removeChild(typingElement);

        // Tampilkan jawaban dari Gemini dengan animasi mengetik dan pemisahan kode
        await addMessageToChat("ai", answer);
    } catch (error) {
        console.error('Error:', error);
        chatWindow.removeChild(typingElement);
        addMessageToChat("ai", "Maaf, ada error: " + error.message);
    }
}

// Pesan Selamat Datang dan Animasi saat Halaman Dimuat
window.addEventListener("load", () => {
    addMessageToChat(
        "ai",
        "Say Hi to Minerva AI from Pandansari 🤙"
    );

    // Sembunyikan animasi pembuka setelah 3 detik
    setTimeout(() => {
      const openingAnimation = document.querySelector('.opening-animation');
      openingAnimation.addEventListener('animationend', () => {
          openingAnimation.style.display = 'none';
      });
    }, 3000);
});
