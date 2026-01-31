"use strict";

// Configuration
const BACKEND_URL = "https://gemini-ai-chatbot-backend-a7yo.onrender.com";

// Auto-generated prompt suggestions
const PROMPT_SUGGESTIONS = [
  {
    icon: "lightbulb",
    text: "Explain quantum computing in simple terms",
    category: "Science",
  },
  {
    icon: "code",
    text: "Write a Python function to reverse a string",
    category: "Programming",
  },
  {
    icon: "create",
    text: "Write a short creative story about a robot learning emotions",
    category: "Creative",
  },
  {
    icon: "psychology",
    text: "What are the benefits of meditation for mental health?",
    category: "Health",
  },
  {
    icon: "trending_up",
    text: "Explain blockchain technology like I'm a beginner",
    category: "Technology",
  },
  {
    icon: "menu_book",
    text: "Summarize the key lessons from 'Atomic Habits'",
    category: "Books",
  },
  {
    icon: "calculate",
    text: "How do I calculate compound interest?",
    category: "Finance",
  },
  {
    icon: "travel_explore",
    text: "What are the must-visit places in Japan?",
    category: "Travel",
  },
];

// Welcome messages
const WELCOME_MESSAGES = [
  "Hello! I'm your AI assistant. How can I help you today?",
  "Hi there! I'm here to answer your questions and help with tasks.",
  "Welcome! Ask me anything - I'm ready to assist you.",
  "Hello! I'm excited to help you learn and explore new ideas.",
];

// State Management
let state = {
  isGenerating: false,
  currentRequest: null,
  conversation: [],
  lastMessageId: null,
};

// DOM Elements
const elements = {
  chatForm: document.getElementById("chat-form"),
  messageInput: document.getElementById("message-input"),
  chatContainer: document.getElementById("chat-container"),
  suggestions: document.getElementById("suggestions"),
  clearChat: document.getElementById("clear-chat"),
  themeToggle: document.getElementById("theme-toggle"),
  stopBtn: document.getElementById("stop-btn"),
  sendBtn: document.getElementById("send-btn"),
  regenerateBtn: document.getElementById("regenerate-btn"),
};

// Initialize
function init() {
  loadTheme();
  setupEventListeners();
  showWelcomeMessage();
  generateSuggestions();
  testBackendConnection();
}

// Theme Management
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light-theme", savedTheme === "light");
  elements.themeToggle.innerHTML =
    savedTheme === "light"
      ? '<span class="material-symbols-rounded">dark_mode</span>'
      : '<span class="material-symbols-rounded">light_mode</span>';
}

// Test backend connection
async function testBackendConnection() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      console.log("✅ Backend connected");
    } else {
      showSystemMessage("⚠️ Backend server error. Responses may be limited.");
    }
  } catch (error) {
    showSystemMessage(
      "❌ Cannot connect to backend server. Please make sure the backend is running.",
    );
    console.error("Backend connection error:", error);
  }
}

// Show welcome message
function showWelcomeMessage() {
  const welcomeMessage =
    WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];

  const welcomeDiv = document.createElement("div");
  welcomeDiv.className = "welcome-message";
  welcomeDiv.innerHTML = `
        <h2>Gemini AI Assistant</h2>
        <p>${welcomeMessage}</p>
        <div class="hint">Click any suggestion below or type your own message</div>
    `;

  elements.chatContainer.appendChild(welcomeDiv);
  scrollToBottom();
}

// Generate prompt suggestions
function generateSuggestions() {
  elements.suggestions.innerHTML = "";

  // Shuffle suggestions
  const shuffled = [...PROMPT_SUGGESTIONS].sort(() => Math.random() - 0.5);

  // Take first 4
  const selectedPrompts = shuffled.slice(0, 4);

  selectedPrompts.forEach((prompt) => {
    const suggestionDiv = document.createElement("div");
    suggestionDiv.className = "suggestion-item";
    suggestionDiv.innerHTML = `
            <span class="material-symbols-rounded icon">${prompt.icon}</span>
            <div class="text">${prompt.text}</div>
        `;

    suggestionDiv.addEventListener("click", () => {
      handleSuggestionClick(prompt.text);
    });

    elements.suggestions.appendChild(suggestionDiv);
  });
}

// Handle suggestion click
function handleSuggestionClick(text) {
  elements.messageInput.value = text;
  elements.messageInput.focus();
  setTimeout(() => {
    elements.chatForm.dispatchEvent(new Event("submit"));
  }, 100);
  elements.suggestions.remove();
}

// Show system message
function showSystemMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot-message";
  messageDiv.innerHTML = `
        <div class="bot-avatar">
            <span class="material-symbols-rounded">info</span>
        </div>
        <div class="message-content">${text}</div>
    `;

  elements.chatContainer.appendChild(messageDiv);
  scrollToBottom();
}

