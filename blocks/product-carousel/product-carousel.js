import { lookupPages, createOptimizedPicture } from '../../scripts/scripts.js';

function createProductCard(product, prefix) {
  const card = document.createElement('div');
  card.className = `${prefix}-card`;
  card.innerHTML = `
    <h4>${product.title}</h4>
    <p>$48.00</p>
    <p><a class="button" href=${product.path}>Add to cart</a></p>`;
  const a = document.createElement('a');
  a.href = product.path;
  a.append(createOptimizedPicture(product.image, product.title, false, [{ width: 400 }]));
  card.prepend(a);
  return (card);
}

export default async function decorate(block) {
  const pathnames = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  const pages = await lookupPages(pathnames);
  block.textContent = '';
  pages.forEach((page) => {
    block.append(createProductCard(page));
  });
}
