/**
 * Luna App - Final Fixed Version
 * Direct event handling approach for reliable functionality
 */

// Global state
const appState = {
  points: 50,
  level: 1,
  levelName: "Nybegynner Sissy",
  tasks: {
    morgen: { 
      name: "Morgenrituale", 
      details: "Kjenn BHen. Perfekt holdning: skuldre ned, rygg rett. Myke hender. Klar til å skinne. Affirmasjoner!", 
      done: false, 
      points: 10 
    },
    dag: { 
      name: "Holdningssjekk", 
      details: "Midt på dagen, sjekk holdningen din. Er ryggen rett? Er bevegelsene dine myke og feminine?", 
      done: false, 
      points: 10 
    },
    ettermiddag: { 
      name: "Feminin Refleksjon", 
      details: "Ta 5 minutter til å tenke på en feminin egenskap du beundrer og hvordan du kan uttrykke den.", 
      done: false, 
      points: 10 
    },
    kveld: { 
      name: "Kveldspleie", 
      details: "Ta vare på huden din. Bruk en fuktighetskrem, og nyt følelsen av mykhet.", 
      done: false, 
      points: 10 
    }
  },
  rewards: [
    { 
      id: 1, 
      name: "Virtuell Godkjenning", 
      cost: 25, 
      description: "Et anerkjennende nikk fra Luna for din innsats.", 
      purchased: false 
    },
    { 
      id: 2, 
      name: "Friminutt for Fantasi", 
      cost: 100, 
      description: "Tillatelse til 15 minutter med dagdrømming om din Isadora-fremtid.", 
      purchased: false 
    }
  ],
  diaryEntries: [],
  motivationalQuotes: [
    "Hver minste bevegelse former din Isadora. Du er vakker i din dedikasjon.",
    "Disiplin er broen mellom mål og virkelighet. Du bygger den nå.",
    "Omfavn mykheten. Den er din største styrke."
  ],
  levels: {
    1: { name: "Nybegynner Sissy", threshold: 0 },
    2: { name: "Dedikert Elev", threshold: 1000 },
    3: { name: "Blomstrende Isadora", threshold: 2500 }
  },
  inspirationImage: null,
  lastQuoteIndex: 0
};

let currentPage = 'hjem';

