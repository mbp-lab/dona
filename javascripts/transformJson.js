const uuid = require('uuid/v4');

function transformJson(deIdentifiedJsonContents, donorId, dataSource) {

    const conversations = deIdentifiedJsonContents.map((jsonContent) => generateConversation(jsonContent, dataSource));
    return Promise.all(conversations).then((res) => {
        const transformedJson = {
            'donor_id': donorId,
            'result': res,
        };
        return transformedJson;
    });
};

function generateConversation (jsonContent, dataSource) {
    var conversation = {}
    conversation["conversation_id"] = uuid();
    conversation["is_group_conversation"] = translateIfGroupConversation(jsonContent["thread_type"]);
    conversation["participants"] = transformParticipants(jsonContent["participants"]);
    let transformedMessages = transformMessages(jsonContent["messages"])
    conversation["messages"] =  transformedMessages.transformedMessages;
    conversation["donation_data_source_type"] = dataSource;
    return {conversation: conversation, earliestDate: transformedMessages.earliestDate, latestDate: transformedMessages.latestDate};
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
    let earliestDate = messages[0].timestamp_ms
    let latestDate = messages[0].timestamp_ms
    var transformedMessages = [];
    messages.forEach(message => {
        if (message.timestamp_ms > latestDate) {
            latestDate = message.timestamp_ms
        } else if (message.timestamp_ms < earliestDate) {
            earliestDate = message.timestamp_ms
        }
        const messageObject = {
            'sender': message.sender_name,
            'timestamp_ms': message.timestamp_ms,
            'word_count': message.word_count
        };
        transformedMessages.push(messageObject);
    });
    return {transformedMessages, earliestDate, latestDate};
};

module.exports = transformJson;