/* ============================================================
   Tiger's English — App logic
   Sections:
     1. State + persistence
     2. Navigation (tabs + screens)
     3. Home (greeting / check-in / mission / quick cats)
     4. Play (category list)
     5. Game flow
     6. Result screen
     7. Wordbook
     8. Mistakes (review)
     9. Me / settings / achievements
    10. Companion (团团)
    11. Audio (TTS + SFX)
    12. Popups / toast / sparks
    13. Init
   ============================================================ */

/* ===== 1. State ===== */
var STATE = {
  kidName: 'Tiger',
  totalStars: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  learned: {},          // {word: true}
  favorites: {},        // {word: true}
  mistakes: {},         // {word: {emoji, cat, count, lastSeen}}
  mastered: {},         // {cat: true}
  achievements: {},     // {id: true}
  checkinDates: [],     // ['2026-05-19', ...]
  bestCheckinStreak: 0,
  dailyMission: { date:'', target:5, progress:0, done:false, claimed:false },
  settings: {
    sound: true,
    clickSound: true,
    imageMode: 'photo',    // 'photo' | 'emoji'
    voiceURI: null,
    lang: (function(){ try{ return (navigator.language||'').toLowerCase().indexOf('zh')===0 ? 'zh':'en'; }catch(e){return 'zh';} })()
  }
};

var ROUNDS = 10;

function todayStr(){
  var d=new Date();
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
}
function pad(n){return n<10?'0'+n:''+n;}
function daysBetween(a,b){
  var d1=new Date(a),d2=new Date(b);
  return Math.round((d2-d1)/86400000);
}

function loadState(){
  try{
    var raw = localStorage.getItem('tiger_v2');
    if(raw){
      var saved = JSON.parse(raw);
      // shallow merge
      Object.keys(saved).forEach(function(k){
        if (k==='settings' && saved.settings){
          Object.assign(STATE.settings, saved.settings);
        } else if (saved[k] !== undefined) {
          STATE[k] = saved[k];
        }
      });
    }
    // backward-compat: pull values from v1 keys if present
    if (!raw) {
      try{
        var ls = JSON.parse(localStorage.getItem('tiger_learned')||'{}'); if(ls)STATE.learned=ls;
        var ms = JSON.parse(localStorage.getItem('tiger_mastered')||'{}'); if(ms)STATE.mastered=ms;
        STATE.totalStars = parseInt(localStorage.getItem('tiger_totalstars')||'0',10);
        STATE.bestStreak = parseInt(localStorage.getItem('tiger_beststreak')||'0',10);
        STATE.gamesPlayed = parseInt(localStorage.getItem('tiger_gamesplayed')||'0',10);
      }catch(e){}
    }
  }catch(e){ console.warn('loadState', e); }
}
function saveState(){
  try{ localStorage.setItem('tiger_v2', JSON.stringify(STATE)); }catch(e){}
}

/* ===== 2. Navigation ===== */
function goTab(target){
  playClickSound();
  document.body.dataset.screen = target;
  document.querySelectorAll('.tab').forEach(function(t){
    t.classList.toggle('active', t.dataset.target === target);
  });
  // scroll to top of new screen
  var s = document.getElementById('screen-'+target);
  if(s) s.scrollTop = 0;
  // refresh dynamic content on enter
  if(target==='home') refreshHome();
  if(target==='play') renderPlayScreen();
  if(target==='wordbook') renderWordbook();
  if(target==='mistakes') renderMistakes();
  if(target==='me') renderMe();
}
function showScreen(name){
  document.body.dataset.screen = name;
  // hide tab bar for game/result handled in CSS
}

/* ===== 3. HOME ===== */
function refreshHome(){
  document.getElementById('kid-name').textContent = STATE.kidName;
  document.getElementById('today-date').textContent = formatDateZh();
  document.getElementById('hero-words').textContent = Object.keys(STATE.learned).length;
  document.getElementById('hero-streak').textContent = currentCheckinStreak();
  document.getElementById('hero-stars').textContent = STATE.totalStars;
  renderCheckin();
  renderMission();
  renderQuickCats();
  var mc = mistakesCount();
  document.getElementById('mistake-count-2').textContent = mc;
  document.getElementById('wordbook-count').textContent = Object.keys(STATE.learned).length;
  // bilingual quantifier lines on the shortcuts (numbers stay live in spans)
  var msl = document.getElementById('mistake-shortcut-line');
  if(msl){
    var raw = t('mistakes_count', mc);
    msl.innerHTML = raw.replace(String(mc), '<span id="mistake-count-2">'+mc+'</span>');
  }
  var wsl = document.getElementById('wordbook-shortcut-line');
  if(wsl){
    var lc = Object.keys(STATE.learned).length;
    var raw2 = t('learned_count', lc);
    wsl.innerHTML = raw2.replace(String(lc), '<span id="wordbook-count">'+lc+'</span>');
  }
  updateMistakeBadge();
}
function formatDateZh(){
  var d=new Date();
  var wkArr = t('weekday') || ['日','一','二','三','四','五','六'];
  return t('date_fmt', d.getMonth()+1, d.getDate(), wkArr[d.getDay()]);
}
function renderCheckin(){
  var row = document.getElementById('checkin-row');
  var dates = STATE.checkinDates;
  var setDates = {}; dates.forEach(function(d){setDates[d]=true;});
  var today = todayStr();
  var html='';
  var labels = t('weekday') || ['日','一','二','三','四','五','六'];
  // show this week (7 days centered on today; use Sun-Sat row)
  var now=new Date();
  var sunday=new Date(now);
  sunday.setDate(now.getDate()-now.getDay());
  for(var i=0;i<7;i++){
    var d=new Date(sunday); d.setDate(sunday.getDate()+i);
    var ds = d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
    var isToday = ds===today;
    var isFuture = d > now && !isToday;
    var isDone = !!setDates[ds];
    var cls = 'checkin-day';
    if(isDone) cls += ' done';
    if(isToday) cls += ' today';
    if(isFuture) cls += ' future';
    var inner = isDone? '✓' : d.getDate();
    html += '<div class="'+cls+'"><div class="dot">'+inner+'</div><div>'+labels[i]+'</div></div>';
  }
  row.innerHTML = html;

  var streak = currentCheckinStreak();
  document.getElementById('streak-pill').textContent = t('streak_n_days', streak);

  var btn = document.getElementById('checkin-btn');
  if(setDates[today]){
    btn.textContent = t('checkin_done');
    btn.classList.add('done');
    btn.disabled = true;
  } else {
    btn.textContent = t('checkin_btn');
    btn.classList.remove('done');
    btn.disabled = false;
  }
}
function currentCheckinStreak(){
  var setDates = {}; STATE.checkinDates.forEach(function(d){setDates[d]=true;});
  var today = todayStr();
  var n=0, d=new Date();
  // Count back from today (or yesterday if today not yet checked)
  if(!setDates[today]) d.setDate(d.getDate()-1);
  while(true){
    var ds=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
    if(setDates[ds]){ n++; d.setDate(d.getDate()-1); } else break;
    if(n>3650) break; // safety
  }
  return n;
}
function doCheckIn(){
  playClickSound();
  var today=todayStr();
  if(STATE.checkinDates.indexOf(today) >= 0){ toast(t('toast_today_done')); return; }
  STATE.checkinDates.push(today);
  STATE.totalStars += 5;
  var s = currentCheckinStreak();
  if(s > STATE.bestCheckinStreak) STATE.bestCheckinStreak = s;
  saveState();
  refreshHome();
  burstSparks(window.innerWidth/2, 200, 12);
  popup({
    icon:'🔥',
    title:t('checkin_popup_title'),
    body:t('checkin_popup_body', s),
    actions:[{label:t('checkin_popup_ok'), primary:true}]
  });
  companionSay(s>=3 ? (STATE.settings.lang==='en' ? 'Wow, '+s+' days in a row!' : '哇，连续 '+s+' 天！太厉害啦！') : (STATE.settings.lang==='en'?'You came back today, Tiger!':'今天也来啦，'+STATE.kidName+'！'));
  playWinSound();
}

