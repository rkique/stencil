#!/usr/bin/env node

/*
Extract all URLs from a web page.
Usage: page.html > ./getURLs.js <base_url>
*/
// outputs persist in urls.txt


const readline = require('readline');
const {JSDOM} = require('jsdom');
const {URL} = require('url');

// argv: [node exec, script, arg1, arg2, ...]
let baseURL = process.argv[2];

if (baseURL.endsWith('index.html')) {
  baseURL = baseURL.slice(0, baseURL.length - 'index.html'.length);
} else {
  baseURL += '/';
}

const rl = readline.createInterface({
  input: process.stdin,
});

let html = '';
rl.on('line', (line) => {
  // 2. Read HTML input from standard input (stdin) line by line using the `readline` module.
  html += `${line}\n`;
});

rl.on('close', () => {
  // 3. Parse HTML using jsdom
  const dom = new JSDOM(html);
  const document = dom.window.document;
  let anchors = document.querySelectorAll('a');
  const hasHref = (anchor) => {
    return anchor.getAttribute('href') != null;
  };
  anchors = Array.from(anchors).filter(hasHref);
  const hrefs = anchors.map((anchor) => anchor.href);
  for (const href of hrefs) {
    console.log(`${baseURL}${href}`);
  }
});


