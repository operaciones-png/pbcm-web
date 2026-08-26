# -*- coding: utf-8 -*-
"""
Genera las imagenes optimizadas (.webp) que usa la pagina, a partir de las
fotos originales de img/.

Por que: una foto de 1280 px que se muestra a 380 px hace que el visitante
descargue cuatro veces mas de lo que ve. Este script deja cada imagen al
tamano que realmente se necesita (el doble del tamano en pantalla, para que
se vea nitida en moviles de pantalla retina) y en formato WebP, que pesa
entre 3 y 6 veces menos que un JPG o PNG con la misma calidad.

Lee de   img/originales/   (las fotos tal como llegaron, sin tocar)
Escribe en img/             (los .webp que la pagina carga)

Los originales nunca se modifican ni se borran. img/originales/sin-usar/
guarda material que hoy no aparece en la pagina, por si se necesita despues.

Como cambiar una foto del sitio:
    1. Reemplaza el original en img/originales/ (mismo nombre, p. ej. foto-rio.jpg)
    2. Ejecuta:  python tools/optimize_images.py
    3. Listo: se regenera el .webp que usa la pagina.

Requiere Pillow:  pip install Pillow
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta Pillow. Instalalo con:  pip install Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "img", "originales")
OUT_DIR = os.path.join(ROOT, "img")

# origen -> anchos a generar, en pixeles.
#
# Un solo ancho  -> se genera "nombre.webp"
# Varios anchos  -> se genera "nombre-<ancho>.webp" (para srcset, en las
#                   imagenes que ocupan todo el ancho de la pantalla y por
#                   tanto necesitan una version chica para movil)
#
# La regla del ancho: el doble del tamano maximo que ocupa en pantalla,
# nunca mas grande que el original.
PLAN = {
    # Fondos a todo el ancho: necesitan version movil
    "hero-bg.jpg": [640, 1024, 1280],
    "proceso-bg.jpg": [900, 1600],
    "foto-rio.jpg": [700, 1280],
    # Hero
    "foto-bote.jpg": [520, 820],
    "comunidad-1.jpg": [470],
    # Pilares (se muestran a 230 px como maximo)
    "pilar-comunidad.jpg": [460],
    "pilar-ambiente.jpg": [460],
    # Iconos de lineas de accion (se muestran a 84 px)
    "gpt-social.png": [168],
    "gpt-vivienda.png": [168],
    "gpt-deporte.png": [168],
    "gpt-vias.png": [168],
    "gpt-saneamiento.png": [168],
    "gpt-agua-suelos.png": [168],
    # Iconos de sectores priorizados (se muestran a 92 px)
    "sec-ambiente.png": [184],
    "sec-vial.png": [184],
    "sec-agro.png": [184],
    "sec-comunidad.png": [184],
    "sec-salud.png": [184],
    # Pasos del proceso
    "paso-1.jpg": [476],
    "paso-2.jpg": [472],
    "paso-3.jpg": [478],
    # Carrusel de fotos (se muestran a 380 px como maximo)
    "foto-reunion.jpg": [760],
    "comunidad-2.jpg": [578],
    "socializacion.jpg": [746],
    "comunidad-4.jpg": [623],
    "comunidad-3.jpg": [608],
    "foto-via.jpg": [760],
    # Logos
    "logo-emblem.png": [104],
    "logo-lockup.png": [472],
}

# Las infografias (img/infografia*.jpg) no pasan por aqui a proposito: son el
# documento original que se abre desde la seccion "Enfoque", no imagenes que
# la pagina cargue. Viven directamente en img/.


def target_name(src, width, multiple):
    stem = src.rsplit(".", 1)[0]
    return "%s-%d.webp" % (stem, width) if multiple else "%s.webp" % stem


def main():
    missing = [s for s in PLAN if not os.path.isfile(os.path.join(SRC_DIR, s))]
    if missing:
        print("FALTAN originales en img/originales/:")
        for m in sorted(missing):
            print("   -", m)
        return 1

    before = after = 0
    generated = []

    for src, widths in sorted(PLAN.items()):
        src_path = os.path.join(SRC_DIR, src)
        before += os.path.getsize(src_path)
        multiple = len(widths) > 1

        with Image.open(src_path) as im:
            im.load()
            has_alpha = im.mode in ("RGBA", "LA") or (
                im.mode == "P" and "transparency" in im.info
            )
            base = im.convert("RGBA" if has_alpha else "RGB")

            for w in widths:
                w = min(w, base.width)
                h = max(1, round(base.height * w / base.width))
                out_name = target_name(src, w, multiple)
                out_path = os.path.join(OUT_DIR, out_name)
                resized = base.resize((w, h), Image.LANCZOS)
                # Las ilustraciones con transparencia aguantan menos
                # compresion antes de que se noten los bordes sucios.
                resized.save(
                    out_path,
                    "WEBP",
                    quality=86 if has_alpha else 78,
                    method=6,
                    alpha_quality=100,
                )
                size = os.path.getsize(out_path)
                after += size
                generated.append((src, out_name, "%dx%d" % (w, h), size))

    print("%-24s %-26s %-11s %8s" % ("original", "generado", "tamano", "KB"))
    for src, out, dim, size in generated:
        print("%-24s %-26s %-11s %8.1f" % (src, out, dim, size / 1024))

    print("\n%d archivos generados" % len(generated))
    print("Originales : %7.0f KB" % (before / 1024))
    print("Optimizados: %7.0f KB  (%.0f%% menos)"
          % (after / 1024, 100 * (1 - after / before)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
