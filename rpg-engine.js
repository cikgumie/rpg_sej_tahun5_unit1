// --- RPG Engine (Library File) ---
// This file contains the core logic for the RPG adventure game.
// It should be hosted on a server and can be reused for any adventure.
// It reads the `gameConfig` variable from the HTML file that loads it.

// --- Global State and Configuration ---
let _gameConfig = {};
let gameState = {};
let isTyping = false;
let typingInterval;
let currentFullText = "";

// --- DOM Element References ---
let gameContainer, gameTitleElement, gameMainTitleElement, gameSubtitleElement, storyTextElement, choicesContainer, loadingIndicator, attributesContainer, inventoryContainer, achievementsContainer, saveGameButton, loadGameButton, restartGameButton, modalElement, modalContentElement, leftPanel, mainContentArea, toggleSidebarButton, toggleSidebarDesktopButton, closeSidebarButton, bodyElement, skipTypingButton, gameTipsList, attributesTitleElement;

/**
 * Generates the entire HTML structure for the game inside a container element.
 * @param {HTMLElement} container - The element to build the game UI in.
 */
function buildGameUI(container) {
    container.innerHTML = `
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-6">
            <h1 id="game-main-title" class="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 mr-3 text-blue-500"><path d="m12 3-9 3 9 3 9-3-9-3Z"></path><path d="M3 12v6l9 3 9-3v-6"></path><path d="m3 6 9 3 9-3"></path></svg>
                <!-- Title will be injected here -->
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 ml-3 text-blue-500"><path d="m12 3-9 3 9 3 9-3-9-3Z"></path><path d="M3 12v6l9 3 9-3v-6"></path><path d="m3 6 9 3 9-3"></path></svg>
            </h1>
            <p id="game-subtitle" class="text-lg text-gray-600"></p>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
            <!-- Toggle Button for Mobile Sidebar -->
            <button id="toggle-sidebar" class="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <!-- Toggle Button for Desktop Sidebar -->
            <button id="toggle-sidebar-desktop" class="hidden lg:block fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>

            <!-- Left Panel (Sidebar) -->
            <div id="left-panel" class="lg:col-span-1 space-y-6 sidebar-panel">
                <!-- Close button for mobile sidebar -->
                <div class="lg:hidden flex justify-end mb-4">
                    <button id="close-sidebar" class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <!-- Attributes Card -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
                    <h3 id="attributes-title" class="font-bold text-lg mb-4 flex items-center text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2 text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <!-- Attributes title will be injected here -->
                    </h3>
                    <div id="attributes-container"></div>
                </div>

                <!-- Inventory -->
                <div id="inventory-container" class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4"></div>

                <!-- Achievements -->
                <div id="achievements-container" class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4"></div>

                <!-- Settings -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
                    <h3 class="font-bold text-lg mb-3 text-gray-800">Settings</h3>
                    <div class="space-y-3">
                        <button id="save-game" class="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Save Game</button>
                        <button id="load-game" class="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Load Game</button>
                        <button id="restart-game" class="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mt-4">Restart</button>
                    </div>
                </div>
            </div>

            <!-- Right Panel (Main Content Area) -->
            <div id="main-content-area" class="lg:col-span-3 main-content-area">
                <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 min-h-[500px]">
                    <div class="mb-6">
                        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                            <p id="story-text" class="text-gray-800 leading-relaxed text-lg min-h-[150px]"></p>
                        </div>
                    </div>
                    <div id="choices-container" class="space-y-3"></div>
                    <div id="loading-indicator" class="flex items-center justify-center p-4 hidden">
                        <div class="flex space-x-2"><div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div><div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div><div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div></div>
                        <p class="ml-4 text-blue-700">Generating...</p>
                    </div>
                    <button id="skip-typing-button" class="w-full p-2 mt-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors hidden">Skip Typing</button>
                </div>

                <div id="game-tips-container" class="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 class="font-bold text-green-800 mb-2">💡 Game Tips:</h4>
                    <ul id="game-tips-list" class="text-sm text-green-700 list-disc list-inside space-y-1"></ul>
                </div>
            </div>
        </div>
    </div>
    <!-- Modal -->
    <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 hidden z-50">
        <div id="modal-content" class="modal bg-white rounded-xl shadow-2xl p-6 text-center max-w-lg mx-auto w-full"></div>
    </div>
    `;
}


