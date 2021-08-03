const uuid = require('uuid/v4');

function transformJson(deIdentifiedJsonContents, donorId, dataSource) {

    const conversations = deIdentifiedJsonContents.map((jsonContent) => generateConversation(jsonContent, dataSource));
    return Promise.all(conversations).then((res) => {
        const transformedJson = {
            'donor_id': donorId,
            'conversations': res
        };
        return transformedJson;
    });
};

function generateConversation (jsonContent, dataSource) {
    var conversation = {}
    conversation["conversation_id"] = uuid();
    conversation["is_group_conversation"] = translateIfGroupConversation(jsonContent["thread_type"]);
    conversation["participants"] = transformParticipants(jsonContent["participants"]);
    conversation["messages"] =  transformMessages(jsonContent["messages"]);
    conversation["donation_data_source_type"] = dataSource;
    return conversation;
};

function translateIfGroupConversation(threadType) {
    if (threadType == "Regular") return false;
    else if (threadType == "RegularGroup") return true;
    else {
        console.log("Unsupported thread type!");
        return false;
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
    var transformedMessages = [];
    messages.forEach(message => {
        const messageObject = {
            'sender': message.sender_name,
            'timestamp_ms': message.timestamp_ms,
            'word_count': message.word_count
        };
        transformedMessages.push(messageObject);
    });
    return transformedMessages;
};

module.exports = transformJson;