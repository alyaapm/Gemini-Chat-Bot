const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Array local state untuk merekam histori chat agar bot mengingat konteks pembicaraan
let conversationHistory = [];

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll ke pesan paling baru
    return msgDiv;
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // 1. Render pesan user di chat box UI
    appendMessage('user', userMessage);
    input.value = '';

    // Simpan pesan user ke dalam array riwayat percakapan
    conversationHistory.push({ role: 'user', text: userMessage });

    // 2. Tampilkan pesan loading placeholder "Thinking..." secara temporer
    const thinkingMessage = appendMessage('bot', 'Gemini is thinking...');

    try {
        // 3. Lakukan request POST fetch ke endpoint API backend /api/chat
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ conversation: conversationHistory })
        });

        const data = await response.json();

        // Singkirkan teks loading "Thinking..." setelah respons datang
        thinkingMessage.remove();

        if (data.result) {
            // 4. Render hasil jawaban AI dinamis dari server
            appendMessage('bot', data.result);
            // Masukkan balasan model AI ke dalam riwayat percakapan
            conversationHistory.push({ role: 'model', text: data.result });
        } else {
            appendMessage('bot', 'Sorry, no response received.');
        }

    } catch (error) {
        console.error('Error saat berkomunikasi dengan API:', error);
        thinkingMessage.remove();
        appendMessage('bot', 'Failed to get response from server.');
    }
});