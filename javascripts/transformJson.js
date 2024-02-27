const uuid = require('uuid/v4');

function transformJson(deIdentifiedJsonContents, donorId, dataSource, randomIdMappings) {
    const conversations = deIdentifiedJsonContents.map((jsonContent, index) => generateConversation(jsonContent, dataSource, randomIdMappings, index));
    return Promise.all(conversations).then((res) => {
        const transformedJson = {
            'donor_id': donorId,
            'result': res,
        };
        return transformedJson;
    });
};

function generateConversation(jsonContent, dataSource, randomIdMappings, index) {
    var conversation = {}
    var dataSourceString = ""
    if (dataSource === "Facebook") {
        conversation["selected"] = jsonContent.selected
        dataSourceString = "F";
    } else if (dataSource === "WhatsApp") {
        conversation["selected"] = true
        dataSourceString = "W";
    }

    conversation["conversation_id"] = uuid();
    conversation["is_group_conversation"] = translateIfGroupConversation(jsonContent["participants"]);
    conversation["participants"] = transformParticipants(jsonContent["participants"]);
    let transformedMessages = transformMessages(jsonContent["messages"])
    conversation["messages"] = transformedMessages.transformedMessages;
    conversation["donation_data_source_type"] = dataSource;
    conversation["conversation_pseudonym"] = "Chat" + " " + dataSourceString + (index + 1);
    return { conversation: conversation, earliestDate: transformedMessages.earliestDate, latestDate: transformedMessages.latestDate };
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
    return { transformedMessages, earliestDate, latestDate };
};

module.exports = transformJson;