(() => {
  const seasonCanvas = document.getElementById("season-canvas");
  const seasonLabel = document.getElementById("season-label");

  if (!seasonCanvas || !seasonLabel) {
    return;
  }

  const context = seasonCanvas.getContext("2d");

  if (!context) {
    return;
  }

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const seasonConfig = {
    winter: { label: "Qish · qor", count: 82 },
    spring: { label: "Bahor · yomg‘ir va gullar", count: 66 },
    summer: { label: "Yoz · quyosh zarralari", count: 48 },
    autumn: { label: "Kuz · barglar", count: 44 }
  };
  const petalColors = ["#f9a8d4", "#fbcfe8", "#fda4af", "#ddd6fe"];
  const leafColors = ["#fb923c", "#f97316", "#facc15", "#dc2626", "#f59e0b"];
  let currentSeason = "";
  let viewportWidth = 0;
  let viewportHeight = 0;
  let particles = [];
  let animationFrame = 0;
  let lastFrameTime = 0;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function getSeason(date = new Date()) {
    const month = date.getMonth();

    if (month <= 1 || month >= 10) {
      return "winter";
    }

    if (month <= 4) {
      return "spring";
    }

    if (month <= 7) {
      return "summer";
    }

    return "autumn";
  }

  function createParticle(fromEdge = false) {
    const particle = {
      x: random(0, viewportWidth),
      y: fromEdge ? -20 : random(-20, viewportHeight),
      phase: random(0, Math.PI * 2),
      rotation: random(0, Math.PI * 2),
      spin: random(-0.025, 0.025),
      opacity: random(0.28, 0.68)
    };

    if (currentSeason === "winter") {
      return {
        ...particle,
        radius: random(0.8, 2.6),
        speed: random(0.35, 1.05),
        drift: random(-0.28, 0.28)
      };
    }

    if (currentSeason === "spring") {
      const isRain = Math.random() < 0.24;

      return {
        ...particle,
        kind: isRain ? "rain" : "petal",
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        size: isRain ? random(10, 18) : random(3, 6),
        speed: isRain ? random(7, 12) : random(0.45, 1.1),
        drift: isRain ? random(-1.8, -1.2) : random(0.15, 0.65),
        spin: isRain ? 0 : random(-0.035, 0.035)
      };
    }

    if (currentSeason === "summer") {
      return {
        ...particle,
        y: fromEdge ? viewportHeight + 20 : random(0, viewportHeight),
        size: random(0.9, 2.2),
        speed: random(0.12, 0.42),
        drift: random(-0.18, 0.18),
        sparkle: Math.random() < 0.22
      };
    }

    return {
      ...particle,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      size: random(4.5, 8),
      speed: random(0.4, 1.05),
      drift: random(0.2, 0.8)
    };
  }

  function updateParticle(particle, delta, time) {
    particle.phase += 0.012 * delta;

    if (currentSeason === "winter") {
      particle.y += particle.speed * delta;
      particle.x += (particle.drift + Math.sin(particle.phase + particle.y * 0.012) * 0.32) * delta;
    } else if (currentSeason === "spring") {
      particle.y += particle.speed * delta;

      if (particle.kind === "rain") {
        particle.x += particle.drift * delta;
      } else {
        particle.x += (particle.drift + Math.sin(particle.phase) * 0.38) * delta;
        particle.rotation += particle.spin * delta;
      }
    } else if (currentSeason === "summer") {
      particle.y -= particle.speed * delta;
      particle.x += (particle.drift + Math.sin(particle.phase + time * 0.0004) * 0.12) * delta;
    } else {
      particle.y += particle.speed * delta;
      particle.x += (particle.drift + Math.sin(particle.phase) * 0.48) * delta;
      particle.rotation += particle.spin * delta;
    }

    const isSummer = currentSeason === "summer";
    const isOutside = particle.y > viewportHeight + 30 ||
      (isSummer && particle.y < -30) ||
      particle.x > viewportWidth + 40 ||
      particle.x < -40;

    return isOutside;
  }

  function drawPetal(particle) {
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = particle.opacity;
    context.fillStyle = particle.color;
    context.beginPath();
    context.moveTo(-particle.size, 0);
    context.bezierCurveTo(-particle.size * 0.45, -particle.size, particle.size * 0.65, -particle.size * 0.75, particle.size, 0);
    context.bezierCurveTo(particle.size * 0.4, particle.size * 0.8, -particle.size * 0.55, particle.size, -particle.size, 0);
    context.fill();
  }

  function drawLeaf(particle) {
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = particle.opacity;
    context.fillStyle = particle.color;
    context.beginPath();
    context.moveTo(-particle.size, 0);
    context.bezierCurveTo(-particle.size * 0.45, -particle.size * 0.8, particle.size * 0.65, -particle.size * 0.65, particle.size, 0);
    context.bezierCurveTo(particle.size * 0.35, particle.size * 0.75, -particle.size * 0.6, particle.size * 0.65, -particle.size, 0);
    context.fill();
    context.strokeStyle = "rgba(255, 237, 213, 0.45)";
    context.lineWidth = 0.65;
    context.beginPath();
    context.moveTo(-particle.size * 0.8, 0);
    context.lineTo(particle.size * 0.8, 0);
    context.stroke();
  }

  function drawParticle(particle, time) {
    context.save();

    if (currentSeason === "winter") {
      context.globalAlpha = particle.opacity;
      context.fillStyle = "#e0f2fe";
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    } else if (currentSeason === "spring") {
      if (particle.kind === "rain") {
        context.globalAlpha = particle.opacity * 0.65;
        context.strokeStyle = "#7dd3fc";
        context.lineWidth = 0.8;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(particle.x - 1.5, particle.y + particle.size);
        context.stroke();
      } else {
        drawPetal(particle);
      }
    } else if (currentSeason === "summer") {
      context.globalAlpha = particle.opacity * (0.78 + Math.sin(time * 0.0015 + particle.phase) * 0.22);
      context.fillStyle = "#fde68a";
      context.shadowColor = "#fbbf24";
      context.shadowBlur = particle.sparkle ? 10 : 6;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      if (particle.sparkle) {
        context.strokeStyle = "#fef3c7";
        context.lineWidth = 0.65;
        context.beginPath();
        context.moveTo(particle.x - particle.size * 2.4, particle.y);
        context.lineTo(particle.x + particle.size * 2.4, particle.y);
        context.moveTo(particle.x, particle.y - particle.size * 2.4);
        context.lineTo(particle.x, particle.y + particle.size * 2.4);
        context.stroke();
      }
    } else {
      drawLeaf(particle);
    }

    context.restore();
  }

  function drawScene(update, delta = 1, time = performance.now()) {
    context.clearRect(0, 0, viewportWidth, viewportHeight);

    particles.forEach((particle, index) => {
      const isOutside = update && updateParticle(particle, delta, time);

      if (isOutside) {
        particles[index] = createParticle(true);
      }

      drawParticle(particles[index], time);
    });
  }

  function animate(time) {
    animationFrame = 0;

    if (document.hidden || motionPreference.matches) {
      return;
    }

    const delta = Math.min(Math.max((time - lastFrameTime) / 16.67, 0.1), 2);
    lastFrameTime = time;
    drawScene(true, delta, time);
    animationFrame = requestAnimationFrame(animate);
  }

  function restartAnimation() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;

    if (document.hidden || motionPreference.matches) {
      context.clearRect(0, 0, viewportWidth, viewportHeight);
      return;
    }

    lastFrameTime = performance.now();
    animationFrame = requestAnimationFrame(animate);
  }

  function resizeCanvas() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const density = viewportWidth < 520 ? 0.5 : viewportWidth < 900 ? 0.75 : 1;
    const count = Math.round(seasonConfig[currentSeason].count * density);

    seasonCanvas.width = Math.round(viewportWidth * pixelRatio);
    seasonCanvas.height = Math.round(viewportHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = Array.from({ length: count }, () => createParticle());
    drawScene(false);
    restartAnimation();
  }

  function applySeason() {
    const season = getSeason();

    if (season === currentSeason) {
      return;
    }

    currentSeason = season;
    document.body.dataset.season = season;
    seasonLabel.textContent = seasonConfig[season].label;
    seasonLabel.title = `${seasonConfig[season].label} — joriy sana bo‘yicha`;
    resizeCanvas();
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", restartAnimation);

  if (typeof motionPreference.addEventListener === "function") {
    motionPreference.addEventListener("change", restartAnimation);
  }

  applySeason();
})();

