var fs = require('fs');
var cheerio = require('cheerio');

var argv = require('optimist').usage(
        'Usage: $0 -i [threads.json] -o [thread_summary_files] -u [users]').demand(
        [ 'i', 'o', 'u' ]).argv;

var input = argv.i;
var output = argv.o;
var users = argv.u;


var summary = [];

var file_read = function(err, data) {
    if (err) {
        console.log("Error while processing " + input + ": " + err)
        process.exit()
    }

    var json = JSON.parse(data);

    if (Array.isArray(json)) {
      for (var i=0; i<json.length; i++) {
        var threadUsers = json[i].users;
        var matches = true;
        if (threadUsers === users) {
          summary.push({ users: threadUsers, messages: json[i].messages.length });
        }
      }
    }

    console.log(summary);

    fs.writeFile(output, JSON.stringify(summary));
};

fs.readFile(input, "utf-8", file_read);
