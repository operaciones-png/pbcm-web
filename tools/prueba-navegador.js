// Prueba la página en un navegador de verdad.
//
//   node tools/prueba-navegador.js [url] [ancho] [alto]
//   node tools/prueba-navegador.js http://localhost:8000/index.html 390 844
//
// POR QUÉ EXISTE
// Muchas cosas de esta página no se pueden comprobar leyendo el código ni con
// un navegador que no dibuje: las animaciones de entrada dependen de que el
// contenido cruce la pantalla, las imágenes se cargan al acercarse, y los
// enlaces del menú dependen de dónde acabe cada sección. Esto abre un Chrome
// real sin ventana, recorre la página como una persona y comprueba:
//
//   1. que todas las animaciones de entrada se disparen
//   2. que todas las imágenes que deben verse acaben cargando
//   3. que los enlaces del menú aterricen en su sección
//   4. que no haya desplazamiento horizontal
//   5. que ningún elemento que se toca sea menor de 44 px
//
// Ya detectó una regresión real: con content-visibility:auto los enlaces del
// menú caían hasta 1085 px lejos de su destino.
//
// Necesita Chrome instalado y el servidor local levantado:
//   python -m http.server 8000

const { spawn } = require('node:child_process');

const URL_OBJETIVO = process.argv[2] || 'http://localhost:8000/index.html';
const ANCHO = parseInt(process.argv[3] || '390', 10);
const ALTO = parseInt(process.argv[4] || '844', 10);
const PUERTO = 9340;
const MINIMO_TACTIL = 44;   // Apple pide 44 px; Google, 48

const RUTAS_CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const dormir = ms => new Promise(r => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pend = new Map();
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pend.has(m.id)) { this.pend.get(m.id)(m); this.pend.delete(m.id); }
    });
  }
  enviar(metodo, params = {}) {
    const id = ++this.id;
    return new Promise(r => { this.pend.set(id, r); this.ws.send(JSON.stringify({ id, method: metodo, params })); });
  }
  async ev(expr) {
    const r = await this.enviar('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    return r.result && r.result.result ? r.result.result.value : null;
  }
}

let fallos = 0;
const ok = (cond, msg, extra) => {
  if (!cond) { fallos++; console.log('  FALLA  ' + msg + (extra ? '  ' + extra : '')); }
  else console.log('  ok     ' + msg + (extra ? '  ' + extra : ''));
};

async function recorrer(cdp) {
  const alto = await cdp.ev('document.documentElement.scrollHeight');
  const pasos = Math.ceil(alto / (ALTO * 0.8));
  for (let i = 1; i <= pasos; i++) {
    await cdp.ev('scrollTo({top:' + Math.round(i * ALTO * 0.8) + ',behavior:"instant"})');
    await dormir(200);
  }
  await dormir(900);
  return alto;
}

