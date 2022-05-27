function showUserIdMapping(userIdMapping) {

    Object.entries(userIdMapping).forEach((mapping) => {
        if (mapping[0] !== "System") {
            $("#display-userIDMapping").append("<p>" + mapping[0] + " &rarr; " + mapping[1] + "</p>")
        }
    })
}

module.exports = showUserIdMapping;