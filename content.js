// content.js — optional helper: intercept click events on links and rewrite them to cleaned link
// This improves UX: clicking a link will navigate to cleaned destination (best-effort)

document.addEventListener('click', function (e) {
  try {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // only handle absolute or protocol-relative URLs
    if (href.startsWith('http') || href.startsWith('//')) {
      // ask background to clean
      browser.runtime.sendMessage({ command: 'clean-url', url: new URL(href, location.href).href }).then(resp => {
        if (resp && resp.cleaned && resp.cleaned !== href) {
          a.setAttribute('href', resp.cleaned);
        }
      }).catch(() => {});
    }
  } catch (e) {}
}, true);