function renderMission(){
  // reset daily mission if date changed
  var today = todayStr();
  if(STATE.dailyMission.date !== today){
    STATE.dailyMission = { date: today, target:5, progress:0, done:false, claimed:false };
    saveState();
  }
  var m = STATE.dailyMission;
  document.getElementById('mission-desc').textContent = m.claimed
    ? t('mission_desc_done')
    : t('mission_desc', m.target);
  var pct = Math.min(100, (m.progress/m.target)*100);
  document.getElementById('mission-fill').style.width = pct+'%';
  document.getElementById('mission-meta').textContent =
    m.claimed ? t('mission_claimed')
    : t('mission_meta', m.progress, m.target);
}
function bumpMission(){
  var m = STATE.dailyMission;
  if(m.claimed) return;
  m.progress++;
  if(m.progress >= m.target && !m.done){
    m.done = true;
    if(!m.claimed){
      m.claimed = true;
      STATE.totalStars += 10;
      toast(t('mission_claimed'));
    }
  }
  saveState();
}
function startMission(){ playClickSound(); goTab('play'); }

function renderQuickCats(){
  // pick 8 popular cats for the quick grid
  var picks = ['Animals','Food','Colors','Body','Clothes','Numbers','Vehicles','Family'];
  var g = document.getElementById('quick-grid');
  var html='';
  picks.forEach(function(c){
    if(!WORDS_DB[c]) return;
    html += '<div class="quick-cat" onclick="startGameWithCat(\''+esc(c)+'\')">'+
      '<span class="qi">'+(CAT_ICONS[c]||'📚')+'</span>'+
      '<span class="qn">'+catNameZh(c)+'</span></div>';
  });
  g.innerHTML = html;
}

/* ===== 4. PLAY ===== */
function renderPlayScreen(){
  var list = document.getElementById('cat-list');
  var html='';
  Object.keys(WORDS_DB).forEach(function(c){
    var total = WORDS_DB[c].length;
    var learned = WORDS_DB[c].filter(function(w){ return STATE.learned[w.w]; }).length;
    var pct = Math.round(learned/total*100);
    var mastered = !!STATE.mastered[c];
    html += '<div class="cat-row '+(mastered?'mastered':'')+'" onclick="startGameWithCat(\''+esc(c)+'\')">'+
      '<div class="ci">'+(CAT_ICONS[c]||'📚')+'</div>'+
      '<div class="cbody">'+
        '<div class="cname">'+catNameZh(c)+' <span style="color:var(--muted);font-weight:500;font-size:13px">· '+c+'</span></div>'+
        '<div class="cmeta">'+t('cat_progress', total, learned, pct)+'</div>'+
        '<div class="cbar"><div class="fill" style="width:'+pct+'%"></div></div>'+
      '</div>'+
      '<div class="carrow">›</div>'+
    '</div>';
  });
  list.innerHTML = html;
}

function catNameZh(c){
  var dict = (I18N[(STATE.settings && STATE.settings.lang)||'zh']||{}).cat_names || I18N.zh.cat_names;
  return (dict && dict[c]) || c;
}

/* ===== 5. GAME FLOW ===== */
var GAME = {
  cat:'All',
  words:[],
  round:0,
  score:0,
  streak:0,
  bestStreakInGame:0,
  correct:0,
  wrong:0,
  current:null,
  wrongList:[],
  reviewMode:false,    // when launched from mistakes
  reviewQueue:null,    // array of mistake-words being practiced
  locked:false
};

