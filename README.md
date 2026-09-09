# PBCM — Sitio web

Sitio de la fundación **PBCM · Programa de Beneficio a las Comunidades y Medio Ambiente**
(Community Benefit Environment).

🌐 **En vivo:** https://pbcmcolombia.com

Una sola página, en **Inglés / Español / Francés** (selector arriba a la derecha).
**Abre siempre en inglés**, que es el idioma primario del sitio; si el visitante
elige otro, se recuerda para sus próximas visitas.

> ℹ️ **No es un error:** la fundación está constituida en **Estados Unidos** y
> destina los recursos a proyectos en **Colombia**. Por eso la sección Contacto
> muestra sede en Estados Unidos y teléfonos con prefijo +1. Los datos
> estructurados (`application/ld+json`, al final de `index.html`) reflejan las
> dos cosas: `address.addressCountry` es `US` y `areaServed` es Colombia.

---

## 📁 Qué hay en el repositorio

| Archivo / carpeta | Qué es |
|---|---|
| **`index.html`** | **El sitio completo.** Textos, traducciones, diseño y comportamiento, todo aquí. Es el único archivo que se edita para cambiar la página. |
| `img/` | Las imágenes que el sitio carga (`.webp`) y el favicon. |
| `img/originales/` | Las fotos originales, sin tocar. De aquí salen los `.webp`. |
| `img/originales/sin-usar/` | Material que hoy no aparece en la página, guardado por si se necesita. |
| `_fuentes/` | **No se publica.** Documentos internos que no deben salir en el sitio. Está en `.gitignore`, así que Netlify nunca los ve. |
| `gracias.html` | Página que ve quien envía el formulario. |
| `404.html` | Página de "no encontrado". |
| `netlify.toml` | Configuración de publicación: cabeceras de seguridad y caché. |
| `robots.txt`, `sitemap.xml` | Para los buscadores. |
| `tools/optimize_images.py` | Genera los `.webp` a partir de `img/originales/`. |
| `tools/build_standalone.py` | Genera una copia del sitio en **un solo archivo**, para enviar por correo o ver sin conexión. No es lo que se publica. |
| `tools/recorta_infografia.py` | Genera las infografías que publica la página a partir de los originales de `_fuentes/`. |
| `docs/solicitud-de-contenido.md` | **Qué pedirle al equipo de PBCM**, en qué formato, y un mensaje listo para enviar. |
| `docs/prompt-investigacion.md` | Prompt listo para pegar en Perplexity o similar, para investigar el marco legal, los financiadores y los estándares del sector. |
| `docs/cuando-llegue-el-contenido.md` | **Qué hacer cuando PBCM entregue las cifras, las fotos y los documentos.** Dónde va cada cosa en el código y cómo comprobarlo. |
| `tools/prueba-navegador.js` | Abre un Chrome de verdad y comprueba la página entera (ver abajo). |
| `tools/prueba-carrusel.js` | Comprueba los números del movimiento del carrusel (`node tools/prueba-carrusel.js`). |

> No hay que "compilar" nada para publicar. Lo que está en el repositorio **es** el sitio.

---

## 💬 ¿Solo quieres dar recomendaciones?

Usa la pestaña **[Issues](../../issues)** para dejar comentarios y sugerencias.
Es la forma más fácil de aportar. 👍

---

## ✏️ Cambiar textos

Todos los textos viven en `index.html`, en el bloque `const I18N = { ... }` cerca del final.
Está dividido en tres partes: `en:`, `es:` y `fr:`.

```js
en: {
  hero_h1:"We sow <em>wellbeing</em> in the communities of Colombia",
  ...
}
```

**Regla de oro: si cambias un texto en `en:`, cámbialo también en `es:` y `fr:`.**
Las tres listas deben tener exactamente las mismas claves; si a una le falta una,
esa parte de la página se queda en blanco en ese idioma.

El texto que está escrito directamente en el HTML (fuera de `I18N`) es el que se ve
mientras carga el JavaScript, el que lee un buscador que no ejecuta scripts, y el
único que queda si el JavaScript falla. **Mantenlo siempre igual al de `en:`.**

---

## 🖼️ Cambiar una imagen

1. Reemplaza el archivo en **`img/originales/`**, con el **mismo nombre**
   (por ejemplo `foto-rio.jpg`).
2. Ejecuta:
   ```bash
   python tools/optimize_images.py
   ```
3. Listo. El script regenera el `.webp` que usa la página, al tamaño correcto.

