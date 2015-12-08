var fs = require('fs');
var cheerio = require('cheerio');
var handlebars = require('handlebars');
var Moment = require('./Moment.js').Moment;

// node display-thread -i "resources/Tobbis Bälch, Cynthia García Belch.json"

var argv = require('optimist')
      .usage('Usage: $0 -i [THREAD_NAME.json] -t [type: "html"]')
      .demand(['i']).argv;

var input = argv.i;
var type = argv.type || 'html';

var receiveFile = function(err, json) {
  if (err) {
    console.log("Error while processing " + input + ": " + err);
    process.exit();
  }

  var thread = JSON.parse(json);

  if (thread) {
    switch (type) {
      case 'html':
      default:
        displayAsHtml(thread);
    }
  }
};

var displayAsHtml = function(thread) {
  var data = {
    title: 'Cynthia García Zermeño & Tobbis Bälch',
    from: thread.from,
    to: thread.to,
    messages: thread.messages
  };

  handlebars.registerHelper('format', function(date) {
    return (new Moment(date)).utcString();
  });

  handlebars.registerHelper('prettyFormat', function(date) {
    return (new Moment(date)).utcPrettyString();
  });

  handlebars.registerHelper("additionanlClasses", function(message) {
    if (this.user === 'Tobbis Bälch') {
      return 'tobbis';
    }
    if (this.user === 'Cynthia García Zermeño') {
      return 'cynthia';
    }
    return '';
  });

  fs.readFile('templates/base.html', 'utf-8', function(err, source) {

    if (err) {
      console.log("Error while processing " + 'templates/base.html' + ": " + err);
      process.exit();
    }

    var base = handlebars.compile(source);
    var html = base(data);

    fs.writeFile(thread.name +'.html', html);
  });
};


fs.readFile(input, "utf-8", receiveFile);
