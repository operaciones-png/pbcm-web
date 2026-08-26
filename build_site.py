# -*- coding: utf-8 -*-
"""
Construye index.html a partir de template.html, incrustando las imagenes
de la carpeta img/ como datos base64 (asi el sitio queda en un solo archivo).

Uso:
    python build_site.py
"""
import base64, re, os

HERE = os.path.dirname(os.path.abspath(__file__))
TPL  = os.path.join(HERE, "template.html")
IMG  = os.path.join(HERE, "img")
OUT  = os.path.join(HERE, "index.html")

with open(TPL, encoding="utf-8") as f:
    html = f.read()

cache = {}
def datauri(fn):
    if fn not in cache:
        ext = fn.rsplit(".", 1)[-1].lower()
        mime = "image/png" if ext == "png" else "image/jpeg"
        with open(os.path.join(IMG, fn), "rb") as fh:
            cache[fn] = f"data:{mime};base64," + base64.b64encode(fh.read()).decode()
    return cache[fn]

def repl(m):
    return 'src="' + datauri(m.group(1)) + '"'

html2 = re.sub(r'src="img/([^"]+\.(?:jpg|png))"', repl, html)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html2)

print("OK  ->  index.html")
print("Tamano:", len(html2) // 1024, "KB")
print("Imagenes incrustadas:", html2.count("data:image/"))
print("Referencias img/ sin resolver:", len(re.findall(r'img/[^\"]+\.(?:jpg|png)', html2)))
