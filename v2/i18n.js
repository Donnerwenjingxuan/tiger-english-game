/* ============================================================
   i18n — bilingual zh / en for all UI chrome
   ============================================================ */
var I18N = {
  zh: {
    tab_home:'首页', tab_play:'闯关', tab_words:'单词册', tab_mistakes:'错题', tab_me:'Tiger',
    hi_prefix:'嗨，', hi_suffix:'！',
    app_title:'Tiger 的英语乐园',
    app_subtitle:'每天一点点，单词越来越多 ✨',
    stat_words:'已学单词', stat_streak:'连续打卡', stat_stars:'收集星星',
    checkin_label:'每日打卡',
    streak_n_days:function(n){return '连续 '+n+' 天';},
    checkin_btn:'今日打卡 ✓',
    checkin_done:'✓ 今天已打卡，明天见！',
    mission_title:'今日任务',
    mission_desc:function(n){return '学会 '+n+' 个新单词';},
    mission_desc_done:'今天的任务已完成 🎉',
    mission_meta:function(p,t){return p+' / '+t+' · 完成后 +10 ⭐';},
    mission_claimed:'已领取 +10 ⭐',
    quick_start:'快速开始',
    see_all:'全部分类 →',
    learning_tools:'学习工具',
    mistakes_short:'错题本',
    mistakes_count:function(n){return n+' 个待复习';},
    wordbook_short:'单词册',
    learned_count:function(n){return n+' 个已学';},
    play_title:'选个分类闯关',
    play_subtitle:'跟着 Tiger 一起学单词',
    play_all:'全部分类挑战',
    play_all_desc:'从所有单词中随机抽取 10 题',
    cat_progress:function(tot,lrn,pct){return tot+' 个单词 · 已学 '+lrn+'/'+tot+' ('+pct+'%)';},
    review_title:'错题复习',
    all_cat:'全部分类',
    question_n:function(n,tot){return '第 '+n+'/'+tot+' 题';},
    fav_btn:'☆ 收藏', fav_btn_on:'★ 已收藏',
    slow_btn:'🐢 慢速',
    rank_perfect:'完美！', rank_great:'超棒！', rank_good:'不错！', rank_keep:'加油！', rank_retry:'再试试！',
    rmsg_perfect:'全对！Tiger 是单词小天才！',
    rmsg_great:'差一点点就满分啦！',
    rmsg_good:'保持下去，越来越厉害了',
    rmsg_keep:'错题本里见，复习一下吧',
    rmsg_retry:'没关系，慢慢来',
    r_correct:'答对', r_wrong:'答错', r_streak:'最高连击', r_stars:'获得星星',
    wrong_intro:'📝 已加入错题本，等会儿一起复习：',
    btn_restart:'↻ 重来', btn_continue:'继续闯关 →', btn_home:'🏠 主页',
    wordbook_title:'单词收藏册',
    wordbook_subtitle:'所有学过、收藏过的单词都在这儿',
    filter_all:'全部', filter_learned:'已学会 ✓', filter_fav:'收藏 ★', filter_unlearned:'未学',
    empty_words:'这里还是空的', empty_words_msg:'去闯关学单词吧！',
    sheet_status_learned:'已学会 ✓', sheet_status_new:'未学',
    sheet_status_label:'状态', sheet_cat_label:'所属',
    sheet_listen:'🔊 听一听', sheet_close:'关闭',
    mistakes_title:'错题本',
    mistakes_subtitle:'答错过的单词，多复习几次就记住啦！',
    no_mistakes:'没有错题啦！',
    no_mistakes_msg:'Tiger 真厉害，所有单词都答对了。<br>继续学习更多单词吧！',
    go_play:'去闯关',
    review_n:function(n){return '一起复习 '+n+' 题';},
    review_hint:'答对 2 次就自动毕业',
    me_id:'英语小冒险家',
    me_games:'闯关', me_best_streak:'最高连击', me_longest_streak:'最长打卡',
    achievements:'成就', settings:'设置',
    set_sound:'音效', set_click:'按键音',
    set_imgmode:'图片样式', imgmode_photo:'真实图片', imgmode_emoji:'Emoji 表情',
    set_voice:'朗读声音', voice_auto:'自动',
    set_name:'小朋友的名字',
    set_language:'语言', lang_zh:'中文', lang_en:'English',
    set_reset:'重置全部进度',
    footer:'v2.0 · Tiger 专属版',
    toast_fav_added:'已加入收藏', toast_today_done:'今天已经打过卡啦',
    checkin_popup_title:'打卡成功！',
    checkin_popup_body:function(n){return '你已经连续打卡 <b>'+n+'</b> 天啦！<br>奖励 <b>5 ⭐</b>';},
    checkin_popup_ok:'太棒了',
    confirm_exit_title:'要退出闯关吗？',
    confirm_exit_msg:'本局进度不会保存哦',
    confirm_exit_keep:'继续闯关', confirm_exit_quit:'退出',
    confirm_reset_title:'重置全部进度？',
    confirm_reset_msg:'打卡、单词、错题、成就都会清空，无法恢复。',
    confirm_reset_cancel:'再想想', confirm_reset_ok:'确认重置',
    name_prompt:'给小朋友取个名字吧 ✏️', name_updated:'名字已更新',
    imgmode_switched:function(n){return '已切换：'+n;},
    sound_on:'声音已开启', sound_off:'声音已静音',
    no_voices:'暂无可用朗读声音',
    voice_picker_title:'选择朗读声音', voice_picker_close:'关闭',
    voice_auto_label:'自动', voice_auto_sub:'系统推荐',
    welcome:'Hi！欢迎来到 Tiger 的英语乐园 🎉',
    welcome_back:'欢迎回来！',
    welcome_back_streak:function(n){return '已经连续打卡 '+n+' 天啦！';},
    just_this:'就是这个',
    streak_3:'连击 ×3！加油！', streak_5:'连击 ×5！太猛了！', streak_8:'连击 ×8！状态爆表！',
    keep_it_up:'继续加油！',
    cat_names:{ Animals:'动物', Vehicles:'交通工具', Furniture:'家具', Food:'食物', Colors:'颜色', Shapes:'形状', Clothes:'衣物', Home:'家', Nature:'大自然', Body:'身体', Numbers:'数字', Time:'时间', Family:'家人', School:'学校', Toys:'玩具', Feelings:'情绪', Weather:'天气', Places:'场所', Actions:'动作', Adjectives:'形容词', Jobs:'职业', Prepositions:'介词', Questions:'疑问词' },
    companion_msgs:[
      '加油 Tiger！','你超棒的！','一个一个慢慢学～','学英语好好玩！',
      '错了也没关系哦','每天学一点就够啦','团团陪着你！','再来一题试试？',
      '今天又学了新东西，厉害！','发音可以再听一次哦','我相信你，Tiger！',
      '汪汪~ 学完一组休息一下吧！'
    ],
    ach:{
      first_game:['第一步','完成第一局游戏'],
      streak_3a:['连击新星','连击答对 3 题'],
      streak_5a:['火力全开','连击答对 5 题'],
      streak_10a:['势不可挡','连击答对 10 题'],
      checkin_3:['坚持三天','连续打卡 3 天'],
      checkin_7:['一周不断','连续打卡 7 天'],
      checkin_30:['坚持成大佬','连续打卡 30 天'],
      words_50:['词汇之芽','学会 50 个单词'],
      words_200:['词汇之树','学会 200 个单词'],
      games_10:['勤奋学习者','完成 10 局游戏'],
      master_first:['首个通关','通关任一分类']
    },
    ach_unlocked:'解锁成就：',
    weekday:['日','一','二','三','四','五','六'],
    date_fmt:function(m,d,wd){return m+'月'+d+'日 · 周'+wd;}
  },
  en: {
    tab_home:'Home', tab_play:'Play', tab_words:'Words', tab_mistakes:'Wrong', tab_me:'Me',
    hi_prefix:'Hi, ', hi_suffix:'!',
    app_title:"Tiger's English",
    app_subtitle:'A little every day, words grow ✨',
    stat_words:'Words', stat_streak:'Day Streak', stat_stars:'Stars',
    checkin_label:'Daily Check-in',
    streak_n_days:function(n){return n+'-day streak';},
    checkin_btn:'Check in ✓',
    checkin_done:'✓ Checked in. See you tomorrow!',
    mission_title:"Today's Mission",
    mission_desc:function(n){return 'Learn '+n+' new words';},
    mission_desc_done:"Mission done 🎉",
    mission_meta:function(p,t){return p+' / '+t+' · Reward +10 ⭐';},
    mission_claimed:'Claimed +10 ⭐',
    quick_start:'Quick Start',
    see_all:'All →',
    learning_tools:'Tools',
    mistakes_short:'Wrong Book',
    mistakes_count:function(n){return n+' to review';},
    wordbook_short:'Word Book',
    learned_count:function(n){return n+' learned';},
    play_title:'Pick a category',
    play_subtitle:'Learn words with Tiger',
    play_all:'All-Category Challenge',
    play_all_desc:'10 random words from all categories',
    cat_progress:function(tot,lrn,pct){return tot+' words · '+lrn+'/'+tot+' ('+pct+'%) learned';},
    review_title:'Mistake Review',
    all_cat:'All',
    question_n:function(n,tot){return n+' / '+tot;},
    fav_btn:'☆ Save', fav_btn_on:'★ Saved',
    slow_btn:'🐢 Slow',
    rank_perfect:'Perfect!', rank_great:'Awesome!', rank_good:'Nice!', rank_keep:'Keep going!', rank_retry:'Try again!',
    rmsg_perfect:'All correct! Tiger is a word genius!',
    rmsg_great:'So close to a perfect score!',
    rmsg_good:"Keep going, you're getting better!",
    rmsg_keep:'Check the Wrong book and review',
    rmsg_retry:"It's OK, take your time",
    r_correct:'Correct', r_wrong:'Wrong', r_streak:'Best Streak', r_stars:'Stars',
    wrong_intro:'📝 Added to Wrong book for review:',
    btn_restart:'↻ Restart', btn_continue:'Continue →', btn_home:'🏠 Home',
    wordbook_title:'Word Album',
    wordbook_subtitle:'All your learned and saved words',
    filter_all:'All', filter_learned:'Learned ✓', filter_fav:'Saved ★', filter_unlearned:'New',
    empty_words:"It's empty", empty_words_msg:'Go play to learn words!',
    sheet_status_learned:'Learned ✓', sheet_status_new:'New',
    sheet_status_label:'Status', sheet_cat_label:'Category',
    sheet_listen:'🔊 Listen', sheet_close:'Close',
    mistakes_title:'Wrong Book',
    mistakes_subtitle:'Wrong words become easy after a few reviews!',
    no_mistakes:'No mistakes!',
    no_mistakes_msg:'Great job, Tiger! All correct.<br>Keep learning more words!',
    go_play:'Start playing',
    review_n:function(n){return 'Review '+n+' words';},
    review_hint:'Get 2 right to graduate',
    me_id:'English Adventurer',
    me_games:'Games', me_best_streak:'Best Streak', me_longest_streak:'Top Streak',
    achievements:'Achievements', settings:'Settings',
    set_sound:'Sound', set_click:'Click Sound',
    set_imgmode:'Image Style', imgmode_photo:'Photos', imgmode_emoji:'Emoji',
    set_voice:'Voice', voice_auto:'Auto',
    set_name:"Kid's Name",
    set_language:'Language', lang_zh:'中文', lang_en:'English',
    set_reset:'Reset All Progress',
    footer:'v2.0 · Tiger Edition',
    toast_fav_added:'Saved to favorites', toast_today_done:'Already checked in today',
    checkin_popup_title:'Checked in!',
    checkin_popup_body:function(n){return "You've checked in <b>"+n+"</b> days in a row!<br>Reward <b>5 ⭐</b>";},
    checkin_popup_ok:'Awesome',
    confirm_exit_title:'Exit this round?',
    confirm_exit_msg:'Your progress will not be saved',
    confirm_exit_keep:'Keep playing', confirm_exit_quit:'Exit',
    confirm_reset_title:'Reset all progress?',
    confirm_reset_msg:'Check-ins, words, mistakes, achievements will be cleared. Cannot undo.',
    confirm_reset_cancel:'Cancel', confirm_reset_ok:'Reset',
    name_prompt:"What's your kid's name? ✏️", name_updated:'Name updated',
    imgmode_switched:function(n){return 'Switched: '+n;},
    sound_on:'Sound on', sound_off:'Muted',
    no_voices:'No voices available',
    voice_picker_title:'Choose Voice', voice_picker_close:'Close',
    voice_auto_label:'Auto', voice_auto_sub:'System recommended',
    welcome:"Hi! Welcome to Tiger's English 🎉",
    welcome_back:'Welcome back!',
    welcome_back_streak:function(n){return n+'-day streak!';},
    just_this:'This one!',
    streak_3:'×3 streak! Go!', streak_5:'×5 streak! Amazing!', streak_8:'×8! On fire!',
    keep_it_up:'Keep it up!',
    cat_names:{ Animals:'Animals', Vehicles:'Vehicles', Furniture:'Furniture', Food:'Food', Colors:'Colors', Shapes:'Shapes', Clothes:'Clothes', Home:'Home', Nature:'Nature', Body:'Body', Numbers:'Numbers', Time:'Time', Family:'Family', School:'School', Toys:'Toys', Feelings:'Feelings', Weather:'Weather', Places:'Places', Actions:'Actions', Adjectives:'Adjectives', Jobs:'Jobs', Prepositions:'Prepositions', Questions:'Questions' },
    companion_msgs:[
      'Go Tiger! You can do it!',
      "Tiger is so smart today!",
      'Keep going, you are amazing!',
      'Tuantuan believes in you!',
      'One word at a time!',
      'Mistakes help us learn!',
      'Let me hear it again? 🔊',
      "You're doing great, Tiger!",
      'Woof! Take a break 🐾',
      'Every word makes you stronger!',
      'Tap me anytime for a hi!'
    ],
    ach:{
      first_game:['First Step','Finish your first game'],
      streak_3a:['Hot Streak','Get 3 right in a row'],
      streak_5a:['On Fire!','Get 5 right in a row'],
      streak_10a:['Unstoppable','Get 10 right in a row'],
      checkin_3:['3-Day Habit','Check in 3 days in a row'],
      checkin_7:['One Week!','Check in 7 days in a row'],
      checkin_30:['Iron Will','Check in 30 days in a row'],
      words_50:['Word Sprout','Learn 50 words'],
      words_200:['Word Tree','Learn 200 words'],
      games_10:['Dedicated Learner','Finish 10 games'],
      master_first:['First Mastery','Master any category']
    },
    ach_unlocked:'Achievement: ',
    weekday:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    date_fmt:function(m,d,wd){var mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return mn[m-1]+' '+d+' · '+wd;}
  }
};