/**
 * Initializes the game with the provided configuration.
 * @param {object} config - The game configuration object.
 */
function initGame(config) {
    if (!config) {
        console.error("Game Configuration (gameConfig) is not defined. Make sure it's in the HTML file before the engine script.");
        return;
    }
    _gameConfig = config;

    // Build the UI first
    gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error("The '#game-container' element was not found in the HTML.");
        return;
    }
    buildGameUI(gameContainer);

    // Query all DOM elements now that they exist
    gameTitleElement = document.getElementById('game-title');
    gameMainTitleElement = document.getElementById('game-main-title');
    gameSubtitleElement = document.getElementById('game-subtitle');
    storyTextElement = document.getElementById('story-text');
    choicesContainer = document.getElementById('choices-container');
    loadingIndicator = document.getElementById('loading-indicator');
    attributesContainer = document.getElementById('attributes-container');
    inventoryContainer = document.getElementById('inventory-container');
    achievementsContainer = document.getElementById('achievements-container');
    saveGameButton = document.getElementById('save-game');
    loadGameButton = document.getElementById('load-game');
    restartGameButton = document.getElementById('restart-game');
    modalElement = document.getElementById('modal');
    modalContentElement = document.getElementById('modal-content');
    leftPanel = document.getElementById('left-panel');
    mainContentArea = document.getElementById('main-content-area');
    toggleSidebarButton = document.getElementById('toggle-sidebar');
    toggleSidebarDesktopButton = document.getElementById('toggle-sidebar-desktop');
    closeSidebarButton = document.getElementById('close-sidebar');
    bodyElement = document.body;
    skipTypingButton = document.getElementById('skip-typing-button');
    gameTipsList = document.getElementById('game-tips-list');
    attributesTitleElement = document.getElementById('attributes-title');

    // Set game title and subtitle from config
    gameTitleElement.textContent = _gameConfig.gameTitle;
    if (gameMainTitleElement && gameMainTitleElement.childNodes.length > 2) {
        gameMainTitleElement.childNodes[2].nodeValue = ` ${_gameConfig.gameTitle} `;
    }
    gameSubtitleElement.textContent = _gameConfig.gameSubtitle;
    if (attributesTitleElement && attributesTitleElement.childNodes.length > 1) {
        attributesTitleElement.childNodes[2].nodeValue = ` ${_gameConfig.attributesTitle} `;
    }

    // Set up event listeners
    saveGameButton.addEventListener('click', saveGame);
    loadGameButton.addEventListener('click', loadGame);
    restartGameButton.addEventListener('click', () => {
        showModal("Restart?", "Are you sure you want to restart? All progress will be lost.", "confirm_restart");
    });

    toggleSidebarButton.addEventListener('click', toggleSidebar);
    toggleSidebarDesktopButton.addEventListener('click', toggleSidebar);
    closeSidebarButton.addEventListener('click', toggleSidebar);
    skipTypingButton.addEventListener('click', skipTypingEffect);

    // Initial sidebar state
    if (window.innerWidth >= 1024) {
        bodyElement.classList.add('sidebar-open');
    } else {
        bodyElement.classList.remove('sidebar-open');
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) bodyElement.classList.add('sidebar-open');
        else bodyElement.classList.remove('sidebar-open');
    });

    loadGame();
}

function toggleSidebar() {
    bodyElement.classList.toggle('sidebar-open');
}

