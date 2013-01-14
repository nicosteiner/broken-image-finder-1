var BIF = BIF || {};

var pageMod = require('page-mod');
var data = require('self').data;
var chrome = require('chrome');
var windows = require('windows').browserWindows;
var panel = require('panel');
var request = require('request').Request;
var prefSet = require('simple-prefs');

var prefHideToolbarIcon = prefSet.prefs.hideToolbarIcon;
var pref403 = prefSet.prefs.alert403;
var prefDataURI = prefSet.prefs.showDataURI;

// define the prefs change callback

prefSet.on('hideToolbarIcon', function () {

  prefHideToolbarIcon = prefSet.prefs.hideToolbarIcon;

});

prefSet.on('alert403', function () {

  pref403 = prefSet.prefs.alert403;

});

prefSet.on('showDataURI', function () {

  prefDataURI = prefSet.prefs.showDataURI;

});

// panel for detail view

BIF.AddonPanel = panel.Panel({

  width: 300,
  height: 400,

  type: 'arrow',
  
  contentURL: data.url('bifPanel.html'),
  
  contentScriptFile: data.url('bifPanel.js')

});

BIF.AddonPanel.showToolbarIcon = function () {

  var doc, toolbar, button, bifExtensionButton;

  doc = chrome.components.classes['@mozilla.org/appshell/window-mediator;1'].getService(chrome.components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser').document;

  toolbar = doc.getElementById('nav-bar');

  bifExtensionButton = doc.getElementById('bif-extension');

  if (toolbar) {

    // make sure there is only one button

    if (bifExtensionButton) {

      bifExtensionButton.parentNode.removeChild(bifExtensionButton);

    }

    if (prefHideToolbarIcon === false) {

      button = doc.createElement('toolbarbutton');

      BIF.AddonPanel.addonButton = button;
      
      toolbar.appendChild(button);

      button.setAttribute('label', 'Broken-Image-Finder');

      button.id = 'bif-extension';

      button.image = data.url('img/bif-logo-16.png');

      button.className = ' bif-extension toolbarbutton-1 chromeclass-Toolbar-Additional chromeclass-toolbar-additional ';

      button.onclick = function(e) {

        BIF.AddonPanel.show(BIF.AddonPanel.addonButton);

      };

    }

  }

};

windows.on('open', function() {

  BIF.AddonPanel.showToolbarIcon();

});

// dial the resourceChecker-script

pageMod.PageMod({

  include: '*',

  contentScriptFile: data.url('resourceChecker.js'),

  onAttach: function (worker) {

    BIF.AddonPanel.showToolbarIcon();

    BIF.AddonPanel.postMessage({

      command: "clear-panel",

      data: null

    });

    worker.port.emit('getResults');

    worker.port.on('getHTTPStatusCode', function (webResource) {

      var url = webResource[0];

      if (request && url && typeof url === 'string') {

        try {

          request({

            url: url,

            onComplete: function (response) {

              // everything else than "found" triggers an error

              if (response.status !== 200) {

                webResource[3] = response.status;

                // optional display 403 in notification popup

                if (response.status === 403) {

                  if(pref403 === true) {

                    worker.port.emit('brokenImageFound', url);

                  }

                } else {

                  worker.port.emit('brokenImageFound', url);

                }

                BIF.AddonPanel.postMessage({

                  command: "add-resource-info",

                  data: webResource

                });

              }

            }

          }).get();

        } catch (e) {

          console.log(e);

        }

      }

    });

    worker.port.on('getResponseText', function (webResource) {

      var url = webResource[0];

      if (request && url && typeof url === 'string') {

        request({

          url: url,

          onComplete: function (response) {

            if (response.status === 200 && response.text) {

              // transmit the response.text and source

              worker.port.emit('gotResponseText', {

                responseText: response.text,

                webResource: webResource

              });

            }

          }

        }).get();

      }

    });

    // if notification popup gets clicked

    worker.port.on('showPanel', function () {

      BIF.AddonPanel.show(BIF.AddonPanel.addonButton);

    });

    // handle 'exceptions' e.g. Data-URIs

    worker.port.on('gotException', function (exceptionDetail) {

      if (exceptionDetail[1] === 'That\'s a Data-URI.') {

         if (prefDataURI === true) {

          worker.port.emit('brokenImageFound', exceptionDetail[0]);

          BIF.AddonPanel.postMessage({

            command: "add-exception-info",

            data: exceptionDetail

          });

        }

      } else if (exceptionDetail[1] === 'Too much backward jumps.') {

        worker.port.emit('brokenImageFound', exceptionDetail[0]);

        BIF.AddonPanel.postMessage({

          command: "add-exception-info",

          data: exceptionDetail

        });

      }

    });

  }

});

// show toolbar icon on addon load (as seen in SenSEO extension code base)

BIF.AddonPanel.showToolbarIcon();