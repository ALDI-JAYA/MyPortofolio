const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Reveal Animations
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);

revealElements.forEach((el) => revealObserver.observe(el));

// Navbar Active Link Tracking
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");
const navObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navItems.forEach((link) => {
                    link.classList.remove("current");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("current");
                    }
                });
            }
        });
    },
    { threshold: 0.4 }
);

sections.forEach((section) => navObserver.observe(section));

// Mobile Menu Toggle
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        navLinks.classList.toggle("nav-active");
        document.body.classList.toggle("no-scroll");
    });

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            menuToggle.classList.remove("active");
            navLinks.classList.remove("nav-active");
            document.body.classList.remove("no-scroll");
        });
    });
}

// Typewriter Function
function initTypewriter(id, delay = 0, speed = 50) {
    const el = document.getElementById(id);
    if (!el) return;
    const text = el.textContent;
    el.textContent = "";
    let i = 0;
    
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            el.classList.add("typing-done");
        }
    }
    setTimeout(type, delay);
}

// Initialize Typewriters
initTypewriter("typewriter", 1000, 40);
initTypewriter("name-typewriter", 2500, 100);

// AI Profile Click Animation
const photoWrap = document.querySelector(".hero-photo-wrap");
const profilePhoto = document.querySelector(".profile-photo");

if (profilePhoto && photoWrap) {
  profilePhoto.addEventListener("click", () => {
    photoWrap.classList.add("ai-burst-active");
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.className = "neural-particle";
      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      particle.style.setProperty("--tx", `${tx}px`);
      particle.style.setProperty("--ty", `${ty}px`);
      photoWrap.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
    setTimeout(() => {
      photoWrap.classList.remove("ai-burst-active");
    }, 1000);
  });
}

// Mouse Parallax Orbs
document.addEventListener("mousemove", (e) => {
    const orbs = document.querySelectorAll(".bg-orb");
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 30;
        const x = (window.innerWidth - mouseX * speed) / 100;
        const y = (window.innerHeight - mouseY * speed) / 100;
        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// AI Background Animation (Neural Network)
const canvas = document.getElementById("ai-canvas");
if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    const particleCount = window.innerWidth < 640 ? 40 : 80;
    const connectionDistance = 150;

    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(191, 148, 255, 0.5)";
        ctx.strokeStyle = "rgba(191, 148, 255, 0.2)";

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    ctx.beginPath();
                    ctx.lineWidth = 1 - dist / connectionDistance;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    window.addEventListener("resize", initCanvas);
    initCanvas();
    draw();
}

// Flask Contact Form Backend Integration
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "SENDING...";
        submitBtn.disabled = true;

        const selectedServices = [];
        contactForm.querySelectorAll('input[name="service"]:checked').forEach(cb => {
            selectedServices.push(cb.value);
        });

        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            message: document.getElementById("message").value,
            services: selectedServices
        };

        try {
            const response = await fetch("/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(result.message);
                contactForm.reset();
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            alert("Gagal menghubungi server. Pastikan Flask berjalan.");
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Terminal Logic
const terminalToggle = document.getElementById("terminal-toggle");
const terminalContainer = document.getElementById("terminal-container");
const terminalClose = document.getElementById("terminal-close");
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");

if (terminalToggle && terminalContainer) {
    terminalToggle.addEventListener("click", () => {
        terminalContainer.classList.toggle("active");
        if (terminalContainer.classList.contains("active")) {
            terminalInput.focus();
        }
    });

    terminalClose.addEventListener("click", () => {
        terminalContainer.classList.remove("active");
    });

    terminalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const command = terminalInput.value.toLowerCase().trim();
            handleCommand(command);
            terminalInput.value = "";
        }
    });
}

