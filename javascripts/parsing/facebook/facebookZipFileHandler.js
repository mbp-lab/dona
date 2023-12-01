var JSZip = require('jszip');
var deIdentify = require('./deIdentify');
const zip = require("@zip.js/zip.js");

async function facebookZipFileHandler(fileList) {

    console.log("fzipfh - FileList:", fileList)
    const i18n = $("#i18n-support");


    var messagesRelativePath = [];
    var zipFiles = {};

    // first get all entries in the zip file
    let allEntries = []
    for (let i = 0; i < fileList.length; i++) {
        const zipFileReader = new zip.BlobReader(fileList[i]);
        const zipReader = new zip.ZipReader(zipFileReader);

        allEntries = allEntries.concat(await zipReader.getEntries())
        await zipReader.close();
    }


    return new Promise( (resolve, reject) => {

        // then check if profileInfo is there and extract the donor name
        let profileInfoEntry = allEntries.find(entry => entry.filename.includes("profile_information.json"))
        console.log("profileInfoEntry:", profileInfoEntry)
        if (profileInfoEntry === undefined) {
            reject(i18n.data('error-no-profile'))
        }

        console.log("this getting here ??? ")
        extractDonorNameFromEntry(profileInfoEntry)
            .then((donorName) => {
                // get all messageEntries
                let messagesEntries = []
                allEntries.forEach((entry) => {
                    if (validateContentEntry("message.json", entry) || validateContentEntry("message_1.json", entry)) {
                        messagesEntries.push(entry);
                        console.log(entry.filename)
                    }
                })
                console.log("entries with messages:", messagesEntries.length)
                console.log("messageEntries:", messagesEntries)
                // if there is no messages then reject
                console.log("is rejecting? messagesEntries.length < 1", messagesEntries.length < 1)
                if (messagesEntries.length < 1) reject("error");

                // get the contents of the messageEntries
                let textList = messagesEntries.map((entry) => {
                    const textWriter = new zip.TextWriter();
                    return entry.getData(textWriter)
                })
                console.log("textList Entries:", textList)

                resolve([resolve(deIdentify(zipFiles, messagesRelativePath, donorName, Promise.all(textList)))]);
            })
            .catch(function (e) {
                reject(e);
            })







        // I need to collect
        // ProfileInfoPath:
            // var profileInfoPath = zipFilesNames.find(name => name.includes("profile_information.json"));
        // message.json or message_1.json with the according text
        // if (validateContent("message.json", zipEntry) || validateContent("message_1.json", zipEntry)) {
        //                         messagesRelativePath.push(relativePath);
        //                     }

        // extractDonorName

        // then deidentify takes the zip files and all relevant paths at the moment
        // but only to then create a textlist of those paths -> I can do this here immediately



/*
        let jszip = JSZip();

        // when using jszip.loadAsync() it merges the zip files -> see documentation
        let aggregatedZip = jszip

        for (let i = 0; i < fileList.length; i++) {
            aggregatedZip = jszip.loadAsync(fileList[i])
        }


        //jszip.loadAsync(file)
        aggregatedZip
            .then(function (zip) {
                const zipFilesNames = Object.keys(zip.files);
                console.log("aggregatedZip files length:", zipFilesNames.length)
                var profileInfoPath = zipFilesNames.find(name => name.includes("profile_information.json"));
                if (!profileInfoPath) reject(i18n.data('error-no-profile'));
                zip.forEach(function (relativePath, zipEntry) {
                    //TODO: Facebook added the '_1' to the json message file. We should figure out how we check all .json files
                    // and just reject the files that do no parse, which in theory should not be any. This would potentially
                    // be more future proof.
                    if (validateContent("message.json", zipEntry) || validateContent("message_1.json", zipEntry)) {
                        messagesRelativePath.push(relativePath);
                    }
                });
                zipFiles = zip.files;
                console.log("messagesRelativePath length:", messagesRelativePath.length)
                if (messagesRelativePath.length != 0) return (profileInfoPath);
                else reject(zip);
            })
            .then((profilePath) => {
                console.log("original:", extractDonorName(zipFiles, profilePath))
                return extractDonorName(zipFiles, profilePath);
            })
            .then((donorName) => {
                //TODO: we now have an async within an async not needed but it works
                resolve([resolve(deIdentify(zipFiles, messagesRelativePath, donorName, []))]);
            })
            .catch(function (e) {
                reject(e);
            })

 */
    });


}

function extractDonorName(zipFiles, profileInfoPath) {
    return zipFiles[profileInfoPath].async('text')
        .then((profileFileText) => {
            return new Promise((resolve, reject) => {
                const profileJson = JSON.parse(profileFileText);
                // find appropriate profile key: it could be "profile" or "profile_v2", or "profile_v3", ...
                let profileKey = Object.keys(profileJson).filter((profile) => /profile/.test(profile));
                if (profileJson[profileKey].name.full_name) resolve(profileJson[profileKey].name.full_name);
                else reject(profileInfoPath);
            });
        });
}


// new - it works!
function extractDonorNameFromEntry(entry) {
    const textWriter = new zip.TextWriter();
    return entry.getData(textWriter).then((profileFileText) => {
        return new Promise((resolve, reject) => {
            const profileJson = JSON.parse(profileFileText);
            // find appropriate profile key: it could be "profile" or "profile_v2", or "profile_v3", ...
            let profileKey = Object.keys(profileJson).filter((profile) => /profile/.test(profile));
            if (profileJson[profileKey].name.full_name) resolve(profileJson[profileKey].name.full_name);
            else reject(profileInfoPath);
        });
    });
}

function validateContent(contentPattern, zipEntry) {
    if (zipEntry.name.trim().indexOf(contentPattern) >= 0) return true;
    return false;
};

function validateContentEntry(contentPattern, entry) {
    if (entry.filename.trim().indexOf(contentPattern) >= 0) return true;
    return false;
};

module.exports = facebookZipFileHandler