// Prueba de integración: levanta la API contra una BD PostgreSQL EN MEMORIA (pg-mem),
// cargando el schema.sql y seed.sql reales del proyecto, y ejercita las rutas por HTTP.
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');
const request = require('supertest');

const db = require('../src/db');
const { crearApp } = require('../src/app');

// --- utilidades de aserción ---
let pass = 0, fail = 0;
function check(nombre, cond) {
  if (cond) { pass++; console.log(`  OK  ${nombre}`); }
  else { fail++; console.log(`  XX  ${nombre}`); }
}

async function main() {
  // 1) Crear BD en memoria y cargar esquema + datos
  const mem = newDb();

  // pg-mem no implementa algunas funciones de catálogo; las registramos como no-op.
  mem.public.registerFunction({ name: 'now', returns: require('pg-mem').DataType.timestamp, implementation: () => new Date() });

  const schemaPath = path.resolve(__dirname, '../sql/schema.sql');
  const seedPath = path.resolve(__dirname, '../sql/seed.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const seed = fs.readFileSync(seedPath, 'utf8');

  mem.public.none(schema);
  mem.public.none(seed);
  console.log('BD en memoria cargada con schema.sql y seed.sql\n');

  // 2) Inyectar el pool de pg-mem en la capa db del backend
  const { Pool } = mem.adapters.createPg();
  db.setPool(new Pool());

  const app = crearApp();

  // ---------- AUTENTICACIÓN ----------
  console.log('AUTENTICACIÓN');

  // correo inexistente -> 404 cuenta_no_encontrada
  let r = await request(app).post('/api/auth/login').send({ correo: 'nadie@x.com', contrasena: 'x' });
  check('login con correo inexistente -> 404 cuenta_no_encontrada', r.status === 404 && r.body.codigo === 'cuenta_no_encontrada');

  // contraseña incorrecta -> 401 credenciales_invalidas
  r = await request(app).post('/api/auth/login').send({ correo: 'maria@servienvia.com', contrasena: 'mala' });
  check('login con contraseña incorrecta -> 401 credenciales_invalidas', r.status === 401 && r.body.codigo === 'credenciales_invalidas');

  // credenciales correctas (estudiante) -> token
  r = await request(app).post('/api/auth/login').send({ correo: 'maria@servienvia.com', contrasena: 'servienvia2026' });
  check('login correcto de María -> 200 + token', r.status === 200 && !!r.body.token);
  check('el usuario devuelto es estudiante', r.body.usuario && r.body.usuario.rol === 'estudiante');
  const tokenMaria = r.body.token;

  // login admin -> token de administrador
  r = await request(app).post('/api/auth/login').send({ correo: 'admin@servienvia.com', contrasena: 'servienvia2026' });
  check('login correcto de Admin -> 200 + rol administrador', r.status === 200 && r.body.usuario.rol === 'administrador');
  const tokenAdmin = r.body.token;

  // /me con token
  r = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokenMaria}`);
  check('GET /me devuelve el perfil de María', r.status === 200 && r.body.usuario.correo === 'maria@servienvia.com');

  // /me sin token -> 401
  r = await request(app).get('/api/auth/me');
  check('GET /me sin token -> 401', r.status === 401);

  // ---------- CRUD DE USUARIOS (RBAC) ----------
  console.log('\nCRUD DE USUARIOS (solo administrador)');

  // un estudiante NO puede listar usuarios -> 403
  r = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenMaria}`);
  check('estudiante intenta listar usuarios -> 403 sin_permiso', r.status === 403 && r.body.codigo === 'sin_permiso');

  // admin lista usuarios
  r = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenAdmin}`);
  check('admin lista usuarios -> 200 con 6 usuarios', r.status === 200 && r.body.total === 6);
  check('la lista NUNCA incluye contrasena_hash', r.body.usuarios.every(u => u.contrasena_hash === undefined));

  // admin crea un usuario
  r = await request(app).post('/api/usuarios').set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ nombre: 'Nuevo Docente', correo: 'docente@servienvia.com', contrasena: 'clave1234', rol: 'instructor' });
  check('admin crea usuario -> 201', r.status === 201 && r.body.usuario.id);
  check('el nuevo usuario tiene rol instructor', r.body.usuario.rol === 'instructor');
  const nuevoId = r.body.usuario.id;

  // el nuevo usuario puede iniciar sesión con su contraseña
  r = await request(app).post('/api/auth/login').send({ correo: 'docente@servienvia.com', contrasena: 'clave1234' });
  check('el usuario recién creado puede iniciar sesión', r.status === 200 && !!r.body.token);

  // correo duplicado -> 409
  r = await request(app).post('/api/usuarios').set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ nombre: 'Repetida', correo: 'maria@servienvia.com', contrasena: 'x12345', rol: 'estudiante' });
  check('crear con correo duplicado -> 409 correo_duplicado', r.status === 409 && r.body.codigo === 'correo_duplicado');

  // admin edita el usuario
  r = await request(app).put(`/api/usuarios/${nuevoId}`).set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ profesion: 'Mentor de backend', rol: 'institucion' });
  check('admin edita usuario (profesión + rol)', r.status === 200 && r.body.usuario.rol === 'institucion' && r.body.usuario.profesion === 'Mentor de backend');

  // admin desactiva (baja lógica)
  r = await request(app).delete(`/api/usuarios/${nuevoId}`).set('Authorization', `Bearer ${tokenAdmin}`);
  check('admin desactiva usuario (baja lógica)', r.status === 200 && r.body.usuario.activo === false);

  // un usuario desactivado no puede iniciar sesión
  r = await request(app).post('/api/auth/login').send({ correo: 'docente@servienvia.com', contrasena: 'clave1234' });
  check('usuario desactivado no puede iniciar sesión -> 403 cuenta_inactiva', r.status === 403 && r.body.codigo === 'cuenta_inactiva');

  // ---------- CATÁLOGO DE CURSOS ----------
  console.log('\nCATÁLOGO DE CURSOS');

  r = await request(app).get('/api/cursos');
  check('listado público de cursos -> 200 con 6 cursos', r.status === 200 && r.body.total === 6);
  check('cada curso trae instructor y categoría', r.body.cursos.every(c => c.instructor && c.categoria !== undefined));

  r = await request(app).get('/api/cursos/1');
  check('detalle del curso 1 (Python) -> 200', r.status === 200 && r.body.curso.id === 1);
  check('el curso 1 tiene 4 secciones', r.body.curso.secciones.length === 4);
  const totalLecciones = r.body.curso.secciones.reduce((a, s) => a + s.lecciones.length, 0);
  check('el curso 1 tiene 12 lecciones en total', totalLecciones === 12);

  // ---------- INSCRIPCIONES Y PROGRESO ----------
  console.log('\nINSCRIPCIONES Y PROGRESO');

  // login María (estudiante con inscripciones en el seed)
  r = await request(app).post('/api/auth/login').send({ correo: 'maria@servienvia.com', contrasena: 'servienvia2026' });
  const tkMaria = r.body.token;

  r = await request(app).get('/api/inscripciones').set('Authorization', `Bearer ${tkMaria}`);
  check('María lista sus inscripciones -> 6', r.status === 200 && r.body.total === 6);
  check('cada inscripción trae título, instructor y progreso', r.body.inscripciones.every(i => i.titulo && i.instructor && i.progreso !== undefined));

  r = await request(app).get('/api/inscripciones?estado=done').set('Authorization', `Bearer ${tkMaria}`);
  check('filtro estado=done -> 1 curso completado', r.status === 200 && r.body.total === 1);
  r = await request(app).get('/api/inscripciones?estado=progress').set('Authorization', `Bearer ${tkMaria}`);
  check('filtro estado=progress -> 4 cursos en progreso', r.body.total === 4);

  r = await request(app).get('/api/inscripciones');
  check('GET /inscripciones sin token -> 401', r.status === 401);

  // progreso por lección de la inscripción 1 (Python)
  r = await request(app).get('/api/inscripciones/1/progreso').set('Authorization', `Bearer ${tkMaria}`);
  check('progreso de la inscripción 1 -> 200 con detalle por lección', r.status === 200 && Array.isArray(r.body.progreso_lecciones));
  const completadasIni = r.body.progreso_lecciones.filter(p => p.completada).length;
  check('inscripción 1 tiene 4 lecciones completadas (seed)', completadasIni === 4);

  // marcar lección 5 -> recalcula 5/12 = 42%
  r = await request(app).put('/api/inscripciones/1/progreso').set('Authorization', `Bearer ${tkMaria}`).send({ leccion_id: 5, completada: true });
  check('marcar lección 5 -> progreso recalculado a 42%', r.status === 200 && r.body.progreso === 42);
  // marcar lección 6 (nueva) -> 6/12 = 50%
  r = await request(app).put('/api/inscripciones/1/progreso').set('Authorization', `Bearer ${tkMaria}`).send({ leccion_id: 6, completada: true });
  check('marcar lección 6 -> progreso 50%', r.status === 200 && r.body.progreso === 50);

  // favorito/archivado
  r = await request(app).put('/api/inscripciones/2').set('Authorization', `Bearer ${tkMaria}`).send({ archivado: true });
  check('archivar inscripción 2 -> archivado=true', r.status === 200 && r.body.inscripcion.archivado === true);
  r = await request(app).get('/api/inscripciones?archivado=true').set('Authorization', `Bearer ${tkMaria}`);
  check('filtro archivado=true -> 1 inscripción', r.body.total === 1);

  // inscribirse (Carlos, sin inscripciones en el seed)
  r = await request(app).post('/api/auth/login').send({ correo: 'carlos@servienvia.com', contrasena: 'servienvia2026' });
  const tkCarlos = r.body.token;
  r = await request(app).post('/api/inscripciones').set('Authorization', `Bearer ${tkCarlos}`).send({ curso_id: 1 });
  check('Carlos se inscribe al curso 1 -> 201', r.status === 201 && !!r.body.inscripcion.id);
  const insCarlos = r.body.inscripcion.id;
  r = await request(app).post('/api/inscripciones').set('Authorization', `Bearer ${tkCarlos}`).send({ curso_id: 1 });
  check('inscripción duplicada -> 409 ya_inscrito', r.status === 409 && r.body.codigo === 'ya_inscrito');

  // aislamiento entre usuarios
  r = await request(app).get(`/api/inscripciones/${insCarlos}/progreso`).set('Authorization', `Bearer ${tkMaria}`);
  check('María no accede a inscripción ajena -> 404', r.status === 404);

  // ---------- ACTIVIDAD / RACHAS ----------
  console.log('\nACTIVIDAD / RACHAS');
  r = await request(app).get('/api/actividad').set('Authorization', `Bearer ${tkMaria}`);
  check('actividad de María -> 200 con lista de días', r.status === 200 && Array.isArray(r.body.actividad));
  check('racha de María = 5 días consecutivos (seed)', r.body.racha_dias === 5);
  check('minutos de la semana = 275 (seed)', r.body.minutos_semana === 275);

  r = await request(app).post('/api/actividad').set('Authorization', `Bearer ${tkMaria}`).send({ minutos: 20 });
  check('registrar 20 min hoy -> 201', r.status === 201);
  r = await request(app).get('/api/actividad').set('Authorization', `Bearer ${tkMaria}`);
  check('minutos de la semana ahora = 295', r.body.minutos_semana === 295);

  // ---------- RESULTADO ----------
  console.log(`\n================ RESULTADO ================`);
  console.log(`  Pruebas superadas: ${pass}`);
  console.log(`  Pruebas fallidas:  ${fail}`);
  console.log(`===========================================`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error('Fallo en la prueba:', e); process.exit(1); });
