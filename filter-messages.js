var fs = require('fs');
var cheerio = require('cheerio');
var Moment = require('./Moment.js').Moment;
var FBDP = require('./facebook-date-parser.js').FBDP;
var badWords = require('./bad-words.js').badWords;
var emojify = require('./emojify.js').emojify;

// node filter-messages -i resources/threads.json -n "Tobbis Bälch, Cynthia García Belch" -f "2014-06-01" -t "2014-11-01"
// original=47474 messages=13893 censored=422 oor=31410 empty=1749

var argv = require('optimist')
      .usage('Usage: $0 -i [threads.json] -n [thred_name] -f [from] -t [to]')
      .demand([ 'i', 'n']).argv;

var input = argv.i;

var thread = { name: argv.n, from: argv.f ? new Moment(argv.f) : undefined, to: argv.t ? new Moment(argv.t) : undefined, messages: [], censored: [] };

var replaceEmojis = function(message) {
  return emojify(message);
};

var censored = function(message) {
  for (var i=0; i<badWords.length; i++) {
    if (message.text.indexOf(badWords[i]) > -1) { return true; }
  }
  return false;
};

var messageInBetween = function(message) {
  message.date = FBDP.parse(message.date);
  if (thread.from && thread.to) {
    return thread.from <= message.date && message.date <= thread.to;
  }
  return true;
};

var receiveFile = function(err, data) {
    if (err) {
        console.log("Error while processing " + input + ": " + err)
        process.exit()
    }

    var threads = JSON.parse(data);
    var num = 0;
    var empty = 0;
    var oor = 0;
    var emojisNotFound = [];

    if (Array.isArray(threads)) {
      for (var t=0; t<threads.length; t++) {
        if (thread.name === threads[t].users) {
          var messages = threads[t].messages;
          num += messages.length;
          for (var m=0; m<messages.length; m++) {
            var message = messages[m];
            if (message && message.text && message.text.trim().length > 0) {
              if (messageInBetween(message)) {
                var emojified = replaceEmojis(message.text);
                message.text = emojified.text;
                emojified.notFound.forEach(function(hex) {
                  if (emojisNotFound.indexOf(hex) === -1) {
                    emojisNotFound.push(hex);
                  }
                });
                if (censored(message)) {
                  thread.censored.push(message);
                } else {
                  thread.messages.push(message);
                }
              } else {
                oor++;
              }
            } else{
              empty++;
            }
          }
        }
      }
    }

    console.log('original=' + num, 'messages=' + thread.messages.length, 'censored=' + thread.censored.length, 'oor='+ oor, 'empty='+ empty);

    thread.messages.sort((a, b) => a.date.utcDate().getTime() - b.date.utcDate().getTime());
    thread.censored.sort((a, b) => a.date.utcDate().getTime() - b.date.utcDate().getTime());

    thread.from = thread.messages[0].date;
    thread.to = thread.messages[thread.messages.length-1].date;

    //console.log('FITRST', thread.messages[0].date.utcDate() +': '+ thread.messages[0].text);
    //console.log('LAST', thread.messages[thread.messages.length-1].date.utcDate() +': '+ thread.messages[thread.messages.length-1].text);

    fs.writeFile('emojis-not-found.json', JSON.stringify(emojisNotFound));

    fs.writeFile(thread.name + '.json', JSON.stringify(thread, function(key, value) {
      return value.isMoment && value.isMoment() ? value.toString() : value;
    }));
};


fs.readFile(input, "utf-8", receiveFile);
