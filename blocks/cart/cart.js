import { fetchPlaceholders, formatPrice, createOptimizedPicture } from '../../scripts/scripts.js';

class Cart {
  constructor() {
    this.maxItem = 9;
    this.items = [];
    this.load();
  }

  log() {
    // eslint-disable-next-line no-console
    console.log(this.items);
  }

  remove(sku) {
    const index = this.items.findIndex((item) => sku === item.sku);
    this.items.splice(index, 1);
    this.update();
  }

  canAdd(sku, details, price, quantity = 1) {
    let total = quantity;
    const item = this.find(sku);
    if (item) total += item.quantity;
    return (total <= this.maxItem);
  }

  add(sku, details, price, quantity = 1) {
    const item = this.find(sku);
    if (item) {
      this.plus(item.sku, quantity);
    } else {
      this.items.push({
        sku, details, price, quantity,
      });
    }
    this.update();
  }

  find(sku) {
    return this.items.find((item) => sku === item.sku);
  }

  plus(sku, quantity = 1) {
    const index = this.items.findIndex((item) => sku === item.sku);
    if (this.items[index].quantity + quantity <= this.maxItem) {
      this.items[index].quantity += quantity;
    }
    this.update();
  }

  minus(sku) {
    const index = this.items.findIndex((item) => sku === item.sku);
    this.items[index].quantity -= 1;
    if (!this.items[index].quantity) this.remove(sku);
    this.update();
  }

  setQuantity(sku, q) {
    const index = this.items.findIndex((item) => sku === item.sku);
    this.line_items[index].quantity = q;
    this.update();
  }

  get totalAmount() {
    let total = 0;
    this.items.forEach((item) => {
      total += item.price * item.quantity;
    });
    return (total);
  }

  get totalItems() {
    let total = 0;
    this.items.forEach((item) => {
      total += item.quantity;
    });
    return (total);
  }

  clear() {
    this.items = [];
    this.update();
  }

  update() {
    localStorage.setItem('cart', JSON.stringify({ lastUpdate: new Date(), items: this.items }));
    const updateEvent = new Event('cart-update', this);
    document.body.dispatchEvent(updateEvent);
  }

  load() {
    const cartobj = JSON.parse(localStorage.getItem('cart'));
    this.items = [];

    if (cartobj && cartobj.items) {
      // validate
      cartobj.items.forEach((item) => {
        // if (this.checkCatalog(item)) {
        this.items.push(item);
        // }
      });
    }
    this.update();
  }
}

async function updateCartDisplay() {
  const ph = await fetchPlaceholders();
  const { cart } = window;

  const createCartItem = (item) => {
    const { details } = item;
    const div = document.createElement('div');

    const createMods = (keys) => keys.map((key) => (details[key] ? `<p>${ph[key]} : ${details[key]}</p>` : '')).join('');

    div.className = 'cart-item';
    div.innerHTML = `
    <div class="cart-item-image">${createOptimizedPicture(details.image).outerHTML}
    </div>
    <div class="cart-item-details">
        <h3>${details.title}</h3>
        ${createMods(['color', 'size'])}
        <p>${ph.qty} : ${item.quantity}</p>
        <p>${formatPrice(item.price, 'USD')} ${ph.ea}</p>
    </div>
    <div class="cart-item-controls">
      <img src="/icons/trashcan.svg" class="icon icon-trashcan">
    </div>`;
    const remove = div.querySelector('.icon-trashcan');
    remove.addEventListener(('click'), () => cart.remove(item.sku));
    return div;
  };

  const createMiniCart = () => {
    const div = document.createElement('div');
    div.className = 'cart-mini';
    div.innerHTML = `<div class="cart-header">
      <div class="cart-numitems">${cart.totalItems} ${cart.totalItems === 1 ? ph.item : ph.items}</div><div class="cart-subtotal">${formatPrice(cart.totalAmount, 'USD')}</div></div>
    </div>
    <div class="cart-items">
    </div>
    <div class="cart-controls">
      <p><a class="button primary" href="/checkout">${ph.checkout}</a></p>
      <p><a class="button secondary" href="/cart">${ph.editShoppingBag}</a></p>
    </div>`;
    const cartItems = div.querySelector('.cart-items');
    cart.items.forEach((item) => {
      cartItems.append(createCartItem(item));
    });
    return div;
  };

  const blocks = document.querySelectorAll('.cart-display');
  blocks.forEach((display) => {
    display.textContent = '';
    if (display.closest('header')) {
      const badge = document.createElement('div');
      badge.textContent = cart.totalItems ? cart.totalItems : '';
      badge.className = 'cart-badge';
      display.append(badge);
      const miniCart = createMiniCart(ph);
      display.append(miniCart);
    }
  });
}

export default function decorate(block) {
  document.body.addEventListener('cart-update', updateCartDisplay);
  window.cart = window.cart || new Cart();
  const displayArea = document.createElement('div');
  displayArea.className = 'cart-display';
  block.append(displayArea);

  if (block.closest('header')) {
    block.addEventListener('click', () => {
      block.querySelector('.cart-mini').classList.toggle('visible');
    });
  }
}
