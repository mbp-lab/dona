const expect = require('chai').expect;
const handleFile = require('../../../parsing/facebook/facebookZipFileHandler');
const fs = require('fs');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;
const { document } = (new JSDOM('')).window;
global.document = document;
const window = document.defaultView;
global.window = window;
global.$ = require('jquery');

describe('DeIdentifying a zip file', function () {
    const zipFile = fs.readFileSync("javascripts/test/resources/validZip.zip");
    it('should return messages with number of words rather than content', function () {
        return handleFile([zipFile]).then(deIdentifiedJson => {
            deIdentifiedJson[0].messages.forEach((message) => {
                expect(message['word_count']).to.equal(6);
            })
        })
    })
    it('should return messages with random IDs instead of sender_name', function () {
        return handleFile([zipFile]).then(deIdentifiedJson => {
        console.log(deIdentifiedJson[0].participants);
            deIdentifiedJson[0].messages.forEach((message) => {
                expect(message.sender_name).to.not.equal('Blah Blah');
                expect(message.sender_name).to.not.equal('Some Person');
            })
        })    
    })
});