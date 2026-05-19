// ===== 音效系统 =====
var soundEnabled = true;
var clickSoundEnabled = true;

function loadSoundSettings() {
  try {
    soundEnabled = localStorage.getItem('tiger_sound') !== 'false';
    clickSoundEnabled = localStorage.getItem('tiger_clicksound') !== 'false';
  } catch(e) {}
}

function saveSoundSettings() {
  try {
    localStorage.setItem('tiger_sound', String(soundEnabled));
    localStorage.setItem('tiger_clicksound', String(clickSoundEnabled));
  } catch(e) {}
}

function playClickSound() {
  if (!clickSoundEnabled || !soundEnabled) return;
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch(e) {}
}

function playCorrectSound() {
  if (!soundEnabled) return;
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach(function(freq, i){
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain).connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.2);
    });
  } catch(e) {}
}

function playWrongSound() {
  if (!soundEnabled) return;
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch(e) {}
}

function playWinFanfare() {
  if (!soundEnabled) return;
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784,1047,784,1047].forEach(function(freq,i){
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain).connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i*0.12);
      gain.gain.setValueAtTime(0.09, ctx.currentTime + i*0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.12 + 0.25);
      osc.start(ctx.currentTime+i*0.12);
      osc.stop(ctx.currentTime+i*0.12+0.25);
    });
  } catch(e) {}
}

function toggleSound() {
  soundEnabled = document.getElementById('toggle-sound').checked;
  saveSoundSettings();
}

function toggleClickSound() {
  clickSoundEnabled = document.getElementById('toggle-clicksound').checked;
  saveSoundSettings();
  // 点击时播放一次声音（如果开启）
  if (clickSoundEnabled && soundEnabled) { /* already played via inline */ }
}


// ===== 图片模式：'photo' (真实照片) / 'emoji' (纯 emoji) =====
var imageMode = 'photo';

function loadImageMode() {
  try {
    var saved = localStorage.getItem('tiger_imgmode');
    if (saved === 'photo' || saved === 'emoji') imageMode = saved;
  } catch(e) {}
}

function saveImageMode() {
  try { localStorage.setItem('tiger_imgmode', imageMode); } catch(e) {}
}

function setImageMode(mode) {
  if (mode !== 'photo' && mode !== 'emoji') return;
  imageMode = mode;
  saveImageMode();
  updateImageModeButtons();
  // 切换模式后，如果正在游戏中，重新渲染当前题目的选项
  if (currentQ && document.getElementById('game-screen').style.display === 'block') {
    var cards = document.querySelectorAll('.pic-card');
    // 已答完的题不重渲染（避免干扰反馈动画）
    if (cards.length && !cards[0].dataset.answered) {
      // 重新生成当前题，保持 currentQ 不变
      round--; // nextQuestion 会再 round++
      nextQuestion();
    }
  }
}

function updateImageModeButtons() {
  var p = document.getElementById('img-photo');
  var e = document.getElementById('img-emoji');
  if (p) p.classList.toggle('active', imageMode === 'photo');
  if (e) e.classList.toggle('active', imageMode === 'emoji');
}


// ===== 多语言系统 =====
var currentLang = 'en';

var I18N = {
  en: {
    home_title:"Tiger's English",
    home_subtitle:"Choose the picture for the word!",
    play_btn:"PLAY!",
    review_shortcut:"Review",
    stat_stars:"Total Stars",
    stat_words_learned:"Words",
    stat_streak:"Best Streak",
    stat_games:"Games",
    cat_title:"Choose a Category!",
    cat_subtitle:"Pick one and start playing!",
    back_btn:"Back",
    exit_btn:"Exit",
    rank_super_star:"Super Star!",
    result_great_job:"Great Job, Tiger!",
    res_correct:"Correct",
    res_wrong:"Wrong",
    res_best_streak:"Best Streak",
    res_stars_earned:"Stars Earned",
    wrong_title:"Words to Practice:",
    restart_btn:"Restart",
    next_game_btn:"Next Game",
    home_btn:"Home",
    settings_title:"Settings",
    set_language_label:"Language",
    set_imgmode_label:"Image Style",
    set_imgmode_photo:"Photos",
    set_voice_label:"Pronunciation Voice",
    set_voice_preview:"Test Voice",
    set_sound_label:"Sound Effects",
    set_sound_onoff:"Sound On / Off",
    set_clicksound_label:"Button Sounds",
    set_clicksound_onoff:"Click Sound On / Off",
    settings_close:"Done!",
    ach_close:"Yay!",
    fb_correct:"Great!",
    fb_wrong:"Oops!",
    fb_correct_answer:"This one!",
    confirm_restart_title:"Restart Game?",
    confirm_restart_msg:"Do you want to play this round again with the same category? Your progress will be reset!",
    confirm_restart_btn:"Restart!",
    confirm_home_title:"Go Home?",
    confirm_home_msg:"Are you sure you want to go back to the home page?",
    confirm_home_btn:"Go Home",
    confirm_yes:"Yes!",
    confirm_no:"No",
    cat_all:"All Categories",
    cat_words:"words",
    mastered_popup_title:" Mastered!",
    mastered_popup_desc:"You got every word right in ",
    mastered_popup_desc2:"! Amazing, Tiger!"
  },
  zh: {
    home_title:"Tiger的英语乐园",
    home_subtitle:"看单词选图片！",
    play_btn:"开始游戏！",
    review_shortcut:"复习",
    stat_stars:"总星星数",
    stat_words_learned:"单词量",
    stat_streak:"最高连击",
    stat_games:"游戏次数",
    cat_title:"选择一个分类！",
    cat_subtitle:"选一个就开始玩吧！",
    back_btn:"返回",
    exit_btn:"退出",
    rank_super_star:"超级明星！",
    result_great_job:"太棒了，Tiger！",
    res_correct:"答对",
    res_wrong:"答错",
    res_best_streak:"最高连击",
    res_stars_earned:"获得星星",
    wrong_title:"需要复习的单词：",
    restart_btn:"重新开始",
    next_game_btn:"下一局",
    home_btn:"主页",
    settings_title:"设置",
    set_language_label:"语言",
    set_imgmode_label:"图片样式",
    set_imgmode_photo:"真实图",
    set_voice_label:"发音声音",
    set_voice_preview:"试听",
    set_sound_label:"音效",
    set_sound_onoff:"音效 开/关",
    set_clicksound_label:"按键音",
    set_clicksound_onoff:"按键音 开/关",
    settings_close:"完成！",
    ach_close:"太棒了！",
    fb_correct:"答对了！",
    fb_wrong:"哎呀！",
    fb_correct_answer:"是这个！",
    confirm_restart_title:"重新开始？",
    confirm_restart_msg:"确定要重新玩当前分类吗？进度会重置哦！",
    confirm_restart_btn:"重新开始！",
    confirm_home_title:"返回主页？",
    confirm_home_msg:"确定要返回主页吗？",
    confirm_home_btn:"返回主页",
    confirm_yes:"是的！",
    confirm_no:"取消",
    cat_all:"全部分类",
    cat_words:"个单词",
    mastered_popup_title:" 已通关！",
    mastered_popup_desc:"你全部答对了「",
    mastered_popup_desc2:"」里的所有单词！太厉害了，Tiger！"
  }
};

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || (I18N['en'][key]) || key;
}

