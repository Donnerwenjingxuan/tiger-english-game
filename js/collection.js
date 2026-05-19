// ===== 单词收藏册（贴纸本）=====
var collectionFilter = 'All';

function refreshCollectionShortcut() {
  var label = document.getElementById('collection-shortcut-label');
  if (!label) return;
  var learned = typeof getLearnedCount === 'function' ? getLearnedCount() : 0;
  var total = typeof countAllWords === 'function' ? countAllWords() : 0;
  label.textContent = currentLang === 'zh'
    ? '单词册 ' + learned + '/' + total
    : 'My Words ' + learned + '/' + total;
}

function showCollectionScreen() {
  if (typeof showOnlyScreen === 'function') showOnlyScreen('collection-screen', 'block');
  else {
    ['home-screen','cat-select-screen','game-screen','result-screen','review-screen'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.getElementById('collection-screen').style.display = 'block';
  }
  renderCollectionScreen();
}

function setCollectionFilter(cat) {
  collectionFilter = cat || 'All';
  renderCollectionScreen();
}

function renderCollectionScreen() {
  if (typeof loadLearnedWords === 'function') loadLearnedWords();
  var title = document.getElementById('collection-title');
  var subtitle = document.getElementById('collection-subtitle');
  var tabs = document.getElementById('collection-tabs');
  var grid = document.getElementById('collection-grid');
  if (!title || !subtitle || !tabs || !grid) return;

  var learned = typeof getLearnedCount === 'function' ? getLearnedCount() : 0;
  var total = typeof countAllWords === 'function' ? countAllWords() : 0;
  title.textContent = currentLang === 'zh' ? '我的单词贴纸本' : 'My Words';
  subtitle.textContent = currentLang === 'zh'
    ? learned + '/' + total + ' 已收集'
    : learned + '/' + total + ' collected';

  renderCollectionTabs(tabs);
  renderCollectionGrid(grid);
  refreshCollectionShortcut();
}

function renderCollectionTabs(tabs) {
  tabs.innerHTML = '';
  var allBtn = makeCollectionTab('All', currentLang === 'zh' ? '全部' : 'All');
  tabs.appendChild(allBtn);
  CATEGORIES.forEach(function(cat) {
    var label = (CAT_ICONS[cat] || '') + ' ' + cat;
    tabs.appendChild(makeCollectionTab(cat, label));
  });
}

function makeCollectionTab(cat, label) {
  var btn = document.createElement('button');
  btn.className = 'col-cat-tab' + (collectionFilter === cat ? ' active' : '');
  btn.textContent = label;
  btn.onclick = function() {
    playClickSound();
    setCollectionFilter(cat);
  };
  return btn;
}

function renderCollectionGrid(grid) {
  grid.innerHTML = '';
  var cats = collectionFilter === 'All' ? CATEGORIES : [collectionFilter];
  cats.forEach(function(cat) {
    (WORDS_DB[cat] || []).forEach(function(entry) {
      grid.appendChild(makeSticker(entry));
    });
  });
}

function makeSticker(entry) {
  var learned = !!(learnedWords && learnedWords[entry.w]);
  var card = document.createElement('div');
  card.className = 'col-sticker' + (learned ? '' : ' locked');
  card.onclick = function() {
    if (learned && typeof speakText === 'function') {
      speakText(entry.w);
    } else if (typeof tuantuanSay === 'function') {
      tuantuanSay(currentLang === 'zh' ? '学会这个词就能点亮贴纸！' : 'Learn this word to unlock the sticker!');
    }
  };

  if (learned && entry.i && imageMode === 'photo') {
    var img = document.createElement('img');
    img.src = entry.i;
    img.alt = entry.w;
    img.loading = 'lazy';
    img.onerror = function() {
      var emoji = document.createElement('div');
      emoji.className = 'col-sticker-emoji';
      emoji.textContent = entry.e || '?';
      this.replaceWith(emoji);
    };
    card.appendChild(img);
  } else {
    var emojiDiv = document.createElement('div');
    emojiDiv.className = 'col-sticker-emoji';
    emojiDiv.textContent = entry.e || '?';
    card.appendChild(emojiDiv);
  }

  var name = document.createElement('div');
  name.className = 'col-sticker-name';
  name.textContent = learned ? entry.w : '???';
  card.appendChild(name);
  return card;
}
