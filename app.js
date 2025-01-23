const CONFIG = {
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  API_KEY: 'AIzaSyBOne70LWP0NqTyX2QrmtEfXh2BkQMkscU',
  MAX_CHARS: 2000
};

class Chat {
  constructor() {
    this.setupElements();
    this.setupListeners();
    this.loadTheme();
    this.loadAvatar();
  }

  setupElements() {
    this.chatBody = document.getElementById('chat-body');
    this.chatInput = document.getElementById('chat-input');
    this.sendButton = document.getElementById('send-button');
    this.themeToggle = document.getElementById('theme-toggle');
    this.promptChips = document.querySelectorAll('.prompt-chip');
    this.welcomeMessage = document.getElementById('welcome-message');
    this.clearButton = document.getElementById('clear-button');
    this.avatarUpload = document.getElementById('avatar-upload');
    this.avatarPreview = document.getElementById('avatar-preview');
  }

  setupListeners() {
    if (this.avatarUpload) {
      this.avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
    }

    this.sendButton.addEventListener('click', () => this.handleFirstMessage());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleFirstMessage();
      }
    });

    this.promptChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.chatInput.value = chip.textContent;
        this.handleFirstMessage();
      });
    });

    this.clearButton.addEventListener('click', () => this.clearChat());
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
  }

  handleFirstMessage() {
    if (this.welcomeMessage) {
      this.welcomeMessage.classList.add('fade-out');
      setTimeout(() => {
        this.welcomeMessage.remove();
        this.welcomeMessage = null;
        this.sendMessage();
      }, 500);
    } else {
      this.sendMessage();
    }
  }

  handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarData = e.target.result;
        localStorage.setItem('userAvatar', avatarData);
        this.updateAvatarPreview(avatarData);
      };
      reader.readAsDataURL(file);
    }
  }

  updateAvatarPreview(avatarData) {
    if (this.avatarPreview) {
      this.avatarPreview.innerHTML = `<img src="${avatarData}" alt="User Avatar">`;
    }
  }

  loadAvatar() {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      this.updateAvatarPreview(savedAvatar);
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
    
    if (sender === 'user') {
      const savedAvatar = localStorage.getItem('userAvatar');
      avatar.innerHTML = savedAvatar
        ? `<img src="${savedAvatar}" alt="User Avatar">`
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    } else {
      avatar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    }

    if (sender === 'user') {
      messageDiv.appendChild(content);
      messageDiv.appendChild(avatar);
    } else {
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(content);
    }

    this.chatBody.appendChild(messageDiv);
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  formatMessage(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```(\w+)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
      });
  }

  clearChat() {
    while (this.chatBody.firstChild) {
      this.chatBody.firstChild.remove();
    }

    const welcomeContainer = document.createElement('div');
    welcomeContainer.className = 'welcome-container';
    welcomeContainer.id = 'welcome-message';
    welcomeContainer.innerHTML = `
      <h1 class="welcome-text">Hello! I'm gitSource, your AI assistant.</h1>
      <p class="welcome-subtext">How can I help you today?</p>
    `;
    this.chatBody.appendChild(welcomeContainer);
    this.welcomeMessage = welcomeContainer;
  }

  toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', savedTheme === 'light');
  }
}

document.addEventListener('DOMContentLoaded', () => new Chat());
