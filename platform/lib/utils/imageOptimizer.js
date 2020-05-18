/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');

const Image = require('@11ty/eleventy-img');

const DEFAULT_IMG_FORMAT = 'jpeg';

const baseDir = path.join(__dirname, '../../..');
const imageBaseDir = path.join(baseDir, 'pages');
const outputDir = path.join(baseDir, 'dist/static/img');

const globalOpts = {
  urlPath: '/static/img/',
  outputDir,
};

/**
 * Resizes the image specified at the given src URL to the given width. Images
 * specified via an absolute URL will be downloaded and cached locally.
 *
 * @param {string} src - the original img's src URL
 * @param {number} width  - the target width
 */
const imageOptimizer = async (src, width) => {
  const format = extractImageFormat(src);
  try {
    const opts = Object.assign({}, globalOpts, {
      formats: [format, ...(globalOpts.formats || [])],
      widths: [width],
    });
    if (!isAbsoluteUrl(src)) {
      src = path.join(imageBaseDir, src);
    }
    // Resizes, compresses the image (and download if needed).
    const stats = await Image(src, opts); // eslint-disable-line
    return stats[format][0].url;
  } catch (e) {
    console.log(`Could not optimize image (${src}, ${width}w):`, e);
    // Don't generate a srcset entry for this image / width.
    return null;
  }
};

function extractImageFormat(src) {
  const fileExtension = path.extname(src);
  if (!fileExtension) {
    return DEFAULT_IMG_FORMAT;
  }
  let format = fileExtension.substring(1);
  if (format === 'jpg') {
    format = 'jpeg';
  }
  return format;
}

function isAbsoluteUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (ex) {}

  return false;
}

module.exports = imageOptimizer;
