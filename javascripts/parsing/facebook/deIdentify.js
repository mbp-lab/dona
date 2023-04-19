var validateMessage = require('./validateMessage');
var wordCount = require('../../stringWordCount')

async function deIdentify(zipFiles, messagesRelativePath, donorName) {
    const i18n = $("#i18n-support");
    let participantNameToRandomIds = {};
    let i = 1;
    participantNameToRandomIds[donorName] = i18n.data("donor");
    const deIdentifiedJsonContents = [];

    // decode function from stackoverflow
    function decode(s) {
        let d = new TextDecoder;
        let a = s.split('').map(r => r.charCodeAt());
        return d.decode(new Uint8Array(a));
    }

    function getDeIdentifiedId(name) {
        let decodedName = decode(name)
        if (!(decodedName in participantNameToRandomIds)) {
            var friendLabel = i18n.data("friend");
            if(!friendLabel) {
                friendLabel = "contact"
            }
            participantNameToRandomIds[decodedName] = friendLabel + i;
            i++;
        }
        return participantNameToRandomIds[decodedName];
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
            wordCount: conv.messages.reduce((pv, cv) => pv + cv.word_count, 0),
            wordCountDonor: conv.messages.reduce((pv, cv) => {
                if (cv.sender_name === i18n.data("donor")) {
                    return pv + cv.word_count
                } else {
                    return pv
                }
            }, 0)
        };
    })

    // filter out those conversations where the donors participation is below a threshold
    // if it is a group chat: threshold = donorWordCount/(totalWordCount/noOfParticipants)
    // otherwise the donors participation must be between 0.1 and 0.9
    let filteredWordCounts = allWordCounts.filter((wordCountObj) => {
        if (wordCountObj.wordCountDonor === 0) {
            return false
        } else if (wordCountObj.participants.length <= 2) {
            // in this case its not a group chat
            let valueToCompare = wordCountObj.wordCountDonor/wordCountObj.wordCount
            if (valueToCompare <= 0.1 || valueToCompare >= 0.9) {
                return false
            } else {
                return true
            }
        } else {
            // in this case it is a group chat
            let valueToCompare = wordCountObj.wordCountDonor/(wordCountObj.wordCount/wordCountObj.participants.length)
            if (valueToCompare <= 0.1 || valueToCompare >= 0.9) {
                return false
            } else {
                return true
            }
        }
    })

    // get 7 most relevant chats to show feedback for
    let chatsToShowFeedbackFor = []
    if (filteredWordCounts.length < 7) {
        chatsToShowFeedbackFor = allWordCounts.sort((a, b) => b.wordCount - a.wordCount).slice(0, 7)
    } else {
        chatsToShowFeedbackFor = filteredWordCounts.sort((a, b) => b.wordCount - a.wordCount).slice(0, 7)
    }


    let participantsToShow = []
    chatsToShowFeedbackFor.forEach(obj => {
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
        participantNameToRandomIds: filteredParticipantNameToRandomIds,
        chatsToShowMapping: chatsToShowFeedbackFor.map(chat => chat.participants)
    }

    return result;
};

module.exports = deIdentify