function doPost(e){
  var estringa = JSON.parse(e.postData.contents);
  var payload = identificar(estringa);
  if (payload) {
    var data = {
      "method": "post",
      "payload": payload
    }
    UrlFetchApp.fetch("https://api.telegram.org/bot<bot-token>/", data);
  }
}

function identificar(e){
  var folder = DriveApp.getFolderById('1AVWGzwEFJTkup13-Dr9fBSdsgwdXH3q2');
  var filename = GetMD5Hash(e.message.chat.id.toString());
  var file = folder.getFilesByName(filename);
  var menu_string = "";
  if (!file.hasNext()) {
    file = folder.createFile(filename,"");
    menu_string = file.getBlob().getDataAsString();
  }
  else {
    file = file.next();
    menu_string = file.getBlob().getDataAsString();
  }
  if (e.message.text){
    var mensaje = {
      "method": "sendMessage",
      "chat_id": e.message.chat.id.toString(),
      "text": TextProcess(file, menu_string, e.message.text),
    }
  }
  else if (e.message.sticker){
    var mensaje = {
      "method": "sendSticker",
      "chat_id": e.message.chat.id.toString(),
      "sticker": e.message.sticker.file_id
    }
   }
  else if (e.message.photo){
    var array = e.message.photo;
    var text = array[1];
    var mensaje = {
      "method": "sendPhoto",
      "chat_id": e.message.chat.id.toString(),
      "photo": text.file_id
    }
   }
  else if (e.message.new_chat_member){
    var mensaje = {
      "method": "sendMessage",
      "chat_id": e.message.chat.id.toString(),
      "text": "欢迎 " + getMentionName(e.message.new_chat_member) + " 加入本群~！使用 /list 来看看有什么好吃的呀~🤗",
      "parse_mode": "Markdown",
      "disable_web_page_preview": true,
    }
  }
  else {
    var mensaje = {}
  }
  return mensaje
}