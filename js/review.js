// ===== 错题复习池 =====
var REVIEW_POOL_KEY = 'tiger_review_pool';
var REVIEW_CLEAR_AFTER = 2;
var reviewPool = {};

function reviewEsc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
}

function loadReviewPool() {
  try { reviewPool = JSON.parse(localStorage.getItem(REVIEW_POOL_KEY) || '{}'); } catch(e) { reviewPool = {}; }
}

function saveReviewPool() {
  try { localStorage.setItem(REVIEW_POOL_KEY, JSON.stringify(reviewPool)); } catch(e) {}
}

function getReviewCount() {
  loadReviewPool();
  return Object.keys(reviewPool).length;
}

function addReviewWord(wordOrEntry) {
  var entry = typeof wordOrEntry === 'string' ? {w: wordOrEntry} : (wordOrEntry || {});
  if (!entry.w) return;
  loadReviewPool();
  var old = reviewPool[entry.w] || {};
  reviewPool[entry.w] = {
    word: entry.w,
    emoji: entry.e || old.emoji || '',
    wrong: (old.wrong || 0) + 1,
    correct: 0,
    lastWrong: Date.now()
  };
  saveReviewPool();
  refreshReviewUI();
}

function markReviewCorrect(word) {
  if (!word) return;
  loadReviewPool();
  if (!reviewPool[word]) {
    refreshReviewUI();
    return;
  }
  reviewPool[word].correct = (reviewPool[word].correct || 0) + 1;
  reviewPool[word].lastCorrect = Date.now();
  if (reviewPool[word].correct >= REVIEW_CLEAR_AFTER) {
    delete reviewPool[word];
  }
  saveReviewPool();
  refreshReviewUI();
}

function getReviewEntries() {
  loadReviewPool();
  return Object.keys(reviewPool).map(function(word) {
    var found = typeof findWordEntry === 'function' ? findWordEntry(word) : null;
    var source = found ? found.entry : {w: word, e: reviewPool[word].emoji || '?'};
    return {
      cat: found ? found.cat : '',
      entry: source,
      meta: reviewPool[word]
    };
  }).sort(function(a, b) {
    var aw = a.meta.wrong || 0;
    var bw = b.meta.wrong || 0;
    if (aw !== bw) return bw - aw;
    return (b.meta.lastWrong || 0) - (a.meta.lastWrong || 0);
  });
}

function refreshReviewShortcut() {
  var badge = document.getElementById('review-count-badge');
  if (!badge) return;
  var count = getReviewCount();
  badge.textContent = count;
  badge.classList.toggle('is-hidden', count === 0);
}

function refreshReviewUI() {
  refreshReviewShortcut();
  var screen = document.getElementById('review-screen');
  if (screen && window.getComputedStyle(screen).display !== 'none') {
    renderReviewScreen();
  }
  if (typeof refreshFeatureBadges === 'function') refreshFeatureBadges();
}

function showReviewScreen() {
  if (typeof showOnlyScreen === 'function') showOnlyScreen('review-screen', 'block');
  else {
    ['home-screen','cat-select-screen','game-screen','result-screen','collection-screen'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.getElementById('review-screen').style.display = 'block';
  }
  renderReviewScreen();
}

function renderReviewScreen() {
  var body = document.getElementById('review-page-body');
  var info = document.getElementById('review-info');
  if (!body) return;
  var entries = getReviewEntries();
  var title = currentLang === 'zh' ? '错题复习' : 'Review';
  var subtitle = currentLang === 'zh'
    ? '答对 2 次后自动离开复习池'
    : 'A word leaves after 2 correct answers';
  if (info) info.textContent = subtitle;

  if (!entries.length) {
    body.innerHTML =
      '<div class="review-empty">' +
        '<div class="review-empty-icon">💡</div>' +
        '<div class="review-empty-title">' + (currentLang === 'zh' ? '复习池空啦' : 'Review is clear') + '</div>' +
        '<div class="review-empty-msg">' + (currentLang === 'zh' ? '玩一局后，答错的单词会自动来到这里。' : 'Missed words will appear here after a game.') + '</div>' +
      '</div>';
    return;
  }

  body.innerHTML =
    '<div class="review-header">' +
      '<div class="review-title">' + title + ' (' + entries.length + ')</div>' +
      '<div class="review-subtitle">' + subtitle + '</div>' +
    '</div>' +
    '<div class="review-actions">' +
      '<button class="review-start-btn" onclick="playClickSound();startReviewGame()">' + (currentLang === 'zh' ? '开始复习' : 'Start Review') + '</button>' +
    '</div>' +
    '<div class="review-word-grid" id="review-word-grid"></div>';

  var grid = document.getElementById('review-word-grid');
  entries.forEach(function(item) {
    var card = document.createElement('div');
    var entry = item.entry;
    var progress = Math.min(item.meta.correct || 0, REVIEW_CLEAR_AFTER);
    card.className = 'review-word-card';
    card.onclick = function() {
      if (typeof speakText === 'function') speakText(entry.w);
    };

    if (entry.i && imageMode === 'photo') {
      var img = document.createElement('img');
      img.src = entry.i;
      img.alt = entry.w;
      img.onerror = function() {
        var emoji = document.createElement('div');
        emoji.className = 'review-emoji';
        emoji.textContent = entry.e || '?';
        this.replaceWith(emoji);
      };
      card.appendChild(img);
    } else {
      var emojiDiv = document.createElement('div');
      emojiDiv.className = 'review-emoji';
      emojiDiv.textContent = entry.e || '?';
      card.appendChild(emojiDiv);
    }

    card.insertAdjacentHTML('beforeend',
      '<div class="review-name">' + reviewEsc(entry.w) + '</div>' +
      '<div class="review-progress">' + progress + '/' + REVIEW_CLEAR_AFTER + '</div>');
    grid.appendChild(card);
  });
}

function startReviewGame() {
  var entries = getReviewEntries();
  if (!entries.length) {
    renderReviewScreen();
    return;
  }
  var words = entries.map(function(item) { return item.entry; });
  if (words.length > ROUNDS_PER_GAME && typeof shuffle === 'function') {
    words = shuffle(words).slice(0, ROUNDS_PER_GAME);
  } else {
    words = words.slice(0, ROUNDS_PER_GAME);
  }
  startCustomGame(currentLang === 'zh' ? '错题复习' : 'Review', words, 'review');
}
