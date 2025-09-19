// popup.js — CleanShare-style cleaning + stylish QR code rendering with qr-code-styling

let cleanedUrl = '';
let qrCode = null;

// Aggressive list of privacy-sensitive parameter patterns
const TRACKER_KEY_PATTERNS = [
  /^utm_/i, /^fbclid$/i, /^gclid$/i, /^icid$/i, /^mc_/i, /^_hs/i,
  /^_ga/i, /^_gid/i, /^_gat/i, /^msclkid$/i, /^yclid$/i, /^dclid$/i,
  /^gbraid$/i, /^wbraid$/i, /^adid$/i, /^aff_?id$/i, /^affiliate/i,
  /^ref$/i, /^ref_src$/i, /^spm$/i, /^igshid$/i, /^mkt_tok$/i, /^promo$/i,
  /^cid$/i, /^bltgh$/i, /^sr_share$/i, /^sr_p$/i, /^s_campaign$/i,
  /^s_kwcid$/i, /^cm_mmc$/i, /^cmpid$/i, /^campaign(id)?$/i, /^source$/i,
  /^src$/i, /^pk_campaign$/i, /^pk_kwd$/i, /^pk_source$/i, /^pk_medium$/i,
  /^ga_campaign$/i, /^ga_source$/i, /^ga_medium$/i, /^piwik_/i,
  /^amp$/i, /^amp_/i, /^fb_action_/i, /^fb_action_ids$/i, /^fb_action_types$/i,
  /^action_object_map$/i, /^action_type_map$/i, /^mc_eid$/i, /^_openstat/i,
  /^trk$/i, /^trkCampaign$/i, /^utm_reader$/i, /^utm_referrer$/i
];

const REDIRECT_PARAM_NAMES = ['url','u','redirect','dest','destination','data','target','r','rd'];
const REDIRECT_HOSTS = [
  'l.facebook.com','lm.facebook.com','t.co','www.google.com',
  'facebook.com','l.instagram.com','outgoing.prod.mozaws.net'
];

function isTrackerKey(key) {
  return TRACKER_KEY_PATTERNS.some(p => p.test(key));
}

// CleanShare-style cleaning + shortening
function cleanUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.toLowerCase();

    // Redirect extraction
    if (REDIRECT_HOSTS.includes(host)) {
      for (const rp of REDIRECT_PARAM_NAMES) {
        const target = u.searchParams.get(rp);
        if (target && /^https?:\/\//i.test(decodeURIComponent(target))) {
          return cleanUrl(decodeURIComponent(target));
        }
      }
    }

    // Remove tracking params
    [...u.searchParams.keys()].forEach(key => {
      if (isTrackerKey(key)) u.searchParams.delete(key);
    });

    // === Site-specific shortening rules ===
    if (host.includes('amazon.')) {
      const m = u.pathname.match(/(\/dp\/[^\/?#]+)|(\/gp\/product\/[^\/?#]+)/i);
      if (m) { u.pathname = m[0]; u.search = ''; }
    }
    if (host.includes('youtube.com') && u.searchParams.get('v')) {
      const v = u.searchParams.get('v');
      u.pathname = '/watch'; u.search = ''; u.searchParams.set('v', v);
    }
    if (host === 'youtu.be') {
      const vid = (u.pathname.split('/')[1] || ''); u.pathname = '/' + vid; u.search = '';
    }
    if (host.includes('twitter.com') && /\/status\//i.test(u.pathname)) u.search = '';
    if (host.includes('tiktok.com') && /\/video\//i.test(u.pathname)) u.search = '';
    if (host.includes('facebook.com')) u.search = '';
    if (host.includes('linkedin.com') && /\/posts\//i.test(u.pathname)) u.search = '';
    if (host.includes('reddit.com') && /\/comments\//i.test(u.pathname)) u.search = '';

    u.hash = '';
    let out = u.toString();
    if (out.endsWith('?')) out = out.slice(0, -1);
    return out;
  } catch {
    return rawUrl;
  }
}

// --- UI logic ---
async function init() {
  const cleanUrlEl = document.getElementById('clean-url');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const editBtn = document.getElementById('edit-btn');
  const editField = document.getElementById('edit-field');
  const urlInput = document.getElementById('url-input');
  const applyEdit = document.getElementById('apply-edit');

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  cleanedUrl = cleanUrl(tab?.url || '');

  renderQr(cleanedUrl);
  cleanUrlEl.textContent = cleanedUrl;

  copyBtn.onclick = async () => {
    await navigator.clipboard.writeText(cleanedUrl);
  };
  downloadBtn.onclick = () => downloadQr();

  editBtn.onclick = () => {
    const isVisible = editField.classList.contains('visible');
    if (isVisible) {
      editField.classList.remove('visible');
      setTimeout(() => window.resizeTo(220, document.body.scrollHeight), 320);
    } else {
      editField.classList.add('visible');
      urlInput.value = cleanedUrl;
      urlInput.focus();
      setTimeout(() => window.resizeTo(220, document.body.scrollHeight), 320);
    }
  };

  applyEdit.onclick = () => {
    cleanedUrl = cleanUrl(urlInput.value.trim());
    renderQr(cleanedUrl);
    cleanUrlEl.textContent = cleanedUrl;
    editField.classList.remove('visible');
    setTimeout(() => window.resizeTo(220, document.body.scrollHeight), 320);
  };
}

function renderQr(text) {
  const qrArea = document.getElementById('qrcode');
  qrArea.innerHTML = '';

  if (!text) {
    qrArea.textContent = 'No URL';
    return;
  }

  // Use qr-code-styling for stylish QR codes
  qrCode = new QRCodeStyling({
    width: 180,
    height: 180,
    type: "svg",
    data: text,
    dotsOptions: {
      color: "#222222",
      type: "dots"
    },
    backgroundOptions: {
      color: "#FFF9C4"
    },
    cornersSquareOptions: { type: "extra-rounded", color: "#222222" }
  });

  qrCode.append(qrArea);
}

function downloadQr() {
  if (qrCode) {
    qrCode.download({ name: "qrcode", extension: "png" });
  }
}

init();