async function handleCommand(cmd) {
    const p = document.createElement("p");
    p.innerHTML = `<span class="prompt">atw:~$</span> ${cmd}`;
    terminalOutput.appendChild(p);

    const args = cmd.split(" ");
    const mainCmd = args[0];

    let response = "";
    
    if (mainCmd === "ask") {
        const question = args.slice(1).join(" ");
        if (!question) {
            response = "Usage: <span class='highlight'>ask [question]</span> (e.g., ask what is odoo?)";
        } else {
            const thinkingP = document.createElement("p");
            thinkingP.innerHTML = "<span class='highlight'>[AI IS THINKING...]</span>";
            terminalOutput.appendChild(thinkingP);
            
            try {
                const res = await fetch("/ai/query", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question: question })
                });
                const data = await res.json();
                thinkingP.remove(); // Hapus pesan thinking
                response = `<span class='success'>AI:</span> ${data.answer}`;
            } catch (err) {
                thinkingP.remove();
                response = "Error: System AI offline. Coba lagi nanti.";
            }
        }
    } else {
        switch (mainCmd) {
            case "help":
                response = "Available: <span class='highlight'>ask, whoami, skills, projects, contact, clear, date</span>";
                break;
            case "whoami":
                response = "Aldi Tri Wijaya - Odoo Developer & Python Enthusiast. Focusing on scalable business solutions.";
                break;
            case "skills":
                response = "Expertise: <span class='success'>Python, Odoo ERP, PostgreSQL, JavaScript, Linux</span>";
                break;
            case "projects":
                response = "Working on: ERP Modules, AI Chatbots, Mobile Apps, and Enterprise level automation.";
                break;
            case "contact":
                response = "Email: alditriwijaya64@gmail.com | WhatsApp: +62 85210857508";
                break;
            case "date":
                response = new Date().toString();
                break;
            case "clear":
                terminalOutput.innerHTML = "";
                return;
            case "":
                return;
            default:
                response = `Command not found: ${cmd}. Type <span class='highlight'>help</span> for list.`;
        }
    }

    const responseP = document.createElement("p");
    responseP.innerHTML = response;
    terminalOutput.appendChild(responseP);
    
    // Auto scroll to bottom
    const body = document.getElementById("terminal-body");
    body.scrollTop = body.scrollHeight;
}

// AI Chat Assistant Logic
const aiChatToggle = document.getElementById("ai-chat-toggle");
const aiChatWindow = document.getElementById("ai-chat-window");
const aiChatClose = document.getElementById("ai-chat-close");
const aiChatInput = document.getElementById("ai-chat-input");
const aiChatSend = document.getElementById("ai-chat-send");
const aiChatMessages = document.getElementById("ai-chat-messages");

if (aiChatToggle && aiChatWindow) {
    aiChatToggle.addEventListener("click", () => {
        aiChatWindow.classList.toggle("active");
        if (aiChatWindow.classList.contains("active")) {
            aiChatInput.focus();
        }
    });

    aiChatClose.addEventListener("click", () => {
        aiChatWindow.classList.remove("active");
    });

    aiChatSend.addEventListener("click", () => {
        sendAiMessage();
    });

    aiChatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendAiMessage();
        }
    });
}

async function sendAiMessage() {
    const text = aiChatInput.value.trim();
    if (!text) return;

    // Add User Message
    addChatMessage(text, 'user');
    aiChatInput.value = "";

    // Show Loading
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message bot";
    loadingDiv.innerHTML = "Thinking...";
    aiChatMessages.appendChild(loadingDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    try {
        const res = await fetch("/ai/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: text })
        });
        const data = await res.json();
        loadingDiv.remove();
        addChatMessage(data.answer, 'bot');
    } catch (err) {
        loadingDiv.innerHTML = "Error: Koneksi terputus.";
    }
}

function addChatMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.textContent = text;
    aiChatMessages.appendChild(div);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

// Project Modal Logic
const projectModal = document.getElementById("project-modal");
const modalClose = document.getElementById("modal-close");
const modalTriggers = document.querySelectorAll(".modal-trigger");

