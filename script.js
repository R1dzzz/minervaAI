// DOM Elements
const themeSwitcher = document.getElementById("themeSwitch");
const chatWindow = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendBtn");
const clearButton = document.getElementById("clearChatBtn");
const examplesBtn = document.getElementById("examples-btn");
const settingsBtn = document.getElementById("settings-btn");
const examplesPanel = document.getElementById("examples-panel");
const settingsPanel = document.getElementById("settings-panel");
const closePanelButtons = document.querySelectorAll(".close-panel");
const exampleItems = document.querySelectorAll(".example-item");
const responseSpeedToggle = document.getElementById("responseSpeed");
const openingAnimation = document.querySelector(".opening-animation");

// Gemini API Key (GANTI SAMA API KEY ASLI LU)
const apiKey = "AIzaSyDggH4etveBGjV6m7OH52V9i1kZ5sTvq94"; // API KEY Gemini: "AIzaSyDggH4etveBGjV6m7OH52V9i1kZ5sTvq94"

// Array to store conversation history (formatted for Gemini API)
let conversationHistory = [];

// Theme state - start with dark mode
let isDarkTheme = true;

// Inisialisasi ikon tombol kirim
sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';

// Auto-resize textarea
userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
    
    // Enable/disable send button based on input
    if (this.value.trim()) {
        sendButton.disabled = false;
    } else {
        sendButton.disabled = true;
    }
});

// Initialize send button state
sendButton.disabled = true;

// Theme Switch Functionality
themeSwitcher.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    
    // Update DOM
    document.body.classList.toggle("dark", isDarkTheme);
    document.querySelector(".opening-animation").classList.toggle("dark", isDarkTheme);
    
    // Update theme switch icon
    themeSwitcher.innerHTML = isDarkTheme
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
});

// Send Message
sendButton.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (message) {
        addMessageToChat("user", message);
        userInput.value = "";
        userInput.style.height = "auto";
        sendButton.disabled = true;
        fetchGeminiResponse(message);
    }
});

// Send Message with Enter (but allow Shift+Enter for new line)
userInput.addEventListener("keydown", (e) => {
    // Pastiin cuma tombol Enter yang dicek
    if (e.key === "Enter") {
        // Kalo Enter tanpa Shift, kirim pesan
        if (!e.shiftKey && !sendButton.disabled) {
            e.preventDefault(); // Cegah default behavior Enter (newline)
            sendButton.click(); // Trigger kirim pesan
        }
        // Kalo Shift + Enter, biarin default behavior (newline)
    }
    // Abaikan tombol Shift atau tombol lain
});

// Clear Chat
clearButton.addEventListener("click", () => {
    chatWindow.innerHTML = "";
    conversationHistory = [];
    showWelcomeMessage();
});

// Side Panel Toggle
examplesBtn.addEventListener("click", () => {
    closeAllPanels();
    examplesPanel.classList.add("open");
    document.body.style.overflow = "hidden";
});

settingsBtn.addEventListener("click", () => {
    closeAllPanels();
    settingsPanel.classList.add("open");
    document.body.style.overflow = "hidden";
});

// Close Panel Buttons
closePanelButtons.forEach(button => {
    button.addEventListener("click", () => {
        closeAllPanels();
    });
});

// Close panels when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".side-panel") && 
        !e.target.closest("#examples-btn") && 
        !e.target.closest("#settings-btn")) {
        closeAllPanels();
    }
});

// Close all panels function
function closeAllPanels() {
    examplesPanel.classList.remove("open");
    settingsPanel.classList.remove("open");
    document.body.style.overflow = "auto";
}

