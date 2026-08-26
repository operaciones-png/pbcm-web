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
| **Una cifra sin fecha no vale** | Cinco de las 37 organizaciones revisadas mostraban `0` el día que se visitaron porque su contador automático falló. Lo más seguro es escribirlas a mano con su fecha. Si algún día se automatizan, hay que hacerlo como Direct Relief: «*Updated 2026-08-26 12:30:43. Totals are unaudited*». |
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

## 6. Lo que se aprendió mirando 28 organizaciones

Se revisaron fundaciones y ONG comparables —de Colombia, de América Latina y
de EE.UU.— para ver qué publican y qué se puede adaptar. Esto es lo que salió de
ahí y no estaba en la lista original.

### La métrica que hay que conseguir sí o sí

Cuatro organizaciones distintas construyen su credibilidad sobre lo mismo, y
**ninguna otra fundación de la zona lo publica**:

| Organización | Qué publica |
|---|---|
| The Water Project | «**94% de agua fluyendo**» sobre 2.831 puntos monitoreados |
| Splash | «**95%+ de los baños escolares siguen limpios y funcionando**, incluso después de que nos vamos» |
| Water For People | Definen el éxito como *Everyone Forever*: «**Forever** significa soluciones que mantienen el agua fluyendo por generaciones» |
| Spark MicroGrants | Sus resultados «**duran más de una década**», con evidencia externa publicada |

No es cuántas obras se hicieron: es **cuántas siguen funcionando**. Y para PBCM
vale doble, porque las propias comunidades pusieron «obras incompletas o
inconclusas» entre las inversiones de menor impacto. Es responder a su queja con
un número.

**Cómo se consigue:** volver a visitar lo entregado y anotar tres estados —sigue
en uso · necesita mantenimiento · no funciona—. Aunque el número no salga
redondo, publicarlo vale más que callarlo.

### Cosas nuevas que pedirle a PBCM

1. **Lo que puso la comunidad.** Habitat for Humanity hace visible el
   *sweat equity*: «las familias construyen su propia casa junto a los
   voluntarios». PBCM ya lo hace —toda su metodología es concertación— pero **no
   lo cuenta**. Pedir: jornales aportados, materiales locales, terrenos cedidos,
   actas firmadas. Es lo que distingue una obra concertada de una obra regalada.

2. **Un compromiso con fecha y territorio.** Splash publica «**100% de cobertura
   para 2030**» sobre 407 escuelas en 4 ciudades. Un objetivo acotado y fechado
   —«todas las veredas de tal municipio con agua para 20XX»— es más creíble que
   una intención abierta, y permite comprobar si se cumplió.

3. **Antes y después, con números.** Splash publica «**54% → 0%** de E. coli en
   el agua» y «**16% → 3%** de niñas que faltan a clase». Pedir que en la próxima
   obra se mida algo **antes** de empezar: sin la medición inicial, el después no
   significa nada.

4. **Quién mantiene la obra cuando PBCM no está.** Water For People lo dice así:
   «el gobierno local pone la estructura, la tienda local los materiales, el
   técnico local las reparaciones». Pedir el esquema de mantenimiento por obra:
   quién responde y con qué recursos.

5. **Qué se haría con más dinero.** Es la pregunta literal de GiveWell: *¿Qué
   permitirán los fondos adicionales?* Todo financiador serio la hace. Tener la
   respuesta escrita —qué proyectos concretos están esperando plata— antes de que
   la pregunten.

6. **Una evaluación de un tercero**, aunque sea pequeña. Village Enterprise cita
   dos ensayos controlados aleatorios; Fundación Capital nombra su modelo y
   publica evidencia. Para PBCM basta con que alguien de fuera —una universidad,
   una alcaldía, un auditor— haya mirado y firmado algo.

7. **Las políticas de salvaguarda.** Minuto de Dios publica su «Programa de
   Transparencia y Ética Empresarial» y su «Política de Prevención de Abuso y
   Explotación Sexual». Los financiadores institucionales las piden cada vez más,
   y trabajar con comunidades y menores las vuelve obligatorias en la práctica.

### Formas de decir el costo que sí funcionan

En la primera ronda se dijo que «ninguna publica costo por resultado». **Hay que
matizarlo:** nadie publica «USD 40 = un filtro», pero varias sí publican otras
formas, más fáciles de calcular:

