const express = require('express');
const cors = require('cors');
const pool = require('./BD')

const app = express();
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Bienvenido desde el backend');
});
app.get('/api/event', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.nombre,
        e.descripcion,
        e.fecha,
        e.duracion_minutos,
        e.precio,
        e.inscripcion_activada,
        e.maxima_asistencia,

        json_build_object(
          'id', u.id,
          'nombre', u.primer_nombre,
          'apellido', u.ultimo_nombre,
          'username', u.username
        ) AS usuario_creador,

        json_build_object(
          'id', el.id,
          'nombre', el.nombre,
          'direccion', el.direccion
        ) AS ubicacion

      FROM events e
      JOIN users u ON e.id_creator_user = u.id
      JOIN event_locations el ON e.id_evento_locacion = el.id
      ORDER BY e.fecha
      LIMIT $1 OFFSET $2;
    `, [limit, offset]);

    res.json({
      page,
      limit,
      resultados: result.rows.length,
      eventos: result.rows
    });

  } catch (err) {
    console.error('Error en /api/event:', err);
    res.status(500).json({ error: 'Error obteniendo eventos' });
  }
})
app.get('/api/event', async (req, res) => {
  const { nombre, fecha, tag } = req.query;
  try {
    console.log('Parametros recibidos:', { nombre, fecha, tag });
    if (!nombre && !fecha && !tag) {
      return res.status(400).json({ mensaje: 'Debes proporcionar al menos un parámetro de búsqueda: nombre, fecha o tag.' });
    }
    let query = 'SELECT * FROM events WHERE true';
    const params = [];

    if (nombre) {
      params.push(`%${nombre}%`);
      query += ` AND nombre ILIKE $${params.length}`;
    }

    if (fecha) {
      params.push(fecha);
      query += ` AND DATE(fecha) = $${params.length}`;
    }

    if (tag) {
      params.push(`%${tag}%`);
      query += ` AND tag ILIKE $${params.length}`;
    }

    console.log('Consulta SQL:', query);
    console.log('Parametros SQL:', params);

    const { rows } = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron eventos que coincidan con la búsqueda.' });
    }
    res.json(rows);
  } catch (err) {
    console.error('Error al buscar evento', err);
    res.status(500).send({ mensaje: 'Error al buscar los eventos' });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
