// ===== 每日连续学习（Daily Streak）=====
var DAILY_STREAK_KEY = 'tiger_daily_streak';
var dailyStreak = {
  current: 0,
  best: 0,
  lastDate: '',
  makeupAvailable: true
};

function streakTodayKey() {
  var d = new Date();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

function streakDayDiff(a, b) {
  if (!a || !b) return 999;
  var da = new Date(a + 'T00:00:00');
  var db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}

function loadDailyStreak() {
  try {
    var saved = JSON.parse(localStorage.getItem(DAILY_STREAK_KEY) || '{}');
    dailyStreak.current = Math.max(0, parseInt(saved.current || 0, 10));
    dailyStreak.best = Math.max(0, parseInt(saved.best || 0, 10));
    dailyStreak.lastDate = saved.lastDate || '';
    dailyStreak.makeupAvailable = saved.makeupAvailable !== false;
  } catch(e) {}
}

function saveDailyStreak() {
  try { localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(dailyStreak)); } catch(e) {}
}

function markDailyPractice() {
  loadDailyStreak();
  var today = streakTodayKey();
  var diff = streakDayDiff(dailyStreak.lastDate, today);
  var message = '';

  if (dailyStreak.lastDate === today) {
    refreshDailyStreakUI();
    return false;
  }

  if (!dailyStreak.lastDate || diff <= 0) {
    dailyStreak.current = Math.max(1, dailyStreak.current || 1);
    dailyStreak.makeupAvailable = true;
  } else if (diff === 1) {
    dailyStreak.current += 1;
    dailyStreak.makeupAvailable = true;
  } else if (diff === 2 && dailyStreak.makeupAvailable) {
    dailyStreak.current += 1;
    dailyStreak.makeupAvailable = false;
    message = currentLang === 'zh' ? '补签成功，火苗保住了！' : 'Make-up used. The fire is safe!';
  } else {
    dailyStreak.current = 1;
    dailyStreak.makeupAvailable = true;
    message = currentLang === 'zh' ? '新的连续学习开始啦！' : 'A fresh streak starts today!';
  }

  dailyStreak.lastDate = today;
  if (dailyStreak.current > dailyStreak.best) dailyStreak.best = dailyStreak.current;
  saveDailyStreak();
  refreshDailyStreakUI();

  if (message && typeof tuantuanSay === 'function') tuantuanSay(message);
  return true;
}

function refreshDailyStreakUI() {
  loadDailyStreak();
  var label = document.getElementById('daily-streak-label');
  if (label) {
    var daysText = currentLang === 'zh' ? '连续 ' + dailyStreak.current + ' 天' : dailyStreak.current + ' day streak';
    if (dailyStreak.current !== 1 && currentLang !== 'zh') daysText = dailyStreak.current + ' day streak';
    label.textContent = daysText;
  }

  var badge = document.getElementById('daily-makeup-badge');
  if (badge) {
    badge.textContent = currentLang === 'zh' ? '补签1' : 'save 1';
    badge.classList.toggle('is-hidden', !dailyStreak.makeupAvailable);
  }

  var btn = document.getElementById('daily-streak-btn');
  if (btn) btn.classList.toggle('streak-active', dailyStreak.current > 0);
}

function showDailyStreakInfo() {
  loadDailyStreak();
  var title = currentLang === 'zh' ? '每日火苗' : 'Daily Streak';
  var makeup = dailyStreak.makeupAvailable
    ? (currentLang === 'zh' ? '还有 1 次补签机会。' : 'You still have 1 make-up save.')
    : (currentLang === 'zh' ? '补签机会已经用掉了。' : 'The make-up save has been used.');
  var desc = currentLang === 'zh'
    ? '已连续学习 ' + dailyStreak.current + ' 天，历史最好 ' + dailyStreak.best + ' 天。' + makeup
    : 'Current streak: ' + dailyStreak.current + ' days. Best: ' + dailyStreak.best + ' days. ' + makeup;

  if (typeof showAchievementPopup === 'function') {
    showAchievementPopup({name: title, desc: desc});
  } else {
    alert(title + '\n' + desc);
  }
}