function startGameWithCat(cat){
  playClickSound();
  GAME.reviewMode = false;
  GAME.reviewQueue = null;
  GAME.cat = cat;
  var pool = cat==='All' ? Object.keys(WORDS_DB).reduce(function(a,k){return a.concat(WORDS_DB[k]);},[]) : (WORDS_DB[cat]||[]).slice();
  pool = shuffle(pool);
  GAME.words = pool.slice(0, ROUNDS);
  beginGameSession();
}
function startReview(){
  playClickSound();
  var mistakeWords = Object.keys(STATE.mistakes);
  if(mistakeWords.length===0){ toast('暂时没有错题哦'); return; }
  var picks = shuffle(mistakeWords).slice(0,10).map(function(w){
    return findWordByText(w) || { w:w, e:STATE.mistakes[w].emoji||'❓', cat:STATE.mistakes[w].cat };
  });
  GAME.reviewMode = true;
  GAME.cat = '__review__';
  GAME.words = picks;
  beginGameSession();
}
function findWordByText(text){
  var cats = Object.keys(WORDS_DB);
  for(var i=0;i<cats.length;i++){
    var list = WORDS_DB[cats[i]];
    for(var j=0;j<list.length;j++){
      if(list[j].w===text){ var x = Object.assign({}, list[j]); x.cat=cats[i]; return x; }
    }
  }
  return null;
}
function beginGameSession(){
  GAME.round=0; GAME.score=0; GAME.streak=0; GAME.bestStreakInGame=0;
  GAME.correct=0; GAME.wrong=0; GAME.wrongList=[]; GAME.locked=false; GAME.segs={};
  showScreen('game');
  var icn = GAME.reviewMode ? '📝' : (GAME.cat==='All' ? '🎲' : (CAT_ICONS[GAME.cat]||'📚'));
  var nm = GAME.reviewMode ? t('review_title') : (GAME.cat==='All' ? t('all_cat') : catNameZh(GAME.cat));
  document.getElementById('game-cat-icon').textContent = icn;
  document.getElementById('game-cat-name').textContent = nm;
  renderProgress();
  document.getElementById('game-score').textContent = '0';
  nextQuestion();
}
function renderProgress(){
  var prog = document.getElementById('game-progress');
  var html='';
  for(var i=0;i<GAME.words.length;i++){
    var cls='seg';
    if(i<GAME.round){
      // already answered; check the wrongList for index
      // we set status in checkAnswer by storing on per-round basis
      if(GAME.segs && GAME.segs[i]==='wrong') cls+=' wrong';
      else cls+=' done';
    } else if(i===GAME.round) cls+=' active';
    html += '<div class="'+cls+'"></div>';
  }
  prog.innerHTML = html;
}
function nextQuestion(){
  if(GAME.round >= GAME.words.length){ return showResults(); }
  GAME.locked = false;
  GAME.current = GAME.words[GAME.round];
  document.getElementById('the-word').textContent = GAME.current.w;
  var rt = document.getElementById('game-round-text');
  if(rt) rt.textContent = t('question_n', GAME.round+1, GAME.words.length);
  updateFavBtn();
  // distractors
  var pool;
  if(GAME.reviewMode || GAME.cat==='All'){
    pool = Object.keys(WORDS_DB).reduce(function(a,k){return a.concat(WORDS_DB[k]);},[]);
  } else {
    pool = WORDS_DB[GAME.cat]||[];
  }
  pool = pool.filter(function(x){ return x.w !== GAME.current.w && x.e !== GAME.current.e; });
  // emoji uniqueness
  pool = shuffle(pool);
  var picks=[], usedE={};
  usedE[GAME.current.e]=true;
  for(var i=0;i<pool.length && picks.length<3;i++){
    if(!usedE[pool[i].e]){ picks.push(pool[i]); usedE[pool[i].e]=true; }
  }
  // backfill if too few
  while(picks.length<3 && pool.length){ picks.push(pool[picks.length]); }
  var options = shuffle([GAME.current].concat(picks));
  renderOptions(options);
  renderProgress();
  speakWord();
  GAME.round++;
}
function renderOptions(options){
  var area = document.getElementById('pics-grid');
  area.innerHTML='';
  options.forEach(function(opt,i){
    var card = document.createElement('div');
    card.className = 'pic-card';
    card.style.animationDelay = (i*0.05)+'s';
    var pic;
    if(opt.i && STATE.settings.imageMode==='photo'){
      pic = document.createElement('img');
      pic.className='pic-img';
      pic.src = opt.i;
      pic.alt = opt.w;
      pic.loading = 'lazy';
      pic.onerror = function(){
        var d=document.createElement('div');
        d.className='pic-emoji';
        d.textContent = opt.e||'❓';
        this.replaceWith(d);
      };
    } else {
      pic = document.createElement('div');
      pic.className='pic-emoji';
      pic.textContent = opt.e||'❓';
    }
    var fb = document.createElement('div');
    fb.className='fb-overlay';
    card.appendChild(pic);
    card.appendChild(fb);
    var fired = false;
    function handle(e){
      if(fired) return; fired = true;
      if(e) e.preventDefault();
      handleAnswer(card, opt);
    }
    card.addEventListener('touchend', handle, {passive:false});
    card.addEventListener('click', handle);
    area.appendChild(card);
  });
}
function handleAnswer(card, opt){
  if(GAME.locked) return;
  GAME.locked = true;
  var isCorrect = (opt.w === GAME.current.w && opt.e === GAME.current.e);
  // dim others
  document.querySelectorAll('.pic-card').forEach(function(c){
    if(c!==card) c.classList.add('dim');
  });
  if(isCorrect){
    card.classList.add('correct');
    showFB(card,'correct','✓');
    GAME.streak++;
    if(GAME.streak > GAME.bestStreakInGame) GAME.bestStreakInGame = GAME.streak;
    if(GAME.bestStreakInGame > STATE.bestStreak) STATE.bestStreak = GAME.bestStreakInGame;
    var pts = 1 + Math.min(Math.floor(GAME.streak/3), 3);
    GAME.score += pts;
    GAME.correct++;
    if(!STATE.learned[GAME.current.w]){
      STATE.learned[GAME.current.w] = true;
      bumpMission();
    }
    if(GAME.reviewMode){
      // reduce mistake count; remove after 2 correct
      var m = STATE.mistakes[GAME.current.w];
      if(m){
        m.count = Math.max(0, (m.count||1) - 1);
        if(m.count<=0) delete STATE.mistakes[GAME.current.w];
      }
    }
    saveState();
    GAME.segs = GAME.segs || {};
    GAME.segs[GAME.round-1] = 'done';
    document.getElementById('game-score').textContent = GAME.score;
    playCorrectSound();
    var rect = card.getBoundingClientRect();
    burstSparks(rect.left+rect.width/2, rect.top+rect.height/2, pts*2);
    if(GAME.streak===3 || GAME.streak===5 || GAME.streak===8) companionSay(streakMsg(GAME.streak));
    setTimeout(nextQuestion, 1100);
  } else {
    card.classList.add('wrong');
    showFB(card,'wrong','✗');
    GAME.streak = 0;
    GAME.wrong++;
    GAME.wrongList.push({w:GAME.current.w, e:GAME.current.e});
    var prev = STATE.mistakes[GAME.current.w] || { count:0 };
    STATE.mistakes[GAME.current.w] = {
      emoji: GAME.current.e,
      cat: GAME.current.cat || guessCat(GAME.current.w),
      count: Math.min(2, (prev.count||0)+2),
      lastSeen: Date.now()
    };
    saveState();
    GAME.segs = GAME.segs || {};
    GAME.segs[GAME.round-1] = 'wrong';
    playWrongSound();
    setTimeout(function(){
      document.querySelectorAll('.pic-card').forEach(function(c){
        var emo = c.querySelector('.pic-emoji');
        var img = c.querySelector('.pic-img');
        var match = (emo && emo.textContent===GAME.current.e) || (img && img.alt===GAME.current.w);
        if(match){
          c.classList.remove('dim');
          c.classList.add('correct');
          showFB(c, 'this-one', t('just_this'));
        }
      });
      setTimeout(nextQuestion, 1300);
    }, 700);
  }
}
function showFB(card, kind, content){
  var fb = card.querySelector('.fb-overlay');
  fb.className = 'fb-overlay show '+kind;
  fb.textContent = content;
}
function guessCat(word){
  var cats = Object.keys(WORDS_DB);
  for(var i=0;i<cats.length;i++){
    if(WORDS_DB[cats[i]].some(function(x){return x.w===word;})) return cats[i];
  }
  return '';
}
function streakMsg(s){
  if(s>=8) return t('streak_8');
  if(s>=5) return t('streak_5');
  if(s>=3) return t('streak_3');
  return t('keep_it_up');
}
function toggleFav(){
  if(!GAME.current) return;
  var w = GAME.current.w;
  if(STATE.favorites[w]) delete STATE.favorites[w];
  else { STATE.favorites[w] = true; toast(t('toast_fav_added')); }
  saveState();
  updateFavBtn();
}
function updateFavBtn(){
  var btn = document.getElementById('fav-btn');
  if(!btn || !GAME.current) return;
  if(STATE.favorites[GAME.current.w]){
    btn.textContent = t('fav_btn_on');
    btn.classList.add('active');
  } else {
    btn.textContent = t('fav_btn');
    btn.classList.remove('active');
  }
}
function confirmExit(){
  playClickSound();
  popup({
    icon:'🏃', title:t('confirm_exit_title'),
    body:t('confirm_exit_msg'),
    actions:[
      {label:t('confirm_exit_keep')},
      {label:t('confirm_exit_quit'), primary:true, danger:true, fn:function(){ goTab('home'); }}
    ]
  });
}

