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
                        <thead><tr>${item.table.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                        <tbody>${item.table.rows.map(r => `<tr>${r.map((c,ci) => ci===1 ? `<td class="vocab-word">${c}</td>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
                    </table></div>` : ''}
                    ${item.note ? `<p style="margin-top:1rem;padding:10px;background:#f1f4f9;border-radius:8px;font-size:0.9rem;">💡 ${item.note}</p>` : ''}
                </div>
            `).join('')}
        </div>`;
}

// ==========================================
// 文法資料
// ==========================================
const grammarData = {
    a1: {
        intro: '掌握基礎動詞變位，是開口說法文的第一步！點擊下方主題展開學習：',
        items: [
            {
                title: '動詞 Être（是 / to be）',
                desc: '<strong>Être</strong> 是法文中最基本的不規則動詞，用來表達身份、狀態或國籍。',
                table: {
                    headers: ['人稱代名詞', '動詞變位', '實用例句'],
                    rows: [
                        ['Je（我）', 'suis', 'Je suis étudiant.'],
                        ['Tu（你）', 'es', 'Tu es taïwanais.'],
                        ['Il / Elle（他/她）', 'est', 'Il est grand.'],
                        ['Nous（我們）', 'sommes', 'Nous sommes heureux.'],
                        ['Vous（您/你們）', 'êtes', 'Vous êtes fatigué ?'],
                        ['Ils / Elles（他們/她們）', 'sont', 'Ils sont amis.'],
                    ]
                }
            },
            {
                title: '動詞 Avoir（有 / to have）',
                desc: '<strong>Avoir</strong> 用來表達擁有某物，也常用來表達年齡、飢餓或口渴等狀態。',
                table: {
                    headers: ['人稱代名詞', '動詞變位', '實用例句'],
                    rows: [
                        ["J'（我）", 'ai', "J'ai 20 ans."],
                        ['Tu（你）', 'as', 'Tu as un chat.'],
                        ['Il / Elle（他/她）', 'a', 'Elle a faim.'],
                        ['Nous（我們）', 'avons', 'Nous avons le temps.'],
                        ['Vous（您/你們）', 'avez', 'Vous avez un stylo ?'],
                        ['Ils / Elles（他們/她們）', 'ont', 'Ils ont une voiture.'],
                    ]
                }
            },
            {
                title: '-ER 規則動詞變位',
                desc: '法文中大多數動詞是 <strong>-ER</strong> 結尾的規則動詞，去掉 -er 後加上固定字尾。以 <em>parler（說話）</em> 為例：',
                table: {
                    headers: ['人稱', '字尾', '例（parler）', '中文'],
                    rows: [
                        ['Je', '-e', 'je parle', '我說'],
                        ['Tu', '-es', 'tu parles', '你說'],
                        ['Il/Elle', '-e', 'il parle', '他說'],
                        ['Nous', '-ons', 'nous parlons', '我們說'],
                        ['Vous', '-ez', 'vous parlez', '你們說'],
                        ['Ils/Elles', '-ent', 'ils parlent', '他們說'],
                    ]
                },
                note: '其他常見 -ER 動詞：habiter（住）、manger（吃）、aimer（愛/喜歡）、écouter（聽）'
            },
            {
                title: '陰陽性與冠詞（Articles）',
                desc: '法文名詞分陰性（féminin）與陽性（masculin），冠詞必須與名詞性別配合。',
                table: {
                    headers: ['類型', '陽性', '陰性', '複數'],
                    rows: [
                        ['定冠詞（the）', 'le', 'la', 'les'],
                        ['不定冠詞（a/an）', 'un', 'une', 'des'],
                        ['部分冠詞（some）', 'du', 'de la', 'des'],
                    ]
                },
                note: '當名詞以母音或 h 開頭時，le/la 縮寫為 l\'，例如：l\'ami, l\'heure'
            }
        ]
    },
    a2: {
        intro: '學會更多動詞時態，能表達過去、現在與未來的事件。',
        items: [
            {
                title: '複合過去式（Passé composé）',
                desc: '用來表達過去已完成的動作。結構：主語 + avoir/être（現在式）+ 過去分詞（participe passé）',
                table: {
                    headers: ['動詞', '過去分詞', '例句', '中文'],
                    rows: [
                        ['manger', 'mangé', "J'ai mangé une pizza.", '我吃了一個披薩。'],
                        ['finir', 'fini', 'Il a fini son travail.', '他完成了工作。'],
                        ['partir（用être）', 'parti(e)', 'Elle est partie tôt.', '她早早離開了。'],
                        ['venir（用être）', 'venu(e)', 'Ils sont venus hier.', '他們昨天來了。'],
                        ['faire', 'fait', "Tu as fait quoi ?", '你做了什麼？'],
                        ['prendre', 'pris', "J'ai pris le métro.", '我搭了地鐵。'],
                    ]
                },
                note: '移動動詞（aller, venir, partir, arriver, naître, mourir 等）使用 être 助動詞，且過去分詞需與主語性別/數配合。'
            },
            {
                title: '近未來式（Futur proche）',
                desc: '表達即將發生的事，結構最簡單：主語 + aller（現在式）+ 不定式動詞',
                table: {
                    headers: ['例句', '中文'],
                    rows: [
                        ['Je vais manger.', '我要去吃東西了。'],
                        ['Tu vas partir ?', '你要出發了嗎？'],
                        ["Nous allons visiter Paris.", '我們要去參觀巴黎。'],
                        ["Il va pleuvoir.", '天快要下雨了。'],
                    ]
                }
            },
            {
                title: '代名詞（Pronoms COD/COI）',
                desc: '直接賓語代名詞（COD）替代直接受詞；間接賓語代名詞（COI）替代間接受詞。',
                table: {
                    headers: ['人稱', 'COD（直接）', 'COI（間接）'],
                    rows: [
                        ['1sg', 'me / m\'', 'me / m\''],
                        ['2sg', 'te / t\'', 'te / t\''],
                        ['3sg 男', 'le / l\'', 'lui'],
                        ['3sg 女', 'la / l\'', 'lui'],
                        ['1pl', 'nous', 'nous'],
                        ['2pl', 'vous', 'vous'],
                        ['3pl', 'les', 'leur'],
                    ]
                },
                note: '例：Je vois Marie → Je la vois. / Je parle à Marc → Je lui parle.'
            },
            {
                title: '比較級與最高級',
                desc: '法文用 plus... que（比……更），moins... que（比……少），aussi... que（和……一樣）來比較。',
                table: {
                    headers: ['結構', '例句', '中文'],
                    rows: [
                        ['plus + adj + que', 'Il est plus grand que moi.', '他比我高。'],
                        ['moins + adj + que', 'Ce film est moins intéressant.', '這部電影沒那麼有趣。'],
                        ['aussi + adj + que', 'Elle est aussi intelligente que lui.', '她和他一樣聰明。'],
                        ['le/la plus + adj', "C'est la plus belle ville.", '這是最美的城市。'],
                    ]
                }
            }
        ]
    },
    b1: {
        intro: '掌握中級語法，讓你的法文表達更精確、更豐富。',
        items: [
            {
                title: '未完成過去式（Imparfait）',
                desc: '表達過去持續進行的狀態、習慣性動作，或描述背景情境。結構：字根（nous 現在式去掉 -ons）+ 字尾。',
                table: {
                    headers: ['字尾', '例（parler → parl-）', '中文'],
                    rows: [
                        ['-ais', 'je parlais', '我（以前）說話'],
                        ['-ais', 'tu parlais', '你（以前）說話'],
                        ['-ait', 'il parlait', '他（以前）說話'],
                        ['-ions', 'nous parlions', '我們（以前）說話'],
                        ['-iez', 'vous parliez', '你們（以前）說話'],
                        ['-aient', 'ils parlaient', '他們（以前）說話'],
                    ]
                },
                note: '情境：Quand j\'étais petit, j\'habitais à Lyon.（當我還小時，我住在里昂。）'
            },
            {
                title: '條件式（Conditionnel présent）',
                desc: '表達假設、禮貌性請求或建議。字根 = 未來式字根；字尾 = 未完成過去式字尾。',
                table: {
                    headers: ['例句', '中文'],
                    rows: [
                        ['Je voudrais un café.', '我想要一杯咖啡。（禮貌）'],
                        ['Tu pourrais m\'aider ?', '你能幫我嗎？（禮貌）'],
                        ['Si j\'avais le temps, je voyagerais.', '如果我有時間，我會旅行。（假設）'],
                        ["Il faudrait partir maintenant.", '我們現在應該離開了。（建議）'],
                    ]
                }
            },
            {
                title: '虛擬式（Subjonctif présent）',
                desc: '表達主觀情感、懷疑、意志或必要性。常跟在 que 後面，並與特定動詞連用。',
                table: {
                    headers: ['觸發結構', '例句', '中文'],
                    rows: [
                        ['Il faut que', 'Il faut que tu fasses tes devoirs.', '你必須做功課。'],
                        ['Je veux que', 'Je veux qu\'il vienne.', '我希望他來。'],
                        ['Je suis content que', 'Je suis content que vous soyez là.', '我很高興你們在這裡。'],
                        ['Bien que', 'Bien qu\'il soit fatigué, il travaille.', '雖然他很累，他仍在工作。'],
                    ]
                },
                note: '常用不規則虛擬式：être → soit / avoir → ait / aller → aille / faire → fasse'
            },
            {
                title: '關係代名詞（Pronoms relatifs）',
                desc: '連接兩個句子，qui 代替主語，que 代替受詞，dont 代替「de + 名詞」，où 代替地點/時間。',
                table: {
                    headers: ['代名詞', '功能', '例句'],
                    rows: [
                        ['qui', '主語', "C'est l'ami qui m'a aidé."],
                        ['que', '受詞', "Le livre que tu lis est excellent."],
                        ['dont', 'de + 名詞', "C'est le projet dont je suis fier."],
                        ['où', '地點/時間', "La ville où j'habite est belle."],
                    ]
                }
            }
        ]
    },
    b2: {
        intro: '精通高級語法，達到流利表達與法文辯論的能力。',
        items: [
            {
                title: '假設句（Hypothèse）與條件句',
                desc: '三種假設句型，表達不同時間維度與可能性的假設。',
                table: {
                    headers: ['類型', 'Si 子句', '主句', '例句'],
                    rows: [
                        ['可能發生（現在/未來）', 'Si + présent', 'futur', 'Si tu travailles, tu réussiras.'],
                        ['不太可能（假設）', 'Si + imparfait', 'conditionnel', 'Si j\'avais de l\'argent, j\'achèterais cette voiture.'],
                        ['不可能（過去假設）', 'Si + plus-que-parfait', 'conditionnel passé', 'Si tu étais venu, tu aurais vu.'],
                    ]
                },
                note: '絕對不能在 si 引導的假設子句中使用 futur 或 conditionnel 時態。'
            },
            {
                title: '被動語態（Voix passive）',
                desc: '主動 → 被動：強調動作的承受者。結構：être（配合時態）+ 過去分詞（性數配合主語）+ par + 施動者',
                table: {
                    headers: ['主動句', '被動句', '中文'],
                    rows: [
                        ['Le chef prépare le repas.', 'Le repas est préparé par le chef.', '飯菜由主廚準備。'],
                        ['On a construit ce pont en 1900.', 'Ce pont a été construit en 1900.', '這座橋建於1900年。'],
                        ['Le jury récompensera les meilleurs.', 'Les meilleurs seront récompensés.', '最優秀者將獲獎。'],
                    ]
                }
            },
            {
                title: '過去虛擬式（Subjonctif passé）',
                desc: '表達對過去事件的主觀判斷或情感，結構：avoir/être 虛擬式 + 過去分詞。',
                table: {
                    headers: ['例句', '中文'],
                    rows: [
                        ["Je suis content qu'il soit venu.", '我很高興他來了。'],
                        ["Il est regrettable qu'elle ait échoué.", '很遺憾她失敗了。'],
                        ["Bien qu'il ait plu, ils sont sortis.", '雖然下了雨，他們還是出門了。'],
                    ]
                }
            },
            {
                title: '副動詞與現在分詞（Gérondif & Participe）',
                desc: '<strong>副動詞</strong>（gérondif）= en + 現在分詞，表示同時進行的動作或方式。<strong>現在分詞</strong>可作形容詞或替換關係子句。',
                table: {
                    headers: ['結構', '例句', '中文'],
                    rows: [
                        ['en + -ant', 'En lisant, il apprend.', '他邊讀書邊學習。'],
                        ['en + -ant（方式）', "Elle a réussi en travaillant dur.", '她靠努力工作成功了。'],
                        ['現在分詞（形容詞）', 'une histoire fascinante', '令人著迷的故事'],
                        ['現在分詞（替換子句）', 'Étant fatigué, il est rentré.', '因為疲憊，他回家了。'],
                    ]
                }
            }
        ]
    }
};

// ==========================================
// 聽力等級選擇
// ==========================================
function selectListeningLevel(level, btn) {
    currentListeningLevel = level;
    btn.parentElement.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // 重置練習區
    document.getElementById('listening-area').innerHTML = `
        <div class="listening-placeholder">
            <div class="placeholder-icon">🎙</div>
            <p>點擊下方按鈕，由 AI 生成一篇 ${level} 等級的法文文章並出題</p>
            <button class="btn-primary" onclick="generateListening()">✨ 生成聽力練習</button>
        </div>`;
}

function selectQuizLevel(level, btn) {
    currentQuizLevel = level;
    btn.parentElement.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function selectQuizType(type, btn) {
    currentQuizType = type;
    btn.parentElement.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// ==========================================
// AI 聽力生成 (串接 Cloudflare API)
// ==========================================
async function generateListening() {
    const area = document.getElementById('listening-area');
    // 顯示載入動畫
    area.innerHTML = `<div class="ai-loading"><div class="spinner"></div><p>正在由 AI 生成 ${currentListeningLevel} 等級的聽力文章與題目，請稍候…</p></div>`;

    // 嚴格規定 AI 回傳的 JSON 格式
    const prompt = `請生成一篇法文聽力練習。
    等級：${currentListeningLevel}。
    要求：回傳格式「必須」是純 JSON，絕對不要包含任何 markdown 標記 (如 \`\`\`json) 或其他文字說明。
    JSON 格式必須完全符合以下結構：
    {
        "level": "${currentListeningLevel}",
        "title": "文章標題(法文)",
        "article": "文章內容(法文，符合等級難度)",
        "questions": [
            { "type": "qcm", "question": "問題內容(法文)", "options": ["選項1", "選項2", "選項3", "選項4"], "answer": 0 },
            { "type": "vrai_faux", "question": "是非題問題內容(法文)", "answer": true }
        ]
    }
    請務必包含 2 題 qcm (選擇題，answer 為 0-3 的整數) 和 1 題 vrai_faux (是非題，answer 為 true 或 false)。`;

    try {
        const response = await fetch("https://french-tutor-api.411277003.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1500,
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();

        // 攔截 Anthropic 傳回的錯誤
        if (data.type === "error" || data.error) {
            throw new Error(data.error?.message || "API 發生錯誤");
        }

        // 取得 AI 回覆的文字
        let aiText = data.content[0].text;
        
        // 防呆機制：去除 AI 可能多加的 markdown 標記
        aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

        // 將字串解析為 JSON 物件
        const exerciseData = JSON.parse(aiText);

        // 重置計分與狀態，並渲染畫面
        currentExercise = exerciseData;
        answeredCount = 0;
        correctCount = 0;
        renderListeningExercise(exerciseData);

    } catch (error) {
        console.error("API Error:", error);
        area.innerHTML = `
            <div class="listening-placeholder">
                <div class="placeholder-icon">⚠️</div>
                <p>生成失敗，錯誤訊息：</p>
                <p style="color: #ed2939; font-size: 0.9rem; word-break: break-all;">${error.message}</p>
                <p style="font-size:0.8rem; color:#999; margin-top: 10px;">(提示：請確認 API 額度是否充足，或稍後再試)</p>
                <button class="btn-primary" style="margin-top: 15px;" onclick="generateListening()">🔄 重試</button>
            </div>`;
    }
}

function renderListeningExercise(exercise) {
    const area = document.getElementById('listening-area');
    const totalQ = exercise.questions.length;

    let questionsHTML = exercise.questions.map((q, qi) => {
        if (q.type === 'qcm') {
            return `<div class="question-item" id="q-${qi}">
                <p>Q${qi+1}. ${q.question}</p>
                <div class="options-grid">
                    ${q.options.map((opt, oi) => `
                        <button class="option-btn" onclick="answerQCM(${qi}, ${oi}, ${q.answer})">
                            ${String.fromCharCode(65+oi)}. ${opt}
                        </button>`).join('')}
                </div>
            </div>`;
        } else if (q.type === 'ordre') {
            const shuffled = [...q.items];
            return `<div class="question-item" id="q-${qi}" data-correct='${JSON.stringify(q.correctOrder)}' data-items='${JSON.stringify(q.items)}'>
                <p>Q${qi+1}. ${q.question}</p>
                <p style="font-size:0.82rem;color:#999;margin-bottom:0.8rem;">💡 拖曳項目或點擊上下箭頭調整順序</p>
                <div class="order-list" id="order-list-${qi}">
                    ${shuffled.map((item, oi) => `
                        <div class="order-item" data-idx="${oi}" draggable="true">
                            <span class="order-num">${oi+1}</span>
                            <span class="order-text">${item}</span>
                            <div class="order-arrows">
                                <button onclick="moveOrderItem(${qi}, ${oi}, -1)">▲</button>
                                <button onclick="moveOrderItem(${qi}, ${oi}, 1)">▼</button>
                            </div>
                        </div>`).join('')}
                </div>
                <button class="check-btn" style="margin-top:0.8rem;" onclick="checkOrder(${qi})">確認順序</button>
                <div class="feedback" id="fb-${qi}"></div>
            </div>`;
        } else {
            return `<div class="question-item" id="q-${qi}">
                <p>Q${qi+1}. ${q.question}</p>
                <div class="true-false-btns">
                    <button class="tf-btn" onclick="answerTF(${qi}, true, ${q.answer})">✅ Vrai（對）</button>
                    <button class="tf-btn" onclick="answerTF(${qi}, false, ${q.answer})">❌ Faux（錯）</button>
                </div>
                <div class="feedback" id="fb-${qi}"></div>
            </div>`;
        }
    }).join('');

    area.innerHTML = `
        <div class="exercise-card">
            <div class="exercise-header">
                <h3>📖 ${exercise.title}</h3>
                <span class="exercise-level-tag">${currentListeningLevel}</span>
            </div>
            <div class="exercise-body">
                <div class="tts-controls">
                    <button class="tts-btn" onclick="readArticle()">▶ 朗讀文章</button>
                    <button class="tts-btn stop" onclick="stopReading()">⏹ 停止</button>
                    <div class="speed-control">
                        <span>速度</span>
                        <input type="range" id="ttsSpeed" min="0.5" max="1.2" step="0.1" value="0.8">
                        <span id="speedVal">0.8x</span>
                    </div>
                </div>
                <div class="article-text" id="article-text">${exercise.article}</div>
                <div class="questions-section">
                    <h4>📝 理解測驗（共 ${totalQ} 題）</h4>
                    ${questionsHTML}
                </div>
                <div id="score-display"></div>
                <div style="margin-top:1.5rem;text-align:center;">
                    <button class="btn-primary" onclick="generateListening()">🔄 換一篇新文章</button>
                </div>
            </div>
        </div>`;

    // Speed display
    const speedSlider = document.getElementById('ttsSpeed');
    const speedVal = document.getElementById('speedVal');
    if (speedSlider) {
        speedSlider.addEventListener('input', () => {
            speedVal.textContent = speedSlider.value + 'x';
        });
    }
}

function readArticle() {
    if (!currentExercise) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentExercise.article);
    utterance.lang = 'fr-FR';
    utterance.rate = parseFloat(document.getElementById('ttsSpeed')?.value || '0.8');
    window.speechSynthesis.speak(utterance);
}

function stopReading() {
    window.speechSynthesis.cancel();
}

function answerQCM(qi, chosen, correct) {
    const container = document.getElementById('q-' + qi);
    if (container.dataset.answered) return;
    container.dataset.answered = '1';

    const btns = container.querySelectorAll('.option-btn');
    btns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === correct) btn.classList.add('reveal');
    });
    btns[chosen].classList.remove('reveal');
    btns[chosen].classList.add(chosen === correct ? 'correct' : 'wrong');

    if (chosen === correct) correctCount++;
    answeredCount++;
    updateScore();
}

