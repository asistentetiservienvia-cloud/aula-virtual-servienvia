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
      const iniciales = ((sesion.nombre[0]||'') + (sesion.nombre.split(' ')[1]?.[0]||'')).toUpperCase();
      // Avatar mini (barra escritorio)
      const av = document.getElementById('hd-av');
      if(av) av.textContent = iniciales;
      // Bloque completo de usuario (solo móvil)
      const userAv = document.getElementById('hd-user-av');
      if(userAv) userAv.textContent = iniciales;
      const userName = document.getElementById('hd-user-name');
      if(userName) userName.textContent = sesion.nombre;
      const userMail = document.getElementById('hd-user-mail');
      if(userMail) userMail.textContent = sesion.correo;
      const userRol = document.getElementById('hd-user-rol');
      if(userRol) {
        const rolLabel = {
          administrador: 'Administrador',
          estudiante: 'Estudiante',
          instructor: 'Instructor',
          institucion: 'Institución'
        }[sesion.rol] || sesion.rol;
        userRol.textContent = rolLabel;
      }
      const link = document.getElementById('hd-av-link');
      if(link) {
        link.href = sesion.rol === 'administrador' ? '/admin.html' : '/dashboard.html';
        link.innerHTML = `<div class="hd-av">${iniciales}</div> Mi Panel`;
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

    // Cerrar el menú móvil al tocar cualquier enlace del menú (D)
    // Excepto el link "Explorar Cursos" que solo abre/cierra el sub-dropdown.
    document.querySelectorAll('.hd-mobile-menu a').forEach(a => {
      a.addEventListener('click', (e) => {
        // Si es el toggle del dropdown "Explorar cursos", no cerrar el menú.
        if(a.closest('.hd-dropdown-wrapper') && a.classList.contains('hd-link')) return;
        // El resto de enlaces cierran el menú antes de navegar.
        nav.classList.remove('open');
        const wrapper = document.querySelector('.hd-dropdown-wrapper');
        if(wrapper) wrapper.classList.remove('open');
      });
    });
    // También cerrar al pulsar el botón de logout
    const btnLogout = document.querySelector('.hd-mobile-menu .hd-logout');
    if(btnLogout) {
      btnLogout.addEventListener('click', () => {
        nav.classList.remove('open');
      });
    }
  }

  // Dropdown "Explorar cursos": abrir/cerrar por clic (además del hover en escritorio)
  const dropWrapper = document.querySelector('.hd-dropdown-wrapper');
  if(dropWrapper) {
    const dropLink = dropWrapper.querySelector('.hd-link');
    if(dropLink) {
      dropLink.addEventListener('click', (e) => {
        e.preventDefault();
        dropWrapper.classList.toggle('open');
      });
    }
    // Cerrar al hacer clic fuera del dropdown
    document.addEventListener('click', (e) => {
      if(!dropWrapper.contains(e.target)) {
        dropWrapper.classList.remove('open');
      }
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
  window.location.replace('/login.html');
}

// Interceptar clics en cualquier botón de "Regístrate" para mostrar el modal de contacto
document.addEventListener('click', e => {
  const btn = e.target.closest('a[href="/registro.html"]');
  if (btn) {
    e.preventDefault();
    if (typeof abrirModalEnsenar === 'function') abrirModalEnsenar();
  }
});

// Inyectar el modal de contacto globalmente si no existe
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('modal-teach')) {
    const modalHTML = `
    <div class="modal-teach-overlay" id="modal-teach">
      <div class="modal-teach">
        <button class="modal-teach-close" onclick="cerrarModalEnsenar()" aria-label="Cerrar">&times;</button>
        <div class="modal-teach-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <h2>¿Quieres ser instructor?</h2>
        <p>Si quieres formar parte de nuestro equipo de instructores y compartir tu conocimiento en Aula Virtual Servienvia, comunícate con nuestros administradores. Estaremos encantados de conversar contigo sobre cómo integrarte.</p>
        <div class="modal-teach-contact">
          <div class="modal-teach-contact-label">Escríbenos a</div>
          <a class="modal-teach-contact-email" href="mailto:administracion@servienvia.com">administracion@servienvia.com</a>
        </div>
        <button class="hd-btn-solid modal-teach-cta" style="width:100%; border:none; justify-content:center; cursor:pointer;" onclick="cerrarModalEnsenar()">Entendido</button>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('modal-teach').addEventListener('click', function(e){
      if(e.target === this) cerrarModalEnsenar();
    });
  }
});

window.abrirModalEnsenar = function(){
  const m = document.getElementById('modal-teach');
  if(m) {
    m.classList.add('show');
    document.body.style.overflow='hidden';
  }
};
window.cerrarModalEnsenar = function(){
  const m = document.getElementById('modal-teach');
  if(m) {
    m.classList.remove('show');
    document.body.style.overflow='auto';
  }
};
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') cerrarModalEnsenar();
});