function t(key){
  var args = Array.prototype.slice.call(arguments, 1);
  var lang = (STATE && STATE.settings && STATE.settings.lang) || 'zh';
  var dict = I18N[lang] || I18N.zh;
  var v = dict[key];
  if(v === undefined && lang!=='zh') v = I18N.zh[key];
  if(typeof v === 'function') return v.apply(null, args);
  return v == null ? key : v;
}

/* Apply current language to all DOM elements with data-i18n / data-i18n-html */
function applyLanguage(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var k = el.getAttribute('data-i18n');
    var v = t(k);
    if(typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){
    var k = el.getAttribute('data-i18n-html');
    var v = t(k);
    if(typeof v === 'string') el.innerHTML = v;
  });
  // dir / html lang
  document.documentElement.lang = (STATE.settings.lang==='en')?'en':'zh-CN';
  // re-render dynamic screens
  if(document.body){
    var s = document.body.dataset.screen;
    if(s==='home') refreshHome();
    if(s==='play') renderPlayScreen();
    if(s==='wordbook') renderWordbook();
    if(s==='mistakes') renderMistakes();
    if(s==='me') renderMe();
  }
}

function setLanguage(lang){
  if(lang!=='zh' && lang!=='en') lang='zh';
  STATE.settings.lang = lang;
  saveState();
  applyLanguage();
}
