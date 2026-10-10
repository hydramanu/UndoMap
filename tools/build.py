"""Build two zero-dependency WebExtension bundles and source distribution."""
from pathlib import Path
import json, shutil, struct, zlib, zipfile
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'extension'
DIST=ROOT/'dist'
DIST.mkdir(exist_ok=True)
icons=SRC/'icons'
icons.mkdir(exist_ok=True)
def png(size):
    # Native raster icon: mint U-turn arrow on a dark teal rounded square.
    pixels=[]
    for y in range(size):
        row=bytearray()
        for x in range(size):
            u=x/size;v=y/size
            radius=((u-.5)**2+(v-.53)**2)**.5
            arc=.20<radius<.30 and (v>.49 or u>.52)
            arrow=.20<u<.49 and abs(v-.31)<(.49-u)*.70
            stem=.25<u<.35 and .31<v<.56
            row.extend((255,246,232,255) if arc or arrow or stem else (232,82,43,255))
        pixels.append(b'\0'+row)
    def chunk(t,data):return struct.pack('>I',len(data))+t+data+struct.pack('>I',zlib.crc32(t+data)&0xffffffff)
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(pixels)))+chunk(b'IEND',b'')
for size in (16,32,48,128):(icons/f'icon{size}.png').write_bytes(png(size))
base={'manifest_version':3,'name':'UndoMap — Know your way back','version':'0.1.0','description':'Review recovery evidence before purchases, subscriptions, or account deletion. Save local recovery cards and reminders.','permissions':['activeTab','scripting','storage','alarms','notifications'],'action':{'default_popup':'popup.html','default_title':'UndoMap: review this page'},'icons':{str(s):f'icons/icon{s}.png' for s in (16,32,48,128)},'options_ui':{'page':'dashboard.html','open_in_tab':True},'content_security_policy':{'extension_pages':"script-src 'self'; object-src 'none'"}}
for browser in ('chromium','firefox'):
    dest=DIST/browser
    shutil.copytree(SRC,dest,dirs_exist_ok=True)
    manifest=dict(base)
    if browser=='chromium':manifest.update(background={'service_worker':'background.js'},minimum_chrome_version='102')
    else:manifest.update(background={'scripts':['core.js','background.js']},browser_specific_settings={'gecko':{'id':'undomap@hydramanu.local','strict_min_version':'142.0','data_collection_permissions':{'required':['none']}}})
    (dest/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    with zipfile.ZipFile(DIST/f'undomap-{browser}.zip','w',zipfile.ZIP_DEFLATED) as z:
        for path in dest.rglob('*'):
            if path.is_file():z.write(path,path.relative_to(dest))
with zipfile.ZipFile(DIST/'undomap-source.zip','w',zipfile.ZIP_DEFLATED) as z:
    for directory in ('extension','demo','docs','tools','tests','.github'):
        folder=ROOT/directory
        if folder.exists():
            for path in folder.rglob('*'):
                if path.is_file() and '__pycache__' not in path.parts:z.write(path,Path('undomap')/path.relative_to(ROOT))
    for name in ('README.md','PRIVACY.md','package.json','.gitignore','start-demo.bat'):
        if (ROOT/name).exists():z.write(ROOT/name,Path('undomap')/name)
print('Built Chromium, Firefox, and source ZIPs in',DIST)
