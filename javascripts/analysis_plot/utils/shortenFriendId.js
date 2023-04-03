let shortenFriendId = (friend, friendsInitial, systemName) => {
    if (friend === systemName) {
        return systemName
    }

    //find index where number starts, all friends have the following form: "friend" + "i" where i is a number
    let numberStart = friend.search(/\d+/)
    return friendsInitial + friend.substring(numberStart, friend.length)
}

module.exports = shortenFriendId;