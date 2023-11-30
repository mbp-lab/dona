var validateMessage = require('./validateMessage');
var wordCount = require('../../stringWordCount')

async function deIdentify(zipFiles, messagesRelativePath, donorName, textListPromise) {
    //console.log("deIdentify:", zipFiles)
    //console.log("messagesRelativePath:", messagesRelativePath)
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
    //const zipFileTexts = messagesRelativePath.map(path => zipFiles[path].async('text'));

    // Promise<Array<Object>>
    //const textList = await Promise.all(zipFileTexts);

    const textList = await textListPromise
    let jsonContents = {}

    // ToDo: combine messages from textLists from different zipfiles if they are from the same chat
    textList.forEach(textContent => {
        let jsonContent = JSON.parse(textContent);
        if (jsonContents[jsonContent.thread_path] != undefined) {
            jsonContents[jsonContent.thread_path].messages = jsonContents[jsonContent.thread_path].messages.concat(jsonContent.messages)
        } else {
            jsonContents[jsonContent.thread_path] = jsonContent
        }
    })

    //console.log("jsonContents old:", jsonContents)

    /*
    let textListNew = await textListTest
    let jsonContentsTest = {}
    textListNew.forEach(textContent => {
        let jsonContent = JSON.parse(textContent);
        if (jsonContentsTest[jsonContent.thread_path] != undefined) {
            jsonContentsTest[jsonContent.thread_path].messages = jsonContentsTest[jsonContent.thread_path].messages.concat(jsonContent.messages)
        } else {
            jsonContentsTest[jsonContent.thread_path] = jsonContent
        }
    })

    console.log("jsonContents new:", jsonContentsTest)

     */

    Object.values(jsonContents).forEach(jsonContent => {
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
        // add selected property
        jsonContent.selected = false
        if (jsonContent.messages.length > 0)
            deIdentifiedJsonContents.push(jsonContent);
    });


    // find seven chats with highest wordcount - so only they will be displayed for friendsmapping
    // TODO: seven should be in some config file
    let allWordCounts = deIdentifiedJsonContents.map((conv, index) => {
        return {
            deIdentifiedJsonContentsIndex: index,
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

        // add a selected: true to the deIdentifiedJsonContents conversation if it is preselected and a selected: false otherwise
        let index = obj.deIdentifiedJsonContentsIndex
        deIdentifiedJsonContents[index]["selected"] = true
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
        allParticipantsNamesToRandomIds: participantNameToRandomIds,
        chatsToShowMappingParticipants: chatsToShowFeedbackFor.map(chat => chat.participants),
        chatsToShowMapping: chatsToShowFeedbackFor,
        allWordCounts: allWordCounts
    }

    return result;
};

module.exports = deIdentify