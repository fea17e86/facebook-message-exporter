var fs = require('fs');
var cheerio = require('cheerio');
var Moment = require('./Moment.js').Moment;

// node same-time -i "resources/Tobbis Bälch, Cynthia García Belch.json"

var argv = require('optimist')
      .usage('Usage: $0 -i [THREAD_NAME.json]')
      .demand(['i']).argv;

var input = argv.i;

var receiveFile = function(err, json) {
  if (err) {
    console.log("Error while processing " + input + ": " + err);
    process.exit();
  }

  var thread = JSON.parse(json);
  var messages = thread.messages;

  var sameTime = {};
  for (var i=0; i<messages.length-1; i++) {
    var current = messages[i];
    var next = messages[i+1];
    if (current.date === next.date && current.user !== next.user) {
      if (!sameTime[current.date]) {
        sameTime[current.date] = [];
      }
      var st = sameTime[current.date];
      if (i === 0 || st.length === 0 || st[st.length-1].index !== i) {
        st.push({ index: i, message: current });
      }
      st.push({ index: (i+1), message: next });
    }
  }

  fs.writeFile('same-time.json', JSON.stringify(sameTime, null, 2));
};

fs.readFile(input, "utf-8", receiveFile);
