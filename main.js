// ==========================================
// 狀態管理
// ==========================================
let currentListeningLevel = 'A1';
let currentQuizLevel = 'A1';
let currentQuizType = '選擇題';
let currentExercise = null;
let answeredCount = 0;
let correctCount = 0;

// ==========================================
// 導覽列切換
// ==========================================
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));

    const active = document.getElementById(sectionId);
    if (active) {
        active.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function toggleMobileMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

function closeMobileMenu() {
    document.getElementById('navLinks').classList.remove('open');
}

// ==========================================
// 動態載入 HTML 元件
// ==========================================
async function loadComponent(elementId, filePath, callback) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Not found');
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        if (callback) callback();
    } catch (error) {
        console.warn(`無法載入 ${filePath}:`, error);
        document.getElementById(elementId).innerHTML =
            `<div class="listening-placeholder"><p style="color:#999;">內容載入失敗，請確認檔案存在。</p></div>`;
    }
}

// ==========================================
// 生成單字區塊 HTML
// ==========================================
function buildVocabHTML(level, title, data) {
    const id = level.toLowerCase();
    return `
        <div class="vocab-header-area">
            <h2>${title}</h2>
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="searchInput-${id}" placeholder="搜尋法文或中文…"
                    onkeyup="filterVocab('${id}')">
            </div>
        </div>
        <div id="vocab-grid-${id}" class="vocab-grid"></div>`;
}

function buildGrammarHTML(level, title, content) {
    return `
        <div class="vocab-header-area">
            <h2>${title}</h2>
        </div>
        <p style="margin-bottom:1.5rem;color:#555;">${content.intro}</p>
        <div class="accordion-container" id="grammar-container-${level}">
            ${content.items.map((item, i) => `
                <button class="accordion">${i+1}. ${item.title}</button>
                <div class="panel">
                    <p>${item.desc}</p>
                    ${item.table ? `<div class="table-responsive"><table class="vocab-table">
                        <thead><tr>${item.table.headers
