var JSZip = require('jszip');
var deIdentify = require('./deIdentify');

function facebookZipFileHandler(fileList) {
    const file = fileList[0];
    const i18n = $("#i18n-support");

    var messagesRelativePath = [];
    var zipFiles = {};
    return new Promise((resolve, reject) => {
        JSZip.loadAsync(file)
            .then(function (zip) {
                const zipFilesNames = Object.keys(zip.files);
                var profileInfoPath = zipFilesNames.find(name => name.includes("profile_information.json"));
                if (!profileInfoPath) reject(i18n.data('error-no-profile'));
                zip.forEach(function (relativePath, zipEntry) {
                    //TODO: Facebook added the '_1' to the json message file. We should figure out how we check all .json files
                    // and just reject the files that do no parse, which in theory should not be any. This would potentially
                    // be more future proof.
                    if (validateContent("message.json", zipEntry) || validateContent("message_1.json", zipEntry)) {
                       messagesRelativePath.push(relativePath);
                    }
                });
                zipFiles = zip.files;
                if (messagesRelativePath.length != 0) return (profileInfoPath);
                else reject(zip);
            })
            .then((profilePath) => {
                return extractDonorName(zipFiles, profilePath);
            })
            .then((donorName) => {
                //TODO: we now have an async within an async not needed but it works
                resolve([resolve(deIdentify(zipFiles, messagesRelativePath, donorName))]);
            })
            .catch(function (e) {
                reject(e);
            })
    });
}

function extractDonorName(zipFiles, profileInfoPath) {
    return zipFiles[profileInfoPath].async('text')
        .then((profileFileText) => {
            return new Promise((resolve, reject) => {
                const profileJson = JSON.parse(profileFileText);
                // TODO: there is an issue with username changes
                // -> then the path for the name is not profile.name.full_name but e.g. profile_v2.name.full_name
                if (profileJson.profile.name.full_name) resolve(profileJson.profile.name.full_name);
                else reject(profileInfoPath);
            });
        });
}

function validateContent(contentPattern, zipEntry) {
    if (zipEntry.name.trim().indexOf(contentPattern) >= 0) return true;
    return false;
};

module.exports = facebookZipFileHandler