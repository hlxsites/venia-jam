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
  cart.setAttribute('data-sfsdk-cart', '');

  decorateBlock(cart);
  loadBlock(cart);

  /**
   * Load the StorefrontSDK script that will populate the div created above.
   * <script type="module">
   *    import 'http://localhost:3001/storefront-sdk-cart.bundle.js';
   *
   *    StorefrontSDK.init({
   *      endpoint: 'https://graph.adobe.io/api/7f6c715a-35b6-4905-bd51-62c1ef973d68/graphql?api_key=commerce-graphql-onboarding',
   *    });
   * </script>
   */
  const sfsdkScript = document.createElement('script');
  sfsdkScript.type = 'module';
  sfsdkScript.innerText = `
  import 'http://localhost:3001/storefront-sdk-widget.bundle-v0.1.0.js';
    
    StorefrontSDK.init({
      endpoint: 'https://graph.adobe.io/api/7f6c715a-35b6-4905-bd51-62c1ef973d68/graphql?api_key=commerce-graphql-onboarding',
    });
  `;

  document.body.append(sfsdkScript);
}