// Create message element
function createMessageElement(content, isUser = false, messageId = null) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
  if (messageId) {
    messageDiv.dataset.messageId = messageId;
  }

  if (isUser) {
    messageDiv.innerHTML = `
            <div class="message-content">${escapeHtml(content)}</div>
            <div class="message-actions">
                <button class="action-icon copy-btn" title="Copy message">
                    <span class="material-symbols-rounded">content_copy</span>
                </button>
            </div>
        `;
  } else {
    messageDiv.innerHTML = `
            <div class="bot-avatar">
                <span class="material-symbols-rounded">smart_toy</span>
            </div>
            <div class="message-content"></div>
            <div class="message-actions">
                <button class="action-icon copy-btn" title="Copy message">
                    <span class="material-symbols-rounded">content_copy</span>
                </button>
                <button class="action-icon regenerate-btn" title="Regenerate response">
                    <span class="material-symbols-rounded">refresh</span>
                </button>
            </div>
        `;
  }

  return messageDiv;
}

// Show typing indicator
function showTypingIndicator() {
  const messageId = "typing_" + Date.now();

  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot-message";
  typingDiv.dataset.messageId = messageId;
  typingDiv.innerHTML = `
        <div class="bot-avatar">
            <span class="material-symbols-rounded">smart_toy</span>
        </div>
        <div class="message-content">
            <span class="typing-indicator">Thinking</span>
            <span class="typing-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span>
        </div>
    `;

  elements.chatContainer.appendChild(typingDiv);
  scrollToBottom();

  return { div: typingDiv, id: messageId };
}


//format bot response
function formatBotResponse(text) {
  if (!text) return "";

  let formatted = text;

  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert *italic* to <em> (optional)
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Remove leftover stray asterisks
  formatted = formatted.replace(/\*/g, "");

  // Convert line breaks
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
}


// Type text with animation
function typeText(element, html, speed = 30) {
  return new Promise((resolve) => {
    let index = 0;
    element.innerHTML = "";

    function typeCharacter() {
      if (index < html.length) {
        // If we're at an HTML tag, insert it instantly
        if (html[index] === "<") {
          const tagEnd = html.indexOf(">", index);
          element.innerHTML += html.slice(index, tagEnd + 1);
          index = tagEnd + 1;
        } else {
          element.innerHTML += html[index];
          index++;
        }

        scrollToBottom();
        setTimeout(typeCharacter, speed);
      } else {
        resolve();
      }
    }

    typeCharacter();
  });
}

// Send message
async function sendMessage(messageText, regenerate = false) {
  if (state.isGenerating && !regenerate) return;

  // Remove welcome message on first user message
  if (elements.chatContainer.querySelector(".welcome-message")) {
    elements.chatContainer.querySelector(".welcome-message").remove();
  }

  // Hide suggestions while generating
  if (!regenerate) {
    elements.suggestions.style.opacity = "0.5";
    elements.suggestions.style.pointerEvents = "none";
  }

  state.isGenerating = true;
  document.body.classList.add("generating");

  // Create user message
  if (!regenerate) {
    const userMessageId = "user_" + Date.now();
    const userMessageDiv = createMessageElement(
      messageText,
      true,
      userMessageId,
    );
    elements.chatContainer.appendChild(userMessageDiv);

    // Add copy functionality
    const copyBtn = userMessageDiv.querySelector(".copy-btn");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(messageText).then(() => {
        copyBtn.innerHTML =
          '<span class="material-symbols-rounded">check</span>';
        setTimeout(() => {
          copyBtn.innerHTML =
            '<span class="material-symbols-rounded">content_copy</span>';
        }, 2000);
      });
    });

    state.conversation.push({
      id: userMessageId,
      role: "user",
      content: messageText,
    });

    state.lastMessageId = userMessageId;
  }

  // Clear input
  if (!regenerate) {
    elements.messageInput.value = "";
  }

  scrollToBottom();

  // Show typing indicator
  const typing = showTypingIndicator();

  try {
    // Prepare abort controller
    state.currentRequest = new AbortController();

    // Call backend API
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageText,
        conversation: state.conversation.slice(-5), // Send last 5 messages for context
      }),
      signal: state.currentRequest.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || "Unknown error");
    }

    // Remove typing indicator
    typing.div.remove();

    // Create bot message
    const botMessageId = "bot_" + Date.now();
    const botMessageDiv = createMessageElement("", false, botMessageId);
    elements.chatContainer.appendChild(botMessageDiv);

    const messageContent = botMessageDiv.querySelector(".message-content");

    // Type the response
   const formattedResponse = formatBotResponse(data.response);
   await typeText(messageContent, formattedResponse);

    // Store in conversation
    state.conversation.push({
      id: botMessageId,
      role: "assistant",
      content: data.response,
    });

    state.lastMessageId = botMessageId;

    // Add functionality to action buttons
    const copyBtn = botMessageDiv.querySelector(".copy-btn");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(data.response).then(() => {
        copyBtn.innerHTML =
          '<span class="material-symbols-rounded">check</span>';
        setTimeout(() => {
          copyBtn.innerHTML =
            '<span class="material-symbols-rounded">content_copy</span>';
        }, 2000);
      });
    });

    const regenerateBtn = botMessageDiv.querySelector(".regenerate-btn");
    regenerateBtn.addEventListener("click", () => {
      if (state.lastMessageId === botMessageId) {
        // Remove this message and regenerate
        botMessageDiv.remove();
        const userMessage = state.conversation.find(
          (m) => m.role === "user" && m.id === userMessageId,
        );
        if (userMessage) {
          sendMessage(userMessage.content, true);
        }
      }
    });
  } catch (error) {
    // Remove typing indicator
    if (typing.div.parentNode) {
      typing.div.remove();
    }

    // Show error message
    if (error.name !== "AbortError") {
      const errorMessage = error.message.includes("quota")
        ? "API quota exceeded. Please try again later."
        : `Error: ${error.message}`;

      showSystemMessage(errorMessage);
    }

    console.error("Chat error:", error);
  } finally {
    state.isGenerating = false;
    document.body.classList.remove("generating");
    state.currentRequest = null;

    // Restore suggestions
    elements.suggestions.style.opacity = "1";
    elements.suggestions.style.pointerEvents = "auto";

    scrollToBottom();
  }
}