function answerTF(qi, chosen, correct) {
    const container = document.getElementById('q-' + qi);
    if (container.dataset.answered) return;
    container.dataset.answered = '1';

    const btns = container.querySelectorAll('.tf-btn');
    btns.forEach(btn => btn.disabled = true);

    const isCorrect = chosen === correct;
    const idx = chosen ? 0 : 1;
    btns[idx].classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
        const correctIdx = correct ? 0 : 1;
        btns[correctIdx].classList.add('reveal');
    }

    const fb = document.getElementById('fb-' + qi);
    if (fb) {
        fb.textContent = isCorrect ? '✅ 正確！' : `❌ 正確答案是：${correct ? 'Vrai（對）' : 'Faux（錯）'}`;
        fb.className = 'feedback show ' + (isCorrect ? 'correct' : 'wrong');
    }

    if (isCorrect) correctCount++;
    answeredCount++;
    updateScore();
}

// --------- 排序題邏輯 ---------
function moveOrderItem(qi, currentIdx, direction) {
    const list = document.getElementById('order-list-' + qi);
    const items = Array.from(list.querySelectorAll('.order-item'));
    const targetIdx = currentIdx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    // Swap
    if (direction === -1) {
        list.insertBefore(items[currentIdx], items[targetIdx]);
    } else {
        list.insertBefore(items[targetIdx], items[currentIdx]);
    }

    // Re-number
    Array.from(list.querySelectorAll('.order-item')).forEach((el, i) => {
        el.querySelector('.order-num').textContent = i + 1;
        el.dataset.idx = i;
        // Update button click handlers
        const btns = el.querySelectorAll('.order-arrows button');
        btns[0].setAttribute('onclick', `moveOrderItem(${qi}, ${i}, -1)`);
        btns[1].setAttribute('onclick', `moveOrderItem(${qi}, ${i}, 1)`);
    });
}

