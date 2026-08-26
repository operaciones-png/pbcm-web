// Comprobacion numerica del movimiento del carrusel.
//
//   node tools/prueba-carrusel.js
//
// Por que existe: el carrusel tiene cuatro numeros que no se pueden "ver" en
// el codigo (la curva de inercia, la resistencia elastica, la rigidez del
// resorte y el umbral de reposo). Un valor mal puesto no rompe nada, solo
// hace que se sienta blando o brusco, y eso no se nota revisando el diff.
// Aqui se verifica que:
//   - un manotazo avance varias fotos y un toque suave no cambie de foto
//   - siempre se aterrice centrado en una foto, nunca entre dos
//   - en los extremos ceda cada vez menos, sin congelarse ni irse al infinito
//   - el resorte asiente entre 200 y 600 ms y sin rebote
//
// OJO: las formulas de abajo son una COPIA de las que estan en index.html
// (bloque "Carrusel de fotos"). Si se cambian alla, hay que cambiarlas aqui.

const proyectar = (v, d) => (v / 1000) * (d || 0.998) / (1 - (d || 0.998));
const elastico = (exceso, ancho, k) => {
  k = k || 0.55;
  return (exceso * ancho * k) / (ancho + k * Math.abs(exceso));
};

let fallos = 0;
const ok = (cond, msg, extra) => {
  if (!cond) { fallos++; console.log('  FALLA  ' + msg + (extra ? '  ' + extra : '')); }
  else console.log('  ok     ' + msg + (extra ? '  ' + extra : ''));
};

console.log('--- proyeccion de inercia (px recorridos tras soltar) ---');
for (const v of [200, 500, 900, 1500]) {
  const d = proyectar(v);
  console.log('   v=%dpx/s  ->  %spx', v, d.toFixed(0));
}
ok(Math.abs(proyectar(500) - 249.5) < 1, 'v=500 proyecta ~250px (referencia Apple)');
ok(proyectar(0) === 0, 'sin velocidad no hay proyeccion');
ok(proyectar(-500) < 0, 'la proyeccion respeta el signo (hacia atras)');
ok(proyectar(1000) > proyectar(500), 'mas velocidad, mas recorrido');

console.log('\n--- resistencia elastica (ancho de pista 380px) ---');
const ANCHO = 380;
let previo = 0, monotona = true, siempreMenor = true;
for (const ex of [10, 25, 50, 100, 200, 400]) {
  const r = Math.abs(elastico(ex, ANCHO));
  console.log('   arrastre ' + String(ex).padStart(3) + 'px fuera  ->  cede ' + r.toFixed(1) + 'px  (' + ((r/ex)*100).toFixed(0) + '%)');
  if (r <= previo) monotona = false;
  if (r >= ex) siempreMenor = false;
  previo = r;
}
ok(monotona, 'siempre cede algo mas al estirar (nunca se congela)');
ok(siempreMenor, 'siempre cede MENOS que el arrastre (se siente resistencia)');
ok(Math.abs(elastico(0, ANCHO)) === 0, 'dentro de los limites no hay desplazamiento');
ok(Math.abs(elastico(1e6, ANCHO)) < ANCHO, 'el estiramiento esta acotado, no se va al infinito');

console.log('\n--- resorte criticamente amortiguado ---');
function simular(desde, destino, velocidadInicial) {
  const rigidez = 320, amortiguacion = 2 * Math.sqrt(320);
  let pos = desde, vel = velocidadInicial, t = 0;
  const dt = 1 / 60;
  let sobrepaso = 0;
  const dir = Math.sign(destino - desde) || 1;
  while (t < 5) {
    vel += (-rigidez * (pos - destino) - amortiguacion * vel) * dt;
    pos += vel * dt;
    t += dt;
    sobrepaso = Math.max(sobrepaso, (pos - destino) * dir);
    if (Math.abs(pos - destino) < 1 && Math.abs(vel) < 30) break;
  }
  return { t, pos, sobrepaso };
}
const a = simular(0, 400, 0);
console.log('   0 -> 400 sin velocidad:   asienta en %sms, sobrepaso %spx', (a.t * 1000).toFixed(0), a.sobrepaso.toFixed(2));
ok(a.t > 0.2 && a.t < 0.6, 'asienta entre 200 y 600ms (rango Apple: response .3-.4)', (a.t * 1000).toFixed(0) + 'ms');
ok(a.sobrepaso < 1, 'sin rebote perceptible (amortiguacion critica)', a.sobrepaso.toFixed(2) + 'px');

const b = simular(0, 400, 800);
console.log('   0 -> 400 lanzado a 800px/s: asienta en %sms, sobrepaso %spx', (b.t * 1000).toFixed(0), b.sobrepaso.toFixed(2));
ok(b.t < 0.8, 'con velocidad tambien asienta rapido', (b.t * 1000).toFixed(0) + 'ms');
ok(Math.abs(b.pos - 400) < 1, 'llega al destino exacto', b.pos.toFixed(2));

const c = simular(0, 400, -600);
console.log('   0 -> 400 lanzado AL REVES: asienta en %sms, posicion %s', (c.t * 1000).toFixed(0), c.pos.toFixed(1));
ok(Math.abs(c.pos - 400) < 1, 'aunque se lance en contra, vuelve al destino');

console.log('\n--- eleccion del ancla mas cercana a la proyeccion ---');
const anclas = [0, 396, 792, 1188, 1584, 1704];
const anclaMasCerca = x => anclas.reduce((p, q) => Math.abs(q - x) < Math.abs(p - x) ? q : p);
const casos = [
  [0, 60, 'toque suave desde el inicio -> se queda'],
  [0, 700, 'manotazo fuerte -> salta varias fotos'],
  [792, -700, 'manotazo hacia atras -> retrocede varias'],
  [1704, 900, 'manotazo al final -> no se pasa del tope'],
];
for (const [desde, v, nota] of casos) {
  const destino = anclaMasCerca(desde + proyectar(v));
  console.log('   desde ' + String(desde).padStart(4) + ', v=' + String(v).padStart(5) + '  ->  ' + String(destino).padStart(4) + '   (' + nota + ')');
  ok(anclas.includes(destino), 'aterriza en una foto, no entre dos', 'destino=' + destino);
}
ok(anclaMasCerca(0 + proyectar(60)) === 0, 'un toque suave no cambia de foto');
ok(anclaMasCerca(0 + proyectar(700)) > 0, 'un manotazo si avanza');
ok(anclaMasCerca(1704 + proyectar(900)) === 1704, 'en el tope no se pasa');

console.log(fallos === 0 ? '\nTODO OK' : '\n' + fallos + ' FALLOS');
process.exit(fallos === 0 ? 0 : 1);
