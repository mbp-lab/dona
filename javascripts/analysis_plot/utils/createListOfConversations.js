function createListOfConversations(conversationFriends, chatWith) {

    let shortenFriend = (friend) => {
        //find index where number starts, all friends have the following form: "friend" + "i" where i is a number
        let numberStart = friend.search(/\d+/)
        return "F" + friend.substring(numberStart, friend.length)
    }

    let listOfConversations = []
    for (let i = 0; i < conversationFriends.length; i++) {

        conversationFriends[i] = conversationFriends[i].map((friend) => shortenFriend(friend))

        listOfConversations.push(chatWith + " <br>" + conversationFriends[i][0]);
        if (conversationFriends[i].length === 1) {
            listOfConversations[i] += "  "
        }
        for (let j = 1; j < conversationFriends[i].length; j++) {
            if (conversationFriends[i][j] !== "donor") {

                if (j > 7) {
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