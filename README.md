# PBCM — Sitio web

Sitio de la fundación **PBCM · Programa de Beneficio a las Comunidades y Medio Ambiente**
(Community Benefit Environment).

🌐 **En vivo:** https://pbcmcolombia.com

Una sola página, en **Español / Inglés / Francés** (selector arriba a la derecha).
Abre en el idioma del navegador del visitante; si elige otro, se recuerda.

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
| `tools/prueba-carrusel.js` | Comprueba los números del movimiento del carrusel (`node tools/prueba-carrusel.js`). |

> No hay que "compilar" nada para publicar. Lo que está en el repositorio **es** el sitio.

---

## 💬 ¿Solo quieres dar recomendaciones?

Usa la pestaña **[Issues](../../issues)** para dejar comentarios y sugerencias.
Es la forma más fácil de aportar. 👍

---

## ✏️ Cambiar textos

Todos los textos viven en `index.html`, en el bloque `const I18N = { ... }` cerca del final.
Está dividido en tres partes: `es:`, `en:` y `fr:`.

```js
es: {
  hero_h1:"Sembramos <em>bienestar</em> en las comunidades de Colombia",
  ...
}
```

**Regla de oro: si cambias un texto en `es:`, cámbialo también en `en:` y `fr:`.**
Las tres listas deben tener exactamente las mismas claves; si a una le falta una,
esa parte de la página se queda en blanco en ese idioma.

El texto que está escrito directamente en el HTML (fuera de `I18N`) es solo el que
se ve un instante antes de que cargue el idioma. Conviene mantenerlo igual al de `es:`.

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

- **Fotos del carrusel.** Son imágenes de referencia de jornadas de
  socialización, no fotos propias de PBCM. Conviene reemplazarlas.
- **Sección "Resultado de mesas".** El texto que muestra la página y el
  documento original de las mesas (en `_fuentes/`, fuera del sitio) no
  coinciden en tres puntos. Definir cuál es la versión válida. El documento
  original **no se publica**: la página cuenta el resultado con sus propias
  palabras.

---

Hecho con cariño para las comunidades de Colombia. 💚
