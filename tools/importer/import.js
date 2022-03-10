/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console, class-methods-use-this */

const MAIN_SELECTOR = '.main-page-3Fo';
const IMAGE_CONTAINER = '.carousel-root-3Sd';
const DESCRIPTION_CONTAINER = '.richContent-root-2XB';
const PRICE_CONTAINER = '.productFullDetail-productPrice-2Ob';
const FASHION_ITEMS_FINDER = '.productFullDetail-options-riy .option-root-20v';
const FASHION_ITEMS = 'button';
const SKU_SELECTOR = '.productFullDetail-details-2Ih strong';

const COLOR_CODES = {
  Peach: 'pe',
  Khaki: 'kh',
  Rain: 'rn',
  Mint: 'mt',
  Lily: 'ly',
  Lilac: 'll',
  Latte: 'la',
}

const makeAbsoluteLinks = (main) => {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      const u = new URL(a.href, 'https://venia-jam--hlxsites.hlx3.page/');
      a.href = u.toString();
    }
  });
}


function moveDescription(main, document) {
  const descr = main.querySelector(DESCRIPTION_CONTAINER);
  const h1 = document.querySelector('h1');
  if (descr && h1) {
    h1.after(descr);
  }
}

function createProductDataBlock(main, document) {
  const result = {};
  const data = [['Product Data']];

  const sku = main.querySelector(SKU_SELECTOR);
  if (sku) {
    result.sku = sku.textContent
    data.push(['SKU', sku.textContent]);
  }

  const price = main.querySelector(PRICE_CONTAINER);
  if (price) {
    result.price  = price.textContent;
    data.push(['Price', price.textContent]);
  }

  const fashionFinder = main.querySelectorAll(FASHION_ITEMS_FINDER);
 
  if (fashionFinder) {
    fashionFinder.forEach((ff) => {
      const fashion = ff.textContent;
      const ffItems = ff.querySelectorAll(FASHION_ITEMS);
      if (ffItems) {
        const items = Array.from(ffItems).map((item) => item.title);
        if (fashion.startsWith('Fashion Color')) {
          result.colors = items;
          data.push(['Colors', items.join(', ')]);
        } else if (fashion.startsWith('Fashion Size')) {
          result.sizes = items;
          data.push(['Sizes', items.join(', ')]);
        } else {
          console.warn('Unknown fashion item:', fashion);
        }
      }
    });
  }

  const table = WebImporter.DOMUtils.createTable(data, document);
  
  const descr = main.querySelector(DESCRIPTION_CONTAINER);
  const h1 = document.querySelector('h1');

  if (descr) {
    descr.after(table);
  } else {
    descr.after(h1);
  }

  return result;
}

function createImagesBlock(main, document, colors = []) {
  const container = main.querySelector(IMAGE_CONTAINER);
  if (container) {
    const data = [['Images']];
    const imgs = container.querySelectorAll('img');
    const allImages = [];
    if (imgs) {
      imgs.forEach((img) => {
        if (img.src && !img.src.startsWith('data:')) {
          if (img.srcset) {
            const split = img.srcset.replace(/\s+[0-9]+(\.[0-9]+)?[wx]/g, "").split(/,\n/);
            img.src = split[split.length-1];
            img.src = img.src.replace('main_1', 'main').replace('main_2', 'main');
            img.removeAttribute('srcset');
            img.removeAttribute('width');
            img.removeAttribute('height');
            img.removeAttribute('sizes');
            img.removeAttribute('class');
          }

          if (!allImages.includes(img.src) && (img.src.includes('-') || colors.length === 0)) {
            data.push([img]);
            allImages.push(img.src)
          }
        }
      });
    }

    const srcRef = allImages[0];
    const root = srcRef.substring(0, srcRef.indexOf('-'));
    const end = srcRef.substring(srcRef.indexOf('_')).replace('_1', '').replace('_2', '');
    colors.forEach((color) => {
      const code = COLOR_CODES[color];
      if (!code) {
        console.warn(`Unknown code for color: ${color}`);
      } else {
        const newSrc = `${root}-${code}${end}`;
        if (!allImages.includes(newSrc)) {
          const img = document.createElement('img');
          img.src = newSrc;
          data.push([img]);
        }
      }
      
    });

    const table = WebImporter.DOMUtils.createTable(data, document);
    container.replaceWith(table);
  }
}

function createMetadata(main, document) {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[name="description"]');
  if (desc) {
    meta.Description = desc.content;
  }
  
  const author = document.querySelector('[name="author"]');
  if (author) {
    meta.Author = author.content;
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  transformDOM: (document) => {
    const main = document.querySelector(MAIN_SELECTOR);

    moveDescription(main, document);
    const productData = createProductDataBlock(main, document);
    createImagesBlock(main, document, productData.colors);
    makeAbsoluteLinks(main);

    WebImporter.DOMUtils.remove(main, [
      '.breadcrumbs-root-3nF',
      '.option-selection-Mcv',
      '.productFullDetail-quantity-lZ3',
      '.productFullDetail-actions-bS9',
      '.productFullDetail-descriptionTitle-3f3',
      '.productFullDetail-sectionTitle-2sn',
      '.productFullDetail-description-21i',
      '.productFullDetail-options-riy',
      '.productFullDetail-details-2Ih',
      PRICE_CONTAINER,
    ]);
    

    return main;

  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  generateDocumentPath: (url) => {
    return new URL(url).pathname.replace(/\.html$/, '');
  },
}