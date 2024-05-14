var validateMessage = require('./validateMessage');
var wordCount = require('../../stringWordCount')
const isVoiceMessage = require("./isVoiceMessage");
const musicMetadata = require('music-metadata-browser');
const {json} = require("mocha/lib/reporters");
const zip = require("@zip.js/zip.js");

async function deIdentify(donorName, textListPromise, postListPromise, commentListPromise, reactionListPromise, groupPostListPromise, groupCommentListPromise,  allEntries) {

    const i18n = $("#i18n-support");
    let participantNameToRandomIds = {};
    let i = 1;
    participantNameToRandomIds[donorName] = i18n.data("donor");
    let messages_deIdentifiedJsonContents = [];

    // decode function from stackoverflow
    // this is just so that names are shown using the correct symbols
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

    let textList = await textListPromise
    let postList = await postListPromise
    let commentList = await commentListPromise
    let reactionList = await reactionListPromise
    let groupPostList = await groupPostListPromise
    let groupCommentList = await groupCommentListPromise

    let messages_jsonContents = {}

    // dealing with textList (for messages)
    textList.forEach((textContent) => {
        let jsonContent = JSON.parse(textContent);
        if (messages_jsonContents[jsonContent.thread_path] != undefined) {
            messages_jsonContents[jsonContent.thread_path].messages = messages_jsonContents[jsonContent.thread_path].messages.concat(jsonContent.messages)
        } else {
            messages_jsonContents[jsonContent.thread_path] = jsonContent
        }
    })
    let messages_deIdentifiedJsonContentsHelper = await Promise.all(Object.values(messages_jsonContents).map(async jsonContent => {
        return processMessages(jsonContent, getDeIdentifiedId, allEntries)
    }))
    messages_deIdentifiedJsonContents = messages_deIdentifiedJsonContentsHelper.filter(Boolean);

    // toDo: this works for FACEBOOK - next up: INSTAGRAM
    let deIdentifiedPosts = processPosts(postList)
    console.log(deIdentifiedPosts)

    let deIdentifiedGroupPosts = processGroupPosts(groupPostList)
    console.log(deIdentifiedGroupPosts)

    let deIdentifiedComments = processComments(commentList)
    console.log(deIdentifiedComments)

    let deIdentifiedGroupComments = processGroupComments(groupCommentList)
    console.log(deIdentifiedGroupComments)

    let deIdentifiedReactions = processReactions(reactionList)
    console.log(deIdentifiedReactions)

    // find seven chats with highest wordcount - so only they will be displayed for friendsmapping
    // TODO: seven should be in some config file
    let allWordCounts = messages_deIdentifiedJsonContents.map((conv, index) => {
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

        // add a selected: true to the messages_deIdentifiedJsonContents conversation if it is preselected and a selected: false otherwise
        let index = obj.deIdentifiedJsonContentsIndex
        messages_deIdentifiedJsonContents[index]["selected"] = true
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
        messages_deIdentifiedJsonContents: messages_deIdentifiedJsonContents,
        deIdentifiedPosts, deIdentifiedGroupPosts, deIdentifiedComments, deIdentifiedGroupComments, deIdentifiedReactions,
        participantNameToRandomIds: filteredParticipantNameToRandomIds,
        allParticipantsNamesToRandomIds: participantNameToRandomIds,
        chatsToShowMappingParticipants: chatsToShowFeedbackFor.map(chat => chat.participants),
        chatsToShowMapping: chatsToShowFeedbackFor,
        allWordCounts: allWordCounts
    }

    return result;
};

module.exports = deIdentify


async function processMessages(jsonContent, getDeIdentifiedId, allEntries) {
    delete jsonContent.thread_path;
    delete jsonContent.title;
    delete jsonContent.is_still_participant;
    jsonContent.participants.forEach((participant) => {
        participant.name = getDeIdentifiedId(participant.name);
    });
    let messagePromises = jsonContent.messages.map(async (message, i_1) => {
        message.isVoiceMessage = false
        if (isVoiceMessage(message)) {
            message.isVoiceMessage = true
            //message.length_seconds = 0
            // find the entry for the voice message
            let voiceMessage = allEntries.find(entry => entry.filename == message.audio_files[0].uri)

            if (voiceMessage !== undefined) {
                // now read and get metadata

                try {
                    const blobWriter = new zip.BlobWriter();
                    let blob = await voiceMessage.getData(blobWriter)
                    let metadata = await musicMetadata.parseBlob(blob)

                    // metadata has all the metadata found in the blob or file
                    message.sender_name = getDeIdentifiedId(message.sender_name);

                    message.length_seconds =  parseInt(metadata.format.duration);

                    delete message.content;
                    delete message.type;
                    if (message.users)
                        delete message.users;
                    delete message.audio_files
                } catch (e) {
                    // some voice messages aren't stored -> still count them
                    message.sender_name = getDeIdentifiedId(message.sender_name);
                    message.length_seconds = -2;
                    delete message.content;
                    delete message.type;
                    if (message.users)
                        delete message.users;
                    delete message.audio_files
                }

            } else {
                // some voice messages aren't stored -> still count them
                message.sender_name = getDeIdentifiedId(message.sender_name);
                message.length_seconds = -1;
                delete message.content;
                delete message.type;
                if (message.users)
                    delete message.users;
                delete message.audio_files
            }
        }
        else if (validateMessage(message)) {
            message.sender_name = getDeIdentifiedId(message.sender_name);
            message.word_count = wordCount(message.content);
            delete message.content;
            delete message.type;
            if (message.users)
                delete message.users;
        }
        else {
            return null;
        }

        return message
    });

    let resolvedMessages = await Promise.all(messagePromises)

    // Filter out any null values
    jsonContent.messages = resolvedMessages.filter(Boolean);
    // add selected property
    jsonContent.selected = false
    if (jsonContent.messages.length > 0)
        //deIdentifiedJsonContents.push(jsonContent);
        return jsonContent
    else
        return null
}

// delivers the processed posts data
// per post that is: timestamp, number of media elements, number of words of text
function processPosts(postList) {
    let result = []
    postList.forEach((elem) => {
        let jsonContent = JSON.parse(elem);
        jsonContent.forEach((post) => {
            if (post.data[0]?.post) {
                post.word_count = wordCount(post.data[0]?.post)
            } else {
                post.word_count = 0
            }

            if (post.attachments) {
                post.media_count = post.attachments.length
            } else {
                post.media_count = 0
            }

            delete post.title
            delete post.attachments
            delete post.data
            delete post.tags

            result.push(post)
        })
    })

    return result
}

// delivers the processed groupPosts data
// per post that is: timestamp, number of media elements, number of words of text
function processGroupPosts(postList) {
    let result = []
    postList.forEach((elem) => {
        let jsonContent = JSON.parse(elem);
        // first get all entries that are actually about group posts
        // also do it this way, because there are group_posts_v2 (v1 then probably also exists...)
        let availableKeys = Object.keys(jsonContent)
        let relevantKeys = []
        availableKeys.forEach(key => {
            if(key.includes("post")) {
                relevantKeys.push(key)
            }
        })

        relevantKeys.forEach((key) => {
            jsonContent[key].forEach(post => {
                if (post.data && post.data[0]?.post) {
                    post.word_count = wordCount(post.data[0]?.post)
                } else {
                    post.word_count = 0
                }

                if (post.attachments) {
                    post.media_count = post.attachments.length
                } else {
                    post.media_count = 0
                }

                delete post.title
                delete post.attachments
                delete post.data
                delete post.tags

                result.push(post)
            })
        })

    })
    return result
}

// delivers the processed comments data
// per comment that is: timestamp, number of words of text, number of media elements
function processComments(commentList) {
    let result = []
    commentList.forEach((elem) => {
        let jsonContent = JSON.parse(elem);
        // first get all entries that are actually about group posts
        // also do it this way, because there are comments_v2 (v1 then probably also exists...)
        let availableKeys = Object.keys(jsonContent)
        let relevantKeys = []
        availableKeys.forEach(key => {
            if(key.includes("comment")) {
                relevantKeys.push(key)
            }
        })

        relevantKeys.forEach((key) => {
            jsonContent[key].forEach(comment => {
                if (comment.data && comment.data[0]?.comment) {
                    comment.word_count = wordCount(comment.data[0]?.comment.comment)
                } else {
                    comment.word_count = 0
                }

                if (comment.attachments) {
                    comment.media_count = comment.attachments.length
                } else {
                    comment.media_count = 0
                }

                delete comment.attachments
                delete comment.title
                delete comment.data
               result.push(comment)
            })
        })

    })
    return result
}


// delivers the processed group comments data
// per comment that is: timestamp, number of words of text, number of media elements
function processGroupComments(commentList) {
    let result = []
    commentList.forEach((elem) => {
        let jsonContent = JSON.parse(elem);
        // first get all entries that are actually about group posts
        // also do it this way, because there are comments_v2 (v1 then probably also exists...)
        let availableKeys = Object.keys(jsonContent)
        let relevantKeys = []
        availableKeys.forEach(key => {
            if(key.includes("comment")) {
                relevantKeys.push(key)
            }
        })

        relevantKeys.forEach((key) => {
            jsonContent[key].forEach(comment => {
                if (comment.data && comment.data[0]?.comment) {
                    comment.word_count = wordCount(comment.data[0]?.comment.comment)
                } else {
                    comment.word_count = 0
                }

                if (comment.attachments) {
                    comment.media_count = comment.attachments.length
                } else {
                    comment.media_count = 0
                }

                delete comment.attachments
                delete comment.title
                delete comment.data
                result.push(comment)
            })
        })

    })
    return result
}


// delivers the processed reactions data
// per reaction that is: timestamp, type
function processReactions(reactionList) {
    let result = []
    reactionList.forEach((elem) => {
        let jsonContent = JSON.parse(elem);
        jsonContent.forEach((reaction) => {
            if (reaction.data && reaction.data[0]?.reaction?.reaction) {
                reaction.type = reaction.data[0]?.reaction?.reaction
            } else {
                reaction.type = "unknown"
            }

            delete reaction.data
            delete reaction.title

            result.push(reaction)
        })
    })
    return result
}