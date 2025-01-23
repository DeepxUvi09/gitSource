const CONFIG = {
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  API_KEY: 'AIzaSyBOne70LWP0NqTyX2QrmtEfXh2BkQMkscU',
  MAX_CHARS: 2000
};

class Chat {
  constructor() {
    this.setupElements();
    this.setupListeners();
    this.loadAvatar();
  }

  setupElements() {
    this.chatBody = document.getElementById('chat-body');
    this.chatInput = document.getElementById('chat-input');
    this.sendButton = document.getElementById('send-button');
    this.welcomeMessage = document.getElementById('welcome-message');
  }

  setupListeners() {
    this.sendButton.addEventListener('click', () => this.handleFirstMessage());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleFirstMessage();
      }
    });
  }

  handleFirstMessage() {
    if (this.welcomeMessage) {
      this.welcomeMessage.classList.add('fade-out');
      setTimeout(() => {
        this.welcomeMessage.remove();
        this.sendMessage();
      }, 500);
    } else {
      this.sendMessage();
    }
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message || message.length > CONFIG.MAX_CHARS) return;

    this.addMessage('user', message);
    this.chatInput.value = '';

    try {
      const response = await this.getAIResponse(message);
      if (response) {
        this.addMessage('ai', response);
      } else {
        this.addMessage('ai', 'I apologize, but I could not generate a response at this time.');
      }
    } catch (error) {
      console.error('Error:', error);
      this.addMessage('ai', 'Sorry, I encountered an error. Please try again.');
    }
  }

  async getAIResponse(message) {
    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': CONFIG.API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = this.formatMessage(text);

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = sender === 'user' ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    this.chatBody.appendChild(messageDiv);
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  formatMessage(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  loadAvatar() {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      const avatarElement = document.querySelector('.avatar img');
      avatarElement.src = savedAvatar;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new Chat());
