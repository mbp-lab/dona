var JSZip = require('jszip');
var deIdentify = require('../shared/deIdentify');
const zip = require("@zip.js/zip.js");

async function facebookZipFileHandler(fileList) {

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
        if (profileInfoEntry === undefined) {
            reject(i18n.data('error-no-profile'))
        }

        extractDonorNameFromEntry(profileInfoEntry)
            .then((donorName) => {

                // get all messageEntries, also all entries for posts, comments, and reactions
                let messagesEntries = []
                let postsEntries = []
                let groupPostsEntries = []
                let commentsEntries = []
                let groupCommentsEntries = []
                let reactionsEntries = []

                // toDo: maybe also add group posts and comments ???
                allEntries.forEach((entry) => {
                    if (validateContentEntry("message.json", entry) || validateContentEntry("message_1.json", entry)) {
                        messagesEntries.push(entry);
                    } else if (validateContentEntry("your_posts__check_ins__photos_and_videos_1.json", entry) || validateContentEntry("your_posts__check_ins__photos_and_videos.json", entry)) {
                        postsEntries.push(entry)
                    } else if (validateContentEntry("your_comments_in_groups_1.json", entry) || validateContentEntry("your_comments_in_groups.json", entry)) {
                        groupCommentsEntries.push(entry)
                    } else if (validateContentEntry("group_posts_and_comments_1.json", entry) || validateContentEntry("group_posts_and_comments.json", entry)) {
                        groupPostsEntries.push(entry)
                    } else if (!groupCommentsEntries.includes(entry) && !groupPostsEntries.includes(entry) && (validateContentEntry("comments_1.json", entry) || validateContentEntry("comments.json", entry))) {
                        commentsEntries.push(entry)
                    } else if (validateContentEntry("likes_and_reactions_1.json", entry) || validateContentEntry("likes_and_reactions.json", entry)) {
                        reactionsEntries.push(entry)
                    }
                })

                // if there is no messages then reject
                if (messagesEntries.length < 1) reject("error");

                // get the contents of the entries
                let textList = createContentListFromEntries(messagesEntries)
                let postList = createContentListFromEntries(postsEntries)
                let commentList = createContentListFromEntries(commentsEntries)
                let reactionList = createContentListFromEntries(reactionsEntries)
                let groupPostList = createContentListFromEntries(groupPostsEntries)
                let groupCommentList = createContentListFromEntries(groupCommentsEntries)

                resolve([resolve(deIdentify(donorName, Promise.all(textList), Promise.all(postList), Promise.all(commentList), Promise.all(reactionList), Promise.all(groupPostList), Promise.all(groupCommentList), allEntries, "Facebook"))]);
            })
            .catch(function (e) {
                reject(e);
            })

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

function validateContentEntry(contentPattern, entry) {
    if (entry.filename.trim().indexOf(contentPattern) >= 0) return true;
    return false;
};

function createContentListFromEntries(entriesList) {
    return entriesList.map((entry) => {
        const textWriter = new zip.TextWriter();
        return entry.getData(textWriter)
    })
}

module.exports = facebookZipFileHandler