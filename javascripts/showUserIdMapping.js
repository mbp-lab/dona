function showUserIdMapping(userIdMapping, systemName, donor, dataSource) {

    clearPreviousRenderedMappings()
        .then(() => {
            let names = [];
            let deidentifiedNames = [];
            let friendMappings = [];
            // get friendMappings and shorten them
            Object.entries(userIdMapping).forEach((mapping) => {

                if (mapping[0] !== systemName) {

                    let friendMapping
                    if (mapping[1] === donor) {
                        friendMapping = donor
                    } else {
                        // create shortened Friend mappings: e.g.: Friend1 -> F1
                        friendMapping = mapping[1]
                        let numberStart = friendMapping.search(/\d+/)
                        friendMapping = "F" + friendMapping.substring(numberStart, friendMapping.length)
                    }
                    friendMappings.push(friendMapping)

                    // add name to names, so that deidentifiedNames can be created in a next step
                    names.push(mapping[0])
                }
            })

            // deidentify names to initials and stars
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

            for (let i = 0; i < deidentifiedNames.length; i++) {
                $("#display-userIDMapping-" + dataSource).append("<p class='mapping-item' style='font-weight: bold'>" + deidentifiedNames[i] + " &rarr; " + friendMappings[i] + "</p>")
            }


        })
}

function clearPreviousRenderedMappings() {
    return new Promise((resolve) => {
        $("#display-userIDMapping .mapping-item").remove();
        resolve();
    });
}

module.exports = showUserIdMapping;