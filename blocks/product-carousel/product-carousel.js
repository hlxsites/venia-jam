import { lookupPages, createOptimizedPicture, fetchPlaceholders } from '../../scripts/scripts.js';

export function createProductCard(product, prefix, ph) {
  const card = document.createElement('div');
  card.className = `${prefix}-card`;
  card.innerHTML = `
    <h4>${product.title}</h4>
    <p>${product.price}</p>
    <p><a class="button" href=${product.path}>${ph.addToCart}</a></p>`;
  const a = document.createElement('a');
  a.href = product.path;
  a.append(createOptimizedPicture(product.image, product.title, false, [{ width: 400 }]));
  card.prepend(a);
  return (card);
}

export default async function decorate(block) {
  const ph = await fetchPlaceholders();
  const pathnames = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  const pages = await lookupPages(pathnames);
  block.textContent = '';
  pages.forEach((page) => {
    block.append(createProductCard(page, 'product-card', ph));
  });
}