/* ===== 6. RESULT ===== */
function showResults(){
  showScreen('result');
  STATE.totalStars += GAME.score;
  STATE.gamesPlayed++;
  // perfect = mastered (only normal cat)
  if(!GAME.reviewMode && GAME.cat!=='All' && GAME.correct===GAME.words.length && GAME.wrong===0 && !STATE.mastered[GAME.cat]){
    STATE.mastered[GAME.cat] = true;
  }
  saveState();
  // ranking
  var ratio = GAME.words.length ? GAME.correct/GAME.words.length : 0;
  var rank, msg, icon;
  if(ratio>=1){ rank=t('rank_perfect'); msg=t('rmsg_perfect'); icon='🌟'; }
  else if(ratio>=.9){ rank=t('rank_great'); msg=t('rmsg_great'); icon='🏆'; }
  else if(ratio>=.7){ rank=t('rank_good'); msg=t('rmsg_good'); icon='🥈'; }
  else if(ratio>=.5){ rank=t('rank_keep'); msg=t('rmsg_keep'); icon='🥉'; }
  else { rank=t('rank_retry'); msg=t('rmsg_retry'); icon='💪'; }
  document.getElementById('trophy-icon').textContent = icon;
  document.getElementById('result-rank').textContent = rank;
  document.getElementById('result-msg').textContent = msg;
  document.getElementById('r-correct').textContent = GAME.correct;
  document.getElementById('r-wrong').textContent = GAME.wrong;
  document.getElementById('r-streak').textContent = GAME.bestStreakInGame;
  document.getElementById('r-stars').textContent = GAME.score;
  // wrong list
  var wl = document.getElementById('wrong-list');
  var wc = document.getElementById('wrong-chips');
  if(GAME.wrongList.length){
    wl.style.display='block';
    wc.innerHTML = GAME.wrongList.map(function(x){
      return '<span class="wrong-chip"><span>'+x.e+'</span>'+esc(x.w)+'</span>';
    }).join('');
  } else { wl.style.display='none'; }
  // celebration
  if(ratio>=.9) burstConfetti();
  playWinSound();
  checkAchievements();
  updateMistakeBadge();
}
function restartGame(){
  playClickSound();
  if(GAME.reviewMode) startReview();
  else startGameWithCat(GAME.cat);
}
function goAfterResult(){
  playClickSound();
  goTab('play');
}
function goHome(){
  playClickSound();
  goTab('home');
}