function checkOrder(qi) {
    const container = document.getElementById('q-' + qi);
    if (container.dataset.answered) return;

    const list = document.getElementById('order-list-' + qi);
    const items = Array.from(list.querySelectorAll('.order-item'));
    const correctOrder = JSON.parse(container.dataset.correct);  // e.g. [1,2,0,3]
    const originalItems = JSON.parse(container.dataset.items);

    // Build user's current order of original indices
    const userOrder = items.map(el => {
        const text = el.querySelector('.order-text').textContent.trim();
        return originalItems.indexOf(text);
    });

    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);

    container.dataset.answered = '1';
    list.querySelectorAll('.order-arrows button').forEach(b => b.disabled = true);
    document.querySelector(`#q-${qi} .check-btn`).disabled = true;

    // Highlight
    items.forEach((el, i) => {
        const userOrigIdx = userOrder[i];
        const correctOrigIdx = correctOrder[i];
        el.style.borderLeft = `4px solid ${userOrigIdx === correctOrigIdx ? '#28a745' : '#ed2939'}`;
        el.style.background = userOrigIdx === correctOrigIdx ? '#e8f5e9' : '#fdecea';
    });

    const fb = document.getElementById('fb-' + qi);
    if (fb) {
        if (isCorrect) {
            fb.textContent = '✅ 完全正確！順序排列正確。';
            fb.className = 'feedback show correct';
        } else {
            const correctLabels = correctOrder.map(idx => originalItems[idx]).join(' → ');
            fb.textContent = `❌ 正確順序為：${correctLabels}`;
            fb.className = 'feedback show wrong';
        }
    }

    if (isCorrect) correctCount++;
    answeredCount++;
    updateScore();
}

