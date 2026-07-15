const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

const newHeader = `<header class="hd-wrapper">
  <nav class="hd-nav" id="hd-nav">
    <div class="hd-left">
      <a class="hd-logo" href="/"><span class="dot"></span>Aula Virtual</a>
    </div>
    
    <button class="hd-toggle" id="hd-toggle">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>

    <div class="hd-links">
      <a class="hd-link" href="/">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Explorar Cursos
      </a>
      <a class="hd-link" href="/acerca-de.html">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        Acerca de
      </a>
    </div>

    <!-- Auth Section -->
    <div class="hd-right" id="hd-logged-out" style="display: none;">
      <a class="hd-btn-ghost" href="/login.html">Iniciar sesión</a>
      <a class="hd-btn-solid" href="/registro.html">Regístrate</a>
    </div>

    <div class="hd-right" id="hd-logged-in" style="display: none;">
      <a class="hd-profile" href="/dashboard.html" id="hd-av-link">
        <div class="hd-av" id="hd-av">··</div>
        Mi Panel
      </a>
      <button class="hd-logout" onclick="hdLogout()" title="Cerrar sesión">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  </nav>
</header>`;

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if it doesn't have a <header>
  if (!content.includes('<header>')) {
    console.log(`Skipping ${file} (no <header> found)`);
    return;
  }

  // Replace <header>...</header> with newHeader
  content = content.replace(/<header>[\s\S]*?<\/header>/, newHeader);

  // Inject <link rel="stylesheet" href="/css/header.css"> before </head>
  if (!content.includes('/css/header.css')) {
    content = content.replace('</head>', '  <link rel="stylesheet" href="/css/header.css">\n</head>');
  }

  // Inject <script src="/js/header.js"></script> before </body>
  if (!content.includes('/js/header.js')) {
    content = content.replace('</body>', '  <script src="/js/header.js"></script>\n</body>');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
