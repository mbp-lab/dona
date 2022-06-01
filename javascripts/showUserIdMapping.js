function showUserIdMapping(userIdMapping) {

    clearPreviousRenderedMappings()
        .then(() => {
        Object.entries(userIdMapping).forEach((mapping) => {
            $("#display-userIDMapping").append("<p class='mapping-item'>" + mapping[0] + " &rarr; " + mapping[1] + "</p>")
        })
    })
}

function clearPreviousRenderedMappings() {
    return new Promise((resolve) => {
        $("#display-userIDMapping .mapping-item").remove();
        resolve();
    });
};

module.exports = showUserIdMapping;