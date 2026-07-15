// public/js/header.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('avs_token');
  const sesion = JSON.parse(localStorage.getItem('avs_usuario') || 'null');
  
  const loggedOut = document.getElementById('hd-logged-out');
  const loggedIn = document.getElementById('hd-logged-in');
  
  if (token && sesion) {
    if(loggedOut) loggedOut.style.display = 'none';
    if(loggedIn) {
      loggedIn.style.display = 'flex';
      const av = document.getElementById('hd-av');
      if(av) av.textContent = ((sesion.nombre[0]||'') + (sesion.nombre.split(' ')[1]?.[0]||'')).toUpperCase();
      const link = document.getElementById('hd-av-link');
      if(link) {
        link.href = sesion.rol === 'administrador' ? '/admin.html' : '/dashboard.html';
        link.innerHTML = `<div class="hd-av" id="hd-av">${av?av.textContent:'U'}</div> Mi Panel`;
      }
    }
  } else {
    if(loggedOut) loggedOut.style.display = 'flex';
    if(loggedIn) loggedIn.style.display = 'none';
  }

  // Mobile menu toggle
  const toggle = document.getElementById('hd-toggle');
  const nav = document.getElementById('hd-nav');
  if(toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const wrapper = document.querySelector('.hd-dropdown-wrapper');
      if(wrapper) wrapper.classList.toggle('open');
    });
  }

  // Cargar categorías dinámicamente en el dropdown
  const catDrop = document.getElementById('hd-cat-dropdown');
  if(catDrop) {
    fetch(window.location.origin + '/api/categorias')
      .then(res => res.json())
      .then(data => {
        const cats = data.categorias || [];
        if(cats.length === 0) {
          catDrop.innerHTML = '<div style="padding:10px; color:#6a6f73; font-size:13px; text-align:center">No hay categorías</div>';
        } else {
          catDrop.innerHTML = cats.map(c => {
            const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
            if (isHome && typeof filtrarCategoria === 'function') {
              return `<a href="#" onclick="event.preventDefault(); filtrarCategoria('${c.nombre}')" class="hd-drop-item">
                <span class="hd-drop-icon">${c.icono || '📚'}</span>
                ${c.nombre}
              </a>`;
            } else {
              return `<a href="/?cat=${encodeURIComponent(c.nombre)}#cursos-sec" class="hd-drop-item">
                <span class="hd-drop-icon">${c.icono || '📚'}</span>
                ${c.nombre}
              </a>`;
            }
          }).join('');
        }
      })
      .catch(() => {
        catDrop.innerHTML = '<div style="padding:10px; color:#ff6b6b; font-size:13px; text-align:center">Error al cargar</div>';
      });
  }
});

function hdLogout() {
  localStorage.removeItem('avs_token');
  localStorage.removeItem('avs_usuario');
  window.location.href = '/login.html';
}
