const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'public', 'admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Sidebar Nav
content = content.replace(
  /<a id="nav-cursos" onclick="switchTab\('cursos'\)">(.*?)<\/a>/,
  `<a id="nav-cursos" onclick="switchTab('cursos')">$1</a>
      <a id="nav-categorias" onclick="switchTab('categorias')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Categorías</a>`
);

// 2. Main View
const viewCategorias = `
    <!-- VISTA CATEGORIAS -->
    <div id="view-categorias" style="display:none">
      <div class="topline">
        <h1>Gestión de categorías</h1>
        <button class="btn btn-solid" onclick="openCrearCategoria()">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nueva categoría
        </button>
      </div>
      <p class="sub">Administra las agrupaciones de los cursos (Ej. Programación, Marketing, etc.).</p>

      <div class="table-wrap">
        <div class="loading" id="loading-categorias" style="display:none"><div class="ring"></div>Cargando categorías…</div>
        <table id="tabla-categorias">
          <thead>
            <tr><th>Ícono</th><th>Nombre</th><th>Descripción</th><th style="text-align:right">Acciones</th></tr>
          </thead>
          <tbody id="tbody-categorias"></tbody>
        </table>
        <div class="empty" id="empty-categorias" style="display:none">
          <div class="ic"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></div>
          <h3>No hay categorías</h3><p>Crea la primera categoría para organizar los cursos.</p>
        </div>
      </div>
    </div>
`;
content = content.replace('  </main>', viewCategorias + '  </main>');

// 3. Update Course Modal
const courseCatField = `
    <div class="field">
      <label>Categoría</label>
      <select id="f-ccategoria">
        <option value="">Sin categoría</option>
      </select>
    </div>
`;
content = content.replace(
  /<div class="field">\s*<label>Publicado<\/label>/,
  courseCatField + '    <div class="field">\n      <label>Publicado</label>'
);

// 4. Modal Categorias
const modalCategoria = `
<!-- MODAL CATEGORIA -->
<div class="modal-bg" id="modal-categoria">
  <div class="modal">
    <button class="x" onclick="closeFormCategoria()">×</button>
    <h2 id="form-cat-title">Crear categoría</h2>
    <div class="field">
      <label>Nombre de la categoría</label>
      <input id="f-catnombre" placeholder="Ej. Inteligencia Artificial">
    </div>
    <div class="field">
      <label>Ícono (Emoji o texto)</label>
      <input id="f-caticono" placeholder="Ej. 🤖">
      <div class="hint">Puedes usar un emoji o pegar un código SVG.</div>
    </div>
    <div class="field">
      <label>Descripción (Opcional)</label>
      <textarea id="f-catdesc" rows="3" placeholder="Breve descripción..."></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeFormCategoria()">Cancelar</button>
      <button class="btn btn-solid" onclick="guardarCategoria()" id="form-save-cat">Guardar</button>
    </div>
  </div>
</div>
`;
content = content.replace('<!-- MODAL LECCION -->', modalCategoria + '\n<!-- MODAL LECCION -->');

// 5. JavaScript variables & logic
content = content.replace(
  /let cursos = \[\];/,
  `let cursos = [];
let categorias = [];
let editCatId = null;`
);