/* ===== 7. WORDBOOK ===== */
var WB_FILTER = 'all';
function renderWordbook(){
  // attach filter listeners once
  document.querySelectorAll('#filter-bar .filter-chip').forEach(function(b){
    b.onclick = function(){
      playClickSound();
      document.querySelectorAll('#filter-bar .filter-chip').forEach(function(x){x.classList.remove('active');});
      b.classList.add('active');
      WB_FILTER = b.dataset.filter;
      paintWordbook();
    };
  });
  paintWordbook();
}
function paintWordbook(){
  var body = document.getElementById('wordbook-body');
  var html='';
  Object.keys(WORDS_DB).forEach(function(c){
    var list = WORDS_DB[c].filter(function(w){
      if(WB_FILTER==='learned') return STATE.learned[w.w];
      if(WB_FILTER==='fav') return STATE.favorites[w.w];
      if(WB_FILTER==='unlearned') return !STATE.learned[w.w];
      return true;
    });
    if(list.length===0) return;
    html += '<div class="cat-section">'+
      '<div class="cat-section-head">'+
        '<span class="icn">'+(CAT_ICONS[c]||'📚')+'</span>'+
        '<span class="nm">'+catNameZh(c)+'</span>'+
        '<span class="cnt">'+list.length+'</span>'+
      '</div>'+
      '<div class="word-grid">'+
        list.map(function(w){
          var unlocked = !!(STATE.learned[w.w] || STATE.favorites[w.w]);
          return '<div class="word-card '+(STATE.learned[w.w]?'learned ':'')+(!unlocked?'locked':'')+'" onclick="openSheet(\''+esc(w.w)+'\',\''+esc(c)+'\')">'+
            wordVisualHtml(w, 'word-thumb', true)+
            '<div class="ww">'+esc(w.w)+'</div>'+
            (STATE.favorites[w.w]?'<span class="badge-fav">★</span>':'')+
            (STATE.learned[w.w]?'<span class="badge-learn">✓</span>':'')+
            (!unlocked?'<span class="badge-lock">🔒</span>':'')+
          '</div>';
        }).join('')+
      '</div>'+
    '</div>';
  });
  if(!html){
    html = '<div class="mistakes-empty"><div class="ill">📭</div><h3>'+t('empty_words')+'</h3><p>'+t('empty_words_msg')+'</p></div>';
  }
  body.innerHTML = html;
  wireFallbackImages(body);
}

function wordVisualHtml(entry, imgClass, allowPhoto){
  var emoji = esc(entry.e || '❓');
  if(allowPhoto && entry.i && STATE.settings.imageMode === 'photo'){
    return '<img class="'+imgClass+'" src="'+esc(entry.i)+'" alt="'+esc(entry.w || '')+'" loading="lazy">'+
      '<div class="we" style="display:none">'+emoji+'</div>';
  }
  return '<div class="we">'+emoji+'</div>';
}

function wireFallbackImages(root){
  Array.prototype.forEach.call(root.querySelectorAll('img'), function(img){
    img.onerror = function(){
      var fallback = img.nextElementSibling;
      img.style.display = 'none';
      if(fallback) fallback.style.display = 'block';
    };
    if(img.complete && img.naturalWidth === 0) img.onerror();
  });
}

/* Word detail sheet */
var currentSheetWord = '';
function openSheet(word, cat){
  playClickSound();
  var entry = findWordByText(word);
  if(!entry) entry = {w:word, e:'❓'};
  currentSheetWord = word;
  var sheetVisual = document.getElementById('sheet-emoji');
  sheetVisual.innerHTML = wordVisualHtml(entry, 'sheet-thumb', true);
  wireFallbackImages(sheetVisual);
  document.getElementById('sheet-word').textContent = word;
  document.getElementById('sheet-status').textContent = STATE.learned[word] ? t('sheet_status_learned') : t('sheet_status_new');
  document.getElementById('sheet-cat').textContent = catNameZh(cat||entry.cat||'')||'—';
  updateSheetFavBtn();
  document.getElementById('sheet-overlay').classList.add('show');
  setTimeout(function(){speakText(word);},150);
}
function closeSheet(e){
  if(e && e.target && !e.target.classList.contains('sheet-overlay')) return;
  document.getElementById('sheet-overlay').classList.remove('show');
}
function toggleSheetFav(){
  if(STATE.favorites[currentSheetWord]) delete STATE.favorites[currentSheetWord];
  else STATE.favorites[currentSheetWord] = true;
  saveState();
  updateSheetFavBtn();
  paintWordbook();
}
function updateSheetFavBtn(){
  var b = document.getElementById('sheet-fav-btn');
  if(STATE.favorites[currentSheetWord]){ b.textContent = t('fav_btn_on'); }
  else { b.textContent = t('fav_btn'); }
}

/* ===== 8. MISTAKES ===== */
function mistakesCount(){ return Object.keys(STATE.mistakes).length; }
function updateMistakeBadge(){
  var n = mistakesCount();
  var b = document.getElementById('tab-mistake-badge');
  if(n>0){ b.textContent = n>99?'99+':n; b.classList.remove('hide'); }
  else b.classList.add('hide');
  // also update home shortcut
  var c2 = document.getElementById('mistake-count-2');
  if(c2) c2.textContent = n;
}
function renderMistakes(){
  var body = document.getElementById('mistakes-body');
  var words = Object.keys(STATE.mistakes);
  updateMistakeBadge();
  if(words.length===0){
    body.innerHTML = '<div class="mistakes-empty">'+
      '<div class="ill">🎉</div>'+
      '<h3>'+t('no_mistakes')+'</h3>'+
      '<p>'+t('no_mistakes_msg')+'</p>'+
      '<button class="btn btn-primary" style="margin-top:18px" onclick="goTab(\'play\')">'+t('go_play')+'</button>'+
    '</div>';
    return;
  }
  var html = '<div class="review-banner" onclick="startReview()">'+
    '<div class="ri">⚡</div>'+
    '<div class="rb"><div class="t">'+t('review_n', Math.min(10,words.length))+'</div>'+
    '<div class="s">'+t('review_hint')+'</div></div>'+
    '<div class="ra">→</div>'+
  '</div>';
  // sort by lastSeen desc
  words.sort(function(a,b){ return (STATE.mistakes[b].lastSeen||0) - (STATE.mistakes[a].lastSeen||0); });
  html += words.map(function(w){
    var m = STATE.mistakes[w];
    var ent = findWordByText(w);
    var emoji = (ent && ent.e) || m.emoji || '❓';
    var cat = m.cat || (ent && ent.cat) || '';
    var dots = ''; for(var i=0;i<2;i++) dots += i<m.count ? '●' : '○';
    return '<div class="mistake-card">'+
      '<div class="mi">'+emoji+'</div>'+
      '<div class="body">'+
        '<div class="w">'+esc(w)+'</div>'+
        '<div class="meta"><span>'+catNameZh(cat)+'</span><span style="color:var(--berry)">'+dots+'</span></div>'+
      '</div>'+
      '<div class="actions">'+
        '<button class="act" onclick="event.stopPropagation();speakText(\''+esc(w)+'\')" aria-label="Hear">🔊</button>'+
        '<button class="act primary" onclick="event.stopPropagation();reviewSingle(\''+esc(w)+'\')" aria-label="Practice">▶</button>'+
      '</div>'+
    '</div>';
  }).join('');
  body.innerHTML = html;
}
function reviewSingle(word){
  playClickSound();
  var ent = findWordByText(word);
  if(!ent){ delete STATE.mistakes[word]; saveState(); renderMistakes(); return; }
  GAME.reviewMode = true;
  GAME.cat = '__review__';
  GAME.words = [ent];
  beginGameSession();
}

