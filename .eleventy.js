const UglifyJS = require('uglify-js');
// Example use for the demo plugin:
// Uses transform to hook into head, and body tags.

// Define defaults for your plugin config
const defaults = {
  api: 'https://your-domain.com/.netlify/functions/doorbell',
};

module.exports = (eleventyConfig, _options) => {
  // Combine defaults with user defined options
  const options = {
    ...defaults,
    ..._options,
  };

  const script = `
  (function(window, api) {
    try {
      if (!window) return;

      var con = window.console;
      var doc = window.document;
      var loc = window.location;
      var nav = window.navigator;
      var stringify = JSON.stringify;
      var addEventListenerFunc = window.addEventListener;
      var undefinedVar = undefined;
      var encodeURIComponentFunc = encodeURIComponent;
      var errorText = "error";
      var pagehide = "pagehide";
      var thousand = 1000;
      var start = Date.now();
      var msHidden = 0;
      var scrolled = 0;

      var warn = function(message) {
        if (con && con.warn) con.warn("Doorbell Brthlmy.com:", message);
      };

      var now = Date.now;

      var seconds = function(since) {
        return Math.round((Date.now() - (since || 0)) / thousand);
      };

      var serialize = function(data) {
        return Object.keys(data)
          .map(function(key) {
            return data[key] != undefinedVar
              ? encodeURIComponentFunc(key) +
                  "=" +
                  encodeURIComponentFunc(data[key])
              : "";
          })
          .join("&");

      };

      var timezone;
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {
        /* Do nothing */
      }

      function sendData(data) {
        data.time = seconds();
        new Image().src = api + "?" +  serialize(data);
      }

     // listen to errors
     addEventListenerFunc(
      errorText,
        function(event) {
          if (event.filename && event.filename.indexOf(api) > -1) {
            sendError(event.message);
          }
        },
        false
      );

      // Send errors
      function sendError(errorOrMessage) {
        warn(errorOrMessage.message || errorOrMessage);
        sendData({
          type: errorText,
          error: errorOrMessage
        });
      }

      var sendOnLeave = function() {
        var append = { type: "append", time: seconds() };
        msHidden = 0;
        start = 0;

        append.scrolled = Math.max(0, scrolled, position());
        append.duration = seconds(start + msHidden);

        if(nav.sendBeacon) {
           nav.sendBeacon(api + "?" + stringify(append), { type: 'append' });
        } else {
          sendData(append);
        }
      };

      var hiddenStart;
      window.addEventListener(
        "visibilitychange",
        function () {
          if (doc.hidden) {
            if (!("on" + pagehide in window)) sendOnLeave();
            hiddenStart = now();
          } else msHidden += now() - hiddenStart;
        },
        false
      );

      addEventListenerFunc(pagehide, sendOnLeave, false);

      var scroll = "scroll";
      var body = doc.body || {};
      var documentElement = doc.documentElement || {};
      var position = function() {
        try {
          var Height = "Height";
          var scrollHeight = scroll + Height;
          var offsetHeight = "offset" + Height;
          var clientHeight = "client" + Height;
          var documentClientHeight = documentElement[clientHeight] || 0;
          var height = Math.max(
            body[scrollHeight] || 0,
            body[offsetHeight] || 0,
            documentElement[clientHeight] || 0,
            documentElement[scrollHeight] || 0,
            documentElement[offsetHeight] || 0
          );
          return Math.min(
            100,
            Math.round(
              (100 * ((documentElement.scrollTop || 0) + documentClientHeight)) /
                height /
                5
            ) * 5
          );
        } catch (error) {
          return 0;
        }
      };

      addEventListenerFunc("load", function() {
        scrolled = position();
        addEventListenerFunc(
          scroll,
          function() {
            if (scrolled < position()) scrolled = position();
          },
          false
        );
      });


      const { pathname, search, hash } = loc;
      const { referrer } = doc;
      const { language, platform, userAgent, userAgentData: { mobile, brands, platform: os } } = nav;
      const { width, height } = window.screen;

      sendData({ pathname, search, hash,
                 referrer, timezone, language,
                 userAgent,
                 screen: stringify({ height, width}),
                 brands: stringify(brands),
                 platform: stringify({platform, os, mobile}) });
    } catch(e) {
      sendError(e);
      warn(e);
    }

  })(window,'${options.api}');
    `;

  const noscript = `
    <noscript>
      <img
        src="${options.api}?noscript"
        alt="doorbell"
        width="0"
        height="0"
        hidden
        decoding="async"
        loading="eager"
      />
    </noscript>`;

  const MINIFY_OPTIONS = {
    warnings: false,
    ie8: true,
    toplevel: true,
    nameCache: null,
  };

  eleventyConfig.addTransform('doorbell', (content, outputPath) => {
    if (outputPath && outputPath.endsWith('.html')) {
      return [
        content
          .split('</head>')
          .join(`</head>${noscript}`)
          .split('</body>')
          .join(
            `<script>${
              UglifyJS.minify(script, {
                ...MINIFY_OPTIONS,
                compress: false,
                mangle: {toplevel: true},
              }).code
            }</script></body>`,
          ),
      ].join('');
    }
    return content;
  });
};