function setLanguage(lang) {
  currentLang = lang;
  try { localStorage.setItem('tiger_lang', lang); } catch(e) {}
  
  // 更新UI（空 key 跳过，防止清掉那些只用作 emoji 装饰的按钮）
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = t(key);
  });
  
  // 更新语言按钮状态
  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
  if (typeof refreshFeatureBadges === 'function') refreshFeatureBadges();
}

function applyLanguage() {
  setLanguage(currentLang);
}

function loadLanguage() {
  try { 
    var saved = localStorage.getItem('tiger_lang'); 
    if (saved === 'zh' || saved === 'en') currentLang = saved;
  } catch(e) {}
}


// ===== 团团可拖拽功能（移动端优化版） =====
(function(){
  var tt=null, dx=0, dy=0, dragging=false, moved=false;

  window.addEventListener('load',function(){
    tt = document.getElementById('tuantuan');
    if (!tt) return;

    // 鼠标拖拽 - 只在mousedown时添加事件监听，确保不干扰点击
    tt.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return; // 只响应左键
      moved = false;
      dragging = false;
      dx = e.clientX - tt.offsetLeft;
      dy = e.clientY - tt.offsetTop;
      tt.style.transition = 'none';

      function onMove(ev) {
        var newX = ev.clientX - dx;
        var newY = ev.clientY - dy;
        // 移动超过10px才算拖拽（区分点击和拖拽）
        if (!dragging && (Math.abs(newX - tt.offsetLeft) > 10 || Math.abs(newY - tt.offsetTop) > 10)) {
          dragging = true;
          moved = true;
        }
        if (!dragging) return;

        // 边界约束
        newX = Math.max(0, Math.min(newX, window.innerWidth - tt.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - tt.offsetHeight));

        tt.style.right = 'auto';
        tt.style.bottom = 'auto';
        tt.style.left = newX + 'px';
        tt.style.top = newY + 'px';
        updateMsgPosition();
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        tt.style.transition = '';
        if (moved) {
          try { localStorage.setItem('tuantuan_pos', JSON.stringify({left: tt.offsetLeft, top: tt.offsetTop})); } catch(ex) {}
        }
        dragging = false;
        moved = false;
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // 触摸拖拽 【优化：只在确认拖拽后才preventDefault，不干扰正常点击】
    tt.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      // 【关键修改】不再在 touchstart 就 preventDefault
      // 这样如果用户只是点击团团说话，不会影响页面其他行为
      moved = false;
      dragging = false;
      var t = e.touches[0];
      dx = t.clientX - tt.offsetLeft;
      dy = t.clientY - tt.offsetTop;
      tt.style.transition = 'none';

      function onTMove(ev) {
        if (!ev.touches.length) return;
        var touch = ev.touches[0];
        var newX = touch.clientX - dx;
        var newY = touch.clientY - dy;
        if (!dragging && (Math.abs(newX - tt.offsetLeft) > 12 || Math.abs(newY - tt.offsetTop) > 12)) {
          dragging = true;
          moved = true;
        }
        // 【关键】只有真正开始拖拽了才阻止默认滚动
        if (dragging) { e.preventDefault(); ev.preventDefault(); }
        if (!dragging) return;

        newX = Math.max(0, Math.min(newX, window.innerWidth - tt.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - tt.offsetHeight));

        tt.style.right = 'auto';
        tt.style.bottom = 'auto';
        tt.style.left = newX + 'px';
        tt.style.top = newY + 'px';
        updateMsgPosition();
      }

      function onTEnd() {
        document.removeEventListener('touchmove', onTMove);
        document.removeEventListener('touchend', onTEnd);
        tt.style.transition = '';
        if (moved) {
          try { localStorage.setItem('tuantuan_pos', JSON.stringify({left: tt.offsetLeft, top: tt.offsetTop})); } catch(ex) {}
        }
        dragging = false;
        moved = false;
      }

      document.addEventListener('touchmove', onTMove, {passive: false});
      document.addEventListener('touchend', onTEnd);
    }, {passive: false});
  });
})();