// Handle example item clicks
exampleItems.forEach(item => {
    item.addEventListener("click", () => {
        const exampleText = item.querySelector("p").textContent.replace(/"/g, "");
        userInput.value = exampleText;
        userInput.dispatchEvent(new Event("input"));
        closeAllPanels();
        sendButton.click();
    });
});

// Fungsi untuk membersihkan tanda bintang dari teks
function cleanText(text) {
    return text.replace(/[*_]{1,2}/g, ''); // Hapus semua tanda bintang dan underscore (Markdown)
}

// Function to Add Message to Chat with Animation and Paragraphs
async function addMessageToChat(sender, message) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message", sender);
    chatWindow.appendChild(messageContainer);

    // Split message into paragraphs based on double line breaks
    const paragraphs = message.split(/\n\s*\n/);

    for (const paragraph of paragraphs) {
        const p = document.createElement("p");
        messageContainer.appendChild(p);

        // Split paragraph into text and code parts
        const parts = paragraph.split(/(```[\s\S]*?```)/);

        for (const part of parts) {
            if (part.startsWith('```') && part.endsWith('```')) {
                // Code block
                const code = part.slice(3, -3).trim();
                const codeBlock = document.createElement("pre");
                codeBlock.classList.add("code-block");
                
                const codeElement = document.createElement("code");
                codeElement.textContent = code;
                codeBlock.appendChild(codeElement);

                // Add copy button
                const copyBtn = document.createElement("button");
                copyBtn.classList.add("copy-btn");
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                copyBtn.addEventListener("click", () => {
                    navigator.clipboard.writeText(code).then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                        }, 2000);
                    });
                });
                
                codeBlock.appendChild(copyBtn);
                p.appendChild(codeBlock);
            } else if (part.trim()) {
                // Regular text, clean it
                const cleanedPart = cleanText(part);
                const words = cleanedPart.split(' ');

                for (const word of words) {
                    const wordSpan = document.createElement("span");
                    wordSpan.textContent = word + ' ';
                    p.appendChild(wordSpan);

                    if (sender === "ai") {
                        await new Promise(resolve => setTimeout(resolve, responseSpeedToggle.checked ? 50 : 20));
                    }
                }
            }
        }
    }

    // Scroll to the bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show AI is typing indicator
function showTypingIndicator() {
    const typingElement = document.createElement("div");
    typingElement.classList.add("typing");
    typingElement.id = "typing-indicator";
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        typingElement.appendChild(dot);
    }
    
    chatWindow.appendChild(typingElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    return typingElement;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Fetch response from Gemini API
async function fetchGeminiResponse(message) {
    try {
        // Add message to conversation history
        conversationHistory.push({ role: "user", parts: [{ text: message }] });
        
        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        
        // Create the request payload for Gemini API
        const payload = {
            contents: conversationHistory.map(item => ({
                role: item.role,
                parts: item.parts
            })),
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };
        
        // If there's conversation history, include more context (but limit to last few exchanges)
        if (conversationHistory.length > 6) {
            // Extract recent history (limited to last 6 messages = 3 exchanges)
            payload.contents = payload.contents.slice(-6);
        }
        
        try {
            // Call the Gemini API with the correct model
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Process the response
            if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                
                // Add AI response to conversation history
                conversationHistory.push({ 
                    role: "model", // Gemini API uses "model" instead of "assistant"
                    parts: [{ text: aiResponse }] 
                });
                
                // Display the response in the chat with cleaned text and paragraphs
                addMessageToChat("ai", aiResponse);
            } else {
                // Handle API error or empty response
                console.error("API response error:", data);
                
                // Check if there's a specific error message
                if (data.error) {
                    console.error("API error details:", data.error);
                    
                    // If it's a key error, provide a helpful message
                    if (data.error.message && data.error.message.includes("API key")) {
                        const keyErrorResponse = "I'm sorry, there seems to be an issue with the API key. Please check if the key is valid and has the necessary permissions.";
                        conversationHistory.push({ role: "model", parts: [{ text: keyErrorResponse }] });
                        addMessageToChat("ai", keyErrorResponse);
                        return;
                    }
                }
                
                // Provide a fallback response
                const fallbackResponse = "I'm sorry, I'm having trouble processing your request right now. Could you try asking in a different way?";
                conversationHistory.push({ role: "model", parts: [{ text: fallbackResponse }] });
                addMessageToChat("ai", fallbackResponse);
            }
        } catch (error) {
            // Handle network or other errors
            console.error("API request error:", error);
            removeTypingIndicator();
            
            const errorResponse = "I'm sorry, I encountered a network error. Please check your connection and try again.";
            conversationHistory.push({ role: "model", parts: [{ text: errorResponse }] });
            addMessageToChat("ai", errorResponse);
        }
    } catch (error) {
        console.error("General error:", error);
        removeTypingIndicator();
        addMessageToChat("ai", "I'm sorry, something went wrong. Please try again later.");
    }
}

// Show welcome message on page load
function showWelcomeMessage() {
    setTimeout(() => {
        addMessageToChat("ai", "Hello! I'm Minerva AI, your intelligent assistant. How can I help you today?");
    }, 300);
}

// Opening animation
document.addEventListener("DOMContentLoaded", () => {
    // Show opening animation
    setTimeout(() => {
        openingAnimation.style.opacity = "0";
        setTimeout(() => {
            openingAnimation.style.display = "none";
            showWelcomeMessage();
        }, 1000);
    }, 3000);
});