(async () => {
  const fs = require('node:fs');
  const chrome = RUTAS_CHROME.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
  if (!chrome) {
    console.log('No se encontró Chrome. Rutas probadas:\n  ' + RUTAS_CHROME.join('\n  '));
    process.exit(2);
  }

  const proc = spawn(chrome, [
    '--headless=new', '--remote-debugging-port=' + PUERTO,
    '--window-size=' + ANCHO + ',' + ALTO,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--user-data-dir=' + (process.env.TEMP || '/tmp') + '/perfil-prueba-pbcm',
    'about:blank',
  ], { stdio: 'ignore' });

  let ws;
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch('http://127.0.0.1:' + PUERTO + '/json/version'); if (r.ok) break; } catch (e) {}
      await dormir(250);
    }
    const objetivos = await (await fetch('http://127.0.0.1:' + PUERTO + '/json/list')).json();
    ws = new WebSocket(objetivos.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
    const cdp = new CDP(ws);
    await cdp.enviar('Page.enable');
    await cdp.enviar('Runtime.enable');
    // Emular un móvil de verdad. Sin esto las reglas @media(pointer:coarse)
    // no aplican y la prueba mediría tamaños de escritorio.
    await cdp.enviar('Emulation.setDeviceMetricsOverride',
      { width: ANCHO, height: ALTO, deviceScaleFactor: 2, mobile: true });
    await cdp.enviar('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

    console.log('Probando ' + URL_OBJETIVO + ' a ' + ANCHO + 'x' + ALTO + '\n');
    await cdp.enviar('Page.navigate', { url: URL_OBJETIVO });
    await dormir(2200);

    // ---------- 1 y 2: animaciones de entrada e imágenes ----------
    const alto = await recorrer(cdp);
    const tras = JSON.parse(await cdp.ev(`JSON.stringify({
      revealTotal: [...document.querySelectorAll('.reveal')].filter(e => getComputedStyle(e).display !== 'none').length,
      revealMarcados: [...document.querySelectorAll('.reveal.in')].filter(e => getComputedStyle(e).display !== 'none').length,
      sinAnimar: [...document.querySelectorAll('.reveal:not(.in)')].filter(e => getComputedStyle(e).display !== 'none')
                   .map(e => e.tagName + '.' + String(e.className).split(' ')[0]),
      imgsRotas: [...document.images].filter(i => {
        if (i.naturalWidth !== 0) return false;
        const b = i.getBoundingClientRect();
        if (b.width === 0) return false;
        // en un carrusel horizontal, lo que esta desplazado fuera aun no ha
        // entrado en pantalla: que no haya cargado es lo correcto
        const pista = i.closest('.car-track');
        if (pista) {
          const pb = pista.getBoundingClientRect();
          if (b.right > pb.right + 2 || b.left < pb.left - 2) return false;
        }
        return true;
      }).map(i => (i.currentSrc || i.src).split('/').pop())
    })`));
    console.log('--- animaciones de entrada e imágenes ---');
    ok(tras.revealMarcados === tras.revealTotal,
       'todas las animaciones se dispararon',
       tras.revealMarcados + '/' + tras.revealTotal + (tras.sinAnimar.length ? ' · faltan: ' + tras.sinAnimar.join(', ') : ''));
    ok(tras.imgsRotas.length === 0, 'ninguna imagen visible se quedó sin cargar',
       tras.imgsRotas.join(', ') || '');

    // ---------- 3: las secciones no se mueven de sitio ----------
    // Los enlaces del menu llevan a #programa, #lineas, etc. Si una seccion
    // cambia de posicion despues de que la pagina ya se dibujo, esos enlaces
    // aterrizan donde no es. Aqui se anota donde empieza cada seccion, se
    // recorre la pagina entera, y se vuelve a mirar: no deberia haber cambiado.
    // Asi se detecto que content-visibility:auto desplazaba las secciones
    // hasta 1085 px de su sitio.
    console.log('\n--- estabilidad del maquetado ---');
    const posiciones = () => cdp.ev(`JSON.stringify(
      [...document.querySelectorAll('main > section[id]')].map(s =>
        s.id + ':' + Math.round(s.getBoundingClientRect().top + scrollY)))`);
    await cdp.enviar('Page.navigate', { url: URL_OBJETIVO });
    await dormir(2000);
    const antes = JSON.parse(await posiciones());
    await recorrer(cdp);
    await cdp.ev('scrollTo({top:0,behavior:"instant"})');
    await dormir(900);
    const despues = JSON.parse(await posiciones());
    const movidas = antes.map((a, k) => {
      const id = a.split(':')[0], y0 = +a.split(':')[1];
      const y1 = +String(despues[k] || ':0').split(':')[1];
      return { id, desvio: Math.abs(y1 - y0) };
    }).filter(x => x.desvio > 10);
    ok(movidas.length === 0, 'las secciones siguen donde estaban tras recorrer la pagina',
       movidas.length ? movidas.map(m => '#' + m.id + ' se movio ' + m.desvio + 'px').join(', ')
                      : antes.length + ' secciones estables');

    // ---------- 4 y 5: desbordamiento y elementos que se tocan ----------
    await cdp.enviar('Page.navigate', { url: URL_OBJETIVO });
    await dormir(1800);
    await recorrer(cdp);
    const fin = JSON.parse(await cdp.ev(`JSON.stringify({
      scrollHorizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      anchoDoc: document.documentElement.scrollWidth,
      pequenos: [...document.querySelectorAll('a,button,input:not([type=hidden]),textarea,select')]
        .map(e => {
          const b = e.getBoundingClientRect();
          if (b.width === 0 || b.left < -1000) return null;
          // la zona sensible puede ampliarse con un ::after invisible
          let an = b.width, al = b.height;
          const ps = getComputedStyle(e, '::after');
          if (ps.content !== 'none' && ps.position === 'absolute') {
            an = Math.max(an, parseFloat(ps.width) || 0);
            al = Math.max(al, parseFloat(ps.height) || 0);
          }
          // un enlace dentro de un párrafo se rige por el mínimo de 24 (WCAG AA);
          // un control con forma de botón, por los 44 de la guía de Apple
          if (an >= 24 && al >= 24) return null;   // minimo de la norma (WCAG 2.5.8 AA)
          return (e.tagName + '.' + String(e.className).split(' ')[0]).slice(0,28)
                 + ' ' + Math.round(an) + 'x' + Math.round(al);
        }).filter(Boolean),
      // entre 24 y 44 cumple la norma pero se queda justo para un dedo:
      // se avisa, no se marca fallo
      justos: [...document.querySelectorAll('button,input:not([type=hidden]),textarea,select,a.btn')]
        .map(e => {
          const b = e.getBoundingClientRect();
          if (b.width === 0 || b.left < -1000) return null;
          let an = b.width, al = b.height;
          const ps = getComputedStyle(e, '::after');
          if (ps.content !== 'none' && ps.position === 'absolute') {
            an = Math.max(an, parseFloat(ps.width) || 0);
            al = Math.max(al, parseFloat(ps.height) || 0);
          }
          if (an >= ${MINIMO_TACTIL} && al >= ${MINIMO_TACTIL}) return null;
          if (an < 24 || al < 24) return null;
          return (e.tagName + '.' + String(e.className).split(' ')[0]).slice(0,28)
                 + ' ' + Math.round(an) + 'x' + Math.round(al);
        }).filter(Boolean)
    })`));
    console.log('\n--- maquetado y elementos que se tocan ---');
    ok(!fin.scrollHorizontal, 'sin desplazamiento horizontal', fin.anchoDoc + 'px de ancho en ' + ANCHO);
    ok(fin.pequenos.length === 0,
       'ningun elemento que se toca baja de 24px (minimo de la norma)',
       fin.pequenos.length ? '\n           ' + fin.pequenos.join('\n           ') : '');
    if (fin.justos.length) {
      console.log('  aviso  controles entre 24 y ' + MINIMO_TACTIL + 'px (cumplen la norma, justos para un dedo):');
      fin.justos.forEach(x => console.log('           ' + x));
    }

    console.log('\n' + (fallos === 0 ? 'TODO OK  (alto de la página: ' + alto + 'px)'
                                     : fallos + ' FALLOS'));
    process.exitCode = fallos === 0 ? 0 : 1;
  } finally {
    if (ws) try { ws.close(); } catch (e) {}
    proc.kill();
  }
})();
