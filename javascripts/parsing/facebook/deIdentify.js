var validateMessage = require('./validateMessage');
var wordCount = require('../../stringWordCount')

async function deIdentify(zipFiles, messagesRelativePath, donorName) {
    const i18n = $("#i18n-support");
    const participantNameToRandomIds = {};
    let i = 1;
    participantNameToRandomIds[donorName] = i18n.data("donor");
    const deIdentifiedJsonContents = [];

    function getDeIdentifiedId(name) {
        if (!(name in participantNameToRandomIds)) {
            var friendLabel = i18n.data("friend");
            if(!friendLabel) {
                friendLabel = "friend"
            }
            participantNameToRandomIds[name] = friendLabel + i;
            i++;
        }
        return participantNameToRandomIds[name];
    }

    // Array<Promise<String>>
    const zipFileTexts = messagesRelativePath.map(path => zipFiles[path].async('text'));

    // Promise<Array<Object>>
    const textList = await Promise.all(zipFileTexts);
    textList.forEach(textContent => {
        const jsonContent = JSON.parse(textContent);
        delete jsonContent.thread_path;
        delete jsonContent.title;
        delete jsonContent.is_still_participant;
        jsonContent.participants.forEach((participant) => {
            participant.name = getDeIdentifiedId(participant.name);
        });
        jsonContent.messages.forEach((message, i_1) => {
            if (validateMessage(message)) {
                message.sender_name = getDeIdentifiedId(message.sender_name);
                message.word_count = wordCount(message.content);
                delete message.content;
                delete message.type;
                if (message.users)
                    delete message.users;
            }
            else {
                delete jsonContent.messages[i_1];
            }
        });
        jsonContent.messages = jsonContent.messages.filter(Boolean);
        if (jsonContent.messages.length > 0)
            deIdentifiedJsonContents.push(jsonContent);
    });

    // TODO: is this okay like this?

    let result = {
        deIdentifiedJsonContents: deIdentifiedJsonContents,
        participantNameToRandomIds: participantNameToRandomIds
    }

    //return deIdentifiedJsonContents;
    return result;
};

module.exports = deIdentify