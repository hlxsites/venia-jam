import {
  makeLinksRelative,
  readBlockConfig,
  decorateBlock,
  loadBlock,
} from '../../scripts/scripts.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  const html = await resp.text();

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.innerHTML = html;
  makeLinksRelative(nav);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((e, j) => {
    nav.children[j].classList.add(`nav-${e}`);
  });

  const navSections = [...nav.children][1];

  navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
    if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
    navSection.addEventListener('click', () => {
      const expanded = navSection.getAttribute('aria-expanded') === 'true';
      collapseAllNavSections(navSections);
      navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    document.body.style.overflowY = expanded ? '' : 'hidden';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  block.append(nav);

  /* init cart */
  const cart = block.querySelector('.icon-cart').closest('li');
  cart.classList.add('cart');

  // StorefrontSDK
  window.addEventListener('StorefrontSDKReady', () => {
    // Toggle Cart Panel
    cart.onclick = () => window.StorefrontSDK.togglePanel('cart');

    // Cart Count Indicator
    window.StorefrontSDK.cartItemsQuantity.watch((qty) => {
      cart.setAttribute('data-cart-qty', qty || '');
    });
  });

  const sfsdkScript = document.createElement('script');
  sfsdkScript.type = 'module';
  sfsdkScript.async = true;
  sfsdkScript.text = `
    import { render, api } from "https://storefront-widgets.s3.amazonaws.com/develop/storefront-sdk-widget.js";

    // Initialize
    const options = {
      endpoint: "https://graph.adobe.io/api/63e62e43-8eb8-45a2-b0f6-f7c3845093db/graphql?api_key=2c6d06bb3aef463db8485c88a90f563f",
      mesh: "storefrontstaticenvmesh"
    };

    render(options, document.body);
  `;

  document.body.append(sfsdkScript);

  decorateBlock(cart);
  loadBlock(cart);
}