// ===== 团团气泡跟随 =====
function updateMsgPosition() {
  var el = document.getElementById('tuantuan-msg');
  if (!el.classList.contains('show')) return;
  var tt = document.getElementById('tuantuan');
  var rect = tt.getBoundingClientRect();
  
  if (rect.left >= 290) {
    el.style.left = (rect.left - 280) + 'px';
    el.style.top = (rect.top - 10) + 'px';
  } else {
    el.style.left = (rect.right + 15) + 'px';
    el.style.top = (rect.top - 20) + 'px';
  }
}

// ===== STATE =====
var score = 0, streak = 0, bestStreak = 0, gameBestStreak = 0, round = 0;
// bestStreak    : 历史最高连击（持久化到 localStorage）
// gameBestStreak: 当前这一局的最高连击（每局开始时清零，用于结算页 res-streak）
var totalStars = 0, gamesPlayed = 0;
var currentQ = null, gameWords = [];
var selectedCat = '';
var gameMode = 'normal';
var correctCount = 0, wrongCount = 0;
var wrongAnswersList = [];
var ROUNDS_PER_GAME = 10;
var isAnswering = false; // 【关键】全局答题锁，防止移动端重复触发

// ===== 已掌握单词追踪 =====
var learnedWords = {};  // key: word, value: true

function loadLearnedWords() {
  try { learnedWords = JSON.parse(localStorage.getItem('tiger_learned') || '{}'); } catch(e) {}
}
loadLearnedWords();

function saveLearnedWords() {
  try { localStorage.setItem('tiger_learned', JSON.stringify(learnedWords)); } catch(e) {}
}

function getLearnedCount() { return Object.keys(learnedWords).length; }
function getTotalWordCount() { return countAllWords(); }
function markWordLearned(word) { if (word) { learnedWords[word] = true; saveLearnedWords(); } }

// ===== 分类通关系统 =====
var masteredCategories = {};
function loadMastered() {
  try { masteredCategories = JSON.parse(localStorage.getItem('tiger_mastered') || '{}'); } catch(e) {}
}
loadMastered();

function saveMastered() {
  try { localStorage.setItem('tiger_mastered', JSON.stringify(masteredCategories)); } catch(e) {}
}

function isCatMastered(catName) {
  return !!masteredCategories[catName];
}

var MAIN_SCREEN_IDS = ['home-screen','cat-select-screen','game-screen','result-screen','review-screen','collection-screen'];

function showOnlyScreen(screenId, displayMode) {
  MAIN_SCREEN_IDS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var target = document.getElementById(screenId);
  if (target) target.style.display = displayMode || 'block';
}

function refreshFeatureBadges() {
  if (typeof refreshDailyStreakUI === 'function') refreshDailyStreakUI();
  if (typeof refreshReviewShortcut === 'function') refreshReviewShortcut();
  if (typeof refreshCollectionShortcut === 'function') refreshCollectionShortcut();
}

// ===== INIT =====
function init() {
  try {
    loadStats();
    loadSoundSettings();
    loadImageMode();
    loadVoiceSettings();
    loadLanguage();
    if (typeof loadDailyStreak === 'function') loadDailyStreak();
    if (typeof loadReviewPool === 'function') loadReviewPool();
    buildCatPageGrid();
    updateImageModeButtons();
    updateWordsLearnedDisplay();
    // 初始化语音列表（部分浏览器 getVoices 异步加载）
    refreshVoices();
    if ('onvoiceschanged' in speechSynthesis) {
      speechSynthesis.onvoiceschanged = refreshVoices;
    }
    var bsEl = document.getElementById('best-streak');
    if (bsEl) bsEl.textContent = bestStreak;
    var gpEl = document.getElementById('games-played');
    if (gpEl) gpEl.textContent = gamesPlayed;
    applyLanguage();
    var tsEl = document.getElementById('toggle-sound');
    if (tsEl) tsEl.checked = soundEnabled;
    var csEl = document.getElementById('toggle-clicksound');
    if (csEl) csEl.checked = clickSoundEnabled;
    refreshFeatureBadges();
  } catch(e) {
    console.error('init error:', e);
  }
}

function loadStats() {
  totalStars = parseInt(localStorage.getItem('tiger_totalstars') || '0', 10);
  bestStreak = parseInt(localStorage.getItem('tiger_beststreak') || '0', 10);
  gamesPlayed = parseInt(localStorage.getItem('tiger_gamesplayed') || '0', 10);
}

function saveStats() {
  localStorage.setItem('tiger_totalstars', String(totalStars));
  localStorage.setItem('tiger_beststreak', String(bestStreak));
  localStorage.setItem('tiger_gamesplayed', String(gamesPlayed));
}

// ===== 设置弹窗 =====
function openSettings() {
  try { playClickSound(); } catch(e) {}
  var so = document.getElementById('settings-overlay');
  if (!so) return;
  so.classList.add('show');
  var en = document.getElementById('lang-en');
  var zh = document.getElementById('lang-zh');
  if (en) en.classList.toggle('active', currentLang === 'en');
  if (zh) zh.classList.toggle('active', currentLang === 'zh');
  updateImageModeButtons();
  refreshVoices();
}

function closeSettings() {
  try { playClickSound(); } catch(e) {}
  var so = document.getElementById('settings-overlay');
  if (so) so.classList.remove('show');
}

// ===== 分类选择页面 =====
function buildCatPageGrid() {
  var g = document.getElementById('cat-page-grid');
  var html = '';
  html += '<button class="cat-page-btn cat-page-btn-all" onclick="playClickSound();startGameWithCat(\'All\')">' + t('cat_all') + ' (' + countAllWords() + ' ' + t('cat_words') + ')</button>';
  var i;
  for (i = 0; i < CATEGORIES.length; i++) {
    var catName = CATEGORIES[i];
    var icon = CAT_ICONS[catName] || '📚';
    var cnt = WORDS_DB[catName].length;
    var starHtml = isCatMastered(catName) ? '<span class="cp-mastered">⭐</span>' : '';
    html += '<button class="cat-page-btn" style="position:relative" onclick="playClickSound();startGameWithCat(\'' + esc(catName) + '\')">';
    html += starHtml;
    html += '<span class="cp-icon">' + icon + '</span>';
    html += '<span class="cp-name">' + esc(catName) + '</span> <small>(' + cnt + ')</small>';
    html += '</button>';
  }
  g.innerHTML = html;
}

