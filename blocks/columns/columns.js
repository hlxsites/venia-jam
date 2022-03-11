export default function decorate(block) {
  block.querySelectorAll('picture').forEach((picture) => {
    picture.closest('div').classList.add('columns-image');
  });
}