/* ===== 9. ME / Settings / Achievements ===== */
var ACHIEVEMENTS_LIST = [
  {id:'first_game',   icon:'🥇', key:'first_game',   check:function(){return STATE.gamesPlayed>=1;}},
  {id:'streak_3',     icon:'🔥', key:'streak_3a',   check:function(){return STATE.bestStreak>=3;}},
  {id:'streak_5',     icon:'⚡', key:'streak_5a',   check:function(){return STATE.bestStreak>=5;}},
  {id:'streak_10',    icon:'💥', key:'streak_10a',  check:function(){return STATE.bestStreak>=10;}},
  {id:'checkin_3',    icon:'📅', key:'checkin_3',   check:function(){return STATE.bestCheckinStreak>=3;}},
  {id:'checkin_7',    icon:'🗓️', key:'checkin_7',   check:function(){return STATE.bestCheckinStreak>=7;}},
  {id:'checkin_30',   icon:'🏅', key:'checkin_30',  check:function(){return STATE.bestCheckinStreak>=30;}},
  {id:'words_50',     icon:'🌱', key:'words_50',    check:function(){return Object.keys(STATE.learned).length>=50;}},
  {id:'words_200',    icon:'🌳', key:'words_200',   check:function(){return Object.keys(STATE.learned).length>=200;}},
  {id:'games_10',     icon:'📖', key:'games_10',    check:function(){return STATE.gamesPlayed>=10;}},
  {id:'master_first', icon:'⭐', key:'master_first',check:function(){return Object.keys(STATE.mastered).length>=1;}}
];
function achTexts(key){
  var lang = (STATE.settings && STATE.settings.lang)||'zh';
  var dict = (I18N[lang]||{}).ach || I18N.zh.ach;
  return (dict && dict[key]) || ['?','?'];
}
function checkAchievements(){
  ACHIEVEMENTS_LIST.forEach(function(a){
    if(!STATE.achievements[a.id] && a.check()){
      STATE.achievements[a.id] = true;
      saveState();
      var pair = achTexts(a.key);
      setTimeout(function(){
        popup({icon:a.icon, title:t('ach_unlocked')+pair[0], body:pair[1], actions:[{label:t('checkin_popup_ok'), primary:true}]});
      }, 300);
    }
  });
}
function renderMe(){
  document.getElementById('me-name').textContent = STATE.kidName;
  document.getElementById('v-name').textContent = STATE.kidName;
  document.getElementById('me-games').textContent = STATE.gamesPlayed;
  document.getElementById('me-streak').textContent = STATE.bestStreak;
  document.getElementById('me-checkin').textContent = STATE.bestCheckinStreak;
  var unlocked = 0;
  var html='';
  ACHIEVEMENTS_LIST.forEach(function(a){
    var ok = !!STATE.achievements[a.id];
    if(ok) unlocked++;
    var pair = achTexts(a.key);
    html += '<div class="menu-item" style="border:0;padding:8px 0;'+(ok?'':'opacity:.45')+'">'+
      '<div class="icn" style="background:'+(ok?'var(--honey-soft)':'var(--bg-soft)')+'">'+a.icon+'</div>'+
      '<div style="flex:1">'+
        '<div class="lbl" style="font-size:14px">'+pair[0]+'</div>'+
        '<div style="font-size:11.5px;color:var(--muted);font-weight:500">'+pair[1]+'</div>'+
      '</div>'+
      (ok?'<div style="color:var(--leaf);font-weight:700">✓</div>':'<div style="color:var(--muted)">·</div>')+
    '</div>';
  });
  document.getElementById('ach-list').innerHTML = html;
  document.getElementById('ach-count').textContent = unlocked+'/'+ACHIEVEMENTS_LIST.length;
  // setting controls
  var sT = document.getElementById('t-sound'); if(sT){sT.checked = !!STATE.settings.sound; sT.onchange = function(){STATE.settings.sound=this.checked;saveState();};}
  var cT = document.getElementById('t-click'); if(cT){cT.checked = !!STATE.settings.clickSound; cT.onchange = function(){STATE.settings.clickSound=this.checked;saveState();};}
  document.getElementById('v-imgmode').textContent = STATE.settings.imageMode==='photo' ? t('imgmode_photo') : t('imgmode_emoji');
  var v = pickVoice();
  document.getElementById('v-voice').textContent = v ? v.name.replace(/Microsoft|Google|Apple/i,'').trim().slice(0,18) : t('voice_auto');
  var vl = document.getElementById('v-lang'); if(vl) vl.textContent = (STATE.settings.lang==='en'?t('lang_en'):t('lang_zh'));
}
function toggleLanguage(){
  playClickSound();
  var next = (STATE.settings.lang==='zh') ? 'en' : 'zh';
  setLanguage(next);
  toast(next==='zh'?'已切换为中文':'Switched to English');
}
function cycleImageMode(){
  playClickSound();
  STATE.settings.imageMode = (STATE.settings.imageMode==='photo' ? 'emoji' : 'photo');
  saveState(); renderMe();
  if(document.body.dataset.screen === 'wordbook') renderWordbook();
  toast(t('imgmode_switched', STATE.settings.imageMode==='photo'?t('imgmode_photo'):t('imgmode_emoji')));
}
function editName(){
  playClickSound();
  var n = prompt(t('name_prompt'), STATE.kidName);
  if(n && n.trim()){
    STATE.kidName = n.trim().slice(0,16);
    saveState();
    renderMe();
    refreshHome();
    toast(t('name_updated'));
  }
}
function openVoicePicker(){
  playClickSound();
  refreshVoiceList();
  var voices = availableVoices;
  if(!voices.length){ toast(t('no_voices')); return; }
  var html = '<div style="max-height:280px;overflow-y:auto;text-align:left;margin-top:10px">';
  html += '<div class="menu-item" style="padding:10px;border:1px solid var(--line);border-radius:10px;margin-bottom:6px;cursor:pointer" onclick="pickVoiceURI(null)">'+
    '<div style="flex:1"><b>'+t('voice_auto_label')+'</b><div style="font-size:11px;color:var(--muted)">'+t('voice_auto_sub')+'</div></div>'+
    (STATE.settings.voiceURI?'':'<span style="color:var(--leaf)">✓</span>')+
  '</div>';
  voices.slice(0,30).forEach(function(v){
    var sel = STATE.settings.voiceURI === v.voiceURI;
    html += '<div class="menu-item" style="padding:10px;border:1px solid var(--line);border-radius:10px;margin-bottom:6px;cursor:pointer" onclick="pickVoiceURI(\''+esc(v.voiceURI)+'\')">'+
      '<div style="flex:1"><b>'+esc(v.name)+'</b><div style="font-size:11px;color:var(--muted)">'+esc(v.lang)+'</div></div>'+
      (sel?'<span style="color:var(--leaf)">✓</span>':'')+
    '</div>';
  });
  html += '</div>';
  popup({icon:'🗣️', title:t('voice_picker_title'), body:html, actions:[{label:t('voice_picker_close'), primary:true}]});
}
function pickVoiceURI(uri){
  STATE.settings.voiceURI = uri;
  saveState();
  speakText(STATE.kidName+', this is your new voice!');
  closePopup();
  renderMe();
}
function confirmReset(){
  playClickSound();
  popup({
    icon:'⚠️', title:t('confirm_reset_title'),
    body:t('confirm_reset_msg'),
    actions:[
      {label:t('confirm_reset_cancel')},
      {label:t('confirm_reset_ok'), primary:true, danger:true, fn:function(){
        localStorage.removeItem('tiger_v2');
        ['tiger_learned','tiger_mastered','tiger_totalstars','tiger_beststreak','tiger_gamesplayed','tiger_achievements','tiger_sound','tiger_clicksound','tiger_imgmode','tiger_lang','tiger_voice_uri'].forEach(function(k){localStorage.removeItem(k);});
        location.reload();
      }}
    ]
  });
}