function countAllWords() {
  var total = 0, i;
  for (i = 0; i < CATEGORIES.length; i++) total += WORDS_DB[CATEGORIES[i]].length;
  return total;
}

function showCatSelect() {
  showOnlyScreen('cat-select-screen', 'flex');
  var cs = document.getElementById('cat-select-screen');
  cs.scrollTop = 0;  // 每次进来都从顶部开始，不沿用上次的滚动位置
  buildCatPageGrid();
}

function goHomeFromCat() {
  goHome();
}

// ===== GAME FLOW =====
function startGameWithCat(cat) {
  selectedCat = cat;
  gameMode = 'normal';

  score = 0; streak = 0; round = 0; correctCount = 0; wrongCount = 0; gameBestStreak = 0;
  wrongAnswersList = [];
  isAnswering = false; // 重置答题锁

  var pool = [];
  if (selectedCat === 'All') {
    var i;
    for (i = 0; i < CATEGORIES.length; i++) {
      pool = pool.concat(WORDS_DB[CATEGORIES[i]]);
    }
  } else {
    pool = (WORDS_DB[selectedCat] || []).slice();
  }

  if (pool.length > ROUNDS_PER_GAME) {
    pool = shuffle(pool);
    gameWords = pool.slice(0, ROUNDS_PER_GAME);
  } else {
    gameWords = shuffle(pool).slice();
  }

  showOnlyScreen('game-screen', 'block');

  var label = selectedCat === 'All' ? 'All' : selectedCat;
  document.getElementById('category-tag').textContent = label;

  updateUI();
  nextQuestion();
}

function startCustomGame(label, words, mode) {
  selectedCat = label || 'Practice';
  gameMode = mode || 'custom';
  score = 0; streak = 0; round = 0; correctCount = 0; wrongCount = 0; gameBestStreak = 0;
  wrongAnswersList = [];
  isAnswering = false;
  gameWords = shuffle((words || []).slice()).slice(0, ROUNDS_PER_GAME);

  if (!gameWords.length) {
    goHome();
    return;
  }

  showOnlyScreen('game-screen', 'block');
  document.getElementById('category-tag').textContent = selectedCat;
  updateUI();
  nextQuestion();
}

function exitToHome() {
  goHome();
}

function refreshHomeStats() {
  try {
    updateWordsLearnedDisplay();
    bestStreak = parseInt(localStorage.getItem('tiger_beststreak') || '0', 10);
    var bsEl = document.getElementById('best-streak');
    if (bsEl) bsEl.textContent = bestStreak;
    var gpEl = document.getElementById('games-played');
    if (gpEl) gpEl.textContent = gamesPlayed;
    refreshFeatureBadges();
  } catch(e) { console.error('refreshHomeStats error:', e); }
}

function updateWordsLearnedDisplay() {
  var el = document.getElementById('words-learned');
  if (!el) return;
  el.innerHTML = getLearnedCount() + '<span class="stat-total">/' + getTotalWordCount() + '</span>';
  if (typeof refreshCollectionShortcut === 'function') refreshCollectionShortcut();
}

function nextQuestion() {
  if (round >= gameWords.length) { showResults(); return; }
  isAnswering = false;
  currentQ = gameWords[round];

  document.getElementById('the-word').textContent = currentQ.w;
  document.getElementById('word-hint').textContent = '';

  // 干扰项过滤器：
  // - photo 模式只去重完全相同的条目
  // - emoji 模式必须确保干扰项的 emoji 与正确答案不同（否则视觉上无法区分）
  function isValidDistractor(item) {
    if (imageMode === 'emoji') {
      return item.e !== currentQ.e;
    }
    return item.w !== currentQ.w || item.e !== currentQ.e;
  }

  var catPool;
  if (selectedCat === 'All') {
    var allPool = [], j;
    for (j = 0; j < CATEGORIES.length; j++) allPool = allPool.concat(WORDS_DB[CATEGORIES[j]]);
    catPool = allPool.filter(isValidDistractor);
  } else {
    catPool = (WORDS_DB[selectedCat] || []).filter(isValidDistractor);
  }

  if (catPool.length < 3) {
    var extras = [];
    var k;
    for (k = 0; k < CATEGORIES.length; k++) {
      if (CATEGORIES[k] !== selectedCat) {
        extras = extras.concat(WORDS_DB[CATEGORIES[k]]);
      }
    }
    extras = extras.filter(isValidDistractor);
    catPool = catPool.concat(extras);
  }

  // emoji 模式下进一步保证 3 个干扰项之间 emoji 也互不相同
  if (imageMode === 'emoji') {
    catPool = shuffle(catPool);
    var picked = [];
    var usedEmojis = {};
    usedEmojis[currentQ.e] = true;
    for (var m = 0; m < catPool.length && picked.length < 3; m++) {
      if (!usedEmojis[catPool[m].e]) {
        picked.push(catPool[m]);
        usedEmojis[catPool[m].e] = true;
      }
    }
    catPool = picked;
  } else {
    catPool = shuffle(catPool).slice(0, 3);
  }
  var options = shuffle([currentQ].concat(catPool));

  renderOptions(options);
  renderDots();
  speakWord();
  round++;
}