// Utility functions
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-20 left-4 right-4 bg-success text-white p-4 rounded-lg shadow-lg z-50 flex items-center';
  toast.innerHTML = `
    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
    </svg>
    <span>${sanitizeInput(message)}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Navigation
function navigateTo(pageId) {
  console.log('Navigating to:', pageId);
  
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.remove('active');
    page.style.display = 'none';
  });
  
  // Show target page
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
    targetPage.style.display = 'block';
  }
  
  // Update navigation buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    if (btn.dataset.page === pageId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  currentPage = pageId;
}

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const page = this.dataset.page;
      console.log('Nav button clicked:', page);
      if (page) {
        navigateTo(page);
      }
    });
  });
}

// Task system
function renderTasks() {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;
  
  taskList.innerHTML = '';
  
  Object.entries(appState.tasks).forEach(([key, task]) => {
    const taskEl = document.createElement('div');
    taskEl.className = `task-item flex items-center gap-4 p-4 rounded-lg border transition-all ${task.done ? 'bg-success/10 border-success' : 'bg-surface border-border'}`;
    
    taskEl.innerHTML = `
      <input 
        type="checkbox" 
        id="task-${key}" 
        class="task-checkbox w-5 h-5 rounded border-2 border-primary cursor-pointer"
        data-task="${key}"
        ${task.done ? 'checked' : ''}
      >
      <div class="flex-grow">
        <label for="task-${key}" class="font-semibold cursor-pointer ${task.done ? 'line-through opacity-60' : ''}">
          ${sanitizeInput(task.name)}
        </label>
        <p class="text-sm text-text-secondary mt-1">
          ${sanitizeInput(task.details)}
        </p>
      </div>
      <div class="text-right">
        <span class="font-bold text-success">+${task.points}p</span>
      </div>
    `;
    
    taskList.appendChild(taskEl);
  });
  
  // Add event listeners to checkboxes
  setupTaskListeners();
}

function setupTaskListeners() {
  const checkboxes = document.querySelectorAll('.task-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function(e) {
      const taskKey = this.dataset.task;
      const completed = this.checked;
      console.log('Task checkbox changed:', taskKey, completed);
      toggleTask(taskKey, completed);
    });
  });
}

function toggleTask(taskKey, completed) {
  const task = appState.tasks[taskKey];
  if (!task) return;
  
  const pointChange = completed ? task.points : -task.points;
  
  appState.tasks[taskKey].done = completed;
  appState.points = Math.max(0, appState.points + pointChange);
  
  console.log(`Task ${taskKey} ${completed ? 'completed' : 'uncompleted'}, points: ${appState.points}`);
  
  if (completed) {
    showTaskCelebration(task);
  }
  
  updateUI();
  renderTasks();
}

function showTaskCelebration(task) {
  const modal = document.getElementById('task-celebration');
  if (!modal) return;
  
  const title = modal.querySelector('#celebration-title');
  if (title) {
    title.textContent = `${task.name} fullført!`;
  }
  
  modal.classList.remove('hidden');
  
  const closeBtn = modal.querySelector('#close-celebration');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.classList.add('hidden');
    };
  }
  
  setTimeout(() => {
    if (!modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    }
  }, 3000);
}

// Reward system
function renderRewards() {
  const rewardsStore = document.getElementById('rewards-store');
  if (!rewardsStore) return;
  
  rewardsStore.innerHTML = '';
  
  appState.rewards.forEach(reward => {
    const canAfford = appState.points >= reward.cost && !reward.purchased;
    
    const rewardEl = document.createElement('div');
    rewardEl.className = `reward-item p-4 rounded-lg border ${reward.purchased ? 'bg-secondary opacity-70' : 'bg-surface'}`;
    
    rewardEl.innerHTML = `
      <div class="flex flex-col gap-3">
        <div>
          <h4 class="font-bold text-lg ${reward.purchased ? 'text-text-secondary' : 'text-primary'}">
            ${sanitizeInput(reward.name)}
          </h4>
          <p class="text-sm text-text-secondary">
            ${sanitizeInput(reward.description)}
          </p>
        </div>
        <button 
          data-id="${reward.id}" 
          class="buy-reward-btn btn ${reward.purchased ? 'btn--secondary' : canAfford ? 'btn--primary' : 'btn--outline'} btn--full-width cursor-pointer"
          ${reward.purchased || !canAfford ? 'disabled' : ''}
        >
          ${reward.purchased ? 'Kjøpt ✓' : `Kjøp for ${reward.cost}p`}
        </button>
      </div>
    `;
    
    rewardsStore.appendChild(rewardEl);
  });
  
  // Add event listeners to reward buttons
  setupRewardListeners();
}

function setupRewardListeners() {
  const buttons = document.querySelectorAll('.buy-reward-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const rewardId = parseInt(this.dataset.id);
      console.log('Reward button clicked:', rewardId);
      purchaseReward(rewardId);
    });
  });
}

function purchaseReward(rewardId) {
  const reward = appState.rewards.find(r => r.id === rewardId);
  if (!reward || reward.purchased || appState.points < reward.cost) {
    console.log('Cannot purchase reward:', reward, appState.points);
    return;
  }
  
  reward.purchased = true;
  appState.points -= reward.cost;
  
  console.log(`Purchased reward: ${reward.name}, remaining points: ${appState.points}`);
  
  showSuccessMessage(`Du har låst opp "${reward.name}"!`);
  updateUI();
  renderRewards();
}

// Chat system
function addChatMessage(message, sender) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${sender} flex gap-3 mb-4`;
  
  if (sender === 'user') {
    messageEl.className += ' flex-row-reverse';
  }
  
  messageEl.innerHTML = `
    <div class="chat-avatar ${sender} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${sender === 'luna' ? 'bg-primary' : 'bg-error'}">
      ${sender === 'luna' ? 'L' : 'I'}
    </div>
    <div class="chat-bubble ${sender} max-w-xs px-3 py-2 rounded-lg ${sender === 'luna' ? 'bg-surface border' : 'bg-primary text-white'}">
      ${sanitizeInput(message)}
    </div>
  `;
  
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  
  const typingEl = document.createElement('div');
  typingEl.id = 'typing-indicator';
  typingEl.className = 'chat-message luna flex gap-3 mb-4';
  
  typingEl.innerHTML = `
    <div class="chat-avatar luna w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-primary">L</div>
    <div class="chat-bubble luna bg-surface border px-3 py-2 rounded-lg">
      <div class="chat-typing flex gap-1">
        <span class="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
        <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
        <span class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

async function handleChatSend() {
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();
  
  if (!message) return;
  
  console.log('Sending chat message:', message);
  
  addChatMessage(message, 'user');
  chatInput.value = '';
  
  const charCount = document.getElementById('chat-char-count');
  if (charCount) {
    charCount.textContent = '0';
  }
  
  showTypingIndicator();
  
  // Simulate AI response delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
  
  removeTypingIndicator();
  
  // Mock responses
  const responses = [
    "Hei kjære Isadora! Så hyggelig å høre fra deg. Hvordan har dagen din vært?",
    "Det er vakkert å høre om din dedikasjon. Husk at hver liten fremgang er viktig.",
    "Du viser stor styrke i din sårbarhet. Det er modig å omfavne din sanne natur.",
    "La oss fokusere på neste steg i din reise. Hva føler du er viktigst akkurat nå?",
    "Jeg beundrer din utholdenhet. Transformasjon tar tid, og du er på rett vei."
  ];
  
  let response;
  if (message.toLowerCase().includes('hei') || message.toLowerCase().includes('hallo')) {
    response = "Hei kjære Isadora! Så hyggelig å høre fra deg. Hvordan har dagen din vært?";
  } else if (message.toLowerCase().includes('takk')) {
    response = "Det var så snilt av deg å si! Jeg er her for deg alltid, Isadora. ✨";
  } else {
    response = responses[Math.floor(Math.random() * responses.length)];
  }
  
  addChatMessage(response, 'luna');
}

function setupChatSystem() {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  
  if (chatForm) {
    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleChatSend();
    });
  }
  
  if (chatSend) {
    chatSend.addEventListener('click', function(e) {
      e.preventDefault();
      handleChatSend();
    });
  }
  
  if (chatInput) {
    chatInput.addEventListener('input', function() {
      const charCount = document.getElementById('chat-char-count');
      if (charCount) {
        charCount.textContent = this.value.length;
      }
    });
  }
}

// Documentation system
function saveDiaryEntry() {
  const diaryInput = document.getElementById('diary-entry');
  const content = diaryInput.value.trim();
  
  if (!content) return;
  
  console.log('Saving diary entry:', content);
  
  const newEntry = {
    id: Date.now(),
    date: new Date(),
    content: sanitizeInput(content)
  };
  
  appState.diaryEntries.unshift(newEntry);
  
  diaryInput.value = '';
  const reflectionBtn = document.getElementById('get-reflection-button');
  if (reflectionBtn) {
    reflectionBtn.disabled = true;
  }
  
  renderHistory();
  showSuccessMessage('Dagboknotat lagret!');
}

async function getReflection() {
  const diaryInput = document.getElementById('diary-entry');
  const content = diaryInput.value.trim();
  
  if (!content) return;
  
  console.log('Getting reflection for:', content);
  
  const reflectionContainer = document.getElementById('reflection-container');
  const reflectionContent = document.getElementById('reflection-content');
  
  if (!reflectionContainer || !reflectionContent) return;
  
  reflectionContainer.classList.remove('hidden');
  reflectionContent.innerHTML = `
    <div class="flex items-center">
      <div class="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
      <p>Luna reflekterer over dine tanker...</p>
    </div>
  `;
  
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  const reflections = [
    "Dine tanker viser stor modenhet og selvrefleksjon. Din bevissthet rundt egen utvikling viser stor visdom.",
    "Jeg kan se hvor mye vekst du har hatt. Måten du beskriver følelsene dine på viser dybde og forståelse.",
    "Det du beskriver er en naturlig del av reisen. Jeg kan se hvordan du vokser gjennom disse erfaringene.",
    "Din ærlighet overfor deg selv er virkelig vakkert. Din åpenhet for endring er inspirerende."
  ];
  
  const reflection = reflections[Math.floor(Math.random() * reflections.length)];
  reflectionContent.innerHTML = `<p>${sanitizeInput(reflection)}</p>`;
}

function renderHistory() {
  const historyGallery = document.getElementById('history-gallery');
  if (!historyGallery) return;
  
  if (appState.diaryEntries.length === 0) {
    historyGallery.innerHTML = `
      <p class="text-text-secondary text-center py-8">
        Dine lagrede notater vil vises her.
      </p>
    `;
    return;
  }
  
  historyGallery.innerHTML = appState.diaryEntries
    .slice(0, 10)
    .map(entry => `
      <div class="card mb-3">
        <div class="card__body">
          <time class="text-sm text-text-secondary block mb-2">
            ${new Date(entry.date).toLocaleString('no-NO')}
          </time>
          <p>${entry.content}</p>
        </div>
      </div>
    `).join('');
}

function setupDocumentationSystem() {
  const saveDiaryBtn = document.getElementById('save-diary-button');
  const getReflectionBtn = document.getElementById('get-reflection-button');
  const diaryInput = document.getElementById('diary-entry');
  
  if (saveDiaryBtn) {
    saveDiaryBtn.addEventListener('click', function(e) {
      e.preventDefault();
      saveDiaryEntry();
    });
  }
  
  if (getReflectionBtn) {
    getReflectionBtn.addEventListener('click', function(e) {
      e.preventDefault();
      getReflection();
    });
  }
  
  if (diaryInput) {
    diaryInput.addEventListener('input', function() {
      if (getReflectionBtn) {
        getReflectionBtn.disabled = this.value.trim().length === 0;
      }
    });
  }
}

// Inspiration system
function handleImageUpload(file) {
  if (!file || file.size > 5 * 1024 * 1024) {
    showSuccessMessage('Filen er for stor eller ugyldig.');
    return;
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showSuccessMessage('Kun JPG, PNG og WebP er tillatt.');
    return;
  }
  
  console.log('Uploading image:', file.name);
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const imagePreview = document.getElementById('image-preview');
    const uploadLabel = document.getElementById('upload-label-text');
    const generateBtn = document.getElementById('generate-inspiration-button');
    
    if (imagePreview && uploadLabel && generateBtn) {
      imagePreview.src = e.target.result;
      imagePreview.classList.remove('hidden');
      uploadLabel.textContent = file.name;
      generateBtn.disabled = false;
      
      appState.inspirationImage = e.target.result.split(',')[1];
    }
  };
  
  reader.readAsDataURL(file);
}

async function generateInspirationChallenge() {
  if (!appState.inspirationImage) return;
  
  console.log('Generating inspiration challenge');
  
  const generateBtn = document.getElementById('generate-inspiration-button');
  const challengeContainer = document.getElementById('inspiration-challenge-container');
  const challengeContent = document.getElementById('inspiration-challenge-content');
  
  if (!generateBtn || !challengeContainer || !challengeContent) return;
  
  generateBtn.disabled = true;
  generateBtn.innerHTML = `
    <div class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
    Luna tenker...
  `;
  
  challengeContainer.classList.remove('hidden');
  challengeContent.innerHTML = `
    <div class="flex items-center justify-center p-8">
      <div class="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
      <p>Luna analyserer bildet ditt...</p>
    </div>
  `;
  
  // Simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
  
  const challenges = [
    "Basert på dette bildet, utfordrer jeg deg til å utforske farger i garderoben din i dag.",
    "La dette bildet inspirere deg til en 10-minutters meditasjon om skjønnhet og eleganse.",
    "Jeg ser eleganse i dette bildet - prøv å kanalisere den samme energien i din holdning i dag.",
    "Dette bildet minner meg om betydningen av detaljer. Fokuser på små, vakre gester i dag."
  ];
  
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  challengeContent.innerHTML = `
    <p class="text-base leading-relaxed">${sanitizeInput(challenge)}</p>
    <div class="mt-4 pt-4 border-t">
      <p class="text-sm text-text-secondary italic">
        Generert basert på ditt opplastede bilde ✨
      </p>
    </div>
  `;
  
  generateBtn.disabled = false;
  generateBtn.innerHTML = `
    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"></path>
    </svg>
    Lag ny utfordring
  `;
}

function setupInspirationSystem() {
  const imageUpload = document.getElementById('image-upload');
  const generateBtn = document.getElementById('generate-inspiration-button');
  const uploadArea = document.querySelector('.upload-area');
  const uploadLabel = document.querySelector('.upload-label');
  
  if (imageUpload) {
    imageUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file);
      }
    });
  }
  
  if (generateBtn) {
    generateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      generateInspirationChallenge();
    });
  }
  
  if (uploadArea) {
    uploadArea.addEventListener('click', function(e) {
      e.preventDefault();
      if (imageUpload) {
        imageUpload.click();
      }
    });
  }
  
  if (uploadLabel) {
    uploadLabel.addEventListener('click', function(e) {
      e.preventDefault();
      if (imageUpload) {
        imageUpload.click();
      }
    });
  }
}

// UI update functions
function updateUI() {
  // Update points displays
  document.querySelectorAll('[id^="points-display-"]').forEach(el => {
    el.textContent = appState.points;
  });
  
  // Update level displays
  document.querySelectorAll('[id^="level-display-"]').forEach(el => {
    el.textContent = appState.level;
  });
  
  // Update progress bar
  updateProgressBar();
  
  // Update next task display
  updateNextTaskDisplay();
}

function updateProgressBar() {
  const progressBar = document.getElementById('level-progress-bar');
  const nextLevelTarget = document.getElementById('next-level-target');
  const rewardsLevel = document.getElementById('rewards-level');
  
  if (!progressBar) return;
  
  const currentLevel = appState.levels[appState.level];
  const nextLevel = appState.levels[appState.level + 1];
  
  if (nextLevel) {
    const progress = ((appState.points - currentLevel.threshold) / 
                     (nextLevel.threshold - currentLevel.threshold)) * 100;
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    progressBar.style.width = `${clampedProgress}%`;
    
    if (nextLevelTarget) {
      nextLevelTarget.textContent = `${nextLevel.threshold}p`;
    }
  } else {
    progressBar.style.width = '100%';
    
    if (nextLevelTarget) {
      nextLevelTarget.textContent = 'Maks';
    }
  }
  
  if (rewardsLevel) {
    rewardsLevel.textContent = appState.level;
  }
}

function updateNextTaskDisplay() {
  const nextTaskEl = document.getElementById('next-task-display');
  if (!nextTaskEl) return;
  
  const unfinishedTasks = Object.values(appState.tasks).filter(task => !task.done);
  
  if (unfinishedTasks.length > 0) {
    nextTaskEl.textContent = unfinishedTasks[0].name;
  } else {
    nextTaskEl.textContent = 'Alle oppgaver fullført! 🎉';
  }
}

// Initialize app
function initApp() {
  console.log('Initializing Luna App...');
  
  // Hide loading screen
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }, 500);
  }
  
  // Setup all systems
  setupNavigation();
  setupChatSystem();
  setupDocumentationSystem();
  setupInspirationSystem();
  
  // Initialize UI
  updateUI();
  renderTasks();
  renderRewards();
  renderHistory();
  
  // Add initial chat message
  setTimeout(() => {
    addChatMessage("Hei Isadora! Jeg er her for deg. Hva tenker du på i dag? 💜", 'luna');
  }, 1000);
  
  console.log('Luna App initialized successfully!');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Global error handling
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault();
});