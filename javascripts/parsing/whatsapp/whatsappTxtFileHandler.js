const uuid = require('uuid/v4');
const countWords = require('../../stringWordCount');
const {makeArrayOfMessages, parseMessages} = require('./whatsappParser.js');
const _ = require("lodash");

function whatsappTxtFilesHandler(filelist, alias) {
    const i18nSupport = $('#i18n-support'); // TODO: This file should not be allowed to access jquery
    var files = [];
    for (var i = 0; i < filelist.length; i++) {
        files.push(filelist[i]);
    }
    ;


    return new Promise((resolve, reject) => {
        const expectedNumberOfFiles = 5;
        //if (alias.length < 1) {
        //    reject(i18nSupport.data('error-no-alias'));
        //} else if (files.length != expectedNumberOfFiles) {
        if (files.length !== expectedNumberOfFiles) {
            reject(i18nSupport.data('error-not-enough-chats').replace('%s', files.length));
            return;
        } else {
            // check if all files seem to be the same
            let fileSize = files[0].size
            let allSameSize = true
            for (let i = 1; i < files.length; i++) {
                if (files[i].size !== fileSize) {
                    allSameSize = false
                }
            }
            if (allSameSize) {
                reject(i18nSupport.data('error-same-files'));
                return;
            }
        }

        const parsedFiles = files.map(file => {
            return handlefile(file)
                .then(data => data.split('\n'))
                .then(makeArrayOfMessages)
                .then(messages => parseMessages(messages))
        });

        // determine possible usernames
        Promise.all(parsedFiles)
            .then((parsed) => {
                let textList = parsed.map((obj) => obj.texts)
                let contacts = parsed.map((obj) => obj.contacts)

                // determine possible alias - if only one is possible then that is the alias
                let possibleUserNames = _.intersection(...contacts)

                if (possibleUserNames.length === 1) {
                    resolve(deIdentification(textList, possibleUserNames[0]));
                } else {
                    askUserForUsername(possibleUserNames)
                        .then(username => {
                            resolve(deIdentification(textList, username));
                        })
                }
            })

    })

}

function askUserForUsername(possibilities) {
    return new Promise((resolve) => {

        let usernameSelector = document.getElementById("usernameSelect");
        usernameSelector.innerHTML = '';
        possibilities.forEach((name) => {
            usernameSelector.options[usernameSelector.options.length] = new Option(name, name);
        })

        usernameSelector.options[0].setAttribute("selected", true)

        let usernameSelectButton = document.getElementById("usernameSelectButton");
        usernameSelectButton.onclick = () => {
            resolve(usernameSelector.value)
        }
        $('#usernameModal').modal('show')
    })
}

function handlefile(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

function deIdentification(parsedFiles, alias) {
    const participantNameToRandomIds = {};
    const deIdentifiedJsonContents = [];
    const systemMessage = "Messages to this chat and calls are now secured with end-to-end encryption.";
    let i = 1;

    return Promise.all(parsedFiles)
        .then(textList => {
            //let textList = parsed.map((obj) => obj.texts)
            //let contacts = parsed.map((obj) => obj.contacts)
            //console.log(textList)
            //console.log(contacts)
            textList.forEach(lines => {
                const jsonContent = {"participants": [], "messages": [], thread_type: "Regular"};
                var eachFileParticipants = new Set();
                const i18nSupport = $('#i18n-support'); // TODO: This file should not be allowed to access jquery
                participantNameToRandomIds[alias] = i18nSupport.data('donor');
                const messages = lines.map(line => {
                    if (!line.message.includes(systemMessage)) {
                        const participant = getDeIdentifiedId(line.author);
                        eachFileParticipants.add(participant);
                        const sender_name = participant;
                        const timestamps_ms = line.date;
                        const wordCount = countWords(line.message);
                        const message = {
                            "sender_name": sender_name,
                            "timestamp_ms": timestamps_ms,
                            "word_count": wordCount
                        };
                        return message;
                    }
                });
                messages.splice(messages.indexOf(undefined), 1)  //remove the system message which is now undefined
                jsonContent.messages = messages;
                const arr = Array.from(eachFileParticipants)
                const t = arr.map(participantId => {
                    return {
                        "name": participantId
                    }
                });
                jsonContent.participants = t;

                if (jsonContent.participants.length === 3) {
                    const systemName = i18nSupport.data("system")
                    // check if one of the participants is the system, then it is no group!
                    if (!arr.includes(systemName)) {
                        jsonContent.thread_type = "RegularGroup"
                    }
                } else if (jsonContent.participants.length > 2) {
                    jsonContent.thread_type = "RegularGroup"
                }
                ;

                deIdentifiedJsonContents.push(jsonContent);
            });


            /*
            let allParticipants = deIdentifiedJsonContents.map(conv => {
              let helper = []
              conv.participants.forEach(p => helper.push(p.name))
              return helper
            })
            console.log(allParticipants)
            console.log(_.intersection(...allParticipants))
            let possibleUserNames = _.intersection(...allParticipants)
            if (possibleUserNames.length === 1) {
              //participantNameToRandomIds[]
              participantNameToRandomIds[alias] = i18nSupport.data('donor');
            }

             */

            let result = {
                deIdentifiedJsonContents: deIdentifiedJsonContents,
                participantNameToRandomIds: participantNameToRandomIds
            }
            //deIdentifiedJsonContents.push(participantNameToRandomIds)
            //console.log(result)
            return result;
        });

    function getDeIdentifiedId(name) {
        const i18nSupport = $('#i18n-support'); // TODO: This file should not be allowed to access jquery
        const systemName = i18nSupport.data("system")

        if (!(name in participantNameToRandomIds)) {
            // TODO: I (Paul) modified this to not anonymize the system, but keep calling it system
            if (name === systemName) {
                participantNameToRandomIds[name] = systemName;
            } else {
                participantNameToRandomIds[name] = i18nSupport.data("friend") + i;
                i++;
            }
        }
        return participantNameToRandomIds[name];
    }

};

module.exports = whatsappTxtFilesHandler;