if (projectModal) {
    modalTriggers.forEach(trigger => {
        trigger.addEventListener("click", () => {
            const title = trigger.getAttribute("data-title");
            const desc = trigger.getAttribute("data-desc");
            const image = trigger.getAttribute("data-image");
            const link = trigger.getAttribute("data-link");
            const role = trigger.getAttribute("data-role");
            const tech = trigger.getAttribute("data-tech");
            const challenge = trigger.getAttribute("data-challenge");

            // Base Info
            document.getElementById("modal-title").textContent = title;
            document.getElementById("modal-desc").textContent = desc;
            document.getElementById("modal-image").src = image;
            document.getElementById("modal-role").textContent = role || "Developer";
            document.getElementById("modal-challenge").textContent = challenge || "No details provided.";
            
            const modalLink = document.getElementById("modal-link");
            if (modalLink) modalLink.href = link;

            // Generate Tech Pills
            const pillContainer = document.getElementById("modal-stack-pills");
            pillContainer.innerHTML = "";
            if (tech) {
                tech.split(",").forEach(t => {
                    const span = document.createElement("span");
                    span.className = "tech-pill";
                    span.textContent = t.trim();
                    pillContainer.appendChild(span);
                });
            }

            projectModal.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    });

    modalClose.addEventListener("click", () => {
        projectModal.classList.remove("active");
        document.body.style.overflow = "auto";
    });

    // Close on overlay click
    const overlay = document.querySelector(".modal-overlay");
    if (overlay) {
        overlay.addEventListener("click", () => {
            projectModal.classList.remove("active");
            document.body.style.overflow = "auto";
        });
    }
}

// Custom Cyber Cursor Logic
const dot = document.getElementById("cursor-dot");
const outline = document.getElementById("cursor-outline");

if (dot && outline) {
    // Scroll Reveal & Active Link Tracking
    function reveal() {
        const reveals = document.querySelectorAll(".reveal");
        const navLinks = document.querySelectorAll(".nav-links a");
        const sections = document.querySelectorAll("section");

        // Reveal animations
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const revealTop = el.getBoundingClientRect().top;
            const revealPoint = 150;

            if (revealTop < windowHeight - revealPoint) {
                el.classList.add("active");
            }
        });

        // Active Link Tracking
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("current");
            if (link.getAttribute("href").includes(current) && current !== "") {
                link.classList.add("current");
            }
        });

        // Header Background on Scroll
        const header = document.querySelector(".header");
        if (pageYOffset > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    // Smooth Scroll for all Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === "#") return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Offset calculation for sticky header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Close mobile menu if open
                const navLinks = document.getElementById("nav-links");
                if (navLinks && navLinks.classList.contains("active")) {
                    navLinks.classList.remove("active");
                }
            }
        });
    });

    window.addEventListener("scroll", reveal);
    window.addEventListener("load", reveal);

    window.addEventListener("mousemove", (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Follow movement
        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;

        outline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Interaction Hover Detection
    const updateInteractables = () => {
        const items = document.querySelectorAll("a, button, .btn, .modal-trigger, .ai-chat-toggle");
        items.forEach(el => {
            el.addEventListener("mouseenter", () => document.body.classList.add("hovered"));
            el.addEventListener("mouseleave", () => document.body.classList.remove("hovered"));
        });
    };
    updateInteractables();

    // 3D Tilt Effect for Project Cards
    const cards = document.querySelectorAll(".project-card");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Update shimmer position
            card.style.setProperty("--x", `${(x / rect.width) * 100}%`);
            card.style.setProperty("--y", `${(y / rect.height) * 100}%`);
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "rotateX(0deg) rotateY(0deg)";
        });
    });
}

// Text Scramble Effect Logic
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = "!<>-_\\/[]{}—=+*^?#________";
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => (this.resolve = resolve));
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || "";
            const to = newText[i] || "";
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = "";
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

function initScramble() {
    const scrambleElements = document.querySelectorAll(".scramble-text");
    scrambleElements.forEach(el => {
        const fx = new TextScramble(el);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fx.setText(el.getAttribute("data-value"));
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(el);
    });
}
initScramble();