const checkboxes = document.querySelectorAll(".security-check");
const progressBar = document.getElementById("progress");
const progressText = document.getElementById("progress-text");
const feedback = document.getElementById("feedback");
const resetButton = document.getElementById("reset-check");

const terminalForm = document.getElementById("terminal-form");
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");

const terminalCommands = {
  help: [
    "Mavjud buyruqlar:",
    "help      — buyruqlar ro‘yxati",
    "status    — sayt holati",
    "2fa       — ikki bosqichli autentifikatsiya haqida",
    "phishing  — phishing belgilari",
    "parol     — kuchli parol qoidalari",
    "whoami    — foydalanuvchi haqida",
    "clear     — terminal ekranini tozalash"
  ].join("\n"),
  status: [
    "[OK] Xavfsiz Internet tizimi ishlayapti.",
    "O‘quv darajalari: 3",
    "Test savollari: 6",
    "Interaktiv vositalar: 4",
    "Shaxsiy ma’lumotlar yuborilmaydi."
  ].join("\n"),
  "2fa": [
    "Ikki bosqichli autentifikatsiya (2FA):",
    "1. Hisob sozlamalariga kiring.",
    "2. Security yoki Two-factor authentication bo‘limini toping.",
    "3. Authenticator ilovani ulang.",
    "4. Zaxira kodlarni xavfsiz saqlang."
  ].join("\n"),
  phishing: [
    "Phishing belgilari:",
    "• Shoshilinch yoki qo‘rqituvchi matn",
    "• Kutilmagan jo‘natuvchi manzili",
    "• Boshqa domenga o‘tadigan havola",
    "• Parol yoki karta ma’lumotlarini so‘rash",
    "Ishonchsiz bo‘lsa, havolani bosing emas, rasmiy sayt orqali tekshiring."
  ].join("\n"),
  parol: [
    "Kuchli parol qoidalari:",
    "• Kamida 12 ta belgidan foydalaning.",
    "• Har bir hisobda alohida parol yarating.",
    "• Parol menejeri ishlating.",
    "• Bir xil parolni qayta ishlatmang."
  ].join("\n"),
  whoami: [
    "Siz — Xavfsiz Internet mehmonisiz.",
    "Hisob yoki shaxsiy ma’lumot talab qilinmaydi."
  ].join("\n")
};