/* ===== 10. COMPANION (团团) ===== */
function companionTalk(){
  playClickSound();
  var msgs = (I18N[(STATE.settings.lang||'zh')]||I18N.zh).companion_msgs || I18N.zh.companion_msgs;
  companionSay(msgs[Math.floor(Math.random()*msgs.length)]);
}
var compTimer = null;
function companionSay(msg){
  var el = document.getElementById('companion-msg');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  var tt = document.getElementById('companion');
  if(tt) tt.classList.add('talking');
  if(compTimer) clearTimeout(compTimer);
  compTimer = setTimeout(function(){
    el.classList.remove('show');
    if(tt) tt.classList.remove('talking');
  }, 3200);
}

/* ===== 11. AUDIO ===== */
function ensureAudio(){
  try{ window.__audioCtx = window.__audioCtx || new (window.AudioContext||window.webkitAudioContext)(); }catch(e){}
}
function playClickSound(){
  if(!STATE.settings.clickSound || !STATE.settings.sound) return;
  try{
    ensureAudio();
    var ctx = window.__audioCtx;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g).connect(ctx.destination);
    o.type='sine'; o.frequency.value=900;
    g.gain.setValueAtTime(.07, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+.06);
    o.start(); o.stop(ctx.currentTime+.06);
  }catch(e){}
}
function playCorrectSound(){
  if(!STATE.settings.sound) return;
  try{
    ensureAudio(); var ctx = window.__audioCtx;
    [659,784,1047].forEach(function(f,i){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g).connect(ctx.destination); o.type='sine';
      o.frequency.setValueAtTime(f, ctx.currentTime+i*.08);
      g.gain.setValueAtTime(.1, ctx.currentTime+i*.08);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+i*.08+.18);
      o.start(ctx.currentTime+i*.08); o.stop(ctx.currentTime+i*.08+.2);
    });
  }catch(e){}
}
function playWrongSound(){
  if(!STATE.settings.sound) return;
  try{
    ensureAudio(); var ctx = window.__audioCtx;
    var o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g).connect(ctx.destination); o.type='sawtooth';
    o.frequency.setValueAtTime(220, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(160, ctx.currentTime+.2);
    g.gain.setValueAtTime(.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+.25);
    o.start(); o.stop(ctx.currentTime+.25);
  }catch(e){}
}
function playWinSound(){
  if(!STATE.settings.sound) return;
  try{
    ensureAudio(); var ctx = window.__audioCtx;
    [523,659,784,1047].forEach(function(f,i){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g).connect(ctx.destination); o.type='sine';
      o.frequency.setValueAtTime(f, ctx.currentTime+i*.1);
      g.gain.setValueAtTime(.08, ctx.currentTime+i*.1);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+i*.1+.22);
      o.start(ctx.currentTime+i*.1); o.stop(ctx.currentTime+i*.1+.24);
    });
  }catch(e){}
}

