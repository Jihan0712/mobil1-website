document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Define the HTML for the chatbot
    const chatHTML = `
        <div class="chat-bot" id="chatToggleButton"></div>

        <div class="chat-window-wrapper" id="migsChatWindow">
            <div class="chat-header">
                <div class="chat-header-info">
                    <h4>Migs &middot; Mobil Drive Guide</h4>
                    <p>Online &middot; AI-assisted guidance</p>
                </div>
                <button class="chat-close-btn" id="chatCloseBtn">&#10005;</button>
            </div>

            <div class="chat-body" id="chatHistory">
                <div class="chat-bubble">
                    Hi, I'm Migs—your Mobil Drive Guide. Tell me about your vehicle and real driving conditions, and I'll help narrow the right Mobil oil.
                </div>
                <p class="chat-prompt">What would you like to do?</p>
                <div class="chat-options">
                    <button class="chat-option-btn">Find the right oil for my vehicle</button>
                    <button class="chat-option-btn">Compare Mobil products</button>
                    <button class="chat-option-btn">Understand my driving stress</button>
                    <button class="chat-option-btn">Find where to buy</button>
                </div>
                <p class="chat-disclaimer">
                    Recommendations are guidance only. Confirm viscosity and specifications in your vehicle owner's manual.
                </p>
            </div>

            <div class="chat-footer">
                <input type="text" class="chat-input" id="chatInput" placeholder="Ask Migs about your vehicle...">
                <button class="chat-send-btn" id="chatSendBtn">&#8594;</button>
            </div>
        </div>
    `;

    // 2. Inject the HTML into the bottom of the body
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 3. Set up the Chat Logic
    const chatWindow = document.getElementById('migsChatWindow');
    const chatToggleButton = document.getElementById('chatToggleButton');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatHistory = document.getElementById('chatHistory');

    // Toggle open/close
    function toggleChat() {
        chatWindow.classList.toggle('show');
    }
    chatToggleButton.addEventListener('click', toggleChat);
    chatCloseBtn.addEventListener('click', toggleChat);

    // Function to add a message bubble
    function addMessage(text, sender) {
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble');
        if (sender === 'user') bubble.classList.add('user-msg');
        bubble.textContent = text;
        chatHistory.appendChild(bubble);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll
    }

    // Handle sending messages
    chatSendBtn.addEventListener('click', function() {
        const userText = chatInput.value.trim();
        
        if (userText !== "") {
            addMessage(userText, 'user');
            chatInput.value = ''; // Clear input

            // Generate Bot Reply
            setTimeout(() => {
                let botReply = "I'm still learning! Right now, I recommend checking your vehicle owner's manual for the best Mobil oil match.";
                
                // Add your custom keyword triggers here!
                if (userText.toLowerCase().includes("honda")) {
                    botReply = "For most Honda vehicles, Mobil 1 Advanced Fuel Economy 0W-20 is a great choice!";
                } else if (userText.toLowerCase().includes("price")) {
                    botReply = "Prices vary depending on the retailer. You can check our 'Buy with confidence' section below!";
                }

                addMessage(botReply, 'bot');
            }, 1000);
        }
    });

    // Send on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') chatSendBtn.click();
    });
});