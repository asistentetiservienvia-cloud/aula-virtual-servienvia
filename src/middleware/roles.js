// Restringe una ruta a uno o más roles. Debe usarse DESPUÉS de autenticar.
// Ej.: router.post('/', autenticar, requiereRol('administrador'), handler)
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado', codigo: 'sin_token' });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'No tienes permisos para esta acción',
        codigo: 'sin_permiso',
      });
    }
    next();
  };
}

module.exports = { requiereRol };
