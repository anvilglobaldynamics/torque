
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const hashFiles = require('hash-files');

let getHash = (absolutePath) => {
  // return fs.statSync(absolutePath).mtime.getTime();
  return hashFiles.sync({
    algorithm: 'sha1',
    files: [absolutePath]
  });
}

let processFile = (absolutePath) => {
  console.log("PROCESSING:", absolutePath);
  let rootDir = path.dirname(absolutePath);
  let contents = fs.readFileSync(absolutePath, 'utf8');
  let $ = cheerio.load(contents);

  $('script').each((i, rawEl) => {
    let el = $(rawEl);
    if (el.attr('src') && !el.attr('src').includes('http')) {
      let hash = getHash(path.join(rootDir, el.attr('src')));
      let src = el.attr('src') + '?hash=' + hash;
      el.attr('src', src);
    }
  });

  $('link[rel="stylesheet"]').each((i, rawEl) => {
    let el = $(rawEl);
    if (el.attr('href') && !el.attr('href').includes('http')) {
      let hash = getHash(path.join(rootDir, el.attr('href')));
      let href = el.attr('href') + '?hash=' + hash;
      el.attr('href', href);
    }
  });

  $('link[rel="import"], link[rel="lazy-import"]').each((i, rawEl) => {
    let el = $(rawEl);
    if (el.attr('href') && !el.attr('href').includes('http')) {
      let subPath = path.join(rootDir, el.attr('href'));
      processFile(subPath);
      let hash = getHash(subPath);
      let href = el.attr('href') + '?hash=' + hash;
      el.attr('href', href);
    }
  });

  let modifiedContents = $.html();

  fs.writeFileSync(absolutePath, modifiedContents);
}

exports.hashLinks = (rootDir) => {
  processFile(path.join(rootDir, 'index.html'));
}