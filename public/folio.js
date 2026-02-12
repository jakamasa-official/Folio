(function() {
  "use strict";

  // Prevent double-init
  if (window.__folio) return;
  window.__folio = { version: "1.0.0" };

  // Read config from script tag
  var script = document.currentScript;
  if (!script) return;
  var profileId = script.getAttribute("data-profile-id");
  if (!profileId) { console.warn("[Folio] Missing data-profile-id"); return; }
  var baseUrl = script.getAttribute("data-base-url") || script.src.replace(/\/folio\.js.*$/, "");
  var lang = script.getAttribute("data-lang") || "ja";
  var widgetList = (script.getAttribute("data-widgets") || "tracking").split(",").map(function(s) { return s.trim(); });
  var widgets = {};
  widgetList.forEach(function(w) { widgets[w] = true; });

  // SVG Icons
  var ICON_ENVELOPE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
  var ICON_STAR = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  var ICON_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  // Origin helper for postMessage security
  function getOrigin(url) {
    try { var a = document.createElement("a"); a.href = url; return a.protocol + "//" + a.host; }
    catch (e) { return ""; }
  }
  var allowedOrigin = getOrigin(baseUrl);

  // --- MODULE 1: PAGE VIEW TRACKING ---
  function trackPageView() {
    var params = {};
    var search = window.location.search.substring(1);
    if (search) {
      search.split("&").forEach(function(pair) {
        var parts = pair.split("=");
        var key = decodeURIComponent(parts[0]);
        var val = parts.length > 1 ? decodeURIComponent(parts[1]) : "";
        if (key.indexOf("utm_") === 0) params[key] = val;
      });
    }
    var payload = JSON.stringify({
      profile_id: profileId, url: window.location.href,
      referrer: document.referrer || null,
      utm_source: params.utm_source || null, utm_medium: params.utm_medium || null,
      utm_campaign: params.utm_campaign || null, utm_term: params.utm_term || null,
      utm_content: params.utm_content || null
    });
    var trackUrl = baseUrl + "/api/analytics/track";
    if (navigator.sendBeacon) {
      navigator.sendBeacon(trackUrl, new Blob([payload], { type: "application/json" }));
    } else {
      try { var x = new XMLHttpRequest(); x.open("POST", trackUrl, true); x.setRequestHeader("Content-Type", "application/json"); x.send(payload); }
      catch (e) { /* tracking must never break host page */ }
    }
  }

  // --- MODULE 2: IFRAME HELPERS ---
  var iframeRegistry = [];

  function createIframe(src, container, opts) {
    opts = opts || {};
    var f = document.createElement("iframe");
    f.src = src;
    f.frameBorder = "0";
    f.allow = "forms";
    f.setAttribute("allowtransparency", "true");
    f.style.cssText = "border:none;display:block;overflow:hidden;width:" + (opts.width || "100%") + ";height:" + (opts.height || "400px") + ";" + (opts.borderRadius ? "border-radius:" + opts.borderRadius + ";" : "");
    container.appendChild(f);
    iframeRegistry.push(f);
    return f;
  }

  function setupMessageListener() {
    window.addEventListener("message", function(event) {
      if (allowedOrigin && event.origin !== allowedOrigin) return;
      var data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "folio:resize" && typeof data.height === "number" && data.height > 0) {
        iframeRegistry.forEach(function(f) {
          try { if (f.contentWindow === event.source) f.style.height = data.height + "px"; }
          catch (e) {}
        });
      } else if (data.type === "folio:success") {
        try { window.dispatchEvent(new CustomEvent("folio:success", { detail: { widget: data.widget || null } })); }
        catch (e) {}
      } else if (data.type === "folio:close") {
        closePopup();
      }
    }, false);
  }

  // --- MODULE 3: FLOATING BUTTON + POPUP ---
  var activePopup = null;

  var fabCount = 0;

  function createFloatingButton(config) {
    var bottomOffset = 20 + fabCount * 66;
    fabCount++;
    var host = document.createElement("div");
    host.id = "folio-fab-host-" + fabCount;
    host.style.cssText = "position:fixed;bottom:" + bottomOffset + "px;right:20px;z-index:999999;";
    var shadow = host.attachShadow({ mode: "open" });

    var styles = document.createElement("style");
    styles.textContent = ":host{all:initial}.folio-fab{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:" + (config.color || "#2563eb") + ";box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s ease,box-shadow .2s ease;padding:0;outline:none;-webkit-tap-highlight-color:transparent}.folio-fab:hover{transform:scale(1.05);box-shadow:0 6px 16px rgba(0,0,0,.2)}.folio-fab:active{transform:scale(.97)}.folio-fab svg{color:#fff;stroke:#fff;pointer-events:none}";

    var btn = document.createElement("button");
    btn.className = "folio-fab";
    btn.innerHTML = config.icon;
    btn.setAttribute("aria-label", config.label || "Open Folio");
    btn.addEventListener("click", function(e) {
      e.preventDefault(); e.stopPropagation();
      if (config.onClick) config.onClick();
    }, false);

    shadow.appendChild(styles);
    shadow.appendChild(btn);
    document.body.appendChild(host);
    return host;
  }

  function createPopup(iframeSrc) {
    closePopup();

    // Overlay
    var overlay = document.createElement("div");
    overlay.id = "folio-popup-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.4);z-index:9999999;opacity:0;transition:opacity .2s ease;";

    // Panel
    var panel = document.createElement("div");
    panel.style.cssText = "position:fixed;bottom:90px;right:20px;width:380px;max-width:calc(100vw - 40px);max-height:80vh;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.2);overflow:hidden;z-index:10000000;opacity:0;transform:translateY(12px);transition:opacity .2s ease,transform .2s ease;";

    // Close button
    var closeBtn = document.createElement("button");
    closeBtn.style.cssText = "position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,.06);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;z-index:1;transition:background .15s ease;-webkit-tap-highlight-color:transparent;";
    closeBtn.innerHTML = ICON_CLOSE;
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("mouseenter", function() { closeBtn.style.background = "rgba(0,0,0,.12)"; }, false);
    closeBtn.addEventListener("mouseleave", function() { closeBtn.style.background = "rgba(0,0,0,.06)"; }, false);
    closeBtn.addEventListener("click", function(e) { e.preventDefault(); e.stopPropagation(); closePopup(); }, false);

    // Iframe wrapper
    var wrap = document.createElement("div");
    wrap.style.cssText = "width:100%;overflow-y:auto;max-height:80vh;-webkit-overflow-scrolling:touch;";
    var iframe = createIframe(iframeSrc, wrap, { width: "100%", height: "400px" });

    panel.appendChild(closeBtn);
    panel.appendChild(wrap);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Animate in (double rAF for reliable transition trigger)
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        overlay.style.opacity = "1";
        panel.style.opacity = "1";
        panel.style.transform = "translateY(0)";
      });
    });

    // Close on overlay click
    overlay.addEventListener("click", function(e) { if (e.target === overlay) closePopup(); }, false);

    // Close on Escape key
    var escHandler = function(e) { if (e.key === "Escape" || e.keyCode === 27) closePopup(); };
    document.addEventListener("keydown", escHandler, false);

    activePopup = { overlay: overlay, panel: panel, iframe: iframe, escHandler: escHandler };
    return activePopup;
  }

  function closePopup() {
    if (!activePopup) return;
    var popup = activePopup;
    activePopup = null;

    if (popup.escHandler) document.removeEventListener("keydown", popup.escHandler, false);

    // Animate out
    popup.overlay.style.opacity = "0";
    popup.panel.style.opacity = "0";
    popup.panel.style.transform = "translateY(12px)";

    setTimeout(function() {
      var idx = iframeRegistry.indexOf(popup.iframe);
      if (idx !== -1) iframeRegistry.splice(idx, 1);
      if (popup.overlay.parentNode) popup.overlay.parentNode.removeChild(popup.overlay);
    }, 220);
  }

  // --- MODULE 4: INLINE WIDGETS ---
  function embedInline(type, containerId, defaultHeight) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var src = baseUrl + "/embed/" + type + "/" + profileId + "?lang=" + encodeURIComponent(lang);
    createIframe(src, container, { width: "100%", height: defaultHeight + "px" });
  }

  // --- MODULE 5: SOCIAL PROOF BADGE ---
  function renderBadge() {
    var host = document.createElement("div");
    host.id = "folio-badge-host";
    host.style.cssText = "position:fixed;bottom:20px;left:20px;z-index:999998;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.12);overflow:hidden;width:300px;height:60px;";
    var src = baseUrl + "/embed/social-proof/" + profileId + "?mode=badge&lang=" + encodeURIComponent(lang);
    createIframe(src, host, { width: "300px", height: "60px", borderRadius: "12px" });
    document.body.appendChild(host);
  }

  // --- INITIALIZATION ---
  setupMessageListener();

  if (widgets["tracking"]) trackPageView();
  if (widgets["badge"]) renderBadge();

  // Floating buttons (stacked vertically, bottom-up)
  if (widgets["contact-float"]) {
    createFloatingButton({
      icon: ICON_ENVELOPE, label: "Contact", color: "#2563eb",
      onClick: function() { createPopup(baseUrl + "/embed/contact/" + profileId + "?lang=" + encodeURIComponent(lang)); }
    });
  }
  if (widgets["review-float"]) {
    createFloatingButton({
      icon: ICON_STAR, label: "Review", color: "#f59e0b",
      onClick: function() { createPopup(baseUrl + "/embed/review/" + profileId + "?lang=" + encodeURIComponent(lang)); }
    });
  }

  // Inline widgets
  if (widgets["contact-inline"]) embedInline("contact", "folio-contact", 400);
  if (widgets["review-inline"]) embedInline("review", "folio-review", 450);
  if (widgets["subscribe-inline"]) embedInline("subscribe", "folio-subscribe", 60);
})();