function skipTypingEffect() {
    if (isTyping) {
        clearInterval(typingInterval);
        storyTextElement.innerHTML = currentFullText;
        isTyping = false;
        loadingIndicator.classList.add('hidden');
        skipTypingButton.classList.add('hidden');
        const scene = _gameConfig.scenarios[gameState.currentScene];
        renderChoices(scene.choices || []);
    }
}

function getDefaultGameState() {
    const initialAttributes = {};
    _gameConfig.attributes.forEach(attr => {
        initialAttributes[attr.key] = attr.initialValue;
    });
    return {
        currentScene: 'intro',
        attributes: initialAttributes,
        inventory: [..._gameConfig.initialInventory],
        achievements: [..._gameConfig.initialAchievements],
    };
}

function saveGame() {
    try {
        localStorage.setItem(_gameConfig.gameId, JSON.stringify(gameState));
        showModal("Game Saved", "Your progress has been saved.", "info");
    } catch (error) {
        console.error("Error saving to localStorage:", error);
        showModal("Error", "Could not save the game.", "error");
    }
}

function loadGame() {
    try {
        const savedState = localStorage.getItem(_gameConfig.gameId);
        if (savedState) {
            gameState = JSON.parse(savedState);
            _gameConfig.attributes.forEach(attr => {
                if (gameState.attributes[attr.key] === undefined) {
                    gameState.attributes[attr.key] = attr.initialValue;
                }
            });
            showModal("Game Loaded", "Welcome back!", "info");
        } else {
            gameState = getDefaultGameState();
        }
    } catch (error) {
        console.error("Error loading from localStorage:", error);
        gameState = getDefaultGameState();
    }
    renderAll();
}

function handleChoice(choice) {
    if (isTyping) return;

    if (choice.action === 'restart') {
        gameState = getDefaultGameState();
        saveGame();
        renderAll();
        return;
    }

    if (choice.action === 'learn_from_ai') {
        handleAILearning();
        return;
    }

    const currentSceneData = _gameConfig.scenarios[gameState.currentScene];

    if (choice.attributeChanges) {
        Object.entries(choice.attributeChanges).forEach(([key, value]) => {
            const attrConfig = _gameConfig.attributes.find(a => a.key === key);
            if (attrConfig) {
                const oldValue = gameState.attributes[key];
                const newValue = Math.max(0, Math.min(attrConfig.maxValue, oldValue + value));
                gameState.attributes[key] = newValue;

                const attrElement = document.getElementById(`attribute-${key}`);
                if (attrElement) {
                    const changeElement = document.createElement('div');
                    changeElement.textContent = `${value > 0 ? '+' : ''}${value}`;
                    changeElement.className = `attribute-change font-bold ${value > 0 ? 'text-green-500' : 'text-red-500'}`;
                    attrElement.parentElement.style.position = 'relative';
                    attrElement.parentElement.appendChild(changeElement);
                    setTimeout(() => changeElement.remove(), 1000);
                }
            }
        });
    }

    if (currentSceneData.achievement && !gameState.achievements.includes(currentSceneData.achievement)) {
        gameState.achievements.push(currentSceneData.achievement);
        showModal("Achievement Unlocked!", `You earned: ${currentSceneData.achievement}`, "trophy");
    }

    gameState.currentScene = choice.action;
    renderAll();
}

async function callGemini(prompt) {
    showModal("AI Advisor is thinking...", "Please wait a moment...", "loading");
    const apiKey = ""; // API key is handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API call failed: ${response.status}`);
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0) {
            return result.candidates[0].content.parts[0].text;
        }
        throw new Error("Invalid API response structure.");
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return `Sorry, there was an error contacting the AI advisor. ${error.message}`;
    } finally {
        modalElement.classList.add('hidden');
    }
}

async function handleAILearning() {
    const prompt = `You are an expert mentor for an educational RPG titled "${_gameConfig.gameTitle}". A new player needs guidance. Provide 3 key pieces of advice based on the game's core attributes: ${_gameConfig.attributes.map(a => a.label).join(', ')}. Structure the advice as a numbered list.`;
    const learning_text = await callGemini(prompt);
    showModal("Advice from your Mentor", learning_text, "advice");
}

