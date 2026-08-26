# Cuándo llegue el contenido, qué se hace

Este documento existe para que el trabajo no dependa de que alguien recuerde
la conversación en la que se decidió. Cada bloque dice **qué llega**, **dónde
va en el código** y **cómo se comprueba que no se rompió nada**.

El contenido que hay que pedirle a PBCM, y en qué formato, está en la
[solicitud de contenido](#la-solicitud). Lo de aquí es qué hacer una vez llegue.

> **Antes de tocar nada:** levanta el servidor y deja pasando la prueba.
> ```bash
> python -m http.server 8000
> node tools/prueba-navegador.js http://localhost:8000/index.html 390 844
> ```
> Si ya falla algo antes de empezar, arréglalo primero. Y vuelve a correrla
> después de cada bloque.

---

## Reglas que no se negocian

Se aprendieron rompiendo cosas. Saltárselas cuesta más tiempo del que ahorra.

| Regla | Por qué |
|---|---|
| **Las tres listas de idiomas llevan las mismas claves** (`en:`, `es:`, `fr:`) | Si a una le falta una clave, esa parte se queda en blanco en ese idioma. |
| **El texto escrito en el HTML va en inglés**, igual que el de `en:` | Es lo que se ve mientras carga el JavaScript, lo que lee un buscador y lo único que queda si el JavaScript falla. |
| **Cada `<img>` lleva `width`, `height` y `height:auto` en el CSS** | Sin `height:auto` los atributos fijan también la altura: deforma la imagen o le impide estirarse con su contenedor. Ya pasó. |
| **Cualquier servicio externo hay que añadirlo a la CSP de `netlify.toml`** | `script-src` **y** `connect-src`. Si falta uno, no funciona y **no da ningún error visible**. |
| **Todo archivo versionado es una URL pública** | Aunque ninguna página lo enlace. Lo que no debe salir va en `_fuentes/`, que está en `.gitignore`. |
| **Green Power no se vincula a la ONG en la web pública** | Decisión de PBCM. Sin logo, sin co-marca, sin contarlo de refilón en el relato de origen. |
| **Nada de contadores automáticos** | Dos de las diez ONG revisadas mostraban `0` el día que se visitaron porque el contador falló. Cifras escritas a mano, con su fecha al lado. |
| **`content-visibility:auto` está descartado** | Se probó y se midió: ahorra un 8% de render pero desplaza las secciones hasta 1085 px y rompe los enlaces del menú. La explicación está en el CSS de `index.html`. |

---

## 1. Las cifras → franja de impacto

**Llega:** de tres a cinco cifras, cada una con número, qué mide, periodo y quién la confirma.

**Dónde va:** una sección nueva `#impacto`, **justo después de la marquesina y antes de `#programa`**. Es lo primero que ve alguien tras el hero, y es el hueco que hoy hace que la página pase de «queremos ayudar» a «esto es lo que hacemos» sin nada en medio que lo demuestre.

**Cómo se construye:**

1. Markup con el patrón de `.cards`, que ya existe y ya es responsive.
2. Cada cifra: número grande, una línea de qué mide, y **la fecha en pequeño**. La fecha no es un detalle: es lo que la hace creíble.
3. Claves de idioma `impacto_n1` / `impacto_t1` / `impacto_f1`, hasta la 5, en los tres idiomas.
4. Si la cifra estrella es **cuántas obras siguen funcionando**, va la primera y más grande. Ninguna otra fundación de la zona publica eso.

**Animación:** los números pueden contar hacia arriba al entrar en pantalla, enganchando al `IntersectionObserver` que ya existe (busca `.reveal` en el script). Dos condiciones: que el valor final esté escrito en el HTML (no calculado), y que con `prefers-reduced-motion` aparezca directamente el número final.

**Comprobar:** `node tools/prueba-navegador.js` y que las tres listas de idiomas sigan cuadrando.

---

## 2. Las fotos propias → reemplazan al carrusel

**Llega:** de seis a diez fotos con permiso, en archivo original.

**Cómo se hace:**

1. Las fotos nuevas van a `img/originales/`.
2. Las actuales del carrusel —que son de banco de imágenes— se mueven a `img/originales/sin-usar/`.
3. Se actualiza la lista `PLAN` en `tools/optimize_images.py`: nombre del archivo y ancho al que se muestra. El propio archivo explica cómo elegir el ancho.
4. `python tools/optimize_images.py`
5. En `index.html`, cambiar el `src` y **reescribir el `alt` de cada una**. El `alt` describe lo que se ve, no repite el pie. Y actualizar `width`/`height` con las dimensiones nuevas.

**Ojo:** si una foto cambia de proporción, revisar que su contenedor siga cuadrando. Las del carrusel van recortadas a 330 px de alto con `object-fit:cover`.

---

## 3. Las historias → sección propia

**Llega:** una o dos historias con nombre, lugar, citas textuales, foto y permiso.

**Dónde va:** sección nueva `#historias`, **entre `#comunidad` y `#contacto`**. Después de haber visto a la gente en la galería y justo antes de pedir algo.

**Cómo se escribe el titular:** el patrón que mejor funciona junta nombre, situación y resultado en la misma línea. TECHO lo hace así: *«Un hogar que no se llueve: el cambio de vida de Vitória y su hija»*.

**Estructura de cada historia:** foto · titular · dos o tres párrafos · una cita textual destacada · lugar y fecha. Media página basta.

---

## 4. El porcentaje administrativo y los documentos → transparencia

**Llega:** el porcentaje que va a obra frente al que va a operación, con fecha; y los documentos que ya existen.

**Dónde va:** sección nueva `#transparencia`, **antes de `#contacto`**. Responde «¿a dónde va mi dinero?» justo antes de pedirlo.

**Cómo se redacta:** honesto y de frente. GiveDirectly titula esa sección *«sí, tenemos costos»* y le funciona. Una línea explicando qué compra ese gasto: un contador y una representación legal en EE.UU. son lo que permite que una donación desde allá sea deducible, auditable y rastreable. **Eso no es plata que se le quita al donante, es el servicio que se le presta.**

**Los documentos:** van como enlaces de descarga dentro de esa sección. Los PDF se suben al repositorio —aquí sí deben ser públicos—, pero **antes de subirlos hay que abrirlos y mirarlos**: que no lleven datos personales, y que no mencionen la operadora si esa sigue siendo la decisión.

---

## 5. La decisión de público → cambia el CTA

Esta no es contenido, es una decisión, y cambia la página entera.

**Si es financiador institucional** (recomendado): el botón de la barra deja de decir «Contáctanos» y pasa a algo como «Trabaja con nosotros», con un dossier descargable. La sección de transparencia sube de importancia. La historia completa —el tope del 1%, la adicionalidad, el historial— **va en el dossier, no en la web**.

**Si es donante individual:** hace falta una vía de pago. Es una decisión técnica aparte:

- El sitio es estático, así que el cobro lo hace un tercero. Empezar por una página alojada por el proveedor es lo más rápido y deja a PBCM fuera del alcance de los requisitos de tarjetas.
- **La CSP de `netlify.toml` bloqueará la pasarela** si no se le añade el dominio del proveedor a `script-src` y `connect-src`. Fallará sin dar ningún error.
- En Colombia, los medios de pago locales importan: World Vision Colombia recibe por Nequi y transferencia bancaria.
- Y hay que ofrecer **aporte mensual**, no solo único. TECHO tiene más de 40.000 socios mensuales y es lo que sostiene un programa.

---

## Orden recomendado

1. **Cifras y transparencia** (bloques 1 y 4). Es lo que mejor relación tiene entre esfuerzo y efecto: solo necesita contenido, ninguna decisión técnica.
2. **Fotos propias** (bloque 2). Quita lo único que hoy es prestado.
3. **Historias** (bloque 3).
4. **La vía de aporte** (bloque 5), cuando haya resultados que mostrar.

Y en cuanto haya cualquiera de las tres primeras: **dar de alta `pbcmcolombia.com` en Plausible**, si no sigue sin medirse nada.

---

## La solicitud

Lo que hay que pedirle a PBCM, con el formato exacto de cada cosa y un mensaje
listo para enviar, está en el documento de solicitud de contenido que preparó
el equipo. Si se perdió el enlace, lo esencial es esto:

- **3 a 5 cifras** propias, cada una con periodo y quién la confirma
- **6 a 10 fotos** propias con permiso, en archivo original (no por WhatsApp)
- **1 o 2 historias** con nombre, citas, foto y permiso
- **Documentos** que ya existen: acta de constitución, estados financieros del
  último año, informe de gestión, y si la figura legal en EE.UU. permite
  deducir impuestos
- **La decisión** de a quién se le pide primero