const quizQuestions = [
  {
    question: "Bir xil parolni bir necha hisobda ishlatish xavfsizmi?",
    options: [
      "Ha, barcha hisoblar uchun bitta parol qulay",
      "Yo‘q, har bir hisobda alohida parol ishlatish kerak",
      "Faqat ijtimoiy tarmoqlarda bir xil bo‘lishi mumkin"
    ],
    correct: 1,
    explanation: "Bitta parol oshkor bo‘lsa, uning ishlatilgan barcha hisoblar xavf ostiga tushadi."
  },
  {
    question: "2FA hisobingizni qanday himoyalaydi?",
    options: [
      "Internet tezligini oshiradi",
      "Parol oshkor bo‘lsa ham qo‘shimcha tasdiq qatlami qo‘shadi",
      "Barcha xabarlarni avtomatik o‘chiradi"
    ],
    correct: 1,
    explanation: "2FA paroldan tashqari yana bir tasdiq talab qiladi va kirishni xavfsizroq qiladi."
  },
  {
    question: "Phishing xabarida avvalo nimalarga e’tibor berish kerak?",
    options: [
      "Faqat xabar rangiga",
      "Faqat yozuv shriftiga",
      "Jo‘natuvchi, havola domeni va shoshilinch matnga"
    ],
    correct: 2,
    explanation: "Soxta xabarlar ko‘pincha shoshilinch, qo‘rqituvchi yoki g‘aliz ko‘rinadigan bo‘ladi."
  },
  {
    question: "Ilova va operatsion tizim yangilanishlari nega muhim?",
    options: [
      "Ma’lumotlar xavfsizligi kamchiliklari yopiladi",
      "Faqat dizayn o‘zgaradi",
      "Parol avtomatik yaxshi bo‘ladi"
    ],
    correct: 0,
    explanation: "Yangilanishlar xavfsizlik bo‘yicha aniqlangan zaifliklarni tuzatishga yordam beradi."
  },
  {
    question: "Muhim fayllaringiz uchun eng yaxshi yondashuv qaysi?",
    options: [
      "Faqat bitta qurilmada saqlash",
      "Muntazam zaxira olish va tiklashni sinash",
      "Fayllarni ochiq havolada saqlash"
    ],
    correct: 1,
    explanation: "Zaxira nusxa faqat saqlab qo‘yish emas, uni vaqtiga vaqtida tiklab ko‘rish ham muhim."
  },
  {
    question: "Foydalanuvchiga faqat vazifasi uchun kerakli ruxsatlarni berish printsipi qanday nomlanadi?",
    options: [
      "To‘liq administrator",
      "Ochiq kirish",
      "Eng kam huquq"
    ],
    correct: 2,
    explanation: "Eng kam huquq printsipi zarar ko‘lamini kamaytiradi va ortiqcha huquqlarni oldini oladi."
  }
];