function renderOptions(options) {
  var area = document.getElementById('pics-area');
  area.innerHTML = '';
  var idx;
  for (idx = 0; idx < options.length; idx++) {
    (function(opt, i) {
      var card = document.createElement('div');
      card.className = 'pic-card';
      // photo 模式且有真实图片URL时用<img>；emoji 模式或无图时直接用 emoji；img 加载失败也自动 fallback 到 emoji
      if (opt.i && imageMode === 'photo') {
        var img = document.createElement('img');
        img.className = 'real-pic';
        img.src = opt.i;
        img.alt = opt.w;
        img.loading = 'lazy';
        // 图片加载失败时自动替换为emoji
        img.onerror = function() {
          var emojiDiv = document.createElement('div');
          emojiDiv.className = 'pic-emoji';
          emojiDiv.textContent = opt.e || '?';
          this.replaceWith(emojiDiv);
        };
        var picEl = img;
      } else {
        var emojiDiv = document.createElement('div');
        emojiDiv.className = 'pic-emoji';
        emojiDiv.textContent = opt.e;
        var picEl = emojiDiv;
      }
      var overlay = document.createElement('div');
      overlay.className = 'feedback-overlay';
      overlay.innerHTML = '<div class="fb-emoji"></div><div class="fb-text"></div>';
      card.appendChild(picEl);
      card.appendChild(overlay);
      // 统一处理点击和触摸：用 handleCardClick 包装
      card.addEventListener('touchend', function(e) {
        e.preventDefault(); // 阻止后续 click 事件（防重复触发）
        handleCardClick(card, opt);
      }, {passive: false});
      card.onclick = function(e) {
        // onclick 作为备用的同时，防止与 touchend 重复
        if (e && e.__handledByTouch) return;
        handleCardClick(card, opt);
      };
      card.style.animationDelay = (i * 0.08) + 's';
      area.appendChild(card);
    })(options[idx], idx);
  }
}

// 【统一答题入口】所有点击/触摸都经过这里
function handleCardClick(card, chosen) {
  if (isAnswering) return; // 全局锁：正在处理上一题的答案时忽略新输入
  if (card.dataset.answered) return;
  isAnswering = true; // 上锁
  // 延迟解锁：确保 setTimeout 的 nextQuestion 完成后解锁
  setTimeout(function() { isAnswering = false; }, 2200);
  checkAnswer(card, chosen);
}

function checkAnswer(card, chosen) {
  if (card.dataset.answered) return;
  card.dataset.answered = 'true';

  var cards = document.querySelectorAll('.pic-card');
  var c;
  for (c = 0; c < cards.length; c++) { cards[c].dataset.answered = 'true'; }

  if (chosen.w === currentQ.w && chosen.e === currentQ.e) {
    card.classList.add('correct');
    showFeedback(card, 'correct', '*', t('fb_correct'), 'fb-correct');
    playCorrectSound();
    streak++;
    if (streak > gameBestStreak) gameBestStreak = streak;
    if (gameBestStreak > bestStreak) bestStreak = gameBestStreak;
    var pts = 1 + Math.min(Math.floor(streak / 3), 3);
    score += pts;
    correctCount++;
    markWordLearned(currentQ.w);
    if (typeof markReviewCorrect === 'function') markReviewCorrect(currentQ.w);
    refreshFeatureBadges();
    spawnStars(card, pts);

    if (streak >= 3) tuantuanSay(getStreakMsg(streak));
    checkAchievements();

    setTimeout(function() { nextQuestion(); }, 1200);
  } else {
    card.classList.add('wrong');
    showFeedback(card, 'wrong', 'X', t('fb_wrong'), 'fb-wrong');
    playWrongSound();
    streak = 0;
    wrongCount++;
    wrongAnswersList.push({word: currentQ.w, emoji: currentQ.e});
    if (typeof addReviewWord === 'function') addReviewWord(currentQ);

    setTimeout(function() {
      var allCards = document.querySelectorAll('.pic-card');
      var k;
      for (k = 0; k < allCards.length; k++) {
        var emoji = allCards[k].querySelector('.pic-emoji');
        var imgEl = allCards[k].querySelector('.real-pic');
        var isCorrectCard =
          (emoji && emoji.textContent === currentQ.e) ||
          (imgEl && imgEl.alt === currentQ.w);
        if (isCorrectCard) {
          allCards[k].classList.add('correct');
          showFeedback(allCards[k], 'correct', '*', t('fb_correct_answer'), 'fb-correct');
          break;
        }
      }
      setTimeout(function() { nextQuestion(); }, 1200);
    }, 800);
  }
  updateUI();
}

function showFeedback(card, type, emoji, text, cls) {
  var ov = card.querySelector('.feedback-overlay');
  ov.className = 'feedback-overlay show ' + cls;
  ov.querySelector('.fb-emoji').textContent = emoji;
  ov.querySelector('.fb-text').textContent = text;
}

function updateUI() {
  document.getElementById('score').textContent = score;
  var sf = document.getElementById('streak-fill');
  sf.textContent = streak;
  sf.style.width = Math.min(streak * 10, 100) + '%';
}

function renderDots() {
  var d = document.getElementById('progress-dots');
  var html = '';
  var maxRounds = Math.min(gameWords.length, ROUNDS_PER_GAME);
  var i;
  for (i = 0; i < maxRounds; i++) {
    if (i < round) { html += '<div class="dot done"></div>'; }
    else if (i === round) { html += '<div class="dot active"></div>'; }
    else { html += '<div class="dot"></div>'; }
  }
  d.innerHTML = html;
}

