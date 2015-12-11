var fs = require('fs');
var cheerio = require('cheerio');
var officegen = require('officegen');
var Moment = require('./Moment.js').Moment;

// node create-docx -i "resources/Tobbis Bälch, Cynthia García Belch.json"

var argv = require('optimist')
      .usage('Usage: $0 -i [THREAD_NAME.json]')
      .demand(['i']).argv;

var input = argv.i;

var errorHandler = function (err) {
  console.log('error', err);
};

var finalizeHandler = function (bytes) {
  console.log('finished', byte + ' bytes written');
};

var createDocx = function(thread) {
  if (thread && thrad.messages) {
    var docx = officegen('docx');
    docx.on('error', errorHandler);
    docx.on('finalize', finalizeHandler);

    var out = fs.createWriteStream(thread.name +'.docx');
    docx.generate(out);
  }
};

var receiveFile = function(err, json) {
  if (err) {
    console.log("Error while processing " + input + ": " + err);
    process.exit();
  }

  createDocx(JSON.parse(json));
};

exports.createDocx = createDocx;

fs.readFile(input, "utf-8", receiveFile);