async function handleGeminiAdvice() {
    const scene = _gameConfig.scenarios[gameState.currentScene];
    const attributesString = _gameConfig.attributes.map(attr => `${attr.label}: ${gameState.attributes[attr.key]}`).join(', ');
    const prompt = `You are a wise AI advisor in the RPG "${_gameConfig.gameTitle}". The player needs a hint. Current Situation: "${scene.text}". Player's Stats: ${attributesString}. Provide a short, cryptic hint (2-3 sentences) to guide their thinking. Do NOT tell them which option to pick.`;
    const advice = await callGemini(prompt);
    showModal("A Hint from your AI Advisor", advice, "advice");
}

async function handleGeminiCustomAction() {
    const scene = _gameConfig.scenarios[gameState.currentScene];
    const prompt = `You are a creative AI assistant in the RPG "${_gameConfig.gameTitle}". The player triggered a special action. The event: "${scene.text}". Generate a short, thematic, creative output based on this. For example, if they discovered a species, suggest a scientific name.`;
    const result = await callGemini(prompt);
    showModal("Creative Action Result", result, "decree");
}

function renderAll() {
    if (!gameState || !gameState.currentScene) {
        gameState = getDefaultGameState();
    }
    renderScene();
    renderAttributes();
    renderInventory();
    renderAchievements();
    renderGameTips();
}

function renderScene() {
    const scene = _gameConfig.scenarios[gameState.currentScene];
    if (!scene) {
        console.error(`Scene not found: ${gameState.currentScene}. Resetting.`);
        gameState.currentScene = 'intro';
        renderScene();
        return;
    }
    typeText(scene.text, () => renderChoices(scene.choices || []));
}

function renderAttributes() {
    attributesContainer.innerHTML = '';
    _gameConfig.attributes.forEach(attr => {
        const value = gameState.attributes[attr.key];
        attributesContainer.innerHTML += `
            <div id="attribute-${attr.key}" class="mb-3">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium capitalize">${attr.icon} ${attr.label}</span>
                    <span class="text-sm font-bold">${value}/${attr.maxValue}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="${attr.color} h-2.5 rounded-full transition-all duration-500" style="width: ${value / attr.maxValue * 100}%;"></div>
                </div>
            </div>`;
    });
}

function renderInventory() {
    inventoryContainer.innerHTML = `
        <h3 class="font-bold text-lg mb-3 flex items-center text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2 text-gray-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>Inventory</h3>
        <div class="space-y-2">
            ${gameState.inventory.length ? gameState.inventory.map(item => `<div class="bg-gray-100 p-2 rounded-md text-sm text-gray-700">${item}</div>`).join('') : '<p class="text-sm text-gray-500">Empty</p>'}
        </div>`;
}

function renderAchievements() {
    achievementsContainer.innerHTML = `
        <h3 class="font-bold text-lg mb-3 flex items-center text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2 text-yellow-600"><path d="M14.24 14.24a2 2 0 1 1-3.313-3.313L19 4 22 7Z"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 0 0 1-2-2V5a2 0 0 1 2-2h4"></path></svg>Achievements</h3>
        <div class="space-y-2">
            ${gameState.achievements.length ? gameState.achievements.map(a => `<div class="bg-yellow-100 p-2 rounded-md text-sm text-yellow-800 font-medium">${a}</div>`).join('') : '<p class="text-sm text-gray-500">None yet.</p>'}
        </div>`;
}

