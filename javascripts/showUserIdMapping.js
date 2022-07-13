function showUserIdMapping(userIdMapping, systemName) {

    clearPreviousRenderedMappings()
        .then(() => {
        Object.entries(userIdMapping).forEach((mapping) => {
            if (mapping[0] !== systemName) {
                $("#display-userIDMapping").append("<p class='mapping-item' style='font-weight: bold'>" + mapping[0] + " &rarr; " + mapping[1] + "</p>")
            }
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