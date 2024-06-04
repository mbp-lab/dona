// import handleCookieAcceptance from './handleCookieAcceptance.js';
// import addListeners from './listeners.js';
// import Gifffer from 'giffer';
var handleCookieAcceptance = require('./handleCookieAcceptance');
var addListeners = require('./listeners.js');
const Gifffer = require('giffer');

$(document).ready(function () {


  handleCookieAcceptance();
  addListeners();
  Gifffer();

});