function renderGameTips() {
    gameTipsList.innerHTML = '';
    _gameConfig.attributes.forEach(attr => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${attr.label}</strong> ${attr.tip}`;
        gameTipsList.appendChild(li);
    });
}

function renderChoices(choices) {
    choicesContainer.innerHTML = '<h3 class="font-bold text-lg text-gray-800 mb-4">Your Choices:</h3>';
    const currentSceneData = _gameConfig.scenarios[gameState.currentScene];

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = `w-full text-left p-4 bg-gradient-to-r from-gray-100 to-blue-50 hover:from-gray-200 hover:to-blue-100 rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-md group`;
        button.onclick = () => handleChoice(choice);
        button.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="font-medium text-gray-800 group-hover:text-blue-800">${choice.text}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-500 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>`;
        choicesContainer.appendChild(button);
    });

    if (currentSceneData.hasGeminiAdvice) {
        const adviceButton = document.createElement('button');
        adviceButton.className = 'w-full text-left p-4 mt-4 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 rounded-lg border border-purple-300 transition-all duration-200 hover:shadow-md group';
        adviceButton.onclick = handleGeminiAdvice;
        adviceButton.innerHTML = `<div class="flex items-center justify-between"><span class="font-medium text-purple-900">✨ Ask AI Advisor for a Hint</span><span class="text-lg">🤔</span></div>`;
        choicesContainer.appendChild(adviceButton);
    }

    if (currentSceneData.canTriggerCustomAction) {
        const customActionButton = document.createElement('button');
        customActionButton.className = 'w-full text-left p-4 mt-4 bg-gradient-to-r from-teal-100 to-cyan-100 hover:from-teal-200 hover:to-cyan-200 rounded-lg border border-teal-300 transition-all duration-200 hover:shadow-md group';
        customActionButton.onclick = handleGeminiCustomAction;
        customActionButton.innerHTML = `<div class="flex items-center justify-between"><span class="font-medium text-teal-900">✨ Perform Special Action</span><span class="text-lg">🚀</span></div>`;
        choicesContainer.appendChild(customActionButton);
    }
}

function typeText(text, callback) {
    isTyping = true;
    currentFullText = text;
    storyTextElement.innerHTML = '';
    choicesContainer.innerHTML = '';
    loadingIndicator.classList.remove('hidden');
    skipTypingButton.classList.remove('hidden');
    let i = 0;
    if (typingInterval) clearInterval(typingInterval);
    typingInterval = setInterval(() => {
        if (i < text.length) {
            storyTextElement.innerHTML = text.slice(0, i + 1) + '<span class="animate-pulse">|</span>';
            i++;
        } else {
            clearInterval(typingInterval);
            storyTextElement.innerHTML = text;
            isTyping = false;
            loadingIndicator.classList.add('hidden');
            skipTypingButton.classList.add('hidden');
            if (callback) callback();
        }
    }, 25);
}

function showModal(title, message, iconType = "info") {
    const icons = {
        trophy: '🏆', map: '🗺️', info: 'ℹ️', error: '❌', confirm_restart: '🔄',
        advice: '🎓', decree: '📜', loading: '⏳'
    };
    let buttons = `<button id="modal-close" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Close</button>`;
    if (iconType === 'confirm_restart') {
        buttons = `
            <button id="confirm-restart-btn" class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 mr-2">Yes, Restart</button>
            <button id="modal-close" class="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancel</button>`;
    } else if (iconType === 'loading') {
        buttons = '';
    }
    modalContentElement.innerHTML = `
        <div class="text-5xl mb-4">${icons[iconType]}</div>
        <h2 class="text-2xl font-bold mb-2 text-gray-800">${title}</h2>
        <div class="text-gray-600 mb-6 whitespace-pre-wrap text-left max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">${message}</div>
        <div class="flex justify-center">${buttons}</div>`;
    modalElement.classList.remove('hidden');

    const closeButton = document.getElementById('modal-close');
    if (closeButton) closeButton.onclick = () => modalElement.classList.add('hidden');

    if (iconType === 'confirm_restart') {
        document.getElementById('confirm-restart-btn').onclick = () => {
            modalElement.classList.add('hidden');
            handleChoice({ action: 'restart' });
        };
    }
}

// --- Initialize the game when the DOM is ready ---
document.addEventListener('DOMContentLoaded', () => {
    // The global `gameConfig` should be available from the HTML file
    initGame(window.gameConfig);
});
