import { getMetadata, toClassName } from '../../scripts/scripts.js';

function selectImage(picture) {
  const images = picture.closest('.product-images');
  const wrapper = images.parentElement;
  const selectedImage = wrapper.querySelector('.product-selected-image');
  const buttons = wrapper.querySelector('.product-images-buttons');
  const index = [...images.children].indexOf(picture);
  const button = [...buttons.children][index];
  images.scrollTo({ top: 0, left: picture.offsetLeft - images.offsetLeft, behavior: 'smooth' });

  [...images.children].forEach((r) => r.classList.remove('selected'));
  picture.classList.add('selected');

  [...buttons.children].forEach((r) => r.classList.remove('selected'));
  button.classList.add('selected');

  selectedImage.textContent = '';
  selectedImage.append(picture.cloneNode(true));
}

function createQuantity() {
  const div = document.createElement('div');
  div.className = 'product-quantity';
  div.innerHTML = `<h3>Quantity</h3><div><button class="product-quantity-minus"></button>
  <input type="number" min="1" value="1" max="20">
  <button class="product-quantity-plus"></button></div>`;
  const [minus, input, plus] = [...div.querySelectorAll('button, input')];
  minus.addEventListener('click', () => {
    if (input.value !== input.getAttribute('min')) {
      input.value = +input.value - 1;
    }
  });
  plus.addEventListener('click', () => {
    if (input.value !== input.getAttribute('max')) {
      input.value = +input.value + 1;
    }
  });
  return div;
}

function createAddToButtons() {
  const div = document.createElement('div');
  div.className = 'product-addto';
  div.innerHTML = `<p class="button-container"><a href="#" class="button">Add to Cart</a></p>
  <p class="product-addto-favorites">Add to Favorites</p>`;
  return div;
}

function createImages(images) {
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
}

function createHeading(h1, price) {
  const div = document.createElement('div');
  div.className = 'product-heading';
  div.innerHTML = `<div class="product-price">${price}</div>`;
  div.prepend(h1);
  return (div);
}

function createPickList(values, prefix, title) {
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
      const picture = [...document.querySelectorAll('.product-images picture')].find((p) => p.dataset.hints.includes(c));
      selectImage(picture);
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
  selected.innerHTML = `Selected ${title}: <span id="product-${prefix}">None</span>`;
  div.append(selected);
  return (div);
}
function createColors(colors) {
  return (colors.length ? createPickList(colors, 'color', 'Fashion Color') : '');
}

function createSizes(sizes) {
  return (sizes.length ? createPickList(sizes, 'size', 'Fashion Size') : '');
}

export default function decorateProduct(block) {
  const h1 = document.querySelector('h1');
  const price = getMetadata('price');
  const colors = getMetadata('colors') ? getMetadata('colors').split(',').map((e) => e.trim()) : [];
  const sizes = getMetadata('sizes') ? getMetadata('sizes').split(',').map((e) => e.trim()) : [];
  const images = [...block.children].map((row) => {
    const hints = row.children[1].textContent;
    const picture = row.querySelector('picture');
    return { picture, hints };
  });

  block.textContent = '';

  const config = document.createElement('div');
  config.className = 'product-config';
  config.append(createColors(colors), createSizes(sizes), createQuantity(), createAddToButtons());
  block.append(createHeading(h1, price), createImages(images), config);
  selectImage(images[0].picture);
}
