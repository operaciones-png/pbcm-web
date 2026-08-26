# PBCM — Sitio web

Sitio web de la fundación **PBCM · Programa de Beneficio a las Comunidades y Medio Ambiente** (Community Benefit Environment).

🌐 **En vivo:** https://pbcmcolombia.com

Sitio de una sola página, en **Español / Inglés / Francés** (selector de idioma arriba a la derecha).

---

## 📁 ¿Qué hay en este repositorio?

| Archivo / carpeta | Qué es |
|---|---|
| **`index.html`** | La página final, lista para publicar. Se abre directo en el navegador. Las imágenes van **incrustadas** dentro del archivo (por eso pesa varios MB). |
| **`template.html`** | El **archivo editable**: mismo diseño, pero con las imágenes enlazadas desde `img/`. **Aquí se edita el contenido, los textos y el diseño.** |
| **`img/`** | Las imágenes del sitio (logo, fotos, iconos, infografías en 3 idiomas). |
| **`build_site.py`** | Script que toma `template.html` + `img/` y genera el `index.html` final. |

---

## 💬 ¿Solo quieres dar recomendaciones? (sin editar)

Usa la pestaña **"Issues"** aquí en GitHub para dejar tus comentarios y sugerencias. Es la forma más fácil de aportar ideas. 👍

---

## ✏️ ¿Cómo editar la página?

1. Edita **`template.html`** — ahí está todo: textos, colores, secciones y las traducciones (ES/EN/FR).
   - Para cambiar una **imagen**, reemplaza el archivo dentro de `img/` (usando el mismo nombre) o agrega uno nuevo.
2. Vuelve a generar el `index.html`:
   ```bash
   python build_site.py
   ```
   (Necesitas [Python](https://www.python.org/downloads/) instalado.)
3. Abre `index.html` para revisar cómo quedó.

> 💡 Para un cambio pequeño de **texto** también puedes editar `index.html` directamente.
> Pero para **imágenes** sí o sí edita `template.html` + `img/` y reconstruye.

---

## 🔁 Trabajo en equipo (recomendado)

- Cada quien crea una **rama** (branch) con su cambio y abre un **Pull Request** para revisarlo entre todos antes de unirlo.
- O deja tus ideas en **Issues** y alguien las implementa.

---

## 🚀 Publicar los cambios en el dominio

El sitio está alojado en **Netlify** (dominio `pbcmcolombia.com`).
Para publicar una versión nueva: entrar a Netlify → el sitio → **Deploys** → arrastrar el `index.html` actualizado.

---

Hecho con cariño para las comunidades de Colombia. 💚