const quizForm = document.getElementById("quiz-form");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizSubmit = document.getElementById("quiz-submit");
const quizNext = document.getElementById("quiz-next");
const quizStep = document.getElementById("quiz-step");
const quizScoreText = document.getElementById("quiz-score");
const quizProgress = document.getElementById("quiz-progress");
const quizResult = document.getElementById("quiz-result");
const quizResultTitle = document.getElementById("quiz-result-title");
const quizResultText = document.getElementById("quiz-result-text");
const quizResultScore = document.getElementById("quiz-result-score");
const quizReset = document.getElementById("quiz-reset");

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function renderQuizQuestion() {
  const currentQuestion = quizQuestions[quizIndex];
  quizAnswered = false;
  quizForm.reset();
  quizOptions.replaceChildren();
  quizFeedback.textContent = "";
  quizFeedback.className = "quiz-feedback";
  quizSubmit.hidden = false;
  quizNext.hidden = true;
  quizStep.textContent = `${String(quizIndex + 1).padStart(2, "0")} / ${String(quizQuestions.length).padStart(2, "0")}`;
  quizScoreText.textContent = `${quizScore} ball`;
  quizProgress.value = quizIndex + 1;
  quizQuestion.textContent = currentQuestion.question;

  currentQuestion.options.forEach((option, index) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    const text = document.createElement("span");

    input.type = "radio";
    input.name = "answer";
    input.value = String(index);
    text.textContent = option;
    label.appendChild(input);
    label.appendChild(text);
    quizOptions.appendChild(label);
  });
}

