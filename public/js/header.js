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
    });
  }
});

function hdLogout() {
  localStorage.removeItem('avs_token');
  localStorage.removeItem('avs_usuario');
  window.location.href = '/login.html';
}
