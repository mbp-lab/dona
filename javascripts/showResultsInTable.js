function showResultsInTable(deIdentifiedJsonList) {
    const i18nSupport = $("#i18n-support");
    const systemName = i18nSupport.data("system")
    const cardsToDisplay = 100;
    clearPreviousRenderedResults()
        .then(() => {
            var shownMessagesCounter = 0;
            var messages = generateMessageList(deIdentifiedJsonList);
            var shuffle = generateUniqueRandomNumbers(messages.length, Math.min(cardsToDisplay, messages.length));
            shuffle.forEach(n => {
                var message = messages[n];
                shownMessagesCounter++;
                addNewMessage(message.participants.filter(p => p !== systemName), message.sender_name, message.word_count, message.timestamp_ms, message.isGroup, shownMessagesCounter)
            });

            $("#display-preview-total").html(shownMessagesCounter);

            $("#carousel-deidentified-preview .carousel-item:first").addClass('active');
        });
};

function generateMessageList(deIdentifiedJsonList) {
    const i18nSupport = $("#i18n-support");
    // did you know `flatMap` and `flat(ten)` are only supported on Firefox 62+? T_T
    return deIdentifiedJsonList.map( conversation => {
        const participants = conversation.participants.map(pt => pt.name);
        const threadType = conversation.thread_type;
        return conversation.messages.map( message => {
            var result = JSON.parse(JSON.stringify(message));
            result.participants = participants;
            result.isGroup = threadType == "RegularGroup" ? i18nSupport.data("yes") : i18nSupport.data("no");
            return result;
        });
    }).reduce((acc, val) => acc.concat(val), []);
}

function generateUniqueRandomNumbers(max, numberToGenerate) {
    var array = new Array(max);
    for (i = 0; i < array.length; i++) {
        array[i] = i;
    }
    var j, x, i;
    for (i = max - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }

    return numberToGenerate < max ? array.slice(0, numberToGenerate) : array;
}

function clearPreviousRenderedResults() {
    return new Promise((resolve) => {
        $("#carousel-deidentified-preview .carousel-item").remove();
        resolve();
    });
};

function getCardText(heading, body) {
    return '<span class="message-card-heading">' + heading + '</span><span class="message-card-text">' + body + '</span>'
}

function addNewMessage(participants, sender, wordCount, timestamp, isGroup, index) {
    const i18nSupport = $("#i18n-support");

    const receivers = participants.filter(item => item != sender).join(", ");
    $("#carousel-deidentified-preview .carousel-inner").append('<div class="carousel-item col-md-4">' +
                            '<div class="message-card card card-body">' +
                                    '<h5 class="card-title">' + i18nSupport.data("message") + " " + index + '</h5>' +
                                    getCardText(i18nSupport.data("sender"), sender) +
                                    getCardText(i18nSupport.data("receiver"), receivers ? receivers : "No receivers found.") +
                                    getCardText(i18nSupport.data("word-count"), wordCount) +
                                    getCardText(i18nSupport.data("timestamp"), timestamp) +
                                    getCardText(i18nSupport.data("group-conversation"), isGroup) +
                                '</div>' +
                            '</div>');
};


module.exports = showResultsInTable;