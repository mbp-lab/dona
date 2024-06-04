function contentSize(messageContent) {
    return messageContent.trim().split(/\s+/).filter(str => str != '').length;
};

// export { contentSize };
module.exports = contentSize
