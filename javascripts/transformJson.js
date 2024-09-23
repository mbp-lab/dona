const uuid = require('uuid/v4');

function transformJson(messages_deIdentifiedJsonContents, deIdentifiedPosts, deIdentifiedGroupPosts, deIdentifiedComments, deIdentifiedGroupComments, deIdentifiedReactions, donorId, dataSource) {

    // ToDo: also transform post, comment, reaction stuff

    const posts = deIdentifiedPosts.map((post) => generatePost(post, dataSource))
    const groupPosts = deIdentifiedGroupPosts.map((groupPost) => generateGroupPost(groupPost, dataSource))
    const comments = deIdentifiedComments.map((comment) => generateComment(comment, dataSource))
    const groupComments = deIdentifiedGroupComments.map((groupComment) => generateGroupComment(groupComment, dataSource))
    const reactions = deIdentifiedReactions.map((reaction) => generateReaction(reaction, dataSource))


    const conversations = messages_deIdentifiedJsonContents.map((jsonContent) => generateConversation(jsonContent, dataSource));
    return Promise.all(conversations).then((res) => {
        const transformedJson = {
            'donor_id': donorId,
            'result': res,
            'posts': posts,
            "group_posts": groupPosts,
            "comments": comments,
            "group_comments": groupComments,
            "reactions": reactions
        };
        return transformedJson;
    });
};

function generateConversation (jsonContent, dataSource) {
    var conversation = {}
    if (dataSource === "Facebook") {
        conversation["selected"] = jsonContent.selected
    } else if (dataSource === "Instagram") {
        conversation["selected"] = jsonContent.selected
    } else if (dataSource === "WhatsApp") {
        conversation["selected"] = true
    }

    conversation["conversation_id"] = uuid();
    conversation["is_group_conversation"] = translateIfGroupConversation(jsonContent["participants"]);
    conversation["participants"] = transformParticipants(jsonContent["participants"]);

    //let allPromises = jsonContent["messages"].map(m => m.length_seconds)
    //console.log("allPromises:", allPromises)

    let transformedMessages = transformMessages(jsonContent["messages"])
    conversation["messages"] =  transformedMessages.transformedMessages
    conversation["messages_audio"] = transformedMessages.transformedMessagesAudio
    conversation["donation_data_source_type"] = dataSource;

    return {conversation: conversation, earliestDate: transformedMessages.earliestDate, latestDate: transformedMessages.latestDate};
};

function translateIfGroupConversation(participants) {
    if (participants.length <= 2) {
        return false
    } else {
        return true
    }
};

function transformParticipants(participants) {
    var transformedParticipants = [];
    participants.forEach(participantObject => {
        transformedParticipants.push(participantObject.name);
    });
    return transformedParticipants;
};

function transformMessages(messages) {
    //console.log("all messages:", messages)
    let earliestDate = messages[0].timestamp_ms
    let latestDate = messages[0].timestamp_ms
    var transformedMessages = [];
    let transformedMessagesAudio = []

    messages.forEach(message => {
        if (message.timestamp_ms > latestDate) {
            latestDate = message.timestamp_ms
        } else if (message.timestamp_ms < earliestDate) {
            earliestDate = message.timestamp_ms
        }
        let messageObject;
        if (message.isVoiceMessage) {
            messageObject = {
                'sender': message.sender_name,
                'timestamp_ms': message.timestamp_ms,
                'length_seconds': message["length_seconds"]
            };
            transformedMessagesAudio.push(messageObject);

        } else {
            messageObject = {
                'sender': message.sender_name,
                'timestamp_ms': message.timestamp_ms,
                'word_count': message.word_count
            };
            transformedMessages.push(messageObject);
        }


    });
    return {transformedMessages, transformedMessagesAudio, earliestDate, latestDate};
};

function generatePost(post, dataSource) {
    post["post_id"] = uuid();
    post["donation_data_source_type"] = dataSource;
    post["timestamp_ms"] = post.timestamp * 1000
    delete post.timestamp
    return post
}

function generateGroupPost(post, dataSource) {
    post["group_post_id"] = uuid();
    post["donation_data_source_type"] = dataSource;
    post["timestamp_ms"] = post.timestamp * 1000
    delete post.timestamp
    return post
}

function generateComment(comment, dataSource) {
    comment["comment_id"] = uuid();
    comment["donation_data_source_type"] = dataSource;
    comment["timestamp_ms"] = comment.timestamp * 1000
    delete comment.timestamp
    return comment
}

function generateGroupComment(comment, dataSource) {
    comment["group_comment_id"] = uuid();
    comment["donation_data_source_type"] = dataSource;
    comment["timestamp_ms"] = comment.timestamp * 1000
    delete comment.timestamp
    return comment
}

function generateReaction(reaction, dataSource) {
    reaction["reaction_id"] = uuid();
    reaction["donation_data_source_type"] = dataSource;
    reaction["timestamp_ms"] = reaction.timestamp * 1000
    delete reaction.timestamp
    return reaction
}

module.exports = transformJson;