function updateScore() {
    const total = currentExercise?.questions?.length || 0;
    if (answeredCount < total) return;

    const pct = Math.round((correctCount / total) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
    const msg = pct >= 80 ? 'Excellent ! 表現優秀！' : pct >= 60 ? 'Bien ! 繼續努力！' : 'Continue à pratiquer ! 多加練習！';

    document.getElementById('score-display').innerHTML = `
        <div class="score-section">
            <h3>${emoji} ${correctCount} / ${total} 題正確（${pct}%）</h3>
            <p>${msg}</p>
        </div>`;
}

// ==========================================
// AI Quiz 生成 (串接 Cloudflare API)
// ==========================================
async function generateQuiz() {
    const area = document.getElementById('quiz-area');
    area.innerHTML = `<div class="ai-loading"><div class="spinner"></div><p>正在由 AI 生成 ${currentQuizLevel} 的 ${currentQuizType}，請稍候…</p></div>`;

    // 根據使用者選擇的題型，動態調整 prompt
    let typeInstruction = "";
    let jsonQuestionFormat = "";

    if (currentQuizType === '選擇題') {
        typeInstruction = "全部出選擇題 (qcm)";
        jsonQuestionFormat = `{ "type": "qcm", "question": "問題(法文)", "options": ["選項A", "選項B", "選項C", "選項D"], "answer": 1, "explanation": "中文詳解" }`;
    } else if (currentQuizType === '填空題') {
        typeInstruction = "全部出填空題 (fill)";
        jsonQuestionFormat = `{ "type": "fill", "question": "問題，請用 ___ 表示空格", "answer": "正確答案", "hint": "中文提示" }`;
    } else if (currentQuizType === '是非題') {
        typeInstruction = "全部出是非題 (vrai_faux)";
        jsonQuestionFormat = `{ "type": "vrai_faux", "question": "問題(法文)", "answer": false, "explanation": "中文詳解" }`;
    }

    const prompt = `請生成一組法文程度測驗。
    等級：${currentQuizLevel}。
    題型要求：${typeInstruction}。請出 3 題。
    要求：回傳格式「必須」是純 JSON，絕對不要包含任何 markdown 標記 (如 \`\`\`json) 或其他文字說明。
    JSON 格式必須完全符合以下結構：
    {
        "title": "Test de niveau - ${currentQuizLevel}",
        "questions": [
            ${jsonQuestionFormat},
            ${jsonQuestionFormat},
            ${jsonQuestionFormat}
        ]
    }`;

    try {
        const response = await fetch("https://french-tutor-api.411277003.workers.dev/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1500,
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();

        if (data.type === "error" || data.error) {
            throw new Error(data.error?.message || "API 發生錯誤");
        }

        let aiText = data.content[0].text;
        aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        const quizData = JSON.parse(aiText);

        renderQuiz(quizData);

    } catch (error) {
        console.error("API Error:", error);
        area.innerHTML = `
            <div class="listening-placeholder">
                <div class="placeholder-icon">⚠️</div>
                <p>生成失敗，錯誤訊息：</p>
                <p style="color: #ed2939; font-size: 0.9rem; word-break: break-all;">${error.message}</p>
                <p style="font-size:0.8rem; color:#999; margin-top: 10px;">(提示：請確認 API 額度是否充足，或稍後再試)</p>
                <button class="btn-primary" style="margin-top: 15px;" onclick="generateQuiz()">🔄 重試</button>
            </div>`;
    }
}

function renderQuiz(quiz) {
    const area = document.getElementById('quiz-area');
    answeredCount = 0;
    correctCount = 0;
    currentExercise = quiz;

    let questionsHTML = quiz.questions.map((q, qi) => {
        if (q.type === 'qcm') {
            return `<div class="question-item" id="qq-${qi}">
                <p>Q${qi+1}. ${q.question}</p>
                <div class="options-grid">
                    ${q.options.map((opt, oi) => `
                        <button class="option-btn" onclick="answerQuizQCM(${qi}, ${oi}, ${q.answer}, '${(q.explanation||'').replace(/'/g,"\\'")}')">
                            ${String.fromCharCode(65+oi)}. ${opt}
                        </button>`).join('')}
                </div>
                <div class="feedback" id="qqfb-${qi}"></div>
            </div>`;
        } else if (q.type === 'fill') {
            return `<div class="question-item" id="qq-${qi}">
                <p>Q${qi+1}. ${q.question}</p>
                ${q.hint ? `<p style="font-size:0.82rem;color:#999;margin-bottom:0.5rem;">💡 提示：${q.hint}</p>` : ''}
                <input type="text" class="fill-blank-input" id="fill-${qi}" placeholder="輸入答案…">
                <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
                    <button class="check-btn" onclick="checkFill(${qi}, '${q.answer.replace(/'/g,"\\'")}')">確認</button>
                </div>
                <div class="feedback" id="qqfb-${qi}"></div>
            </div>`;
        } else {
            return `<div class="question-item" id="qq-${qi}">
                <p>Q${qi+1}. ${q.question}</p>
                <div class="true-false-btns">
                    <button class="tf-btn" onclick="answerQuizTF(${qi}, true, ${q.answer}, '${(q.explanation||'').replace(/'/g,"\\'")}')">✅ Vrai（對）</button>
                    <button class="tf-btn" onclick="answerQuizTF(${qi}, false, ${q.answer}, '${(q.explanation||'').replace(/'/g,"\\'")}')">❌ Faux（錯）</button>
                </div>
                <div class="feedback" id="qqfb-${qi}"></div>
            </div>`;
        }
    }).join('');

    area.innerHTML = `
        <div class="exercise-card">
            <div class="exercise-header">
                <h3>🧠 ${quiz.title}</h3>
                <span class="exercise-level-tag">${currentQuizLevel} · ${currentQuizType}</span>
            </div>
            <div class="exercise-body">
                ${questionsHTML}
                <div id="quiz-score-display"></div>
                <div style="margin-top:1.5rem;text-align:center;">
                    <button class="btn-primary" onclick="generateQuiz()">🔄 換一組新題目</button>
                </div>
            </div>
        </div>`;
}

function answerQuizQCM(qi, chosen, correct, explanation) {
    const container = document.getElementById('qq-' + qi);
    if (container.dataset.answered) return;
    container.dataset.answered = '1';

    const btns = container.querySelectorAll('.option-btn');
    btns.forEach((btn, i) => {
        btn.disabled = true;
        if (i === correct) btn.classList.add('reveal');
    });
    btns[chosen].classList.remove('reveal');
    const isCorrect = chosen === correct;
    btns[chosen].classList.add(isCorrect ? 'correct' : 'wrong');

    const fb = document.getElementById('qqfb-' + qi);
    if (fb && explanation) {
        fb.textContent = (isCorrect ? '✅ 正確！' : '❌ 答錯了。') + (explanation ? ' ' + explanation : '');
        fb.className = 'feedback show ' + (isCorrect ? 'correct' : 'wrong');
    }

    if (isCorrect) correctCount++;
    answeredCount++;
    updateQuizScore();
}

function answerQuizTF(qi, chosen, correct, explanation) {
    const container = document.getElementById('qq-' + qi);
    if (container.dataset.answered) return;
    container.dataset.answered = '1';

    const btns = container.querySelectorAll('.tf-btn');
    btns.forEach(btn => btn.disabled = true);
    const isCorrect = chosen === correct;
    const idx = chosen ? 0 : 1;
    btns[idx].classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
        const correctIdx = correct ? 0 : 1;
        btns[correctIdx].classList.add('reveal');
    }

    const fb = document.getElementById('qqfb-' + qi);
    if (fb) {
        fb.textContent = (isCorrect ? '✅ 正確！' : `❌ 正確答案是 ${correct ? 'Vrai' : 'Faux'}。`) + (explanation ? ' ' + explanation : '');
        fb.className = 'feedback show ' + (isCorrect ? 'correct' : 'wrong');
    }

    if (isCorrect) correctCount++;
    answeredCount++;
    updateQuizScore();
}

