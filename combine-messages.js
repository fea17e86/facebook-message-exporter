var fs = require('fs');
var cheerio = require('cheerio');
var Moment = require('./Moment.js').Moment;

// combines messages which belong together: a message, following another one sent by the same user, will be concatenated
// node combine-messages -i resources/threads.json

var argv = require('optimist')
      .usage('Usage: $0 -i [threads.json]')
      .demand([ 'i']).argv;

var input = argv.i;

var merge = function(current, last, params) {
  return last && last.user === current.user && (!params || !params.maxMargin || ((new Moment(current.date)).utcDate().getTime() - (new Moment(last.date)).utcDate().getTime() < params.maxMargin));
};

var combineMessages = function(messages, params) {

  if (Array.isArray(messages) && messages.length > 0 && messages[0].text) {
    var combined = [];
    var last = undefined;
    for (var i=0; i<messages.length; i++) {
      var current = messages[i];
      if (merge(current, last, params)) {
        last.text += '\n' + current.text;
      } else {
        combined.push(current);
        last = current;
      }
    }
    console.log('combineMessages', 'original: '+ messages.length, 'combined: '+ combined.length);
    return combined;
  }
  return messages;
};

var receiveFile = function(err, data) {
    if (err) {
        console.log("Error while processing " + input + ": " + err);
        process.exit();
    }

    data = JSON.parse(data);

    if (data && data.messages) {
      data.messages = combineMessages(data.messages);

      fs.writeFile(data.name +'_combined.json', JSON.stringify(data));
    }
};

exports.combineMessages = combineMessages;

fs.readFile(input, "utf-8", receiveFile);