// Result screen
function showResults() {
  showOnlyScreen('result-screen', 'block');

  var earned = score;
  totalStars += earned;
  gamesPlayed++;
  if (typeof markDailyPractice === 'function') markDailyPractice();
  // bestStreak 已经在 checkAnswer 中实时更新过，这里 saveStats 会把它写入 localStorage
  saveStats();

  document.getElementById('res-correct').textContent = correctCount;
  document.getElementById('res-wrong').textContent = wrongCount;
  document.getElementById('res-streak').textContent = gameBestStreak;
  document.getElementById('res-stars').textContent = earned;

  // 渲染错题列表
  var waSection = document.getElementById('wrong-answers-section');
  var waList = document.getElementById('wrong-answers-list');
  if (wrongAnswersList.length > 0) {
    waSection.style.display = 'block';
    var html = '';
    var i;
    for (i = 0; i < wrongAnswersList.length; i++) {
      html += '<div class="wrong-item"><span class="wi-emoji">' + wrongAnswersList[i].emoji + '</span><span class="wi-word">' + wrongAnswersList[i].word + '</span></div>';
    }
    waList.innerHTML = html;
  } else {
    waSection.style.display = 'none';
  }

  // 检查是否全对 → 分类通关
  var ratio = gameWords.length > 0 ? correctCount / gameWords.length : 0;
  if (gameMode === 'normal' && ratio === 1 && wrongCount === 0 && selectedCat !== 'All' && CATEGORIES.indexOf(selectedCat) !== -1 && !isCatMastered(selectedCat)) {
    masteredCategories[selectedCat] = true;
    saveMastered();
    showCategoryMasteredPopup(selectedCat);
  }

  var badge, rank, msg;
  if (ratio >= 0.9) { badge = '🥇'; rank = t('rank_legendary') || 'LEGENDARY!'; msg = t('msg_legendary') || 'You are a word master, Tiger!'; }
  else if (ratio >= 0.75) { badge = '🥈'; rank = 'AMAZING!'; msg = 'So close to perfect! Keep going!'; }
  else if (ratio >= 0.5) { badge = '🥉'; rank = 'GREAT JOB!'; msg = 'Good work! Practice makes perfect!'; }
  else { badge = '4'; rank = 'GOOD TRY!'; msg = 'Every expert was once a beginner!'; }

  document.getElementById('rank-badge').textContent = badge;
  document.getElementById('rank-name').textContent = rank;
  document.getElementById('result-msg').textContent = msg;
  updateWordsLearnedDisplay();
  document.getElementById('best-streak').textContent = bestStreak;
  document.getElementById('games-played').textContent = gamesPlayed;
  refreshFeatureBadges();


  checkGameAchievements();
  confettiBurst();
  playWinFanfare();
}

function goHome() {
  showOnlyScreen('home-screen', 'flex');
  refreshHomeStats();
}

// ===== 确认弹窗系统 =====
var pendingConfirmAction = null;

function showConfirm(icon, title, msg, yesText, yesColor, actionFn) {
  document.getElementById('confirm-icon').textContent = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  var yesBtn = document.getElementById('btn-confirm-yes');
  yesBtn.textContent = yesText || t('confirm_yes');
  yesBtn.style.background = yesColor || 'linear-gradient(135deg,#4caf50,#388e3c)';
  pendingConfirmAction = actionFn;
  document.getElementById('confirm-overlay').classList.add('show');
}

function closeConfirm() {
  document.getElementById('confirm-overlay').classList.remove('show');
  pendingConfirmAction = null;
}

function confirmAction() {
  if (pendingConfirmAction) {
    var fn = pendingConfirmAction;
    closeConfirm();
    fn();
  }
}

function confirmRestart() {
  showConfirm(
    '🔄', t('confirm_restart_title'), t('confirm_restart_msg'),
    t('confirm_restart_btn'), 'linear-gradient(135deg,#ef5350,#c62828)',
    function() { startGameWithCat(selectedCat); }
  );
}

var pendingNextGameCat = null;

function nextGame() {
  showOnlyScreen('cat-select-screen', 'flex');
  var cs = document.getElementById('cat-select-screen');
  cs.scrollTop = 0;
  buildCatPageGrid();
}

function confirmGoHome() {
  showConfirm(
    '🏠', t('confirm_home_title'), t('confirm_home_msg'),
    t('confirm_home_btn'), 'linear-gradient(135deg,#42a5f5,#1976d2)',
    function() { goHome(); }
  );
}

// ===== TTS =====
// 系统语音列表缓存（getVoices 在某些浏览器初始是空，需要 voiceschanged 后再取）
var availableVoices = [];
var selectedVoiceURI = null;  // 用户挑的 voice 的 voiceURI，null 表示自动

function loadVoiceSettings() {
  try { selectedVoiceURI = localStorage.getItem('tiger_voice_uri') || null; } catch(e) {}
}
function saveVoiceSettings() {
  try {
    if (selectedVoiceURI) localStorage.setItem('tiger_voice_uri', selectedVoiceURI);
    else localStorage.removeItem('tiger_voice_uri');
  } catch(e) {}
}

function refreshVoices() {
  try {
    availableVoices = (speechSynthesis.getVoices() || []).filter(function(v) {
      return /^en/i.test(v.lang);  // 只列英文 voice
    });
    // 排序：优先 default、higher-quality 词、Google/Apple/Microsoft 品牌
    availableVoices.sort(function(a, b) {
      var ra = voiceRank(a), rb = voiceRank(b);
      if (ra !== rb) return rb - ra;
      return a.name.localeCompare(b.name);
    });
    rebuildVoiceSelect();
  } catch(e) {}
}

function voiceRank(v) {
  var name = (v.name || '').toLowerCase();
  var score = 0;
  if (v.default) score += 10;
  if (/premium|enhanced|natural|neural/.test(name)) score += 30;
  if (/google/.test(name)) score += 20;
  if (/samantha|siri|ava|allison|karen|moira/.test(name)) score += 15;
  if (/microsoft|aria|jenny/.test(name)) score += 12;
  if (/en-us/i.test(v.lang)) score += 5;
  return score;
}

