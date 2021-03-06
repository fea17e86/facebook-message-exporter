function Moment(params) {
  params = params || {};

  this.day = 0;
  this.month = 0;
  this.year = 0;
  this.hours = 0;
  this.minutes = 0;
  this.seconds = 0;
  this.milliseconds = 0;
  this.utc = 0;

  if (params instanceof Date) {
    this.fromDate(params);
  } else if (typeof params === 'string') {
    this.fromString(params);
  } else {
    this.day = params.day || params.d || 0;
    this.month = params.month || params.m || 0;
    this.year = params.year || params.y || 0;
    this.hours = params.hours || params.hh || 0;
    this.minutes = params.minutes || params.mm || 0;
    this.seconds = params.seconds || params.ss || 0;
    this.milliseconds = params.milliseconds || params.ms || 0;
    this.utc = params.utc || 0;
  }
}

Moment.prototype.format = 'YYYY-MM-DDTHH:mm:ss';

Moment.prototype.toString = function(utc) {
  utc = utc || false;
  var year = Moment.stringWLZ(this.year, 4);
  var month = Moment.stringWLZ(this.month + 1, 2);
  var day = Moment.stringWLZ(this.day, 2);
  var hours = Moment.stringWLZ(this.hours + (utc ? 0 : (this.utc || 0)), 2);
  var minutes = Moment.stringWLZ(this.minutes, 2);
  return year +'-'+ month +'-'+ day +'T'+ hours +':'+ minutes;
};

Moment.prototype.valueOf = function() {
    return this.utcDate().getTime();
};

Moment.prototype.fromDate = function(date) {
  this.day = date.getUTCDate();
  this.month = date.getUTCMonth();
  this.year = date.getUTCFullYear();
  this.hours = date.getUTCHours();
  this.minutes = date.getUTCMinutes();
  this.seconds = date.getUTCSeconds();
  this.milliseconds = date.getUTCMilliseconds();
  this.utc = -(date.getTimezoneOffset() / 60);
};

Moment.prototype.fromString = function(string) {
  return this.fromDate(new Date(string));
};

Moment.prototype.date = function(utc) {
  utc = utc || false;
  return new Date(this.year, this.month, this.day, this.hours + (utc ? 0 : (this.utc || 0)), this.minutes, this.seconds, this.milliseconds);
};

Moment.prototype.utcDate = function() {
  return this.date(true);
};

Moment.prototype.string = function(utc) {
  utc = utc || false;
  var year = Moment.stringWLZ(this.year, 4);
  var month = Moment.stringWLZ(this.month + 1, 2);
  var day = Moment.stringWLZ(this.day, 2);
  var hours = Moment.stringWLZ(this.hours + (utc ? 0 : (this.utc || 0)), 2);
  var minutes = Moment.stringWLZ(this.minutes, 2);
  return day +'.'+ month +'.'+ year +' '+ hours +':'+ minutes;
};

Moment.prototype.utcString = function() {
  return this.string(true);
};

Moment.prototype.prettyString = function(lang, time, utc) {
  time = time || false;
  utc = utc || false;
  lang = (lang && Moment.months.lang) ? lang : 'en';

  var ret = this.day +'. '+ Moment.months[lang][this.month] +' '+ this.year;
  if (time) {
    var hours = Moment.stringWLZ(this.hours + (utc ? 0 : (this.utc || 0)), 2);
    var minutes = Moment.stringWLZ(this.minutes, 2);
    ret += ', '+ hours +':'+ minutes;
  }

  return ret;
};

Moment.prototype.utcPrettyString = function(lang, time) {
  return this.prettyString(lang, time, true);
};

Moment.prototype.json = function() {
  return this.string();
};

Moment.prototype.isMoment = function () { return true; }

Moment.months = {
  de: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember'
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
};

Moment.stringWLZ = function(number, size) {
  var numberString = '' + number;
  if (size > 0) {
    var tokens = numberString.split('.');
    size = size - tokens[0].length;
    if (size > 0) {
      for (var i=0; i<size; i++) {
        numberString = '0' + numberString;
      }
    }
  }
  return numberString;
};

exports.Moment = Moment;