function checkFill(qi, answer) {
    const input = document.getElementById('fill-' + qi);
    const container = document.getElementById('qq-' + qi);
    if (container.dataset.answered) return;

    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = answer.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;

    container.dataset.answered = '1';
    input.disabled = true;
    input.classList.add(isCorrect ? 'correct' : 'wrong');

    const fb = document.getElementById('qqfb-' + qi);
    fb.textContent = isCorrect ? '✅ 正確！' : `❌ 正確答案是：${answer}`;
    fb.className = 'feedback show ' + (isCorrect ? 'correct' : 'wrong');

    if (isCorrect) correctCount++;
    answeredCount++;
    updateQuizScore();
}

function updateQuizScore() {
    const total = currentExercise?.questions?.length || 0;
    if (answeredCount < total) return;

    const pct = Math.round((correctCount / total) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📖';
    const msg = pct >= 80 ? 'Félicitations ! 成績優秀！' : pct >= 60 ? 'Bien ! 繼續加油！' : 'Courage ! 多複習後再試。';

    document.getElementById('quiz-score-display').innerHTML = `
        <div class="score-section">
            <h3>${emoji} ${correctCount} / ${total} 題正確（${pct}%）</h3>
            <p>${msg}</p>
        </div>`;
}

// ==========================================
// 法國新聞 — 真實 RSS 即時抓取
// ==========================================

// rss2json.com 免費 API，無需金鑰，每天有限制次數
const RSS_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// 各來源的 RSS 網址與分類標籤
const newsSources = [
    { url: 'https://www.lemonde.fr/rss/une.xml',          label: 'Le Monde',    color: '#002395' },
    { url: 'https://www.francetvinfo.fr/titres.rss',      label: 'France Info', color: '#ed2939' },
    { url: 'https://www.lefigaro.fr/rss/figaro_actualites.xml', label: 'Le Figaro', color: '#6a1b9a' },
];

// 備用靜態新聞（當 RSS 完全失敗時顯示）
const fallbackNews = [
    { title: 'Le gouvernement annonce un nouveau plan économique', desc: 'Des mesures sont prévues pour stimuler la croissance et réduire le chômage en France.', date: "Aujourd'hui", url: 'https://www.lemonde.fr', label: 'Le Monde', color: '#002395' },
    { title: "L'intelligence artificielle : enjeux pour la France", desc: "La France investit massivement dans l'IA pour renforcer sa compétitivité européenne.", date: "Aujourd'hui", url: 'https://www.lefigaro.fr', label: 'Le Figaro', color: '#6a1b9a' },
    { title: 'Nouvelles recommandations pour la santé des jeunes', desc: 'Les experts préconisent une limitation du temps passé sur les réseaux sociaux.', date: 'Hier', url: 'https://www.francetvinfo.fr', label: 'France Info', color: '#ed2939' },
    { title: "La langue française intègre de nouveaux mots", desc: "L'Académie française examine des termes liés au numérique et à l'environnement.", date: 'Cette semaine', url: 'https://www.lemonde.fr', label: 'Le Monde', color: '#002395' },
    { title: 'Festival de Cannes : la sélection officielle dévoilée', desc: "Des films français et internationaux concourront pour la Palme d'Or cette année.", date: 'Cette semaine', url: 'https://www.lefigaro.fr', label: 'Le Figaro', color: '#6a1b9a' },
    { title: 'Sport français : bilan de la saison', desc: "Retour sur les performances des athlètes français dans les compétitions internationales.", date: 'Cette semaine', url: 'https://www.francetvinfo.fr', label: 'France Info', color: '#ed2939' },
];

function timeAgo(dateStr) {
    try {
        const pub = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - pub) / 60000); // minutes
        if (diff < 60)   return `Il y a ${diff} min`;
        if (diff < 1440) return `Il y a ${Math.floor(diff/60)}h`;
        if (diff < 2880) return 'Hier';
        return `Il y a ${Math.floor(diff/1440)} jours`;
    } catch { return ''; }
}

