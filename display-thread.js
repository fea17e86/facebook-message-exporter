var fs = require('fs');
var cheerio = require('cheerio');
var handlebars = require('handlebars');
var Moment = require('./Moment.js').Moment;

// creates html files out of a thread represented in a json file
// node display-thread -i "resources/Tobbis Bälch, Cynthia García Belch.json" -t "book" -c 100

var argv = require('optimist')
      .usage('Usage: $0 -i [THREAD_NAME.json] -t [type: "book"] -c [count: -1 = all]')
      .demand(['i']).argv;

var input = argv.i;
var type = argv.t || 'web';
var number = argv.c || -1;

var receiveFile = function(err, json) {
  if (err) {
    console.log("Error while processing " + input + ": " + err);
    process.exit();
  }

  var thread = JSON.parse(json);

  if (type === 'web') {
    var style = '';
    fs.readFile('css/bootstrap-3.3.6.min.css', "utf-8", function (err, css) {
      if (!err) { style = css; }
      fs.readFile('css/messages.css', "utf-8", function (err, css) {
        if (!err) { style += '\n' + css; }
        displayAsHtml(thread, style, type);
      });
    });
  } else {
    displayAsHtml(thread, style, type);
  }
};

var displayAsHtml = function(thread, style, type) {
  var data = {
    title: 'Cynthia & Tobias',
    from: thread.from,
    to: thread.to,
    messages: thread.messages,
    style: style
  };

  handlebars.registerHelper('eachlimited', function(context, options) {
    var ret = '';
    var num = number > 0 ? Math.min(number, context.length) : context.length;
    for (var i=0; i<num; i++) {
      ret = ret + options.fn(context[i]);
    }
    return ret;
  });

  handlebars.registerHelper('format', function(date) {
    return (new Moment(date)).utcString();
  });

  handlebars.registerHelper('prettyFormat', function(date, options) {
    return (new Moment(date)).utcPrettyString('en', options.hash['time']);
  });

  handlebars.registerHelper("replaceName", function(message, options) {
    if (this.user === 'Tobbis Bälch') {
      return options.hash['first-letter'] ? 'T' : 'Tobias';
    }
    if (this.user === 'Cynthia García Zermeño') {
      return options.hash['first-letter'] ? 'C' : 'Cynthia';
    }
    return '';
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

  var template = type === 'book' ? 'templates/book.html' : 'templates/base.html';

  fs.readFile(template, 'utf-8', function(err, source) {

    if (err) {
      console.log('Error while processing ' + template + ": " + err);
      process.exit();
    }

    var base = handlebars.compile(source);
    var html = base(data);

    fs.writeFile(thread.name +'-'+ type +'.html', html);
  });
};


fs.readFile(input, "utf-8", receiveFile);
