// GA4 Tracking Code - G-J8ND35KCZW
// This file serves as a backup for GA4 configuration

(function() {
  // Load gtag.js
  var gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-J8ND35KCZW';
  document.head.appendChild(gtagScript);

  // Initialize GA4
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-J8ND35KCZW');
  
  // Make gtag globally available
  window.gtag = gtag;
})();