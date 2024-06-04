// import * as chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import { JSDOM } from 'jsdom';
// import $ from 'jquery';

// chai.use(chaiAsPromised);

// const { document } = (new JSDOM('')).window;
// const window = document.defaultView;
// global.document = document;
// global.window = window;
// global.$ = $;
// const fs = require('fs');
// const chai = require('chai');
let expect;
let assert;
let chaiAsPromised;

before(async function () {
    const chai = await import('chai');
    chaiAsPromised = await import('chai-as-promised');
    chai.use(chaiAsPromised.default);
    expect = chai.expect;
    assert = chai.assert;

    const jsdom = require('jsdom');
    const { JSDOM } = jsdom;
    const { document } = (new JSDOM('')).window;
    global.document = document;
    const window = document.defaultView;
    global.window = window;
    global.$ = require('jquery');
});

// this test is not working anymore with the zipjs library - because it uses client specific modules
/*
describe('Unzip file', function () {
    let validInputZip = fs.readFileSync("javascripts/test/resources/validZip.zip");
    let invalidInputZip = fs.readFileSync("javascripts/test/resources/invalidZip.zip");
    validInputZip = new Blob([validInputZip])
    invalidInputZip = new Blob([invalidInputZip])
    it('should not throw processing a valid zip file', function () {
        expect(handleFile([validInputZip])).not.to.throw;
    });

    it('should reject processing an invalid zip file containing no message.zip', function () {
        const promise = handleFile([invalidInputZip]);
        return assert.isRejected(promise);
    })
});

 */