- **Costo del proceso por persona.** Spark MicroGrants: «este proceso es de bajo
  costo y replicable a **30 dólares por persona**». Para PBCM sería el costo de la
  metodología —socialización, concertación, acompañamiento— por persona
  alcanzada. Sale de la contabilidad; no hace falta atribuir resultados.
- **Razón de retorno.** Village Enterprise: «**5,34 dólares de beneficio por cada
  dólar invertido**».
- **Separar la inversión propia de la de los socios.** Fundación FEMSA muestra las
  dos por separado, con lo que se ve cuánto apalanca cada peso propio. Encaja con
  la estrategia de buscar cofinanciadores.

### Cambios de estructura en la web

8. **«Dónde trabajamos», por territorio.** WWF Colombia divide el país en cuatro
   regiones; Fundación Santo Domingo organiza por ciudad. PBCM debería tener su
   mapa de municipios y veredas: es una organización territorial y hoy no se ve
   dónde está.

9. **Una puerta por interlocutor.** Root Capital separa *Become a Funder / Become
   a Client / Become an Employee*; Habitat separa aliados de empresa, de fe y
   comunitarios. PBCM tiene tres públicos —comunidad, financiador, aliado— y una
   sola puerta que dice «Contáctanos».

10. **Ponerle nombre a la metodología.** Fundación Capital tiene su «Programa
    Graduación»; Water For People, «Everyone Forever». PBCM tiene un método real y
    probado —socialización, concertación, ejecución— **sin nombre**. Un método con
    nombre se cita, se compara y se defiende; uno sin nombre es un párrafo.

11. **Medios de pago colombianos.** Minuto de Dios recibe por Efecty, Supergiros y
    Servientrega; World Vision Colombia por Nequi y transferencia bancaria. Si
    algún día se pide a donantes locales, sin esto no llega nada.

12. **Convocatorias abiertas.** Fundación Santo Domingo mantiene convocatorias
    activas y publicadas. Si PBCM quiere que las comunidades postulen proyectos en
    vez de esperar a que las visiten, ese es el mecanismo.

### Credenciales baratas que dan credibilidad

- **Sellos de Candid (GuideStar).** El de Bronce pide **cuatro datos**; el de
  Plata, programas y área geográfica; el de Oro, finanzas actualizadas; el de
  Platino, **una sola métrica**. PBCM puede tener Bronce y Plata casi de inmediato
  con lo que ya existe. Casi todas las organizaciones revisadas los exhiben.
- **GlobalGiving.** Plataforma que da pasarela de pago y acceso a donantes sin
  construir nada, y **admite organizaciones fuera de EE.UU.** (opera en más de 175
  países). Su admisión exige documentos legales, registros financieros, materiales
  de programa y la lista de directivos: exactamente lo que pide el bloque 5 de
  este documento. **Puede resolver la vía de aporte sin tocar la CSP ni montar una
  pasarela.**
- **Charity Navigator** evalúa cuatro pilares —Responsabilidad y Finanzas, Impacto
  y Medición, Liderazgo y Planificación, Cultura y Compensación— y pide **tres
  años de formulario IRS 990**. Conviene ir presentándolos desde ya.

### Confirmaciones de lo que ya estaba escrito

- **Nada de contadores automáticos.** Ya van tres organizaciones que mostraban
  ceros el día que se visitaron: TECHO, Pencils of Promise y Fundación FEMSA.
- **No vincular a la empresa madre tiene precedente.** Fundación Alpina publica
  todos sus documentos legales sin narrar su relación con Grupo Alpina, y
  **Fundación FEMSA no menciona a FEMSA en ninguna parte de su web**. La decisión
  de PBCM es normal en el sector.
- **La promesa del 100% sigue sin aplicar.** charity: water y Thirst Project la
  usan, pero ambos tienen la operación financiada aparte. PBCM no. La vía honesta
  sigue siendo la de GiveDirectly: decir el porcentaje real y explicar qué compra.

---

## 7. Tercera ronda: nueve organizaciones más

Se revisaron otras nueve —37 en total— buscando ángulos que no habían salido:
reforestación, transparencia sobre los fracasos, y retroalimentación de las
propias comunidades. Esto es lo nuevo.

### Publicar lo que salió mal

