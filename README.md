# Canned Text jQuery plugin

Resizes text to make it fit completely inside fixed size (width and height) text boxes.

One of the many approaches to create responsive internet content is to have a full page
content (i.e. a page that fits completely in the device screen without scrolling) or even
page segmented content like those created using [fullpage.js](http://alvarotrigo.com/fullPage/).

The challenge here is not the box layout but making the text fit inside boxes at
all resolutions. Techniques like using `vh`, `vw` or `vmin` for the font size are
somewhat helpful but sometimes the text will still bleed and some other times it will
leave lots of blank spaces besides leaving our CSS crowded with media queries and
complex rules.

This is where `Canned Text` comes into play. Just apply `canText` to any selector and your
text will be "canned" completely inside the container. You just have to worry about the
box layout.

[![build status](https://gitlab.com/juank-pa/canned-text/badges/master/build.svg)](https://gitlab.com/juank-pa/canned-text/commits/master)

## How to
Just use this simple setup:
```html
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
<script src="jquery.canned-text.js"></script>
<script>
  $("#responsive_text").canText();
</script>
```
This will let text to wrap into the box and will adjust it vertically to can it into the container.

If what you want is to fit text vertically and horizontally without wrapping it use:
```js
$("#nowrap_text").canText({ nowrap: true });
```

## Bower
If you are using bower you can install this plugin with:
```bash
bower install jquery-canned-text
```

## FAQ
- :warning: Run canned text before anything that hides the element. A hidden element does
  not have width or height.
- :warning: Make sure your containers have a width and a height other than `auto`.
  - Use `display: block` or `display: inline-block` for the container.
  - Percentage, `ems` and viewport values are valid for width and height.
- Do not set fixed `font-size` values for elements inside the container otherwise the canning
  process will be cancelled.
- Set a no-js fallback `font-size` in your CSS.
- Containers with only non-text content (e.g. img) will not be canned.
- This plugin uses a brute force algorithm to try to fit the text into the container. If the
  content doesn´t seem to be resizing then the canning will be cancelled.
- If your application has lots of non-relative styles that affect this plugin you can include
  the canned text CSS which contains defaults for the most common HTML elements inside
  canned containers.

    ```html
<link rel="stylesheet" type="text/css" href="jquery.canned-text.css">
    ```

  You can then override any style you want by creating a selector for your elements inside the
  `.canned-text` selector. e.g.

    ```html
<style>
.canned-text h1 {
  /* ... */
}
</style>
    ```

- Nowrap canned content can still wrap (via custom CSS) but the container will still
  try to can any remaining non-wrapping content. You can also use `<br>` elements.

## Running tests
If you want to run tests simply open `test/index.html` in a browser.