content = content.replace(
  /function switchTab\(tab\) \{/,
  `function switchTab(tab) {
  document.getElementById('nav-usuarios').classList.toggle('active', tab === 'usuarios');
  document.getElementById('nav-cursos').classList.toggle('active', tab === 'cursos');
  document.getElementById('nav-categorias').classList.toggle('active', tab === 'categorias');
  
  document.getElementById('view-usuarios').style.display = tab === 'usuarios' ? 'block' : 'none';
  document.getElementById('view-cursos').style.display = tab === 'cursos' ? 'block' : 'none';
  document.getElementById('view-categorias').style.display = tab === 'categorias' ? 'block' : 'none';
  
  if (tab === 'cursos' && cursos.length === 0) cargarCursos();
  if (tab === 'categorias' && categorias.length === 0) cargarCategorias();`
);

// We need to fetch categories in cargar() because they are needed for the course dropdown even if we don't switch to the categorias tab immediately!
content = content.replace(
  /async function cargar\(\)\{([\s\S]*?)const data = await api\('GET', '\/api\/usuarios'\);/,
  `async function cargar(){$1const data = await api('GET', '/api/usuarios');
    await cargarCategorias(false); // Carga silenciosa para llenar selects`
);

// Inject JS Functions
const jsCategorias = `
// --- GESTIÓN DE CATEGORÍAS ---
async function cargarCategorias(renderizar = true) {
  if(renderizar) {
    document.getElementById('loading-categorias').style.display = 'block';
    document.getElementById('tabla-categorias').style.display = 'none';
  }
  try {
    const data = await api('GET', '/api/categorias');
    categorias = data.categorias || [];
    
    // Actualizar el select de cursos
    const sel = document.getElementById('f-ccategoria');
    if(sel) {
      sel.innerHTML = '<option value="">Sin categoría</option>' + categorias.map(c => \`<option value="\${c.id}">\${c.nombre}</option>\`).join('');
    }
    
    if(renderizar) renderCategorias();
  } catch(e) {
    if(renderizar) showToast(e.message, true);
  } finally {
    if(renderizar) {
      document.getElementById('loading-categorias').style.display = 'none';
      document.getElementById('tabla-categorias').style.display = '';
    }
  }
}

function renderCategorias() {
  const tb = document.getElementById('tbody-categorias');
  document.getElementById('empty-categorias').style.display = categorias.length ? 'none' : 'block';
  tb.innerHTML = categorias.map(c => \`
    <tr>
      <td style="font-size:24px">\${c.icono || ''}</td>
      <td style="font-weight:700">\${c.nombre}</td>
      <td style="color:var(--muted); font-size:13px">\${c.descripcion || ''}</td>
      <td>
        <div class="actions">
          <button class="iconbtn" title="Editar" onclick="openEditarCategoria(\${c.id})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>
          <button class="iconbtn danger" title="Eliminar" onclick="eliminarCategoria(\${c.id})"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
        </div>
      </td>
    </tr>\`).join('');
}

function openCrearCategoria() {
  editCatId = null;
  document.getElementById('form-cat-title').textContent = 'Crear categoría';
  document.getElementById('f-catnombre').value = '';
  document.getElementById('f-caticono').value = '';
  document.getElementById('f-catdesc').value = '';
  show('modal-categoria');
}

function openEditarCategoria(id) {
  const c = categorias.find(x => x.id === id);
  if(!c) return;
  editCatId = id;
  document.getElementById('form-cat-title').textContent = 'Editar categoría';
  document.getElementById('f-catnombre').value = c.nombre;
  document.getElementById('f-caticono').value = c.icono || '';
  document.getElementById('f-catdesc').value = c.descripcion || '';
  show('modal-categoria');
}

function closeFormCategoria() { close('modal-categoria'); }

async function guardarCategoria() {
  const nombre = document.getElementById('f-catnombre').value.trim();
  const icono = document.getElementById('f-caticono').value.trim();
  const descripcion = document.getElementById('f-catdesc').value.trim();

  if (!nombre) return showToast('El nombre es requerido', true);

  const btn = document.getElementById('form-save-cat');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';

  try {
    if (editCatId) {
      await api('PUT', '/api/admin/categorias/' + editCatId, { nombre, icono, descripcion });
      showToast('Categoría actualizada');
    } else {
      await api('POST', '/api/admin/categorias', { nombre, icono, descripcion });
      showToast('Categoría creada');
    }
    closeFormCategoria();
    await cargarCategorias(true);
  } catch(e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false; btn.textContent = 'Guardar';
  }
}

async function eliminarCategoria(id) {
  if(!confirm('¿Estás seguro de eliminar esta categoría? (Los cursos asignados no se borrarán, solo quedarán sin categoría)')) return;
  try {
    await api('DELETE', '/api/admin/categorias/' + id);
    showToast('Categoría eliminada');
    await cargarCategorias(true);
  } catch(e) { showToast(e.message, true); }
}

`;
content = content.replace('// --- GESTIÓN DE CURSOS ---', jsCategorias + '\n// --- GESTIÓN DE CURSOS ---');

// Modify the guardCurso function to pass categoria_id
content = content.replace(
  /const publicado = document\.getElementById\('f-cpub'\)\.value === 'true';/,
  `const publicado = document.getElementById('f-cpub').value === 'true';
  const categoria_id = document.getElementById('f-ccategoria').value || null;`
);

content = content.replace(
  /await api\('PUT', '\/api\/admin\/cursos\/' \+ editCursoId, \{ titulo, descripcion, portada_url, publicado \}\);/,
  `await api('PUT', '/api/admin/cursos/' + editCursoId, { titulo, descripcion, portada_url, publicado, categoria_id });`
);

content = content.replace(
  /await api\('POST', '\/api\/admin\/cursos', \{ titulo, descripcion, portada_url, publicado \}\);/,
  `await api('POST', '/api/admin/cursos', { titulo, descripcion, portada_url, publicado, categoria_id });`
);

// Modifiy openEditarCurso to select the category
content = content.replace(
  /document\.getElementById\('f-cpub'\)\.value = c\.publicado \? 'true' : 'false';/,
  `document.getElementById('f-cpub').value = c.publicado ? 'true' : 'false';
  if(c.categoria) {
    // Find the ID of the category from its name (adminCursosController currently returns cat.nombre AS categoria)
    // Actually, we should change adminCursosController to return categoria_id, but for now we can find by name:
    const cObj = categorias.find(cat => cat.nombre === c.categoria);
    document.getElementById('f-ccategoria').value = cObj ? cObj.id : '';
  } else {
    document.getElementById('f-ccategoria').value = '';
  }`
);

content = content.replace(
  /document\.getElementById\('f-cpub'\)\.value = 'false';/,
  `document.getElementById('f-cpub').value = 'false';
  document.getElementById('f-ccategoria').value = '';`
);

fs.writeFileSync(adminPath, content);
console.log('admin.html parcheado correctamente');