Necesitas [Python](https://www.python.org/downloads/) y Pillow:

```bash
pip install Pillow
```

**Para agregar una imagen nueva**, además de ponerla en `img/originales/`, añádela a la
lista `PLAN` dentro de `tools/optimize_images.py` indicando a qué ancho se usa.
El propio archivo explica cómo elegir ese ancho.

> ⚠️ No edites los `.webp` a mano: se sobreescriben cada vez que corre el script.

---

## 👀 Ver el sitio en tu computador

Abrir `index.html` con doble clic funciona, pero algunas cosas (el formulario,
las rutas absolutas) se comportan raro. Mejor levantar un servidor local:

```bash
python -m http.server 8000
```

Y abrir http://localhost:8000

---

## 🧪 Comprobar que nada se rompió

Antes de unir un cambio grande, con el servidor local levantado:

```bash
node tools/prueba-navegador.js http://localhost:8000/index.html 390 844
```

Abre un Chrome real sin ventana, emula un móvil, recorre la página como una
persona y comprueba cinco cosas que **no se pueden ver leyendo el código**:

1. que todas las animaciones de entrada se disparen
2. que todas las imágenes que deben verse acaben cargando
3. que las secciones no se muevan de sitio (si se mueven, los enlaces del
   menú aterrizan donde no es)
4. que no haya desplazamiento horizontal
5. que ningún elemento que se toca sea menor de 24 px

Cámbiale el ancho y el alto para probar otros tamaños: `320 720` es el móvil
más estrecho que hay que soportar.

> Ya sirvió para algo: detectó que `content-visibility:auto` desplazaba las
> secciones hasta 1085 px de su sitio, lo que rompía todos los enlaces del
> menú. Por eso ese ajuste está descartado, con la explicación escrita en el
> CSS de `index.html`.

---

## 🚀 Publicar

El sitio está en **Netlify**, con el dominio `pbcmcolombia.com`.

**Cada cambio que entra a la rama `main` se publica automáticamente.** No hay que
arrastrar archivos ni hacer nada manual.

<details>
<summary><b>Configuración inicial en Netlify</b> (una sola vez, requiere acceso al panel)</summary>

1. Netlify → el sitio → **Site configuration → Build & deploy → Continuous deployment**
2. **Link repository** → GitHub → `operaciones-png/pbcm-web`
3. Rama a publicar: `main`. Build command: *vacío*. Publish directory: `.`
   (`netlify.toml` ya lo declara, debería llenarse solo.)
4. **Forms** → activar la detección de formularios si no está activa.
5. **Forms → Form notifications → Add notification → Email notification**:
   poner el correo que debe recibir los mensajes de contacto.

Hasta que se haga el paso 5, los mensajes quedan guardados en el panel de
Netlify (Forms → contacto) pero **nadie recibe aviso por correo**.

</details>

---

## 📊 Medición de visitas

El sitio mide visitas con **Plausible**: sin cookies, sin datos personales y sin
seguir a nadie por otros sitios. Por eso **no necesita banner de consentimiento**
(comprobado: la página no crea ninguna cookie).

Además de las visitas, se registran tres cosas útiles:

| Evento | Para qué sirve |
|---|---|
| `Contacto enviado` | Saber si alguien usa el formulario, y en qué idioma escribe |
| `Contacto fallido` | Detectar que el envío se rompió, en vez de enterarse por el silencio |
| `Idioma cambiado` | Si mucha gente lo cambia a mano, el idioma por defecto no está acertando |

<details>
<summary><b>Falta un paso: dar de alta el dominio</b></summary>

Hay que crear la cuenta y añadir `pbcmcolombia.com` en el panel de Plausible.
Hasta que se haga, el script carga pero no se registra nada — la página funciona
igual, no se rompe.

</details>

> ⚠️ **Para cambiar de herramienta de medición hay que tocar DOS sitios:**
> la etiqueta del script en `index.html` **y** `script-src` y `connect-src` en
> la CSP de `netlify.toml`. Si se cambia solo uno, deja de medir **sin dar
> ningún error visible**. Lo mismo aplica a cualquier servicio externo que se
> añada después (una pasarela de pago, un mapa, un vídeo incrustado).

---

## 🔁 Trabajo en equipo

- Cada quien crea una **rama** con su cambio y abre un **Pull Request** para
  revisarlo entre todos antes de unirlo a `main`.
- O deja la idea en **Issues** y alguien la implementa.

Como `main` se publica automáticamente, conviene que nada entre a `main` sin
que otra persona lo haya mirado.

---

## 📤 Enviar el sitio por correo o verlo sin conexión

```bash
python tools/build_standalone.py
```

Genera `dist/pbcm-standalone.html`: un archivo único con todas las imágenes
dentro. Sirve para adjuntarlo en un correo o abrirlo sin internet.
**No es el archivo que se publica** y no se sube al repositorio.

---

## 📌 Pendientes por confirmar con PBCM

> Lo que falta para la parte que capta fondos —cifras propias, fotos, historias
> y documentos— y qué se hace con cada cosa cuando llegue, está en
> [`docs/cuando-llegue-el-contenido.md`](docs/cuando-llegue-el-contenido.md).


- **Fotos del carrusel.** Son imágenes de referencia de jornadas de
  socialización, no fotos propias de PBCM. Conviene reemplazarlas.
- **Infografía de las mesas.** La que se publica sale de los originales de
  `_fuentes/` pasando por `tools/recorta_infografia.py`, que acorta la banda
  de "menor impacto" para que termine tras el cuarto ítem. Si llega un
  original de más resolución, se reemplaza en `_fuentes/` y se vuelve a
  ejecutar el script. Los originales nunca se publican.

---

Hecho con cariño para las comunidades de Colombia. 💚
