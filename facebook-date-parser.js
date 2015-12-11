var Moment = Moment || require('./Moment.js').Moment;

var FBDP = {

  timeSeparator: 'um',

  parse: function(dateString) {
    if (dateString) {
      try {
        var tokens = dateString.replace(' ' + this.timeSeparator, '').split(' ');
      } catch (e) {
        console.log('parse', dateString);
      }
      var date = new Moment();
      for (var i=1; i<tokens.length; i++) {
        switch(i) {
          case 1:
            date.day = this.parseDay(tokens[i]);
            break;
          case 2:
            date.month = this.parseMonth(tokens[i]);
            break;
          case 3:
            date.year = this.parseYear(tokens[i]);
            break;
          case 4:
            var time = this.parseTime(tokens[i]);
            date.hours = time.hours;
            date.minutes = time.minutes;
            break;
          case 5:
            date.utc = this.parseUTC(tokens[i]);
            if (date.utc) { date.hours -= date.utc; }
            break;
          default:;
        }
      }
      return date;
    }
  },

  parseDay: function(dayString) {
    return parseInt(dayString);
  },

  parseMonth: function(monthString) {
    return Moment.months.de.indexOf(monthString);
  },

  parseYear: function(yearString) {
    return parseInt(yearString);
  },

  parseTime: function(timeString) {
    var tokens = timeString.split(':');
    return { hours: parseInt(tokens[0]), minutes: parseInt(tokens[1]) };
  },

  parseUTC: function(utcString) {
    var newString = utcString.replace('UTC', '');
    return parseInt(newString);
  }
};

exports.FBDP = FBDP;