function stripHtml(html) {
    return html ? html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim() : '';
}

function renderNewsCards(items) {
    const grid = document.getElementById('news-grid');
    if (!grid) return;
    grid.innerHTML = items.slice(0, 6).map(n => `
        <div class="news-card" onclick="window.open('${n.url || n.link}','_blank')">
            <div class="news-card-cat" style="background:${n.color || '#002395'}">${n.label || 'Actualité'}</div>
            <div class="news-card-body">
                <h3>${n.title}</h3>
                <p>${n.desc || n.description || ''}</p>
            </div>
            <div class="news-card-footer">
                <span class="news-card-date">🕐 ${n.date || timeAgo(n.pubDate)}</span>
                <span class="news-card-link">Lire la suite →</span>
            </div>
        </div>`).join('');
}

async function fetchOneSource(src) {
    const res = await fetch(`${RSS_API}${encodeURIComponent(src.url)}&count=3`, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (data.status !== 'ok' || !data.items?.length) throw new Error('No items');
    return data.items.map(item => ({
        title: item.title,
        desc: stripHtml(item.description).substring(0, 120) + '…',
        url: item.link,
        date: timeAgo(item.pubDate),
        label: src.label,
        color: src.color,
    }));
}

async function loadNews() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="news-loading">📡 正在抓取法國即時新聞…</div>';

    try {
        // 並行抓取所有來源，各自最多等 6 秒
        const results = await Promise.allSettled(newsSources.map(fetchOneSource));
        const allItems = results
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value);

        if (allItems.length >= 3) {
            renderNewsCards(allItems);
            // 顯示更新時間
            const header = document.querySelector('.news-header');
            if (header && !header.querySelector('.news-update-time')) {
                const ts = document.createElement('span');
                ts.className = 'news-update-time';
                ts.style.cssText = 'font-size:0.75rem;color:#999;margin-left:auto;';
                ts.textContent = `更新於 ${new Date().toLocaleTimeString('zh-TW', {hour:'2-digit',minute:'2-digit'})}`;
                header.appendChild(ts);
            }
        } else {
            throw new Error('Not enough articles');
        }
    } catch (err) {
        console.warn('RSS 抓取失敗，顯示備用新聞：', err);
        renderNewsCards(fallbackNews);
        const grid2 = document.getElementById('news-grid');
        if (grid2) {
            const note = document.createElement('p');
            note.style.cssText = 'grid-column:1/-1;text-align:center;font-size:0.8rem;color:#bbb;padding-top:0.5rem;';
            note.textContent = '⚠️ 無法連接 RSS，顯示範例新聞';
            grid2.appendChild(note);
        }
    }
}

