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
app.get('/api/event',async (req, res) =>{
const{nombre,fecha,tag}=req.query
try{
let query=`SELECT * FROM events WHERE 1=1`
const params = [];

if (nombre) {
  params.push(`%${nombre}%`);
  query += ` AND nombre ILIKE $${params.length}`;
}

if (fecha) {
  params.push(fecha);
  query += ` AND DATE (fecha) = $${params.length}`;
}

if (tag) {
  params.push(`%${tag}%`);
  query += ` AND tag ILIKE $${params.length}`;
}
const { rows } = await pool.query(query, params);
res.json(rows);
}
catch (err) {
  console.error(err);
  res.status(500).send('Error al buscar los eventos');
}
})

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
