# -*- coding: utf-8 -*-
"""
Genera las infografias que publica la pagina, a partir de los originales.

QUE HACE Y POR QUE
------------------
Los originales de las mesas terminan la banda de "inversiones de menor
impacto" con un quinto item que PBCM decidio no publicar. Este script acorta
esa banda para que termine despues del cuarto item.

El metodo no borra ni pinta encima a mano: copia el remate redondeado de la
propia banda —una franja junto al borde donde no hay texto— y lo pega justo
despues del cuarto item. Lo que quedaba a la derecha pasa a fondo de pagina.
Asi el resultado conserva el color, el radio y el suavizado originales.

Los originales de _fuentes/ NUNCA se modifican. La edicion vive aqui, en
codigo, para que cualquiera pueda ver exactamente que se cambio.

Uso:
    python tools/recorta_infografia.py

Lee de   _fuentes/infografia*.jpg   (no se publican, estan en .gitignore)
Escribe  img/infografia*.webp       (lo que la pagina carga)
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta Pillow. Instalalo con:  pip install Pillow")

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTES = os.path.join(RAIZ, "_fuentes")
DESTINO = os.path.join(RAIZ, "img")

# Coordenadas medidas sobre cada imagen. Los tres archivos tienen tamanos y
# maquetacion distintos, y la version francesa ademas usa azul marino en vez
# de teal, por eso cada uno lleva sus propios numeros.
#
#   remate_desde / remate_hasta : franja del borde derecho, sin texto, de la
#                                 que se copia la esquina redondeada
#   fin_banda                   : donde debe terminar la banda ya acortada
PLAN = {
    "infografia.jpg":    dict(remate_desde=1191, remate_hasta=1209, fin_banda=1070),
    "infografia-en.jpg": dict(remate_desde=1216, remate_hasta=1243, fin_banda=1102),
    "infografia-fr.jpg": dict(remate_desde=1220, remate_hasta=1247, fin_banda=1088),
}

CALIDAD = 88  # WebP: por encima de esto el archivo crece sin verse mejor


def alto_de_la_banda(im, x_sonda):
    """Filas que ocupa la banda oscura, mirando una columna de su interior."""
    px, (_, H) = im.load(), im.size
    filas = [y for y in range(int(H * 0.75), H) if sum(px[x_sonda, y]) < 330]
    if not filas:
        raise SystemExit("No se encontro la banda en x=%d" % x_sonda)
    # el tramo contiguo mas largo: evita confundirla con el circulo del titulo
    mejor, actual = [], [filas[0]]
    for y in filas[1:]:
        if y - actual[-1] <= 2:
            actual.append(y)
        else:
            if len(actual) > len(mejor):
                mejor = actual
            actual = [y]
    if len(actual) > len(mejor):
        mejor = actual
    return min(mejor), max(mejor)


def main():
    faltan = [f for f in PLAN if not os.path.isfile(os.path.join(FUENTES, f))]
    if faltan:
        print("FALTAN originales en _fuentes/:")
        for f in sorted(faltan):
            print("   -", f)
        return 1

    print("%-20s %-16s %10s %10s" % ("origen", "generado", "original", "publicado"))
    for nombre, p in sorted(PLAN.items()):
        origen = os.path.join(FUENTES, nombre)
        with Image.open(origen) as im:
            im = im.convert("RGB")
            W, H = im.size
            by0, by1 = alto_de_la_banda(im, p["remate_desde"] + 4)
            fondo = im.getpixel((W - 6, (by0 + by1) // 2))
            # margen vertical, para arrastrar el suavizado del borde redondeado
            my0, my1 = by0 - 6, min(H, by1 + 7)

            remate = im.crop((p["remate_desde"], my0, p["remate_hasta"], my1))
            ancho = p["remate_hasta"] - p["remate_desde"]

            out = im.copy()
            out.paste(fondo, (p["fin_banda"], my0, W, my1))
            out.paste(remate, (p["fin_banda"] - ancho, my0))

            salida = nombre.replace(".jpg", ".webp")
            ruta = os.path.join(DESTINO, salida)
            out.save(ruta, "WEBP", quality=CALIDAD, method=6)
            print("%-20s %-16s %8.0f KB %8.0f KB"
                  % (nombre, salida,
                     os.path.getsize(origen) / 1024,
                     os.path.getsize(ruta) / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