// ==========================================
// 單字區塊動態生成
// ==========================================
function setupVocabSection(level, title, data) {
    const section = document.getElementById(`vocab-${level}`);
    if (!section) return;
    section.innerHTML = buildVocabHTML(level, title, data);
    renderVocab(data, `vocab-grid-${level}`);
}

// ==========================================
// 文法區塊動態生成
// ==========================================
function setupGrammarSection(level, title) {
    const section = document.getElementById(`grammar-${level}`);
    if (!section) return;
    const data = grammarData[level];
    if (!data) return;
    section.innerHTML = buildGrammarHTML(level, title, data);
    initAccordions(`grammar-container-${level}`);
}

// ==========================================
// 初始化
// ==========================================
window.onload = () => {
    // 單字區塊
    setupVocabSection('a1', '📚 Vocabulaire — A1 基礎單字', vocabDataA1);
    setupVocabSection('a2', '📚 Vocabulaire — A2 初級單字', vocabDataA2);
    setupVocabSection('b1', '📚 Vocabulaire — B1 中級單字', vocabDataB1);
    setupVocabSection('b2', '📚 Vocabulaire — B2 中高級單字', vocabDataB2);

    // 文法區塊
    setupGrammarSection('a1', '📖 Grammaire — A1 基礎文法');
    setupGrammarSection('a2', '📖 Grammaire — A2 初級文法');
    setupGrammarSection('b1', '📖 Grammaire — B1 中級文法');
    setupGrammarSection('b2', '📖 Grammaire — B2 高級文法');

    // 新聞
    loadNews();
};
