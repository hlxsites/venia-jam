export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const cardBody = document.createElement('div');
      cardBody.className = 'cards-card-body';
      [...cell.children].forEach((el) => {
        if (!el.querySelector('picture')) {
          cardBody.append(el);
        }
      });
      cell.append(cardBody);
    });
  });
}
