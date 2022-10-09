var validateMessage = require('./validateMessage');
var wordCount = require('../../stringWordCount')

async function deIdentify(zipFiles, messagesRelativePath, donorName) {
    const i18n = $("#i18n-support");
    let participantNameToRandomIds = {};
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

    // find seven chats with highest wordcount - so only they will be displayed for friendsmapping
    // TODO: seven should be in some config file
    let allWordCounts = deIdentifiedJsonContents.map(conv => {
        return {
            participants: conv.participants,
            wordCount: conv.messages.reduce((pv, cv) => pv + cv.word_count, 0)
        };
    })

    let chatsWithHighestWordCount = allWordCounts.sort((a, b) => b.wordCount - a.wordCount).slice(0, 7)
    let participantsToShow = []
    chatsWithHighestWordCount.forEach(obj => {
        obj.participants.forEach(p => participantsToShow.push(p.name))
    })
    // get unique participants of those chats with the highest word counts
    participantsToShow = [... new Set(participantsToShow)]

    // create new mapping object for display on the anonymization page
    let filteredParticipantNameToRandomIds = {}
    participantsToShow.forEach(p => {
        let key = Object.keys(participantNameToRandomIds).find(key => participantNameToRandomIds[key] === p);
        filteredParticipantNameToRandomIds[key] = p
    })

    let result = {
        deIdentifiedJsonContents: deIdentifiedJsonContents,
        participantNameToRandomIds: filteredParticipantNameToRandomIds
    }

    return result;
};

module.exports = deIdentify