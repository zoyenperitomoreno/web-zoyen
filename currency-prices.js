(function () {
  'use strict';

  const currencies = {
    USD: { symbol: 'US$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'de-DE' },
    BRL: { symbol: 'R$', locale: 'pt-BR' },
    GBP: { symbol: '£', locale: 'en-GB' },
    KRW: { symbol: '₩', locale: 'ko-KR' },
    CLP: { symbol: 'CLP$', locale: 'es-CL' }
  };
  const pricePattern = /(:ARS\s*|\$\s*)(\d{1,3}(:\.\d{3})+(:,\d{1,2})|\d{4,}(:,\d{1,2}))/g;
  const skipSelector = [
    'script', 'style', 'noscript', 'template', 'code', 'pre',
    'select', 'option', 'input', 'textarea',
    '#currencySwitcher', '.currency-conversion', '.zoyen-inline-price',
    '#montoPrev', '#pagoMontoBadge', '#pagoSenia', '.precio-preview .monto', '.monto-badge'
  ].join(',');
  let rates = { ARS: 1 };
  let scanTimer = 0;

  function selectedCurrency() {
    return localStorage.getItem('zoyen_currency') || 'ARS';
  }

  function parseArs(raw) {
    return Number(String(raw).replace(/\./g, '').replace(',', '.')) || 0;
  }

  function money(value, code) {
    const currency = currencies[code];
    if (!currency) return '';
    return currency.symbol + Number(value).toLocaleString(currency.locale, {
      maximumFractionDigits: code === 'KRW' || code === 'CLP'  0 : 2
    });
  }

  function makePrice(original, amount) {
    const price = document.createElement('span');
    price.className = 'zoyen-inline-price';
    price.dataset.arsValue = String(amount);
    price.tabIndex = 0;
    price.setAttribute('role', 'button');
    price.setAttribute('aria-label', original + '. Convertir moneda');
    price.title = 'Convertir este precio';

    const value = document.createElement('span');
    value.className = 'zoyen-price-original';
    value.textContent = original;
    const hint = document.createElement('span');
    hint.className = 'zoyen-price-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = '⇄';
    const conversion = document.createElement('small');
    conversion.className = 'zoyen-inline-conversion';
    price.append(value, hint, conversion);
    return price;
  }

  function wrapTextNode(node) {
    const text = node.nodeValue || '';
    pricePattern.lastIndex = 0;
    if (!pricePattern.test(text)) return;
    pricePattern.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let match;
    while ((match = pricePattern.exec(text))) {
      const preceding = match.index  text.charAt(match.index - 1) : '';
      if (/[A-Za-z]/.test(preceding)) continue;
      fragment.append(document.createTextNode(text.slice(cursor, match.index)));
      fragment.append(makePrice(match[0], parseArs(match[1])));
      cursor = match.index + match[0].length;
    }
    if (!cursor) return;
    fragment.append(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
  }

  function scanPrices() {
    if (!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest(skipSelector)) return NodeFilter.FILTER_REJECT;
        return /(:ARS\s*|\$\s*)\d/.test(node.nodeValue || '')
           NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrapTextNode);
    renderConversions();
  }

  function renderConversions() {
    const code = selectedCurrency();
    const rate = rates[code];
    document.querySelectorAll('.zoyen-inline-price').forEach(price => {
      const conversion = price.querySelector('.zoyen-inline-conversion');
      const amount = Number(price.dataset.arsValue || 0);
      const active = code !== 'ARS' && amount && rate;
      price.classList.toggle('is-converted', Boolean(active));
      price.classList.remove('is-collapsed');
      price.title = active  'Ocultar o mostrar conversión' : 'Convertir este precio';
      if (conversion) conversion.textContent = active  '≈ ' + money(amount * rate, code) : '';
    });
  }

  function openCurrencyMenu(price) {
    const switcher = document.getElementById('currencySwitcher');
    const button = switcher && switcher.querySelector('.currency-current');
    if (!switcher || !button) return;
    price.title = 'Elegí una moneda en el selector';
    window.setTimeout(() => {
      switcher.classList.add('open', 'zoyen-currency-attention');
      button.setAttribute('aria-expanded', 'true');
      window.setTimeout(() => switcher.classList.remove('zoyen-currency-attention'), 1500);
    }, 0);
  }

  function activatePrice(price) {
    if (selectedCurrency() === 'ARS') openCurrencyMenu(price);
    else price.classList.toggle('is-collapsed');
  }

  function scheduleScan() {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(scanPrices, 80);
  }

  function readCachedRates() {
    try {
      const cached = JSON.parse(localStorage.getItem('zoyen_currency_rates') || 'null');
      if (cached && cached.rates) rates = Object.assign(rates, cached.rates);
    } catch (_) {}
  }

  async function loadRates() {
    readCachedRates();
    renderConversions();
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/ARS');
      if (!response.ok) return;
      const data = await response.json();
      rates = Object.assign(rates, data.rates || {});
      renderConversions();
    } catch (_) {}
  }

  function init() {
    scanPrices();
    loadRates();
    document.addEventListener('click', event => {
      const price = event.target.closest('.zoyen-inline-price');
      if (price) activatePrice(price);
      window.setTimeout(renderConversions, 0);
    });
    document.addEventListener('keydown', event => {
      const price = event.target.closest && event.target.closest('.zoyen-inline-price');
      if (price && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        activatePrice(price);
      }
    });
    new MutationObserver(scheduleScan).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