function pickVoice() {
  // 已选择的优先
  if (selectedVoiceURI) {
    for (var i = 0; i < availableVoices.length; i++) {
      if (availableVoices[i].voiceURI === selectedVoiceURI) return availableVoices[i];
    }
  }
  return availableVoices[0] || null;
}

function speakWord() {
  if (!currentQ) return;
  speakText(currentQ.w);
}

function speakText(text) {
  try {
    if (!text) return;
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; }
    else u.lang = 'en-US';
    u.rate = 0.9;        // 比正常稍慢，方便儿童听清，但不至于拖
    u.pitch = 1.0;       // 自然音调（之前 1.15 像花栗鼠）
    u.volume = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch(e) {
    console.warn('TTS not available:', e);
  }
}

function rebuildVoiceSelect() {
  var sel = document.getElementById('voice-select');
  if (!sel) return;
  var html = '<option value="">(' + (currentLang === 'zh' ? '自动挑选' : 'Auto') + ')</option>';
  for (var i = 0; i < availableVoices.length; i++) {
    var v = availableVoices[i];
    var label = v.name + ' — ' + v.lang;
    html += '<option value="' + esc(v.voiceURI) + '"' +
            (v.voiceURI === selectedVoiceURI ? ' selected' : '') + '>' + esc(label) + '</option>';
  }
  sel.innerHTML = html;
}

function onVoiceSelectChange() {
  var sel = document.getElementById('voice-select');
  selectedVoiceURI = sel.value || null;
  saveVoiceSettings();
}

function previewVoice() {
  speakText(currentLang === 'zh' ? 'Hello Tiger, this is a sample.' : 'Hello Tiger, this is a sample.');
}

// ===== TUANTUAN =====
var TUANTUAN_MSGS_EN = [
  'Go Tiger! You can do it!',
  'Tiger is so smart today!',
  'Keep going, you are amazing!',
  'Tuantuan believes in you!',
  'Tiger + Tuantuan = Best team!',
  'Wow, another right answer!',
  'Take your time, no rush!',
  'Learning English is fun!',
  'Tiger brain is super powerful!',
  'Good job! Give yourself a high five!',
  'Remember: mistakes help us learn!',
  'You are doing great, Tiger!',
  'Every word you learn makes you stronger!'
];
var TUANTUAN_MSGS_ZH = [
  '加油 Tiger！你可以的！',
  'Tiger今天好聪明啊！',
  '继续加油，你太棒了！',
  '团团相信你！',
  'Tiger + 团团 = 最佳搭档！',
  '哇，又答对了一个！',
  '别着急，慢慢来~',
  '学英语超有趣的！',
  'Tiger的大脑超级强大！',
  '干得漂亮！给自己击个掌吧！',
  '记住：犯错能帮我们学到更多！',
  '你做得太好了，Tiger！',
  '每个学会的单词都会让你更强！'
];

function getTuMsgArray() {
  return currentLang === 'zh' ? TUANTUAN_MSGS_ZH : TUANTUAN_MSGS_EN;
}

var lastTuIdx = -1;

function tuantuanTalk() {
  var msgs = getTuMsgArray();
  var i;
  do { i = Math.floor(Math.random() * msgs.length); }
  while (i === lastTuIdx && msgs.length > 1);
  lastTuIdx = i;
  tuantuanSay(msgs[i]);
}

function tuantuanSay(msg) {
  try {
    var el = document.getElementById('tuantuan-msg');
    var tt = document.getElementById('tuantuan');
    if (!el || !tt) return;

    var rect = tt.getBoundingClientRect();
    
    // 气泡显示在团团左上方
    if (rect.left >= 290) {
      el.style.left = (rect.left - 280) + 'px';
      el.style.top = (rect.top - 10) + 'px';
    } else {
      // 团团太靠左，气泡放右边
      el.style.left = (rect.right + 15) + 'px';
      el.style.top = (rect.top - 20) + 'px';
    }
    
    el.innerHTML = '<div class="msg-avatar"><img src="puppy.png" style="width:100%;height:100%;object-fit:cover;" alt=""></div>' + msg;
    el.classList.add('show');
    setTimeout(function() { if(el) el.classList.remove('show'); }, 3500);
  } catch(e) {
    console.error('tuantuanSay error:', e);
  }
}

function getStreakMsg(s) {
  var msgs_en = {8:'Tiger is on FIRE!!!',5:'Amazing streak! Go go go!',3:'Nice combo, Tiger!'};
  var msgs_zh = {8:'Tiger 状态爆表！！！',5:'太猛了连击！冲冲冲！',3:'不错的连击，Tiger！'};
  var msgs = currentLang === 'zh' ? msgs_zh : msgs_en;
  if (s >= 8) return msgs[8];
  if (s >= 5) return msgs[5];
  if (s >= 3) return msgs[3];
  return currentLang === 'zh' ? '继续保持！' : 'Keep it up!';
}

// ===== ACHIEVEMENTS =====
var unlockedAchievements = {};
function loadAchievements() {
  try { unlockedAchievements = JSON.parse(localStorage.getItem('tiger_achievements') || '{}'); } catch(e) {}
}
loadAchievements();

