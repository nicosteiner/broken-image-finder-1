// if any command get received
self.on('message', function(commandMessage) {

  var i,
      url,
      urlOrigin,
      urlType,
      status,
      line,
      container,
      resourceInfos,
      infoSpan,
      infoSpanText,
      noResults,
      linkDiv,
      urlSpan,
      urlSpanText,
      statusSpan,
      statusSpanText,
      moreInfoSpan,
      moreInfoSpanText,
      toggleElem,
      detailDiv,
      detailParagraph,
      detailParagraphBreak,
      detailDivText1,
      detailDivText1Span,
      detailDivText2,
      detailDivText2Span;

  // process command messages

  if (commandMessage.command === 'clear-panel') {

    container = document.getElementById('results');

    while (container.firstChild) {

      container.removeChild(container.firstChild);

    }

    //create a noResultMessage

    infoSpan = document.createElement('span');
    infoSpan.className = 'noResultMessage';

      infoSpanText = document.createTextNode('there are no broken images...');

    infoSpan.appendChild(infoSpanText);

    container.appendChild(infoSpan);


  } else if (commandMessage.command === 'add-resource-info') {

    container = document.getElementById('results');

    // remove noResultMessage if it exists

    noResults = document.getElementsByClassName('noResultMessage');

    for (i = 0; i < noResults.length; i += 1) {

      container.removeChild(noResults[i]);

    }

    resourceInfos = commandMessage.data;

    url = resourceInfos[0];
    urlOrigin = resourceInfos[1];
    urlType = resourceInfos[2];
    status = resourceInfos[3];

    line = resourceInfos[4];

    if (typeof line === 'undefined') {

      line = '';

    } else {

      line = ' (' + line + ')';
    }

    // create HTML frame

    linkDiv = document.createElement('div');
    linkDiv.className = 'resultElement';
/*
    if (status === 403) {

      linkDiv.style.backgroundColor = '#cd853f';

    } else if (status === 404 || status === 410 || status === 204) {

      linkDiv.style.backgroundColor = '#ffbaba';

    }
*/

    // url info container

    urlSpan = document.createElement('span');
    urlSpan.className = 'url';

    // this even works when lastIndexOf('/') === -1
    urlSpanText = document.createTextNode(url.substring(url.lastIndexOf('/') + 1, url.length));

    urlSpan.appendChild(urlSpanText);

    // status info container

    statusSpan = document.createElement('span');
    statusSpan.className = 'status error-' + status;

    statusSpanText = document.createTextNode(status);

    statusSpan.appendChild(statusSpanText);

    // more link container

    moreLinkSpan = document.createElement('span');
    moreLinkSpan.className = 'moreinfo';

    moreLinkSpanText = document.createTextNode('more');

    moreLinkSpan.appendChild(moreLinkSpanText);

    // toggle details
    moreLinkSpan.onclick = function() {

      // get the 'secondChild'
      toggleElem = this.nextSibling;

      if (toggleElem.style.display === 'none') {

        toggleElem.style.display = 'block';

      } else {

        toggleElem.style.display = 'none';

      }

    };

    detailDiv = document.createElement('div');
    detailDiv.className = 'details';
    detailDiv.style.display = 'none';

    detailParagraph = document.createElement('p');

    detailDivText1Span = document.createElement('span');
    detailDivText1Span.className = 'fullUrl';
    detailDivText1 = document.createTextNode('Full URL: ' + url);
    detailDivText1Span.appendChild(detailDivText1);
    detailParagraph.appendChild(detailDivText1Span);

    detailDivText1Span = document.createElement('span');
    detailDivText1Span.className = 'source';
    detailDivText1 = document.createTextNode('Source: ' + urlType);
    detailDivText1Span.appendChild(detailDivText1);
    detailParagraph.appendChild(detailDivText1Span);

    detailDivText1Span = document.createElement('span');
    detailDivText1Span.className = 'line';
    detailDivText1 = document.createTextNode('Line: ' + line);
    detailDivText1Span.appendChild(detailDivText1);
    detailParagraph.appendChild(detailDivText1Span);

    detailDivText2Span = document.createElement('span');
    detailDivText1Span.className = 'file';
    detailDivText2 = document.createTextNode('File: ' + urlOrigin);
    detailDivText2Span.appendChild(detailDivText2);
    detailParagraph.appendChild(detailDivText2);

    detailDiv.appendChild(detailParagraph);

    linkDiv.appendChild(urlSpan);
    linkDiv.appendChild(statusSpan);
    linkDiv.appendChild(moreLinkSpan);
    linkDiv.appendChild(detailDiv);

    if (container) {

      container.appendChild(linkDiv);

    }

  } else if (commandMessage.command === 'add-exception-info') {

    container = document.getElementById('results');

    // remove noResultMessage if it exists

    noResults = document.getElementsByClassName('noResultMessage');

    for (i = 0; i < noResults.length; i += 1) {

      container.removeChild(noResults[i]);

    }

    exceptionInfos = commandMessage.data;

    url = exceptionInfos[0];
    description = exceptionInfos[1];

    // create HTML frame

    linkDiv = document.createElement('div');
    linkDiv.className = 'resultElement';
    linkDiv.style.backgroundColor = '#cd853f';

    urlSpan = document.createElement('span');

      urlSpanText = document.createTextNode(url + ' throws exception: ' + description);

    urlSpan.appendChild(urlSpanText);

    linkDiv.appendChild(urlSpan);

    if (container) {

      container.appendChild(linkDiv);

    }

  } else {

    console.log("unknown command");

  }
});