import './style.css'

// Global tsParticles Configuration 
window.addEventListener('load', async () => {
  if (typeof tsParticles !== 'undefined') {
    await tsParticles.load("tsparticles", {
      fullScreen: { enable: true, zIndex: 0 },
      fpsLimit: 120,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: ["grab", "bubble", "attract"], // Integrated Smart Interaction
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 180,
            links: {
              opacity: 0.2, // Faint and professional
              color: "#10b981"
            }
          },
          bubble: {
            distance: 180,
            size: 2.5,
            duration: 0.4,
            opacity: 1,
            color: "#10b981"
          },
          attract: {
            distance: 180,
            duration: 0.4,
            factor: 5 // Smooth liquid nudge
          }
        },
      },
      particles: {
        color: { value: "#10b981" },
        links: {
          enable: true,
          color: "#10b981",
          distance: 150,
          opacity: 0.15,
          width: 0.5,
        },
        move: {
          enable: true,
          speed: 0.6, // Perfect Background Drift
          parallax: {
            enable: true,
            force: 80,
            smooth: 10
          }
        },
        number: {
          density: { enable: true, area: 1000 },
          value: 180, // Rich high-end density
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
        },
        shape: { type: "square" }, 
        size: { value: 1.5 },
      },
      detectRetina: true,
    });
  }
});

// Cursor & Spotlight Tracking
const cursorDot = document.getElementById('cursor-dot');
const spotlight = document.getElementById('mouse-spotlight');

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  if (cursorDot) {
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  }

  if (spotlight) {
    spotlight.style.opacity = "1";
    spotlight.style.left = `${mouseX}px`;
    spotlight.style.top = `${mouseY}px`;
  }
});

// Hover states & Magnetic Buttons
const updateHoverEvents = () => {
  const targets = document.querySelectorAll('a, button, input, textarea, .card-clean');
  
  targets.forEach(el => {
    // Magnetic pull effect for buttons
    if(el.tagName === 'BUTTON' || el.classList.contains('btn')) {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        el.style.transition = 'transform 0.1s ease-out';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = `translate(0px, 0px)`;
        el.style.transition = 'transform 0.3s ease-in-out';
      });
    }
  });
};
updateHoverEvents();

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// =====================================================
// AI CHATBOT LOGIC
// =====================================================
const initChatbot = () => {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('close-chat');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  let isOpen = false;

  const toggleChat = () => {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.remove('hidden');
      // small delay to allow display:block to apply before animating opacity/transform
      setTimeout(() => {
        chatWindow.classList.remove('scale-95', 'opacity-0');
        chatWindow.classList.add('scale-100', 'opacity-100', 'flex');
        chatInput.focus();
      }, 10);
    } else {
      chatWindow.classList.remove('scale-100', 'opacity-100');
      chatWindow.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        chatWindow.classList.add('hidden');
        chatWindow.classList.remove('flex');
      }, 300);
    }
  };

  toggleBtn?.addEventListener('click', toggleChat);
  closeBtn?.addEventListener('click', toggleChat);

  const appendUserMessage = (text) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-3 justify-end';
    msgDiv.innerHTML = `
      <div class="bg-cyber-green text-black rounded-2xl rounded-tr-sm p-3 text-sm shadow-[0_0_10px_rgba(16,185,129,0.2)] inline-block max-w-[85%]">
        ${text}
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const appendTypingIndicator = () => {
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = 'flex gap-3';
    msgDiv.innerHTML = `
      <div class="w-6 h-6 rounded-full border border-cyber-green flex-shrink-0 flex items-center justify-center bg-black/50 text-[10px] text-cyber-green font-bold mt-1">AI</div>
      <div class="bg-black/50 border border-cyber-green/20 rounded-2xl rounded-tl-sm p-3 text-sm flex gap-1 items-center shadow-lg">
        <span class="w-2 h-2 bg-cyber-green rounded-full animate-bounce" style="animation-delay: 0s"></span>
        <span class="w-2 h-2 bg-cyber-green rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
        <span class="w-2 h-2 bg-cyber-green rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
  };

  const appendAIMessage = (text, typingId) => {
    const typingIndicator = document.getElementById(typingId);
    if (typingIndicator) typingIndicator.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-3';
    msgDiv.innerHTML = `
      <div class="w-6 h-6 rounded-full border border-cyber-green flex-shrink-0 flex items-center justify-center bg-black/50 text-[10px] text-cyber-green font-bold mt-1">AI</div>
      <div class="bg-black/50 border border-cyber-green/20 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-300 shadow-lg inline-block max-w-[85%]">
        ${text}
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const getAIResponse = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('skill') || lower.includes('technology') || lower.includes('stack')) {
      return "Sakib specializes in the MERN stack. His core skills include React, Next.js, Node.js, Express, MongoDB, Tailwind CSS, and TypeScript. He is also experienced with Docker and AWS!";
    }
    if (lower.includes('project') || lower.includes('portfolio') || lower.includes('work')) {
      return "Sakib has built several impressive projects including KeenKeeper (Productivity App), DigiTools, TechWave (E-commerce), and GitHub Issues Tracker. You can check them out in the Projects section above!";
    }
    if (lower.includes('experience') || lower.includes('job') || lower.includes('work')) {
      return "He is currently a Senior Web Developer at Tech Solutions Inc., where he leads the frontend team, optimizes performance, and implements secure API integrations.";
    }
    if (lower.includes('contact') || lower.includes('email') || lower.includes('hire')) {
      return "You can reach out to Sakib via email at <a href='mailto:contact@sakib.me' class='text-cyber-green underline'>contact@sakib.me</a>, or connect with him on LinkedIn!";
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Hello! I am Sakib's virtual assistant. Ask me anything about his skills, experience, or projects!";
    }
    return "That's an interesting question! For specific details, it's best to contact Sakib directly at <a href='mailto:contact@sakib.me' class='text-cyber-green underline'>contact@sakib.me</a>.";
  };

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    appendUserMessage(text);
    
    // Simulate thinking delay
    const typingId = appendTypingIndicator();
    setTimeout(() => {
      const response = getAIResponse(text);
      appendAIMessage(response, typingId);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  });
};

initChatbot();
