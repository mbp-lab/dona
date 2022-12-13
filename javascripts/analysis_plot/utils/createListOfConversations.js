const shortenFriendId = require("./shortenFriendId");

function createListOfConversations(conversationFriends, chatWith, friendsInitial) {

    let listOfConversations = []
    for (let i = 0; i < conversationFriends.length; i++) {

        conversationFriends[i] = conversationFriends[i].map((friend) => shortenFriendId(friend, friendsInitial))

        listOfConversations.push(chatWith + " <br>" + conversationFriends[i][0]);
        if (conversationFriends[i].length === 1) {
            listOfConversations[i] += "  "
        }
        for (let j = 1; j < conversationFriends[i].length; j++) {
            if (conversationFriends[i][j] !== "donor") {

                if (j > 6) {
                    listOfConversations[i] += ", ..."
                    break;
                }

                if (j % 4 === 0) {
                    listOfConversations[i] += ", <br>" + conversationFriends[i][j]
                } else {
                    listOfConversations[i] += ", " + conversationFriends[i][j]
                }
                if (j === conversationFriends[i].length - 1) {
                    listOfConversations[i] += "  "
                }
            }
        }
    }
    return listOfConversations
}


module.exports = createListOfConversations;