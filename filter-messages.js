var fs = require('fs');
var cheerio = require('cheerio');
var Moment = require('./Moment.js').Moment;
var FBDP = require('./facebook-date-parser.js').FBDP;
var firstMails = require('./resources/first-mails.js').firstMails;
var badWords = require('./bad-words.js').badWords;
var combineMessages = require('./combine-messages.js').combineMessages;
var emojify = require('./emojify.js').emojify;

// node filter-messages -i resources/threads.json -n "Tobbis Bälch, Cynthia García Belch" -f "2014-06-01" -t "2014-11-01"
// original=47474 messages=13893 censored=422 oor=31410 empty=1749

var argv = require('optimist')
      .usage('Usage: $0 -i [threads.json] -n [thred_name] -f [from] -t [to] -c [censor: true || false] -m [mild censor: true || false]')
      .demand([ 'i', 'n']).argv;

var input = argv.i;

var replaceEmojis = function(message) {
  return emojify(message);
};

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

var censor = function(text) {
  for (var i=0; i<badWords.length; i++) {
    text = text.replace(new RegExp(escapeRegExp(badWords[i]), 'g'), '(...)');
  }
  return text;
};

var isMessageInBetween = function(message, from, to) {
  message.date = FBDP.parse(message.date);
  if (from && to) {
    return from <= message.date && message.date <= to;
  }
  return true;
};

var compareMessages = function(a, b) {
  if (a.date && b.date) {
    var aDate = a.date.isMoment() ? a.date.utcDate().getTime() : a.data.getTime();
    var bDate = b.date.isMoment() ? b.date.utcDate().getTime() : b.date.getTime();
    return aDate - bDate;
  }
  return 0;
};

var filterMessages = function(messages, from, to, doCensor, mildCensor, sort) {
  var accepted = [];
  var censored = [];
  var emojisNotFound = [];
  var total = 0;
  var empty = 0;
  var outOfRange = 0;

  if (Array.isArray(messages)) {
    total = messages.length;

    for (var m=0; m<total; m++) {
      var message = messages[m];
      if (message && message.text && message.text.trim().length > 0) {
        if (isMessageInBetween(message, from, to)) {
          var emojified = replaceEmojis(message.text);
          message.text = emojified.text;
          emojified.notFound.forEach(function(hex) {
            if (emojisNotFound.indexOf(hex) === -1) {
              emojisNotFound.push(hex);
            }
          });
          var censoredText = censor(message.text);
          if (censoredText !== message.text) {
            if (!doCensor || mildCensor) {
              message.text = censoredText;
              accepted.push(message);
            } else {
              censored.push(message);
            }
          } else {
            accepted.push(message);
          }
        } else {
          outOfRange++;
        }
      } else{
        empty++;
      }
    }
  }

  if (sort) {
    accepted.sort(compareMessages);
  }

  return {
    messages: accepted,
    censored: censored,
    emojisNotFound: emojisNotFound,
    total: total,
    empty: empty,
    outOfRange: outOfRange
  };
};

var filterThreads = function(threads, threadName, from, to, doCensor, mildCensor) {
  var accepted = [];
  var censored = [];
  var emojisNotFound = [];
  var total = 0;
  var empty = 0;
  var outOfRange = 0;

  var result = filterMessages(firstMails.messages, from, to, doCensor, true, false);
  accepted.push.apply(accepted, result.messages);
  censored.push.apply(censored, result.censored);
  result.emojisNotFound.forEach(function(hex) {
    if (emojisNotFound.indexOf(hex) === -1) {
      emojisNotFound.push(hex);
    }
  });
  total += result.total;
  empty += result.empty;
  outOfRange += result.outOfRange;

  if (Array.isArray(threads) && threads.length > 0 && threads[0].messages) {

    for (var t=0; t<threads.length; t++) {
      var thread = threads[t];
      if (threadName === thread.users) {
        result = filterMessages(thread.messages.concat(), from, to, doCensor, mildCensor, false);
        accepted.push.apply(accepted, result.messages);
        censored.push.apply(censored, result.censored);
        result.emojisNotFound.forEach(function(hex) {
          if (emojisNotFound.indexOf(hex) === -1) {
            emojisNotFound.push(hex);
          }
        });
        total += result.total;
        empty += result.empty;
        outOfRange += result.outOfRange;
      }
    }
  }

  accepted = combineMessages(accepted.sort(compareMessages));

  return {
    messages: accepted,
    censored: censored,
    emojisNotFound: emojisNotFound,
    total: total,
    empty: empty,
    outOfRange: outOfRange
  };
};

var filterData = function(data, threadName, from, to, doCensor, mildCensor) {

  from = from ? new Moment(from) : undefined;
  to = to ? new Moment(to) : undefined;
  doCensor = doCensor || true;
  mildCensor = mildCensor || false;

  var result = {
    messages: [],
    censored: [],
    emojisNotFound: [],
    total: 0,
    empty: 0,
    outOfRange: 0
  };

  if (data) {
    if (data.messages || (Array.isArray(data) && data.length > 0 && data[0].text)) {
      result = filterMessages(data.messages || data, from, to, doCensor, mildCensor);
    } else if (Array.isArray(data) && data.length > 0 && data[0].messages) {
      result = filterThreads(data, threadName, from, to, doCensor, mildCensor);
    }
  }

  console.log('total=' + result.total, 'messages=' + result.messages.length, 'censored=' + result.censored.length, 'outOfRange='+ result.outOfRange, 'empty='+ result.empty);

  var thread = { name: threadName, from: from, to: to, messages: result.messages, censored: result.censored };

  thread.messages.sort((a, b) => a.date.utcDate().getTime() - b.date.utcDate().getTime());
  thread.censored.sort((a, b) => a.date.utcDate().getTime() - b.date.utcDate().getTime());

  if (thread.messages && thread.messages.length > 0) {
    thread.from = thread.messages[0].date;
    thread.to = thread.messages[thread.messages.length-1].date;
  }

  return { thread: thread, emojisNotFound: result.emojisNotFound };
};

var receiveFile = function(err, data) {
    if (err) {
        console.log("Error while processing " + input + ": " + err);
        process.exit();
    }

    var result = filterData(JSON.parse(data), argv.n, argv.f, argv.t, argv.c, argv.m);

    fs.writeFile('emojis-not-found.json', JSON.stringify(result.emojisNotFound));

    fs.writeFile(result.thread.name + '.json', JSON.stringify(result.thread, function(key, value) {
      return value.isMoment && value.isMoment() ? value.toString() : value;
    }));
};

exports.filterData = filterData;
exports.filterThreads = filterThreads;
exports.filterMessages = filterMessages;

fs.readFile(input, "utf-8", receiveFile);
