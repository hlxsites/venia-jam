import {
  fetchPlaceholders,
  getMetadata,
  toClassName,
} from '../../scripts/scripts.js';

export default async function decorateProduct(block) {
  const ph = await fetchPlaceholders();
  const selectedModifiers = {};
  let selectedModifierImage;

  const getProduct = () => {
    const sku = getMetadata('sku');
    const price = +getMetadata('price').substring(1);
    const details = {};
    const usp = new URLSearchParams();
    const modkeys = Object.keys(selectedModifiers);
    modkeys.forEach((key) => {
      usp.append(key, selectedModifiers[key]);
      details[key] = selectedModifiers[key];
    });
    details.title = getMetadata('og:title');
    details.image = selectedModifierImage;
    return { sku, details, price };
  };

  const enableAddToCart = (enabled) => {
    const addToButton = block.querySelector('.product-addto button');
    const quantity = +block.querySelector('.product-quantity input').value;
    const modkeys = Object.keys(selectedModifiers);

    // Force Disabled
    if (typeof enabled === 'boolean') {
      addToButton.disabled = !enabled;
      return;
    }

    // Enable if Quantity has been selected
    if (modkeys.every((key) => selectedModifiers[key])) {
      if (quantity > 0) {
        addToButton.disabled = false;
        return;
      }
    }

    addToButton.disabled = true;
  };

  const selectImage = (picture) => {
    const images = picture.closest('.product-images');
    const wrapper = images.parentElement;
    const selectedImage = wrapper.querySelector('.product-selected-image');
    const buttons = wrapper.querySelector('.product-images-buttons');
    const index = [...images.children].indexOf(picture);
    const button = [...buttons.children][index];
    images.scrollTo({
      top: 0,
      left: picture.offsetLeft - images.offsetLeft,
      behavior: 'smooth',
    });

    [...images.children].forEach((r) => r.classList.remove('selected'));
    picture.classList.add('selected');

    [...buttons.children].forEach((r) => r.classList.remove('selected'));
    button.classList.add('selected');

    selectedImage.textContent = '';
    selectedImage.append(picture.cloneNode(true));
  };

  const createImages = (images) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'product-images-wrapper';
    const buttons = document.createElement('div');
    buttons.className = 'product-images-buttons';
    const div = document.createElement('div');
    div.className = 'product-images';
    images.forEach((image, i) => {
      image.picture.dataset.hints = image.hints;
      div.append(image.picture);
      image.picture.addEventListener('click', () => {
        selectImage(image.picture);
      });

      /* buttons */
      const button = document.createElement('button');
      if (!i) button.classList.add('selected');
      button.addEventListener('click', () => {
        selectImage(image.picture);
      });
      buttons.append(button);
    });
    const selected = document.createElement('div');
    selected.className = 'product-selected-image';

    wrapper.append(div, buttons, selected);
    return wrapper;
  };

  const createQuantity = () => {
    const div = document.createElement('div');
    div.className = 'product-quantity';
    div.innerHTML = `<h3>${ph.quantity}</h3><div><button class="product-quantity-minus"></button>
    <input type="number" min="1" value="1" max="20">
    <button class="product-quantity-plus"></button></div>`;
    const [minus, input, plus] = [...div.querySelectorAll('button, input')];
    minus.addEventListener('click', () => {
      if (input.value !== input.getAttribute('min')) {
        input.value = +input.value - 1;
        enableAddToCart();
      }
    });
    input.addEventListener('input', () => {
      enableAddToCart();
    });
    plus.addEventListener('click', () => {
      if (input.value !== input.getAttribute('max')) {
        input.value = +input.value + 1;
        enableAddToCart();
      }
    });
    return div;
  };

  const createPickList = (values, prefix, title) => {
    selectedModifiers[prefix] = '';
    const div = document.createElement('div');
    div.className = `product-${prefix}s`;
    div.innerHTML = `<h3>${title}</h3>`;
    const options = document.createElement('div');
    options.className = 'product-option-radios';
    values.forEach((c) => {
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = prefix;
      radio.id = `product-${prefix}-${toClassName(c)}`;
      radio.value = c;
      radio.addEventListener('change', () => {
        document.getElementById(`product-${prefix}`).textContent = c;
        const picture = [
          ...document.querySelectorAll('.product-images picture'),
        ].find((p) => p.dataset.hints.includes(c));
        if (picture) {
          selectImage(picture);
          selectedModifierImage = picture.querySelector('img').currentSrc;
        }
        selectedModifiers[prefix] = c;
        enableAddToCart();
      });
      options.append(radio);
      const label = document.createElement('label');
      label.setAttribute('for', radio.id);
      label.textContent = c;
      options.append(label);
    });
    div.append(options);
    const selected = document.createElement('div');
    selected.className = `product-${prefix}-selected`;
    selected.innerHTML = `Selected ${title}: <span id="product-${prefix}">${ph.none}</span>`;
    div.append(selected);
    return div;
  };

  const createColors = (colors) => (colors.length ? createPickList(colors, 'color', `${ph.color}`) : '');

  const createSizes = (sizes) => (sizes.length ? createPickList(sizes, 'size', `${ph.size}`) : '');

  const addToCart = () => {
    const quantity = +block.querySelector('.product-quantity input').value;
    const { sku } = getProduct();
    window.StorefrontSDK?.addProductsToCart?.([{ quantity, sku }]);
  };

  const createAddToButtons = () => {
    const div = document.createElement('div');
    div.className = 'product-addto';
    div.innerHTML = `<p class="button-container"><button disabled>${ph.addToCart}</button></p>
    <p class="product-addto-favorites">${ph.addToFavorites}</p>`;
    div.querySelector('button').addEventListener('click', () => {
      addToCart();
    });
    return div;
  };

  const createHeading = (h1, price) => {
    const div = document.createElement('div');
    div.className = 'product-heading';
    div.innerHTML = `<div class="product-price">${price}</div>`;
    div.prepend(h1);
    return div;
  };

  const h1 = document.querySelector('h1');
  const price = getMetadata('price');
  const colors = getMetadata('colors')
    ? getMetadata('colors')
      .split(',')
      .map((e) => e.trim())
    : [];
  const sizes = getMetadata('sizes')
    ? getMetadata('sizes')
      .split(',')
      .map((e) => e.trim())
    : [];
  const images = [...block.children].map((row) => {
    const hints = row.children[1].textContent;
    const picture = row.querySelector('picture');
    return { picture, hints };
  });

  block.textContent = '';

  const config = document.createElement('div');
  config.className = 'product-config';
  config.append(
    createColors(colors),
    createSizes(sizes),
    createQuantity(),
    createAddToButtons(),
  );
  block.append(createHeading(h1, price), createImages(images), config);
  selectImage(images[0].picture);
  selectedModifierImage = images[0].picture.querySelector('img').src;

  window.addEventListener('StorefrontSDKReady', () => {
    window.StorefrontSDK.customerToken.watch((token) => {
      enableAddToCart(!!token);
    });
  });
}
