(() => {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const nav = document.querySelector("[data-nav]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  if (nav && menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  const pricingButtons = document.querySelectorAll("[data-pricing-toggle]");
  const pricingBlocks = document.querySelectorAll("[data-pricing]");
  if (pricingButtons.length && pricingBlocks.length) {
    pricingButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.getAttribute("data-pricing-toggle");
        pricingButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        pricingBlocks.forEach((block) => {
          if (block.getAttribute("data-pricing") === target) {
            block.style.display = "grid";
          } else {
            block.style.display = "none";
          }
        });
      });
    });
  }

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      showToast("Thanks. Our team will reply within one business day.");
      contactForm.reset();
    });
  }

  const messageField = document.querySelector("[data-contact-message]");
  if (messageField) {
    const transcript = localStorage.getItem("aumoChatTranscript");
    if (transcript) {
      try {
        const items = JSON.parse(transcript);
        if (Array.isArray(items) && items.length) {
          const lines = items.map((item) => `${item.from}: ${item.text}`);
          messageField.value = `Chat transcript:\n${lines.join("\n")}`;
        }
      } catch (error) {
        // Ignore parse errors
      }
    }
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  const chatbot = document.querySelector("[data-chatbot]");
  if (chatbot) {
    const toggle = chatbot.querySelector("[data-chat-toggle]");
    const closeBtn = chatbot.querySelector("[data-chat-close]");
    const messagesEl = chatbot.querySelector("[data-chat-messages]");
    const optionsEl = chatbot.querySelector("[data-chat-options]");
    const formEl = chatbot.querySelector("[data-chat-form]");
    const inputEl = chatbot.querySelector("[data-chat-input]");

    const flow = {
      greeting: {
        message: "Hi! I am AUMO.X assistant. How can I help you today?",
        options: [
          { label: "About our services", next: "services" },
          { label: "Show me products", next: "products" },
          { label: "Pricing", next: "pricing" },
          { label: "Talk to a human", action: "human" }
        ]
      },
      services: {
        message: "We deliver full-stack engineering, cloud modernization, and automation with enterprise-grade reliability.",
        options: [
          { label: "Web development", next: "service-web" },
          { label: "Mobile apps", next: "service-mobile" },
          { label: "AI and automation", next: "service-ai" },
          { label: "Back", next: "greeting" }
        ]
      },
      "service-web": {
        message: "Web platforms, portals, and internal tools built for speed, security, and scale.",
        options: [
          { label: "Get a quote", action: "human" },
          { label: "Back", next: "services" }
        ]
      },
      "service-mobile": {
        message: "Native and cross-platform apps with reliable offline-first architecture.",
        options: [
          { label: "Get a quote", action: "human" },
          { label: "Back", next: "services" }
        ]
      },
      "service-ai": {
        message: "Workflow automation, data pipelines, and intelligent systems with clear ROI.",
        options: [
          { label: "Get a quote", action: "human" },
          { label: "Back", next: "services" }
        ]
      },
      products: {
        message: "AUMO.X products help teams move faster with less risk.",
        options: [
          { label: "Aumo Nexus", action: "product-nexus" },
          { label: "Aumo Pulse", action: "product-pulse" },
          { label: "Aumo Atlas", action: "product-atlas" },
          { label: "Back", next: "greeting" }
        ]
      },
      pricing: {
        message: "Pricing is tailored to scope and scale. See the pricing page or request a custom plan.",
        options: [
          { label: "View pricing", action: "pricing" },
          { label: "Talk to sales", action: "human" },
          { label: "Back", next: "greeting" }
        ]
      }
    };

    const keywordReplies = [
      { match: ["price", "pricing", "cost"], reply: "Pricing is flexible based on scope. You can view tiers on the Pricing page." },
      { match: ["timeline", "delivery", "how long"], reply: "Most engagements start with a 2 week discovery, then launch in 6 to 12 weeks." },
      { match: ["security", "compliance"], reply: "We follow security-first delivery with access controls, audit trails, and secure-by-design reviews." },
      { match: ["contact", "call", "demo"], reply: "You can reach the team through the Contact page or book a discovery call." }
    ];

    let state = {
      open: false,
      messages: [],
      currentId: "greeting"
    };

    const savedState = localStorage.getItem("aumoChatState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        state = { ...state, ...parsed };
      } catch (error) {
        // Ignore parse errors
      }
    }

    function saveState() {
      localStorage.setItem("aumoChatState", JSON.stringify(state));
      localStorage.setItem("aumoChatTranscript", JSON.stringify(state.messages));
    }

    function renderMessages() {
      if (!messagesEl) return;
      messagesEl.innerHTML = "";
      state.messages.forEach((msg) => {
        const bubble = document.createElement("div");
        bubble.className = `chat-message ${msg.from}`;
        bubble.textContent = msg.text;
        messagesEl.appendChild(bubble);
      });
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setOptions(options = []) {
      if (!optionsEl) return;
      optionsEl.innerHTML = "";
      options.forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "chat-option";
        btn.textContent = option.label;
        btn.addEventListener("click", () => {
          if (option.next) {
            advance(option.next);
          } else if (option.action) {
            handleAction(option.action);
          }
        });
        optionsEl.appendChild(btn);
      });
    }

    function addMessage(from, text) {
      state.messages.push({ from, text });
      renderMessages();
      saveState();
    }

    function advance(id) {
      const node = flow[id];
      if (!node) return;
      state.currentId = id;
      addMessage("bot", node.message);
      setOptions(node.options || []);
    }

    function handleAction(action) {
      if (action === "human") {
        addMessage("bot", "Got it. I will connect you with our team.");
        saveState();
        window.location.href = "contact.html?from=chat";
        return;
      }

      if (action === "pricing") {
        window.location.href = "pricing.html";
        return;
      }

      if (action.startsWith("product-")) {
        window.location.href = `${action}.html`;
      }
    }

    function matchKeyword(text) {
      const lower = text.toLowerCase();
      const found = keywordReplies.find((item) => item.match.some((term) => lower.includes(term)));
      return found ? found.reply : null;
    }

    function ensureGreeting() {
      if (!state.messages.length) {
        const greeting = flow.greeting;
        state.currentId = "greeting";
        state.messages.push({ from: "bot", text: greeting.message });
        saveState();
      }
    }

    function openChat() {
      chatbot.classList.add("open");
      state.open = true;
      saveState();
      renderMessages();
      setOptions(flow[state.currentId]?.options || flow.greeting.options);
    }

    function closeChat() {
      chatbot.classList.remove("open");
      state.open = false;
      saveState();
    }

    if (toggle) {
      toggle.addEventListener("click", () => {
        ensureGreeting();
        if (chatbot.classList.contains("open")) {
          closeChat();
        } else {
          openChat();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeChat);
    }

    if (formEl && inputEl) {
      formEl.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = inputEl.value.trim();
        if (!text) return;
        addMessage("user", text);
        inputEl.value = "";

        const reply = matchKeyword(text);
        if (reply) {
          addMessage("bot", reply);
          setOptions(flow.greeting.options);
        } else {
          addMessage("bot", "Thanks for sharing. I will connect you with our team.");
          setOptions([
            { label: "Talk to a human", action: "human" },
            { label: "Back to menu", next: "greeting" }
          ]);
        }
      });
    }

    ensureGreeting();
    renderMessages();
    setOptions(flow[state.currentId]?.options || flow.greeting.options);

    if (state.open) {
      chatbot.classList.add("open");
    }
  }
})();