/* TTS */
var availableVoices = [];
function refreshVoiceList(){
  try{
    availableVoices = (speechSynthesis.getVoices()||[]).filter(function(v){return /^en/i.test(v.lang);});
    availableVoices.sort(function(a,b){return voiceScore(b)-voiceScore(a);});
  }catch(e){}
}
function voiceScore(v){
  var s=0, n=(v.name||'').toLowerCase();
  if(v.default)s+=10;
  if(/premium|enhanced|natural|neural/.test(n))s+=30;
  if(/google/.test(n))s+=20;
  if(/samantha|siri|ava|allison|karen/.test(n))s+=15;
  if(/microsoft|aria|jenny/.test(n))s+=12;
  if(/en-us/i.test(v.lang))s+=5;
  return s;
}
function pickVoice(){
  if(STATE.settings.voiceURI){
    for(var i=0;i<availableVoices.length;i++){
      if(availableVoices[i].voiceURI===STATE.settings.voiceURI) return availableVoices[i];
    }
  }
  return availableVoices[0]||null;
}
function speakWord(rate){
  if(!GAME.current) return;
  speakText(GAME.current.w, rate);
  // pulse the speaker
  var b = document.getElementById('speaker-btn');
  if(b){ b.classList.add('playing'); setTimeout(function(){b.classList.remove('playing');}, 800); }
}
function speakText(text, rate){
  try{
    if(!text) return;
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice();
    if(v){ u.voice = v; u.lang = v.lang; } else { u.lang='en-US'; }
    u.rate = rate || 0.9;
    u.pitch = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }catch(e){}
}

/* ===== 12. POPUP / TOAST / SPARKS ===== */
var popupAction = null;
function popup(opts){
  document.getElementById('popup-icon').textContent = opts.icon||'⭐';
  document.getElementById('popup-title').textContent = opts.title||'';
  document.getElementById('popup-body').innerHTML = opts.body||'';
  var ac = document.getElementById('popup-actions');
  if(!opts.actions || !opts.actions.length){
    ac.innerHTML = '<button class="pSingle" onclick="closePopup()">好</button>';
  } else if (opts.actions.length===1){
    var a = opts.actions[0];
    ac.innerHTML = '<button class="pSingle" id="pop-go">'+esc(a.label)+'</button>';
    document.getElementById('pop-go').onclick = function(){ closePopup(); if(a.fn) a.fn(); };
  } else {
    ac.innerHTML = opts.actions.map(function(a,i){
      var cls = a.primary ? 'pConfirm' : 'pCancel';
      if(a.danger) cls = 'pConfirm';
      return '<button class="'+cls+'" data-i="'+i+'"'+(a.danger?' style="background:linear-gradient(180deg,#ED4548,#C42B30)"':'')+'>'+esc(a.label)+'</button>';
    }).join('');
    Array.prototype.forEach.call(ac.children, function(btn){
      btn.onclick = function(){
        var i = +btn.dataset.i;
        var a = opts.actions[i];
        closePopup();
        if(a.fn) a.fn();
      };
    });
  }
  document.getElementById('popup-overlay').classList.add('show');
}
function closePopup(){ document.getElementById('popup-overlay').classList.remove('show'); }

var toastTimer=null;
function toast(msg){
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){t.classList.remove('show');}, 1800);
}

function burstSparks(x, y, n){
  var icons = ['⭐','✨','🌟','💫','⭐'];
  for(var i=0;i<(n||6);i++){
    var s = document.createElement('div');
    s.className = 'spark';
    s.textContent = icons[i%icons.length];
    s.style.left = x+'px';
    s.style.top = y+'px';
    var dx = (Math.random()-.5)*200;
    var dy = -100 - Math.random()*120;
    s.style.setProperty('--dx', dx+'px');
    s.style.setProperty('--dy', dy+'px');
    s.style.animationDuration = (1.2+Math.random()*.8)+'s';
    document.body.appendChild(s);
    setTimeout((function(el){return function(){el.remove();};})(s), 2200);
  }
}
function burstConfetti(){
  for(var i=0;i<28;i++){
    var s = document.createElement('div');
    s.className = 'spark';
    s.textContent = ['🎉','✨','⭐','🌟','💛'][i%5];
    s.style.left = (Math.random()*window.innerWidth)+'px';
    s.style.top = (window.innerHeight*0.4)+'px';
    var dx = (Math.random()-.5)*window.innerWidth*.8;
    var dy = -Math.random()*window.innerHeight*.5;
    s.style.setProperty('--dx', dx+'px');
    s.style.setProperty('--dy', dy+'px');
    s.style.animationDuration = (1.8+Math.random()*1.2)+'s';
    s.style.fontSize = (18+Math.random()*16)+'px';
    document.body.appendChild(s);
    setTimeout((function(el){return function(){el.remove();};})(s), 3200);
  }
}

/* ===== shared utils ===== */
function shuffle(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

/* ===== 13. INIT ===== */
function init(){
  loadState();
  document.getElementById('btn-sound').onclick = function(){
    playClickSound();
    STATE.settings.sound = !STATE.settings.sound;
    saveState();
    this.textContent = STATE.settings.sound ? '🔊' : '🔇';
    toast(STATE.settings.sound ? t('sound_on') : t('sound_off'));
  };
  document.getElementById('btn-sound').textContent = STATE.settings.sound?'🔊':'🔇';

  refreshVoiceList();
  if('onvoiceschanged' in speechSynthesis){
    speechSynthesis.onvoiceschanged = refreshVoiceList;
  }

  applyLanguage();
  refreshHome();
  updateMistakeBadge();

  if(STATE.gamesPlayed===0 && STATE.checkinDates.length===0){
    setTimeout(function(){ companionSay(t('welcome')); }, 600);
  } else {
    setTimeout(function(){
      var s = currentCheckinStreak();
      if(s>=3) companionSay(t('welcome_back_streak', s));
      else companionSay(t('welcome_back'));
    }, 600);
  }
}

document.addEventListener('DOMContentLoaded', init);
