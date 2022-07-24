const uuid = require('uuid/v4');
const countWords = require('../../stringWordCount');
const { makeArrayOfMessages, parseMessages } = require('./whatsappParser.js');

function whatsappTxtFilesHandler(filelist, alias) {
    const i18nSupport= $('#i18n-support'); // TODO: This file should not be allowed to access jquery
  var files = [];
  for (var i = 0; i < filelist.length; i++) {
    files.push(filelist[i]);
  };




  return new Promise((resolve, reject) => {
    const expectedNumberOfFiles = 5;
    if (alias.length < 1) {
      reject(i18nSupport.data('error-no-alias'));
    }
    else if (files.length != expectedNumberOfFiles) {
      reject(i18nSupport.data('error-not-enough-chats').replace('%s', files.length));
    } else {
      // check if all files seem to be the same
      let fileSize = files[0].size
      let allSameSize = true
      for (let i = 1; i < files.length; i++) {
        if (files[i].size !== fileSize) {
          allSameSize = false
        }
      }
      if (allSameSize) {
        reject(i18nSupport.data('error-same-files'));
      }
    }

    const parsedFiles = files.map(file => {
      return handlefile(file)
        .then(data => data.split('\n'))
        .then(makeArrayOfMessages)
        .then(messages => parseMessages(messages))
    });

    resolve(deIdentification(parsedFiles, alias));
  })

}

function handlefile(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

function deIdentification(parsedFiles, alias) {
  const participantNameToRandomIds = {};
  const deIdentifiedJsonContents = [];
  const systemMessage = "Messages to this chat and calls are now secured with end-to-end encryption.";
  let i = 1;

  return Promise.all(parsedFiles)
    .then(textList => {
      textList.forEach(lines => {
        const jsonContent = { "participants": [], "messages": [], thread_type: "Regular" };
        var eachFileParticipants = new Set();
        const i18nSupport= $('#i18n-support'); // TODO: This file should not be allowed to access jquery
        participantNameToRandomIds[alias] = i18nSupport.data('donor');
        const messages = lines.map(line => {
          if (!line.message.includes(systemMessage)) {
            const participant = getDeIdentifiedId(line.author);
            eachFileParticipants.add(participant);
            const sender_name = participant;
            const timestamps_ms = line.date;
            const wordCount = countWords(line.message);
            const message = {
              "sender_name": sender_name,
              "timestamp_ms": timestamps_ms,
              "word_count": wordCount
            };
            return message;
          }
        });
        messages.splice(messages.indexOf(undefined), 1)  //remove the system message which is now undefined
        jsonContent.messages = messages;
        const arr = Array.from(eachFileParticipants)
        const t = arr.map(participantId => {
          return {
            "name": participantId
          }
        });
        jsonContent.participants = t;
        if (jsonContent.participants.length > 2) jsonContent.thread_type = "RegularGroup";
        deIdentifiedJsonContents.push(jsonContent);
      });

      // TODO: is this okay like this? -> to display participantNameToRandomIds Mapping to user

      let result = {
        deIdentifiedJsonContents: deIdentifiedJsonContents,
        participantNameToRandomIds: participantNameToRandomIds
      }
      //deIdentifiedJsonContents.push(participantNameToRandomIds)

      return result;
    });

  function getDeIdentifiedId(name) {
    const i18nSupport= $('#i18n-support'); // TODO: This file should not be allowed to access jquery
    const systemName = i18nSupport.data("system")

    if (!(name in participantNameToRandomIds)) {
      // TODO: I (Paul) modified this to not anonymize the system, but keep calling it system
      if (name === systemName) {
        participantNameToRandomIds[name] = systemName;
      } else {
        participantNameToRandomIds[name] = i18nSupport.data("friend") + i;
        i++;
      }
    }
    return participantNameToRandomIds[name];
  }

};

module.exports = whatsappTxtFilesHandler;