function showQuizResult() {
  const total = quizQuestions.length;
  const percentage = Math.round((quizScore / total) * 100);
  let level;

  if (quizScore >= 5) {
    level = {
      title: "Ilg‘or daraja",
      text: "Tizimli fikrlaysiz. Keyingi qadam — loglarni tushunish va hodisa rejasini mustahkamlash."
    };
  } else if (quizScore >= 3) {
    level = {
      title: "O‘rta daraja",
      text: "Asoslaringiz yaxshi. Phishing, zaxira nusxalar va 2FA mavzularini davom ettiring."
    };
  } else {
    level = {
      title: "Boshlang‘ich daraja",
      text: "O‘quv yo‘lining 1-darajasidan boshlang va testni qayta urinib ko‘ring."
    };
  }

  quizForm.hidden = true;
  quizResult.hidden = false;
  quizStep.textContent = `${String(total).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  quizProgress.value = total;
  quizResultTitle.textContent = level.title;
  quizResultText.textContent = level.text;
  quizResultScore.textContent = `${quizScore} / ${total} · ${percentage}%`;
}

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (quizAnswered) {
    return;
  }

  const selected = quizForm.querySelector('input[name="answer"]:checked');

  if (!selected) {
    quizFeedback.textContent = "Davom etish uchun bir javob tanlang.";
    quizFeedback.className = "quiz-feedback error";
    return;
  }

  quizAnswered = true;
  const currentQuestion = quizQuestions[quizIndex];
  const isCorrect = Number(selected.value) === currentQuestion.correct;

  if (isCorrect) {
    quizScore += 1;
    quizFeedback.textContent = `To‘g‘ri! ${currentQuestion.explanation}`;
    quizFeedback.className = "quiz-feedback success";
  } else {
    quizFeedback.textContent = `Noto‘g‘ri. To‘g‘ri javob: ${currentQuestion.options[currentQuestion.correct]}. ${currentQuestion.explanation}`;
    quizFeedback.className = "quiz-feedback error";
  }

  quizScoreText.textContent = `${quizScore} ball`;
  quizOptions.querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });
  quizSubmit.hidden = true;
  quizNext.hidden = false;
  quizNext.textContent = quizIndex === quizQuestions.length - 1 ? "Natijani ko‘rish" : "Keyingi savol";
});

quizNext.addEventListener("click", () => {
  if (quizIndex === quizQuestions.length - 1) {
    showQuizResult();
    return;
  }

  quizIndex += 1;
  renderQuizQuestion();
});

quizReset.addEventListener("click", () => {
  quizIndex = 0;
  quizScore = 0;
  quizResult.hidden = true;
  quizForm.hidden = false;
  renderQuizQuestion();
});

const passwordInput = document.getElementById("password-input");
const passwordToggle = document.getElementById("password-toggle");
const passwordClear = document.getElementById("password-clear");
const passwordStrength = document.getElementById("password-strength");
const passwordStrengthLabel = document.getElementById("password-strength-label");
const passwordLength = document.getElementById("password-length");
const passwordFeedback = document.getElementById("password-feedback");
const passwordSegments = passwordStrength.querySelectorAll("span");
const passwordRuleElements = {
  length: document.getElementById("rule-length"),
  letters: document.getElementById("rule-letters"),
  number: document.getElementById("rule-number"),
  symbol: document.getElementById("rule-symbol")
};
const commonPasswords = new Set([
  "123456", "12345678", "123456789", "1234567890", "password", "password123",
  "parol", "parol123", "qwerty", "qwerty123", "admin", "admin123", "welcome",
  "iloveyou", "salom123", "uzbekistan", "ozbekiston"
]);
const strengthLevels = [
  { label: "Juda zaif", level: "weak" },
  { label: "Zaif", level: "weak" },
  { label: "O‘rta", level: "fair" },
  { label: "Yaxshi", level: "good" },
  { label: "Kuchli", level: "strong" }
];

function assessPassword(value) {
  const requirements = {
    length: value.length >= 12,
    letters: /[a-z]/.test(value) && /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9\s]/.test(value)
  };
  let score = Object.values(requirements).filter(Boolean).length;
  const normalized = value.toLowerCase();
  const isCommon = commonPasswords.has(normalized);
  const hasPattern = /(.)\1{3,}/.test(value) ||
    /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf|zxcv)/i.test(value);

  if (isCommon) {
    score = Math.min(score, 1);
  } else if (value.length < 8) {
    score = Math.min(score, 1);
  } else if (hasPattern) {
    score = Math.min(score, 2);
  }

  return { score, requirements, isCommon };
}

function updatePasswordStrength() {
  const value = passwordInput.value;
  const assessment = assessPassword(value);
  const level = strengthLevels[assessment.score];

  passwordLength.textContent = `${value.length} belgi`;
  passwordStrength.dataset.score = String(assessment.score);
  passwordStrength.setAttribute("aria-valuenow", String(assessment.score));
  passwordStrength.setAttribute("aria-valuetext", value ? level.label : "Hali tekshirilmadi");
  passwordStrengthLabel.textContent = value ? level.label : "Hali tekshirilmadi";
  passwordFeedback.dataset.level = value ? level.level : "empty";
  passwordSegments.forEach((segment, index) => {
    segment.classList.toggle("is-active", index < assessment.score);
  });

  Object.entries(passwordRuleElements).forEach(([rule, element]) => {
    element.dataset.valid = String(assessment.requirements[rule]);
  });

  if (!value) {
    passwordFeedback.textContent = "Parol yozish bilan shartlar tekshiriladi.";
  } else if (assessment.isCommon) {
    passwordFeedback.textContent = "Bu parol juda ko‘p uchraydi. Boshqa va uzoqroq parol tanlang.";
  } else if (assessment.score === 4) {
    passwordFeedback.textContent = "Ajoyib! Parol uzun va har xil belgilardan tashkil topgan. Uni boshqa hisobda ishlatmang.";
  } else if (!assessment.requirements.length) {
    passwordFeedback.textContent = "Parolni kamida 12 belgiga yetkazing va har xil belgilar qo‘shing.";
  } else if (assessment.score === 3) {
    passwordFeedback.textContent = "Yaxshi. Yana bir necha belgi qo‘shib, parolni yanada mustahkamlang.";
  } else if (assessment.score === 2) {
    passwordFeedback.textContent = "O‘rta. Parolni uzaytirib, harflar, raqam va maxsus belgilarni qo‘shing.";
  } else {
    passwordFeedback.textContent = "Zaif. Uzunroq va oldindan taxmin qilinmaydigan parol yarating.";
  }
}

function setPasswordVisibility(visible) {
  passwordInput.type = visible ? "text" : "password";
  passwordToggle.textContent = visible ? "Yashirish" : "Ko‘rsatish";
  passwordToggle.setAttribute("aria-label", visible ? "Parolni yashirish" : "Parolni ko‘rsatish");
  passwordToggle.setAttribute("aria-pressed", String(visible));
}

passwordInput.addEventListener("input", updatePasswordStrength);

passwordToggle.addEventListener("click", () => {
  setPasswordVisibility(passwordInput.type === "password");
});

passwordClear.addEventListener("click", () => {
  passwordInput.value = "";
  setPasswordVisibility(false);
  updatePasswordStrength();
  passwordInput.focus();
});

function updateProgress() {
  const completed = [...checkboxes].filter((checkbox) => checkbox.checked).length;
  const total = checkboxes.length;

  progressBar.value = completed;
  progressText.textContent = `${completed} / ${total}`;

  if (completed === total) {
    feedback.textContent = "Ajoyib! Barcha asosiy qoidalarni belgiladingiz.";
  } else if (completed === 0) {
    feedback.textContent = "Birinchi qoidani belgilab boshlang.";
  } else {
    feedback.textContent = `Yana ${total - completed} ta qoidani tekshiring.`;
  }
}

function appendTerminalLine(text, className = "") {
  const line = document.createElement("p");
  line.textContent = text;

  if (className) {
    line.className = className;
  }

  terminalOutput.appendChild(line);
}

function appendTerminalCommand(command) {
  const line = document.createElement("p");
  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = "xavfsiz@internet:~$ ";
  line.appendChild(prompt);
  line.appendChild(document.createTextNode(command));
  terminalOutput.appendChild(line);
}

function runTerminalCommand(rawCommand) {
  const command = rawCommand.trim().toLowerCase();

  if (!command) {
    return;
  }

  appendTerminalCommand(command);

  if (command === "clear") {
    terminalOutput.replaceChildren();
    return;
  }

  const response = terminalCommands[command];

  if (!response) {
    appendTerminalLine(`Buyruq topilmadi: ${command}. Yordam uchun help yozing.`, "terminal-error");
  } else {
    response.split("\n").forEach((line) => appendTerminalLine(line));
  }

  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", updateProgress);
});

resetButton.addEventListener("click", () => {
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  updateProgress();
});

terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runTerminalCommand(terminalInput.value);
  terminalInput.value = "";
});

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => {
    terminalInput.value = button.dataset.command;
    terminalForm.requestSubmit();
  });
});

updateProgress();
updatePasswordStrength();
renderQuizQuestion();