Ingenieros Sin Fronteras Canadá publica desde 2008 un **informe anual de
fracasos**: testimonios de una o dos páginas que cuentan «la actividad, el
error, por qué falló y qué se aprendió». Lo hacen para «celebrar públicamente
estos fracasos» y que otros aprendan. Después abrieron *AdmittingFailure.com*
para que otras organizaciones publiquen los suyos.

Uno de los casos que citan es **casi exactamente el riesgo de PBCM**: un sistema
de monitoreo de infraestructura de agua en Malaui «que el gobierno no pudo
permitirse mantener cuando se acabó la financiación».

**Por qué vale para PBCM:** cuesta dos páginas al año y compra algo que el
dinero no compra. Una organización que cuenta lo que le salió mal es más creíble
cuando cuenta lo que le salió bien. Y las comunidades ya señalaron «obras
incompletas o inconclusas»: reconocerlo primero desarma la crítica.

### El bucle que cierra la donación

DonorsChoose funciona así: quien necesita algo publica el proyecto con su costo
exacto y su plazo; cuando se financia y se ejecuta, el donante recibe **«cómo se
gastó cada dólar, en qué cambió las cosas, y el agradecimiento»** de quien lo
recibió.

PBCM ya tiene las dos mitades sueltas: las actas de concertación son la
solicitud, y las actas de entrega son el cierre. **Lo que falta es publicarlas
como un ciclo.** Si algún día se abren convocatorias para que las comunidades
postulen proyectos (como hace Fundación Santo Domingo), este es el modelo.

### Mapas hechos con la comunidad, no sobre ella

Amazon Conservation Team publica mapas narrados construidos junto a comunidades
indígenas, y describe su gobernanza así: sus prioridades las han definido «los
mayores» de las comunidades socias.

PBCM hace justo eso —la concertación *es* eso— y no lo dice con esas palabras.
Y Fundación Natura Colombia lo aterriza en **fichas por territorio**: hectáreas,
ecosistemas, acciones concretas («24 pequeñas iniciativas comunitarias», «18
viveros comunitarios») y los logos de los aliados de cada proyecto.

**Aplicación directa:** una ficha por municipio o vereda, con lo que se hizo,
con quién, y quién lo decidió. Es la versión territorial de la sección
«dónde trabajamos» del bloque anterior.

### Contar la coalición como si fuera una cifra de impacto

Fundación Corona no dice «trabajamos con aliados»: dice **«5 fundaciones, 1
cámara de comercio y 11 secretarías de educación»** y «36 congresistas de 10
partidos políticos». El tamaño de la coalición es en sí mismo el dato.

PBCM puede contar lo suyo igual: cuántas juntas de acción comunal, cuántas
alcaldías, cuántas veredas, cuántas mesas. **Son cifras que ya existen en las
actas y que nadie ha sumado.**

### Certificaciones de proceso, no solo de transparencia

Además de los sellos de Candid, hay reconocimientos sobre *cómo* se trabaja:

- Oxfam exhibe estar **certificada en la Norma Humanitaria Esencial (CHS) por
  HQAI** desde 2018, y tiene una página propia de «Nuestro compromiso con la
  salvaguarda».
- Trees for the Future es **«United Nations World Restoration Flagship»**, una
  designación de Naciones Unidas para restauración de ecosistemas.

PBCM hace reforestación y conservación de nacimientos de agua: esa segunda vía
—registrarse en los mecanismos de la Década de la Restauración— es realista y
no cuesta dinero, solo documentación.

### Mecánicas de donación que se pueden copiar

- **Fondos por causa.** One Tree Planted separa un «Wildfire Fund», un
  «Women's Empowerment Fund» y otros. PBCM tiene seis líneas de acción: dejar
  elegir a cuál va el aporte convierte una lista temática en seis destinos.
- **Igualar los primeros meses del aporte mensual.** One Tree Planted: «tus
  primeros tres meses se igualan dólar por dólar». Si algún financiador acepta
  poner esa contrapartida, es el empujón más eficaz para convertir un aporte
  único en uno recurrente.

### Tercer precedente sobre la empresa madre

A Fundación Alpina y Fundación FEMSA se suma **Fundación Corona**: su relación
con la empresa «permanece implícita en las alianzas, no explícita». Tres de las
fundaciones corporativas colombianas y latinoamericanas revisadas hacen lo
mismo que PBCM decidió hacer. **No es una rareza: es la norma del sector.**

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
