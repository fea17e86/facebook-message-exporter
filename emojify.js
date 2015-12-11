var altHex = require('./emoji-hex-map.js').hexValues;
var iconMap = require('./emoji-icon-map.js').iconValues;

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function emojify(text) {
  var notFound = [];

  if (text) {
    var newText = '';
    var chunks = text.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);
    for (var i=0, l=chunks.length; i<l; i++) {
      if (i % 2 === 0) {
        newText += chunks[i];
      } else {
        var pair = chunks[i];
        var hex = getHex(getCodepoint([pair.charCodeAt(0), pair.charCodeAt(1)]));
        if (hex) {
          var altHex = getAltHex(hex);
          if (altHex) {
            hex = altHex;
          } else {
            notFound.push(hex);
          }
          newText += '&#x' + hex + ';';
        } else {
          newTex += chunks[i];
        }
      }
    }
    text = newText;
  }
  for (icon in iconMap) {
    text = text.replace(new RegExp(escapeRegExp(icon), 'g'), '&#x' + iconMap[icon] + ';');
  }
  return { text: text, notFound: notFound };
}

function getCodepoint(pair) {
  if (pair && pair.length > 1) {
    return (
        0x10000
        | ((pair[0] - 0xD800) << 10)
        | (pair[1] - 0xDC00)
    );
  }
  return 0;
}

function getHex(codepoint) {
  if (codepoint) {
    return codepoint.toString(16).toUpperCase();
  }
  return '0';
}

function getAltHex(hex) {
  return hex.startsWith('1') ? hex : altHex[hex.toUpperCase()];
}

exports.emojify = emojify;