// Stop generation
function stopGeneration() {
  if (state.currentRequest) {
    state.currentRequest.abort();
    state.currentRequest = null;
  }
  state.isGenerating = false;
  document.body.classList.remove("generating");

  // Restore suggestions
  elements.suggestions.style.opacity = "1";
  elements.suggestions.style.pointerEvents = "auto";

  // Remove any typing indicators
  const typingIndicators =
    elements.chatContainer.querySelectorAll(".typing-indicator");
  typingIndicators.forEach((indicator) => {
    const messageDiv = indicator.closest(".message");
    if (messageDiv) {
      messageDiv.remove();
    }
  });
}

// Regenerate last response
function regenerateLastResponse() {
  if (state.isGenerating || state.conversation.length === 0) return;

  // Find the last user message
  const lastUserMessage = [...state.conversation]
    .reverse()
    .find((msg) => msg.role === "user");

  if (lastUserMessage) {
    // Remove the last bot response if it exists
    const lastBotMessage = state.conversation
      .filter((msg) => msg.role === "assistant")
      .pop();

    if (lastBotMessage) {
      const botMessageDiv = elements.chatContainer.querySelector(
        `[data-message-id="${lastBotMessage.id}"]`,
      );
      if (botMessageDiv) {
        botMessageDiv.remove();
      }

      // Remove from conversation
      state.conversation = state.conversation.filter(
        (msg) => msg.id !== lastBotMessage.id,
      );
    }

    // Send the user message again
    sendMessage(lastUserMessage.content, true);
  }
}

// Clear chat
function clearChat() {
  if (state.isGenerating) {
    stopGeneration();
  }

  state.conversation = [];
  state.lastMessageId = null;

  // Clear chat container
  elements.chatContainer.innerHTML = "";

  // Show new welcome message
  showWelcomeMessage();

  // Regenerate suggestions
  generateSuggestions();

  // Focus input
  elements.messageInput.focus();
}

// Scroll to bottom
function scrollToBottom() {
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Setup event listeners
function setupEventListeners() {
  // Form submission
  elements.chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = elements.messageInput.value.trim();
    if (!message || state.isGenerating) return;

    await sendMessage(message);
  });

  // Clear chat
  elements.clearChat.addEventListener("click", clearChat);

  // Stop generation
  elements.stopBtn.addEventListener("click", stopGeneration);

  // Regenerate response
  elements.regenerateBtn.addEventListener("click", regenerateLastResponse);

  // Theme toggle
  elements.themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    elements.themeToggle.innerHTML = isLight
      ? '<span class="material-symbols-rounded">dark_mode</span>'
      : '<span class="material-symbols-rounded">light_mode</span>';
  });

  // Keyboard shortcuts
  elements.messageInput.addEventListener("keydown", (e) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      elements.chatForm.dispatchEvent(new Event("submit"));
    }

    // Stop on Escape
    if (e.key === "Escape" && state.isGenerating) {
      stopGeneration();
    }

    // Clear chat with Ctrl+K
    if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      clearChat();
    }
  });

  // Auto-resize textarea (if using textarea)
  elements.messageInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });

  // Focus input on page load
  elements.messageInput.focus();
}

// Start the application
window.addEventListener("DOMContentLoaded", init);
