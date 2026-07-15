const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Reemplazar la constante CATS por una variable vacía
content = content.replace(
  /const CATS = \[\s*\{nombre:'Programación'[\s\S]*?\];/,
  `let CATS = [];`
);

// 2. Hacer setupCats asíncrono y cargar de la API
content = content.replace(
  /function setupCats\(\)\{([\s\S]*?)document\.getElementById\('skills'\)\.innerHTML = /g,
  `async function setupCats(){
  try {
    const resp = await fetch(API + '/api/categorias');
    const data = await resp.json();
    if(data.categorias) CATS = data.categorias;
  } catch(e) {
    console.error('Error cargando categorias', e);
  }

  document.getElementById('cats').innerHTML = CATS.map(c=>\`
    <div class="cat" data-cat="\${c.nombre}" onclick="filtrarCategoria('\${c.nombre}')">
      <div class="ic">\${c.icono || ''}</div><h3>\${c.nombre}</h3><small>Ver cursos</small>
    </div>\`).join('');
  document.getElementById('dropdown-cats').innerHTML = CATS.map(c=>\`
    <a onclick="filtrarCategoria('\${c.nombre}')">\${c.nombre} <span>›</span></a>\`).join('');
  document.getElementById('skills').innerHTML = `
);

// 3. Reemplazar llamadas finales
content = content.replace(
  /setupCats\(\);\s*cargarCursos\(\);/,
  `(async () => {
  await setupCats();
  cargarCursos();
})();`
);

fs.writeFileSync(indexPath, content);
console.log('index.html parcheado correctamente');
