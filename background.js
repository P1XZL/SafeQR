// background.js

const TRACKER_KEYS = [
  /^utm_/,
  /^fbclid$/i,
  /^gclid$/i,
  /^icid$/i,
  /^mc_cid$/i,
  /^mc_eid$/i,
  /^_hsenc$/i,
  /^_hsmi$/i
];

function cleanUrl(input) {
  try {
    const url = new URL(input);
    // remove query params that match tracker keys
    const params = new URLSearchParams(url.search);
    for (const key of Array.from(params.keys())) {
      for (const t of TRACKER_KEYS) {
        if (t.test(key)) {
          params.delete(key);
          break;
        }
      }
    }
    // also try to unwrap common redirectors (google, l.facebook, l.instagram, t.co etc.)
    // simple heuristic: some redirectors use a `url` or `u` or `q` parameter that contains the real target
    const redirectParams = ['url', 'u', 'q', 'redirect', 'dest'];
    for (const p of redirectParams) {
      if (params.has(p)) {
        const possible = params.get(p);
        try {
          const inner = new URL(possible);
          return cleanUrl(inner.href);
        } catch (e) {
          // not an absolute URL, ignore
        }
      }
    }

    url.search = params.toString();
    // remove trailing ? if no params
    let out = url.toString();
    if (out.endsWith('?')) out = out.slice(0,-1);
    return out;
  } catch (e) {
    return input; // if parsing failed, return original
  }
}

// Create context menus
browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({
    id: 'copy-clean-link-page',
    title: 'Copy clean link (page)',
    contexts: ['page']
  });
  browser.contextMenus.create({
    id: 'copy-clean-link-link',
    title: 'Copy clean link (link)',
    contexts: ['link']
  });
  browser.contextMenus.create({
    id: 'generate-qr-page',
    title: 'Generate QR (page URL)',
    contexts: ['page']
  });
  browser.contextMenus.create({
    id: 'generate-qr-selection',
    title: 'Generate QR (selected text)',
    contexts: ['selection']
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab) return;
  if (info.menuItemId === 'copy-clean-link-page') {
    const cleaned = cleanUrl(tab.url || '');
    await copyToClipboard(cleaned);
    notify(tab.id, 'Copied clean page URL to clipboard');
  } else if (info.menuItemId === 'copy-clean-link-link') {
    const href = info.linkUrl || info.srcUrl || '';
    const cleaned = cleanUrl(href);
    await copyToClipboard(cleaned);
    notify(tab.id, 'Copied clean link to clipboard');
  } else if (info.menuItemId === 'generate-qr-page') {
    const cleaned = cleanUrl(tab.url || '');
    // open a popup window with the QR (use a data URL to pass text)
    openQrTab(cleaned);
  } else if (info.menuItemId === 'generate-qr-selection') {
    const text = info.selectionText || '';
    openQrTab(text);
  }
});

function openQrTab(text) {
  const url = browser.runtime.getURL('popup.html') + '#qr:' + encodeURIComponent(text);
  browser.tabs.create({ url });
}

async function copyToClipboard(text) {
  try {
    // Use the clipboardWrite permission via an offscreen document approach: attempt to use navigator.clipboard in the tab
    // Fallback: create a temporary textarea in the background page (works in Firefox when clipboardWrite exists)
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

function notify(tabId, message) {
  // Simple notification using tabs.executeScript to show an alert in the tab
  if (!tabId) return;
  try {
    browser.tabs.executeScript(tabId, {
      code: `(() => { if (window.__cleanshare_notify_timeout) clearTimeout(window.__cleanshare_notify_timeout); const el=document.createElement('div'); el.innerText=${JSON.stringify(message)}; el.style.position='fixed'; el.style.zIndex=2147483647; el.style.right='12px'; el.style.bottom='12px'; el.style.background='#222'; el.style.color='#fff'; el.style.padding='8px 12px'; el.style.borderRadius='6px'; el.style.boxShadow='0 2px 6px rgba(0,0,0,0.5)'; el.style.fontSize='13px'; document.body.appendChild(el); window.__cleanshare_notify_timeout=setTimeout(()=>el.remove(),1800); })();`
    });
  } catch (e) {
    // ignore
  }
}

// Expose cleaning via messages for popup/content
browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.command === 'clean-url') {
    return Promise.resolve({ cleaned: cleanUrl(msg.url || '') });
  }
});