import { lookupPages, readBlockConfig } from '../../scripts/scripts.js';
import { createProductCard } from '../product-carousel/product-carousel.js';

export default async function decorate(block) {
  let config = [...document.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  if (!config.length) config = readBlockConfig(block);

  block.innerHTML = `<div class="products-controls">
      <button class="products-filter-button">Filter</button>
      <button class="products-sort-button">Sort</button>
    </div>
    <div class="products-facets">
    </div>
    <div class="products-sortby">
      <p>Sort By <span id="sortby">Best Match</span></p>
      <ul>
        <li>Best Match</li>
        <li>Position</li>
        <li>Price: High to Low</li>
        <li>Price: Low to High</li>
        <li>Product Name</li>
      </ul>
    </div>
  </div>
  <div class="products-results">
  </div>`;

  const resultsElement = block.querySelector('.products-results');
  const facetsElement = block.querySelector('.products-facets');

  const displayResults = async (results) => {
    resultsElement.innerHTML = '';
    results.forEach((product) => {
      resultsElement.append(createProductCard(product, 'products'));
    });
  };

  const createFilterConfig = () => {
    const filterConfig = { ...config };
    block.querySelectorAll('input[type="checkbox"]:checked').forEach((checked) => {
      const facetKey = checked.name;
      const facetValue = checked.value;
      if (filterConfig[facetKey]) filterConfig[facetKey] += `, ${facetValue}`;
      else filterConfig[facetKey] = facetValue;
    });
    return (filterConfig);
  };

  const displayFacets = (facets, filters) => {
    facetsElement.innerHTML = '';
    const facetKeys = Object.keys(facets);
    facetKeys.forEach((facetKey) => {
      const filter = filters[facetKey];
      const filterValues = filter ? filter.split(',').map((t) => t.trim()) : [];
      const div = document.createElement('div');
      div.className = 'products-facet';
      const h3 = document.createElement('h3');
      h3.innerHTML = facetKey;
      div.append(h3);
      const facetValues = Object.keys(facets[facetKey]);
      facetValues.forEach((facetValue) => {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = facetValue;
        const checked = filterValues.includes(facetValue);
        input.checked = checked;
        input.id = `${facetKey}-${facetValue}`;
        input.name = facetKey;
        const label = document.createElement('label');
        label.setAttribute('for', input.id);
        label.textContent = `${facetValue} (${facets[facetKey][facetValue]})`;
        div.append(input, label);
        input.addEventListener('change', () => {
          const filterConfig = createFilterConfig();
          // eslint-disable-next-line no-use-before-define
          runSearch(filterConfig);
        });
      });
      facetsElement.append(div);
    });
  };

  const runSearch = async (filterConfig = config) => {
    const facets = { colors: {}, sizes: {} };
    const results = await lookupPages(filterConfig, facets);
    displayResults(results, null);
    displayFacets(facets, filterConfig);
  };

  runSearch(config);
}
