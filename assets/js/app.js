/* =========================================================
   محلات أبو بشار للملابس والأحذية — تفاعلات الصفحة
   (مشاركة / نسخ الرابط / رمز QR / طباعة / تنزيل)
   ========================================================= */
(function () {
  'use strict';

  /* الرابط الرسمي الدائم للصفحة (يُحدَّث تلقائيًا عند تغيير الاستضافة) */
  var CANONICAL = 'https://tbtbshyt-cmyk.github.io/bhyr776430697/';

  function pageUrl() {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      return location.origin + location.pathname;
    }
    return CANONICAL;
  }

  /* ---------- توست ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- نسخ الرابط ---------- */
  function copyLink() {
    var url = pageUrl();
    function done() { toast('تم نسخ رابط الصفحة ✓'); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { toast('الرابط: ' + url); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, fallback);
    } else {
      fallback();
    }
  }

  /* ---------- مشاركة الصفحة ---------- */
  function sharePage() {
    var data = {
      title: 'محلات أبو بشار للملابس والأحذية',
      text: 'تابعوا محلات أبو بشار للملابس والأحذية على جميع منصات التواصل الاجتماعي 👇',
      url: pageUrl()
    };
    if (navigator.share) {
      navigator.share(data).catch(function () { /* إلغاء المستخدم */ });
    } else {
      copyLink();
    }
  }

  /* ---------- رمز QR ---------- */
  function qrInstance(url) {
    if (typeof window.qrcode !== 'function') return null;
    var qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    return qr;
  }

  /* إعادة توليد الرمز تلقائيًا إذا فُتحت الصفحة من رابط مختلف عن الرسمي */
  function syncQr() {
    var url = pageUrl();
    var box = document.getElementById('qrBox');
    var urlEl = document.getElementById('qrUrl');
    if (urlEl) urlEl.textContent = url;
    if (url === CANONICAL || !box) return;
    var qr = qrInstance(url);
    if (!qr) return;
    var tag = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    box.innerHTML = tag.replace('<svg', '<svg style="width:100%;height:100%"');
  }

  function printQr() { window.print(); }

  function downloadQr() {
    var url = pageUrl();
    var qr = qrInstance(url);
    if (!qr) { toast('تعذر إنشاء الرمز'); return; }
    var gif = qr.createDataURL(8, 2);           /* GIF مؤقت */
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      var a = document.createElement('a');
      a.href = c.toDataURL('image/png');
      a.download = 'abu-bashar-qr.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast('تم تنزيل رمز QR ✓');
    };
    img.onerror = function () { toast('تعذر إنشاء الرمز'); };
    img.src = gif;
  }

  /* ---------- الربط ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var shareBtn = document.getElementById('shareBtn');
    var copyBtn = document.getElementById('copyBtn');
    var printBtn = document.getElementById('qrPrint');
    var dlBtn = document.getElementById('qrDownload');
    var yearEl = document.getElementById('year');

    if (shareBtn) shareBtn.addEventListener('click', sharePage);
    if (copyBtn) copyBtn.addEventListener('click', copyLink);
    if (printBtn) printBtn.addEventListener('click', printQr);
    if (dlBtn) dlBtn.addEventListener('click', downloadQr);
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    syncQr();
  });
})();
