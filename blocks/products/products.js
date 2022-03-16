import { lookupPages, readBlockConfig } from '../../scripts/scripts.js';
import { createProductCard } from '../product-carousel/product-carousel.js';

export default async function decorate(block) {
  let config = [...document.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  if (!config.length) config = readBlockConfig(block);
  const products = await lookupPages(config);
  block.textContent = '';
  products.forEach((product) => {
    block.append(createProductCard(product, 'products'));
  });
}
