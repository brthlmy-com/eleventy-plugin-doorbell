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
      const src = '${options.api}';

      const { pathname, search, hash } = window.location;

      const params = new URLSearchParams();
      params.append('pathname', pathname);
      params.append('search', search);
      params.append('hash', hash);

      const img = document.createElement('img');
      img.src = [src, params].join('?');
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

  eleventyConfig.addTransform('doorbell', (content, outputPath) => {
    if (outputPath && outputPath.endsWith('.html')) {
      return [
        content.split('</head>').join(`</head>${noscript}`),
        content
          .split('</body>')
          .join(
            `${
              UglifyJS.minify(script, {
                compress: true,
                mangle: {toplevel: true},
              }).code
            }</body>`,
          ),
      ].join('');
    }
    return content;
  });
};
