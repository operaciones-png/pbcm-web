# -*- coding: utf-8 -*-
"""
Genera una copia del sitio en UN SOLO ARCHIVO, con las imagenes incrustadas
en base64. Sirve para enviar la pagina por correo o WhatsApp, o para verla
sin conexion.

OJO: el sitio publicado NO usa este archivo. La pagina que se publica es
index.html + la carpeta img/ (Netlify las sirve por separado, que es mucho
mas rapido). Este script es solo para compartir una copia portatil.

Uso:
    python tools/build_standalone.py

Resultado:
    dist/pbcm-standalone.html
"""
import base64
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "index.html")
IMG = os.path.join(ROOT, "img")
OUT_DIR = os.path.join(ROOT, "dist")
OUT = os.path.join(OUT_DIR, "pbcm-standalone.html")

MIMES = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
    "svg": "image/svg+xml",
}

with open(SRC, encoding="utf-8") as f:
    html = f.read()

cache = {}
missing = []


def datauri(fn):
    """Devuelve la imagen img/<fn> como data URI, o None si no existe."""
    if fn not in cache:
        path = os.path.join(IMG, fn)
        if not os.path.isfile(path):
            missing.append(fn)
            cache[fn] = None
        else:
            ext = fn.rsplit(".", 1)[-1].lower()
            mime = MIMES.get(ext, "application/octet-stream")
            with open(path, "rb") as fh:
                cache[fn] = "data:%s;base64,%s" % (
                    mime,
                    base64.b64encode(fh.read()).decode(),
                )
    return cache[fn]


# Incrusta src="img/...", href="img/..." y los srcset de <picture>.
# El srcset se colapsa a una sola imagen: dentro de un archivo unico no hay
# nada que ganar sirviendo varios tamanos, y evita duplicar megas en base64.
def repl_attr(m):
    attr, fn = m.group(1), m.group(2)
    uri = datauri(fn)
    return m.group(0) if uri is None else '%s="%s"' % (attr, uri)


def repl_srcset(m):
    """Se queda con el candidato mas grande del srcset y lo incrusta."""
    candidates = [c.strip() for c in m.group(1).split(",") if c.strip()]
    if not candidates:
        return ""
    best = candidates[-1].split()[0]
    fn = best.split("/", 1)[-1]
    uri = datauri(fn)
    return "" if uri is None else 'srcset="%s"' % uri


EXT = r"(?:jpg|jpeg|png|webp|svg)"
html = re.sub(r'srcset="((?:\s*img/[^",]+%s[^",]*,?)+)"' % EXT, repl_srcset, html)
html = re.sub(r'(src|href)="img/([^"]+\.%s)"' % EXT, repl_attr, html)

os.makedirs(OUT_DIR, exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)

left = re.findall(r'(?:src|href|srcset)="[^"]*img/[^"]+', html)

print("OK  ->  dist/pbcm-standalone.html")
print("Tamano:", len(html) // 1024, "KB")
print("Imagenes incrustadas:", html.count("data:image/"))
print("Referencias img/ sin resolver:", len(left))

if missing:
    print("\nFALTAN en img/ (%d):" % len(missing))
    for fn in sorted(set(missing)):
        print("   -", fn)
    sys.exit(1)
if left:
    print("\nAVISO: quedaron referencias sin incrustar:")
    for ref in left[:10]:
        print("   -", ref)
    sys.exit(1)
