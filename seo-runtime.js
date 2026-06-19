(function () {
  var file = location.pathname.split('/').pop() || 'index.html';
  var cfg = window.ZOYEN_SEO_CONFIG && window.ZOYEN_SEO_CONFIG[file];
  if (!cfg) return;
  var base = 'https://zoyenperitomoreno.github.io/web-zoyen/';
  var canonical = base + (file === 'index.html' ? '' : file);
  var image = /^https?:/i.test(cfg.image || '') ? cfg.image : base + String(cfg.image || '').replace(/^\//, '');
  function meta(selector, attr, value) {
    var node = document.head.querySelector(selector);
    if (!node) { node = document.createElement('meta'); document.head.appendChild(node); }
    Object.keys(attr).forEach(function (key) { node.setAttribute(key, attr[key]); });
    node.setAttribute('content', value || '');
  }
  document.title = cfg.title;
  meta('meta[name="description"]', {name:'description'}, cfg.description);
  meta('meta[name="keywords"]', {name:'keywords'}, cfg.keywords);
  meta('meta[property="og:title"]', {property:'og:title'}, cfg.title);
  meta('meta[property="og:description"]', {property:'og:description'}, cfg.description);
  meta('meta[property="og:image"]', {property:'og:image'}, image);
  meta('meta[property="og:url"]', {property:'og:url'}, canonical);
  meta('meta[name="twitter:title"]', {name:'twitter:title'}, cfg.title);
  meta('meta[name="twitter:description"]', {name:'twitter:description'}, cfg.description);
  meta('meta[name="twitter:image"]', {name:'twitter:image'}, image);
  var link = document.head.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = canonical;
  var data = {
    '@context':'https://schema.org',
    '@type': file === 'index.html' || file === 'nosotros.html' ? 'TravelAgency' : 'TouristTrip',
    name: cfg.title.replace(/ \| Zoyen Turismo.*$/, ''),
    description: cfg.description,
    url: canonical,
    image: image,
    provider: {'@type':'TravelAgency', name:'Zoyen Turismo', url:base},
    areaServed: ['Perito Moreno','Santa Cruz','Patagonia Argentina','Patagonia Chilena']
  };
  var json = document.createElement('script');
  json.type = 'application/ld+json'; json.id = 'zoyen-seo-schema';
  json.textContent = JSON.stringify(data); document.head.appendChild(json);
})();
