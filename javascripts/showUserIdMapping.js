function showUserIdMapping(userIdMapping, idsPerConv, systemName, donor, friendInitial, andMoreContacts, dataSource) {


    clearPreviousRenderedMappings(dataSource)
        .then(() => {
            let names = [];
            let deidentifiedNames = [];
            let friendMappings = [];

            // get friendMappings and shorten them (e.g., from Contact1 to C1)
            Object.entries(userIdMapping).forEach((mapping) => {

                if (mapping[0] !== systemName) {

                    let friendMapping
                    if (mapping[1] === donor) {
                        friendMapping = donor
                    } else {
                        // create shortened Friend mappings: e.g.: Friend1 -> F1
                        friendMapping = mapping[1]
                        let numberStart = friendMapping.search(/\d+/)
                        friendMapping = friendInitial + friendMapping.substring(numberStart, friendMapping.length)
                    }
                    friendMappings.push(friendMapping)

                    // add name to names, so that deidentifiedNames can be created in a next step
                    names.push(mapping[0])
                }
            })

            // deidentify names to initials and stars
            if (dataSource === "WhatsApp") {
                for (let i = 0; i < names.length; i++) {
                    if (friendMappings[i] === donor) {
                        deidentifiedNames.push(names[i])
                    } else {
                        let splitIntoWords = names[i].split(" ");
                        let deidentifiedName = "";
                        splitIntoWords.forEach((word) => {
                            deidentifiedName += word[0]
                            for (let i = 1; i < word.length; i++) {
                                deidentifiedName += "*"
                            }
                            deidentifiedName += " "
                        })
                        deidentifiedNames.push(deidentifiedName)
                    }
                }
            }

            // show more symbols of user names for facebook - as here there are a lot more contacts and only
            // a few of those are shown -> making it easier for people to identify their contacts
            else {
                for (let i = 0; i < names.length; i++) {
                    if (friendMappings[i] === donor) {
                        deidentifiedNames.push(names[i])
                    } else {
                        let splitIntoWords = names[i].split(" ");
                        let deidentifiedName = "";
                        splitIntoWords.forEach((word) => {
                            if (word.length >= 4) {
                                deidentifiedName += word[0]
                                deidentifiedName += word[1]
                                for (let i = 2; i < word.length; i++) {
                                    deidentifiedName += "*"
                                }
                                deidentifiedName += " "
                            } else {
                                deidentifiedName += word[0]
                                for (let i = 1; i < word.length; i++) {
                                    deidentifiedName += "*"
                                }
                                deidentifiedName += " "
                            }
                        })
                        deidentifiedNames.push(deidentifiedName)
                    }
                }
            }



            // get all indices where the deidentified names are equal
            for (let i = 0; i < deidentifiedNames.length; i++) {
                let allIndicesEqualName = []
                let index;
                for (let j = 0; j < deidentifiedNames.length; j++) {
                    index = deidentifiedNames.indexOf(deidentifiedNames[i], j)
                    if (index < 0) {
                        break;
                    }
                    allIndicesEqualName.push(index)
                    j = index
                }

                // only if more than one index has been found, then there are duplicates for this name
                if (allIndicesEqualName.length > 1) {

                    allIndicesEqualName.forEach((index) => {
                        let curName = names[index]
                        allIndicesEqualName.forEach((other) => {
                            if (other !== index) {
                                let otherName = names[other]
                                for (let k = 0; k < otherName.length; k++) {
                                    // find first different char and then replace the star at that position by that char
                                    if (otherName.charAt(k) !== curName.charAt(k)) {
                                        deidentifiedNames[index] =
                                            deidentifiedNames[index].substring(0, k) +
                                            curName.charAt(k) +
                                            deidentifiedNames[index].substring(k + 1);
                                        // only show first distinct character -> so break once one was found
                                        break;
                                    }
                                }
                            }
                        })
                    })

                }
            }

            // create grouping for displaying the contactsmapping per chat
            let contactsPerChat = idsPerConv.map(conv => conv.filter(obj => obj["name"] !== "System" && obj["name"] !== donor))

            let resultMappingsPerChat = []
            for (let i = 0; i < contactsPerChat.length; i++) {
                let pseudosPerChat = []
                contactsPerChat[i].forEach((contact) => {
                    let numberStart = contact["name"].search(/\d+/)
                    let searchString = friendInitial + contact["name"].substring(numberStart, contact["name"].length)
                    pseudosPerChat.push({
                        name: deidentifiedNames[friendMappings.indexOf(searchString)],
                        pseudonym: searchString,
                    })
                })
                resultMappingsPerChat.push(pseudosPerChat)
            }


            for (let i = 0; i < resultMappingsPerChat.length; i++) {
                $("#display-userIDMapping-" + dataSource).append("<p class='mapping-item name-pseudonym-mapping' style='font-weight: bold; font-size: 22px'><u>Chat " + (i+1) + "</u></p>")
                for (let j = 0; j < resultMappingsPerChat[i].length; j++) {
                    if (j > 4) {
                        $("#display-userIDMapping-" + dataSource).append("<p class='mapping-item' style='font-weight: bold'>..." + (resultMappingsPerChat[i].length-j) + " " + andMoreContacts + "</p>")
                        break;
                    }
                    $("#display-userIDMapping-" + dataSource).append("<p class='mapping-item' style='font-weight: bold'>" + resultMappingsPerChat[i][j].name + " &rarr; " + resultMappingsPerChat[i][j].pseudonym + "</p>")
                }
            }


        })
}

function clearPreviousRenderedMappings(dataSource) {
    return new Promise((resolve) => {
        $("#display-userIDMapping-" + dataSource + " .mapping-item").remove();
        resolve();
    });
}

module.exports = showUserIdMapping;