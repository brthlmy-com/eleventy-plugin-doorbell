## Usage

Tracking JS for doorbell google headless netlify analytics

Query String Parameters:

* pathname: /
* search:
* hash:
* referrer: http://localhost:3000/
* timezone: Europe/Amsterdam
* language: en-GB
* userAgent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36
* screen: {"height":1200,"width":1920}
* brands: [{"brand":"Brave","version":"113"},{"brand":"Chromium","version":"113"},{"brand":"Not-A.Brand","version":"24"}]
* platform: {"platform":"MacIntel","os":"macOS","mobile":false}
* time: 1685557808

```bash
$ yarn add brthlmy-com/eleventy-plugin-doorbell
```

Then, include it in your `.eleventy.js` config file:

```js
const doorbell = require('@brthlmy/eleventy-plugin-doorbell');

module.exports = eleventyConfig => {
  eleventyConfig.addPlugin(doorbell, {
    api: 'https://brthlmycom.netlify.app/.netlify/functions/doorbell',
  });
};
```

## Credits

- simpleanalytics.com for tracking scroll + sendOnLeave