var ACHIEVEMENTS = {
  first_game: {name:(currentLang==='zh'?'第一步':'First Step'), desc:(currentLang==='zh'?'完成了第一场游戏！':'Complete your first game!'), check:function(){return gamesPlayed>=1;}},
  streak_3: {name:(currentLang==='zh'?'连击新星':'Hot Streak'), desc:(currentLang==='zh'?'连续答对3道题！':'Get 3 answers in a row!'), check:function(){return bestStreak>=3;}},
  streak_5: {name:(currentLang==='zh'?'火力全开':'On Fire!'), desc:(currentLang==='zh'?'连续答对5道题！':'Get 5 answers in a row!'), check:function(){return bestStreak>=5;}},
  streak_10: {name:(currentLang==='zh'?'势不可挡':'Unstoppable!'), desc:(currentLang==='zh'?'连续答对10道题！':'Get 10 answers in a row!'), check:function(){return bestStreak>=10;}},
  perfect_game: {name:(currentLang==='zh'?'完美游戏':'Perfect Game!'), desc:(currentLang==='zh'?'全部答对！':'Get all answers right!'), check:function(){return correctCount===gameWords.length&&wrongCount===0}},
  star_10: {name:(currentLang==='zh'?'星星收集者':'Star Collector'), desc:(currentLang==='zh'?'一场游戏获得10+颗星！':'Earn 10+ stars in a game!'), check:function(){return score>=10;}},
  star_30: {name:(currentLang==='zh'?'超级明星':'Super Star'), desc:(currentLang==='zh'?'一场游戏获得30+颗星！':'Earn 30+ stars in a game!'), check:function(){return score>=30;}},
  games_5: {name:(currentLang==='zh'?'勤奋学习者':'Dedicated Learner'), desc:(currentLang==='zh'?'玩了5场游戏！':'Play 5 games!'), check:function(){return gamesPlayed>=5;}},
  games_10: {name:(currentLang==='zh'?'单词大师':'Word Master'), desc:(currentLang==='zh'?'玩了10场游戏！':'Play 10 games!'), check:function(){return gamesPlayed>=10;}},
  stars_50: {name:(currentLang==='zh'?'冉冉升起':'Rising Star'), desc:(currentLang==='zh'?'累计收集50颗星！':'Collect 50 total stars!'), check:function(){return totalStars>=50;}},
  stars_100: {name:(currentLang==='zh'?'闪耀之星':'Shining Star'), desc:(currentLang==='zh'?'累计收集100颗星！':'Collect 100 total stars!'), check:function(){return totalStars>=100;}}
};

function checkAchievements() {
  var keys = Object.keys(ACHIEVEMENTS);
  var k;
  for (k = 0; k < keys.length; k++) {
    var ach = ACHIEVEMENTS[keys[k]];
    if (!unlockedAchievements[keys[k]] && ach.check()) {
      unlockAchievement(keys[k], ach);
    }
  }
}

function checkGameAchievements() { checkAchievements(); }

function unlockAchievement(id, ach) {
  if (unlockedAchievements[id]) return;
  unlockedAchievements[id] = true;
  try { localStorage.setItem('tiger_achievements', JSON.stringify(unlockedAchievements)); } catch(e) {}
  showAchievementPopup(ach);
}

function showAchievementPopup(ach) {
  document.getElementById('ach-title').textContent = ach.name;
  document.getElementById('ach-desc').textContent = ach.desc;
  var starEl = document.querySelector('#achievement-popup .ach-star');
  if (starEl) starEl.textContent = '🏅';
  document.getElementById('ach-overlay').classList.add('show');
  document.getElementById('achievement-popup').classList.add('show');
}

function closeAchievement() {
  document.getElementById('achievement-popup').classList.remove('show');
  document.getElementById('ach-overlay').classList.remove('show');
}

// ===== 分类通关弹窗 =====
function showCategoryMasteredPopup(catName) {
  var icon = CAT_ICONS[catName] || '⭐';
  var el = document.getElementById('achievement-popup');
  document.getElementById('ach-title').textContent = catName + t('mastered_popup_title');
  document.getElementById('ach-desc').textContent = t('mastered_popup_desc') + catName + t('mastered_popup_desc2');
  document.getElementById('ach-title').parentElement.querySelector('.ach-star').textContent = '🌟';
  document.getElementById('ach-overlay').classList.add('show');
  el.classList.add('show');
  setTimeout(function() {
    confettiBurst();
    spawnMasterStars();
  }, 200);
}

function spawnMasterStars() {
  var i;
  for (i = 0; i < 15; i++) {
    (function(idx) {
      var s = document.createElement('div');
      s.className = 'star-particle';
      s.textContent = '★';
      s.style.left = (Math.random() * window.innerWidth) + 'px';
      s.style.top = (Math.random() * window.innerHeight * 0.6) + 'px';
      s.style.fontSize = (20 + Math.random() * 24) + 'px';
      s.style.color = ['#ffd700', '#ffb74d', '#ffeb3b', '#fff176'][idx % 4];
      s.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      document.body.appendChild(s);
      setTimeout(function(el) { return function() { el.remove(); }; }(s), 4000);
    })(i);
  }
}

// ===== EFFECTS =====
function spawnStars(card, n) {
  var rect = card.getBoundingClientRect();
  var i;
  var stars = ['*', '+', '~'];
  for (i = 0; i < n; i++) {
    var s = document.createElement('div');
    s.className = 'star-particle';
    s.textContent = stars[i % 3];
    s.style.left = (rect.left + rect.width / 2 + Math.random() * 80 - 40) + 'px';
    s.style.top = (rect.top + rect.height / 2) + 'px';
    document.body.appendChild(s);
    setTimeout(function(el) { return function() { el.remove(); }; }(s), 2600);
  }
}

function confettiBurst() {
  var icons = ['*','~','!','#','?','@','^','='];
  var i;
  for (i = 0; i < 30; i++) {
    var s = document.createElement('div');
    s.className = 'star-particle';
    s.textContent = icons[i % icons.length];
    s.style.left = (Math.random() * window.innerWidth) + 'px';
    s.style.top = window.innerHeight + 'px';
    s.style.animationDuration = (2 + Math.random() * 2) + 's';
    document.body.appendChild(s);
    setTimeout(function(el) { return function() { el.remove(); }; }(s), 4500);
  }
}

// ===== UTILITIES =====
function shuffle(arr) {
  var i, j, tmp;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
}

// ===== START =====
try { init(); } catch(e) { console.error('init error:', e); }
