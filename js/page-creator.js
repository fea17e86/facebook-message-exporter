function convertToPages($elements, $target, options) {

  options = options || {};
  options.createHeader = options.createHeader || function(pageElements, pageIndex) { return ''; };
  options.createFooter = options.createFooter || function(pageElements, pageIndex) { return pageIndex > 0 ? pageIndex : ''; };
  options.contentWidth = options.contentWidth || 675;
  options.contentHeight = options.contentHeight || 1111;

  var pages = fillPages($elements.toArray(), options);
  for (var i=0; i<pages.length; i++) {
    $target.append(pages[i]);
  }

  if (options.callback) {
    options.callback($elements, $target, options);
  }
}

function fillPages(elements, options) {
  var pages = [];
  var length = elements.length;
  var index = 0;

  while (elements.length > 0) {
    var page = fillPage(elements, index, options);
    if (page) {
      pages.push(page);
      index++;
    } else {
      return pages;
    }
  }
  return pages;
}

function fillPage(elements, index, options) {
  var $page = $('<div class="page">' +
    '<div class="page-header">Header</div>' +
    '<div class="page-content"></div>' +
    '<div class="page-footer">'+ (index + 1) +'</div>' +
  '</div>');
  var $pageHeader = $page.children('.page-header');
  var $pageContent = $page.children('.page-content');
  var $pageFooter = $page.children('.page-footer');

  var height = 0;

  while (height < options.contentHeight && elements.length > 0) {
    var $element = $(elements.shift()).outerWidth(options.contentWidth);
    var eHeight = $element.outerHeight(true);

    if (height + eHeight <= options.contentHeight) {
      $pageContent.append($element);
      height += eHeight;
    } else {
      elements.unshift($element[0]);
      break;
    }
  }

  $pageHeader.html(options.createHeader($pageContent.children().toArray(), index));
  $pageFooter.html(options.createFooter($pageContent.children().toArray(), index));

  return $page;
}
