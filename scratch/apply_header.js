const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

const newHeader = `<header class="hd-wrapper">
  <nav class="hd-nav" id="hd-nav">
    <div class="hd-left">
      <a class="hd-logo" href="/"><span class="dot"></span>Aula Virtual</a>
    </div>
    
    <button class="hd-toggle" id="hd-toggle">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>

    <div class="hd-mobile-menu">
      <div class="hd-links">
        <div class="hd-dropdown-wrapper">
          <a class="hd-link" href="/">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            Explorar Cursos
            <svg class="hd-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:4px"><path d="m6 9 6 6 6-6"/></svg>
          </a>
          <div class="hd-dropdown" id="hd-cat-dropdown">
            <!-- Cargadas dinámicamente -->
            <div style="padding:10px; color:#6a6f73; font-size:13px; text-align:center">Cargando categorías...</div>
          </div>
        </div>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  </nav>
</header>`;

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if it doesn't have a <header>
  if (!content.includes('<header class="hd-wrapper">')) {
    // Maybe we applied the old header, so let's match anything
    if (!content.includes('<header>')) {
      if(!content.includes('hd-wrapper')) {
         console.log(`Skipping ${file} (no <header> found)`);
         return;
      }
    }
  }

  // Replace old or new header
  content = content.replace(/<header[\s\S]*?<\/header>/, newHeader);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
