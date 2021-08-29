function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getUniqueRandoms(min, max, cnt) {
  var res = [];
  if (max - min + 1 == cnt) {
    for (var i = min; i <= max; i++) res.push(i);
  }
  else if ((max - min + 1)/2 >= cnt) {
    while(res.length < cnt) {
      var random = randomInteger(min, max);
      if (!res.includes(random)) res.push(random);
    }
  }
  else {
    var tmp = [];
    while(tmp.length < max - min + 1 - cnt) {
      var random = randomInteger(min, max);
      if (!tmp.includes(random)) tmp.push(random);
    }
    for (var i = min; i <= max; i++)
      if (!tmp.includes(i)) res.push(i);
  }
  return res;
}

function GetMD5Hash(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input);
  var txtHash = '';

  for (j = 0; j <rawHash.length; j++) {
    var hashVal = rawHash[j];
    if (hashVal < 0)
      hashVal += 256; 
    if (hashVal.toString(16).length == 1)
      txtHash += "0";
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function getFolder(){
  return DriveApp.getFolderById('1AVWGzwEFJTkup13-Dr9fBSdsgwdXH3q2');
}

function getFileList(folder) {
  var files = folder.getFiles();
  var fileids = [];
  while (files.hasNext()) {
    fileids.push(files.next().getId());
  }
  return fileids;
}

function getName(user) {
  var name = user.first_name;
  if (user.last_name) {
    name += " " + user.last_name;
  }
  return name;
}

function escapeMarkDown(toEscapeMsg) {
  var escapedMsg = toEscapeMsg
  .replace(/_/g, "\\_")
  .replace(/\*/g, "\\*")
  .replace(/\[/g, "\\[")
  .replace(/`/g, "\\`");
  
  return escapedMsg;
}

function getMarkDownUserUrl(userName, userId) {
  return "[" + userName + "](tg://user?id=" + userId + ")";
}

function getMentionName(user) {
  var mentionName = "";
 
  var name = getName(user);
  if (!name) {
    name = "***";
  }
  mentionName = getMarkDownUserUrl(escapeMarkDown(name), user.id);

  return mentionName;
}

function splitFileContent(menu_string) {
  var menu = menu_string.split('\n'); menu.pop();
  var chat_id = menu.splice(0,1);
  return [chat_id, menu, menu.length];
}

function getInlineKeyboardMarkup(settings) {
  var daliy = settings.getRange(daliy_pos).getValue();
  var lang = settings.getRange(lang_pos).getValue();
  if (lang == 'Zh') var key = "关闭每日推荐";
  else var key = 'Close everyday recommendation'
  if (daliy.toString() == '0') {
    if (lang == 'Zh') key = "开启每日推荐";
    else key = 'Open everyday recommendation';
  }
  if (lang == 'Zh') lang = 'En';
  else lang = 'Zh';
  return {
    "inline_keyboard": [
      [
        {
          text: key,
          callback_data: "daliy"
        }      
      ],
      [
        {
          text: lang,
          callback_data: "language"
        }
      ]
    ]
  };
}

function CallbackProcess(file, data, mensaje) {
  var settings = file.getSheetByName('settings');
  if (data.indexOf("daliy") === 0) {
    var cell = settings.getRange(daliy_pos);
    var stext = "<< 返回设置";
    if (cell.getValue().toString() != '0') {
      cell.setValue(0);
      if (settings.getRange(lang_pos).getValue() == 'Zh') mensaje.text = "每日推荐已关闭🥚";
      else {
        mensaje.text = "Everyday recommendation is closed🥚";
        stext = "<< Back to settings";
      }
    }
    else {
      cell.setValue(1);
      if (settings.getRange(lang_pos).getValue() == 'Zh') mensaje.text = "每日推荐开启成功🐣";
      else {
        mensaje.text = "Everyday recommendation is opened🐣";
        stext = "<< Back to settings";
      }
    }
    mensaje.reply_markup = JSON.stringify({"inline_keyboard": [[{text: stext, callback_data: "/settings"}]]});
  }
  else if (data.indexOf("language") === 0) {
    var cell = settings.getRange(lang_pos);
    if (cell.getValue() == 'Zh') {
      cell.setValue('En');
      mensaje.text = "Customize Chickeat in this chat 🐣";
    }
    else {
      cell.setValue('Zh');
      mensaje.text = "设置当前会话的 Chickeat 🐣";
    }
    mensaje.reply_markup = JSON.stringify(getInlineKeyboardMarkup(settings));
  }
  else if (data.indexOf("/settings") === 0) {
    mensaje = TextProcess(file, data, mensaje);
  }
  return mensaje;
}

function TextProcess(file, text, mensaje) {
  var menu_sheet = file.getSheetByName('menu');
  var settings = file.getSheetByName('settings');
  var lang = settings.getRange(lang_pos).getValue();
  var len = menu_sheet.getLastRow();
  var paras = text.trim().split(' ');
  var msg = "";
  if (text.indexOf('/random') === 0) {
    if (paras[1])
    {
      if (paras[1] > len) {
        if (lang == 'Zh') msg = "想什么啦！😡菜单里根本没那么多菜！"
        else msg = "There aren't so many dishes on the menu! :(";
      }
      else if (paras[1] == 1)
      {
        var random = randomInteger(1, len);
        if (lang == 'Zh') msg = "尝尝 " + menu_sheet.getRange(random, 1).getValue() + " 怎么样？";
        else msg = "How about " + menu_sheet.getRange(random, 1).getValue() + " ?";
      }
      else if (paras[1] <= 15) {
        var chosen = getUniqueRandoms(1, len, paras[1]);
        if (lang == 'Zh') var msg = "看看这些怎么样🐥：\n";
        else var msg = "How about these🐥: \n";
        for (var j = 0; j < chosen.length; j++) chosen[j] = 'A' + chosen[j];
        var ranges = menu_sheet.getRangeList(chosen).getRanges();
        for (var j = 0; j < chosen.length; j++) msg += ranges[j].getValue() + '\n';
      }
      else {
        var chosen = getUniqueRandoms(1, len, 15);
        if (lang == 'Zh') var msg = "看看这些怎么样🐥：\n";
        else var msg = "How about these🐥: \n";
        for (var j = 0; j < chosen.length; j++) chosen[j] = 'A' + chosen[j];
        var ranges = menu_sheet.getRangeList(chosen).getRanges();
        for (var j = 0; j < chosen.length; j++) msg += ranges[j].getValue() + '\n';
        if (lang == 'Zh') msg += "......\n你真的吃得完这么多么？👀"
        else msg += "......\nI don't believe you can eat all of these.👀"
      }
    }
    else{
      if (len == 0) {
        if (lang == 'Zh') msg = "什么都没有怎么随机啦！>_<";
        else msg = "There is nothing on the menu. >_<"
      }
      else
      {
        var random = randomInteger(1, len);
        if (lang == 'Zh') msg = "尝尝 " + menu_sheet.getRange(random, 1).getValue() + " 怎么样？\n\n还可以一次随机多个菜品嗷 => /random[@random_eat_bot] [number=1]";
        else msg = "How about " + menu_sheet.getRange(random, 1).getValue() + " ?\n\nYou can also random two or more dishes at one time => /random[@random_eat_bot] [number=1]";
      }
    }
  }
  else if (text.indexOf('/list') === 0) {     
    if (len == 0) {
      if (lang == 'Zh') msg = "现在没有什么想法诶…(ŏωŏ)";
      else msg = "There is nothing on the menu :("
    }
    else if (len == 1) {
      if (lang == 'Zh') msg = "只能吃" + menu_sheet.getRange('A1').getValue() + "了 (╥ω╥)";
      else msg = "You can only eat " + menu_sheet.getRange('A1').getValue() + " (╥ω╥)";
    }
    else if (len <= 5) {
      var menu = menu_sheet.getRange(1, 1, len).getValues();
      if (lang == 'Zh') msg = "当前菜单较为简陋，只剩下" + menu[0][0];
      else msg = "There aren't so many dishes. Only " + menu[0][0];
      for (var i = 1; i < len - 1; i++) {
        if (lang == 'Zh') msg += "、" + menu[i][0];
        else msg += ", " + menu[i][0];
      }
      if (lang == 'Zh') msg += "和" + menu[len - 1][0] + "了 :(";
      else msg += "and " + menu[len - 1][0] + " :(";
    }
    else if (len <= 10) {
      var menu = menu_sheet.getRange(1, 1, len).getValues();
      if (lang == 'Zh') msg = "这就是全部的菜了(ΦˋωˊΦ)：\n" + menu[0][0];
      else msg = "This is all(ΦˋωˊΦ):\n" + menu[0][0];
      for (var i = 1; i < len; i++) {
        msg += '\n' + menu[i][0];
      }
    }
    else {
      var menu = menu_sheet.getRange(1, 1, len).getValues();
      if (lang == 'Zh') msg = "还有好多吃的呢~！\\(ΦωΦ ≡ ΦωΦ)/ 你看你看：\n";
      else msg = "There are so many dishes!\\(ΦωΦ ≡ ΦωΦ)/ Have a look:\n";
      for (var i = 0; i < 10; i++) {
        msg += menu[i][0] + '\n';
      }
      msg += '...';
    }
  }
  else if (text.indexOf('/add') === 0) {
    if (paras[1])
    {
      var cnt = 0;
      for (var i = 1; i < paras.length; i++) {
        eobj = paras[i].split(',');
        var cur = menu_sheet.createTextFinder(eobj[0]).findNext();
        if (cur) {
          menu_sheet.deleteRow(cur.getRow());
          menu_sheet.appendRow(eobj);
          if (lang == 'Zh') msg += eobj[0] + " 已更新~🐣\n"
          else msg += eobj[0] + " updated~🐣\n"
        }
        else {
          menu_sheet.appendRow(eobj);
          cnt += 1;
        }
      }
      if (cnt > 0) {
        if (lang == 'Zh') msg += "添加成功！菜单已更新咕！🥳";
        else msg += "Menu updated!🥳";
      }
    }
    else {
      if (lang == 'Zh') msg = "咕？所以要提议吃啥呀？🤨\n\n我能看懂的提议格式 ΦωΦ：/add[@random_eat_bot] <吃的1[,类型1]> [<吃的2[,类型2]>...]";
      else msg = "What do you want to recommend?\n\nI can only understand messages in this format: /add[@random_eat_bot] <eatable1[,type1]> [<eatable2[,type2]>...]";
    }
  }
  else if (text.indexOf('/delete') === 0) {
    if (paras[1])
    {
      var cnt = 0;
      for (var i = 1; i < paras.length; i++) {
        var cell = menu_sheet.createTextFinder(paras[i]).findNext();
        if (cell) {
          menu_sheet.deleteRow(cell.getRow());
          cnt += 1;
        }
        else {
          if (lang == 'Zh') msg += paras[i] + " 不在菜单中哦~🤪\n"
          else msg += paras[i] + " is not on the menu~🤪\n"
        }
      }
      if (cnt > 0) {
        if (lang == 'Zh') msg += "删除成功！不能吃的东西减少了~🥳";
        else msg += "Delete success!"
      }
    }
    else {
      if (lang == 'Zh') msg = "什么都没删掉( ´ΦДΦ｀)！\n\n我能看懂的删除方法 ΦωΦ：/delete[@random_eat_bot] <uneatable1> [<uneatable2>...]";
      else msg = "Delete failed( ´ΦДΦ｀)!\n\nI can only understand messages in this format: /delete[@random_eat_bot] <uneatable1> [<uneatable2>...]";
    }
  }
  else if (text.indexOf('/settings') === 0) {
    if (lang == 'Zh') msg = "设置当前会话的 Chickeat 🐣";
    else msg = "Customize Chickeat in this chat 🐣";
    mensaje.reply_markup = JSON.stringify(getInlineKeyboardMarkup(settings));
  }
  else{
      msg = text;
  }
  mensaje.text = msg;
  return mensaje;
}