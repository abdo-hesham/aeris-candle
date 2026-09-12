"""Original AERIS procedural still lifes; Pillow + NumPy, no image model/stock.
Run from any directory: python scripts/generate-story-assets.py
Only generated files under public/assets/story are written.
"""
from pathlib import Path
import math
import random
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/story'
OUT.mkdir(parents=True, exist_ok=True)
R = random.Random(81023)
N = np.random.default_rng(81023)
W, H = 1440, 1080


def background(w=W, h=H):
    y, x = np.mgrid[:h, :w]
    light = 9*np.exp(-((x-w*.20)/(w*.7))**2-((y-h*.1)/(h*.9))**2)
    light -= 12*(y/h)+5*(x/w)
    grain = N.normal(0, .64, (h, w))
    arr = np.stack([v+light+grain for v in (233, 224, 208)], axis=-1)
    return Image.fromarray(np.uint8(np.clip(arr, 0, 255))).convert('RGBA')


def shadow(base, alpha, offset=(30, 35), blur=24, opacity=.22):
    s = Image.new('RGBA', base.size, (73, 49, 28, 0))
    a = Image.new('L', base.size)
    a.paste(alpha, offset)
    a = a.filter(ImageFilter.GaussianBlur(blur)).point(lambda x: int(x*opacity))
    s.putalpha(a)
    base.alpha_composite(s)


def place(base, obj, center, angle=0):
    obj = obj.rotate(angle, Image.Resampling.BICUBIC, expand=True)
    p = (int(center[0]-obj.width/2), int(center[1]-obj.height/2))
    layer = Image.new('RGBA', base.size)
    layer.alpha_composite(obj, p)
    shadow(base, layer.getchannel('A'))
    base.alpha_composite(layer)


def wood(length, height, dark=False):
    # A split heartwood sliver: continuous warped fibers and torn edges.
    w, h = length, height
    y, x = np.mgrid[:h, :w]
    warp = y + 6*np.sin(x/127+y/41) + 2*np.sin(x/39+y/20)
    fibers = 7*np.sin(warp*1.33)+4*np.sin(warp*3.04)+3*np.sin(warp*.32)
    broad = 10*np.sin(warp/18+x/420)
    shade = -26*(y/h)**2 + 12*np.sin(y/h*math.pi)
    noise = N.normal(0, 2.7, (h, w))
    color = (157, 105, 61) if dark else (193, 151, 101)
    arr = np.stack([c+fibers+broad+shade+noise for c in color], -1)
    im = Image.fromarray(np.uint8(np.clip(arr, 0, 255))).convert('RGBA')
    mask = Image.new('L', (w,h)); d = ImageDraw.Draw(mask)
    top = [(i, int(12+R.uniform(-7,7)+5*math.sin(i/90))) for i in range(20,w-28,12)]
    bottom = [(i, int(h-15+R.uniform(-6,6))) for i in range(w-25,22,-12)]
    d.polygon([(0,h*.48)]+top+[(w-1,h*.36),(w-10,h*.74)]+bottom, fill=255)
    im.putalpha(mask)
    details = Image.new('RGBA', im.size); d = ImageDraw.Draw(details)
    for _ in range(105):
        yy=R.randrange(15,h-12); xx=R.randrange(4,w-60); end=min(w-8,xx+R.randrange(25,280))
        pts=[(t,yy+3*math.sin(t/83+yy/31)) for t in range(xx,end,4)]
        if len(pts)>1: d.line(pts, fill=(77,43,22,R.randrange(12,56)), width=R.choice([1,1,2]))
    # Split end exposes short cross-grain and brighter broken fibers.
    d.polygon([(w-58,19),(w-1,h*.36),(w-10,h*.74),(w-49,h-17)], fill=(221,179,126,125))
    for _ in range(40):
        yy=R.randrange(25,h-18)
        d.line([(w-50,yy),(w-9,yy-6)], fill=(108,72,41,R.randrange(30,90)),width=1)
    details.putalpha(ImageChops.multiply(details.getchannel('A'),mask))
    im.alpha_composite(details)
    return im


def sandalwood():
    im=background()
    place(im,wood(695,155),(748,567),-13)
    place(im,wood(645,136),(775,637),15)
    place(im,wood(565,131),(700,507),27)
    place(im,wood(237,58),(1024,778),-24)
    # Tiny natural splinters, not decorative dust.
    for _ in range(22):
        x,y=R.gauss(837,173),R.gauss(768,28)
        ImageDraw.Draw(im).line([(x,y),(x+R.uniform(3,16),y+R.uniform(-4,4))], fill=(161,122,78,170),width=1)
    return im


def resin(size, seed):
    r=random.Random(seed); w,h=size
    y,x=np.mgrid[:h,:w]
    # Warm translucent depth, golden edges, irregular natural fracture faces.
    dist=((x-w*.40)/(w*.7))**2+((y-h*.35)/(h*.8))**2
    noise=N.normal(0,2,(h,w))
    arr=np.stack([206-36*dist+noise,129-52*dist+noise,42-28*dist+noise],-1)
    im=Image.fromarray(np.uint8(np.clip(arr,0,255))).convert('RGBA')
    pts=[]
    for i in range(13):
        a=math.tau*i/13; rad=r.uniform(.79,1)
        pts.append((w*.5+math.cos(a)*w*.48*rad,h*.5+math.sin(a)*h*.47*rad))
    mask=Image.new('L',(w,h)); ImageDraw.Draw(mask).polygon(pts,fill=255); im.putalpha(mask)
    layer=Image.new('RGBA',(w,h)); d=ImageDraw.Draw(layer)
    # Broad broken interior planes avoid an artificial radial gemstone cut.
    inner=[(w*.5+(p[0]-w*.5)*r.uniform(.45,.71),h*.43+(p[1]-h*.5)*r.uniform(.47,.70)) for p in pts]
    for i,p in enumerate(pts):
        j=(i+1)%len(pts); q=pts[j]
        c=r.choice([(255,205,114,46),(108,47,12,55),(255,228,150,58),(133,62,10,46),(243,164,63,40)])
        d.polygon([p,q,inner[j],inner[i]],fill=c)
        if i%4==0:d.line([p,inner[i],inner[j]],fill=(255,222,152,68),width=2)
    d.polygon(inner,fill=(249,165,66,30))
    d.polygon([inner[2],inner[3],inner[4],inner[7],inner[8]],fill=(105,51,14,30))
    for _ in range(230):
        px=r.randrange(w); py=r.randrange(h); radius=r.choice([.6,.8,1,1.4,2.3])
        d.ellipse((px,py,px+radius*2,py+radius),fill=(72,36,7,r.randrange(20,95)))
    for _ in range(24):
        px=r.uniform(w*.2,w*.8); py=r.uniform(h*.25,h*.8)
        d.arc((px,py,px+r.uniform(10,60),py+r.uniform(8,30)),180,300,fill=(255,232,167,85),width=1)
    for i in [7,8,9]:
        p,q=pts[i],pts[(i+1)%13]
        d.line([p,q],fill=(255,232,174,175),width=3)
    layer.putalpha(ImageChops.multiply(layer.getchannel('A'),mask))
    im.alpha_composite(layer)
    return im


def amber():
    im=background()
    for size,center,angle,seed in [((350,265),(849,466),12,21),((318,236),(617,615),-19,37),((278,217),(916,657),21,17),((115,94),(1112,726),-8,22),((73,61),(775,807),3,52)]:
        place(im,resin(size,seed),center,angle)
    return im


def cedar():
    im=background()
    place(im,wood(526,131,True),(785,698),-16)
    place(im,wood(393,81,True),(758,770),9)
    spray=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(spray)
    def branch(x,y,angle,length,depth):
        ex=x+math.cos(angle)*length; ey=y+math.sin(angle)*length
        d.line([(x,y),(ex,ey)],fill=(94,91,57,255),width=max(1,depth+1))
        if depth:
            for k in range(3,10):
                f=k/11
                for side in (-1,1):
                    branch(x+(ex-x)*f,y+(ey-y)*f,angle+side*R.uniform(.43,.9),length*R.uniform(.19,.31)*(1.2-f*.35),depth-1)
        else:
            # Alternating overlapping scales form cedar fans, not generic leaves.
            for k in range(2,10):
                f=k/10; px=x+(ex-x)*f; py=y+(ey-y)*f
                for side in (-1,1):
                    a=angle+side*.6; ln=R.uniform(7,13)*(1-f*.4)
                    tx=px+math.cos(a)*ln; ty=py+math.sin(a)*ln
                    normal=(-math.sin(a)*2.1,math.cos(a)*2.1)
                    c=R.choice([(102,111,75,255),(119,123,81,255),(130,132,90,255),(84,101,69,255),(146,143,97,255)])
                    d.polygon([(px,py),(px+normal[0],py+normal[1]),(tx,ty),(px-normal[0],py-normal[1])],fill=c)
    branch(1117,843,-2.26,680,3)
    branch(1032,769,-1.39,409,2)
    shadow(im,spray.getchannel('A'),(20,22),14,.16)
    im.alpha_composite(spray)
    return im


def purchase():
    im=background(1200,1500)
    src=Image.open(ROOT/'public/assets/candle-without-flame.png').convert('RGBA')
    # The source has isolated low-alpha speckles in transparent padding.
    # Preserve the source's exact product geometry and artwork; crop robust alpha bounds.
    a=src.getchannel('A'); robust=a.point(lambda v:255 if v>210 else 0)
    box=robust.getbbox(); src=src.crop(box)
    src.thumbnail((757,930),Image.Resampling.LANCZOS)
    x=(1200-src.width)//2-23; y=1140-src.height
    # Ground-plane cast shadow points away from the source's upper-left softbox.
    ground=Image.new('L',im.size); d=ImageDraw.Draw(ground)
    d.ellipse((x+55,1075,x+src.width+160,1220),fill=87)
    shadow(im,ground,(0,0),47,.7)
    tight=Image.new('L',im.size); ImageDraw.Draw(tight).ellipse((x+59,1102,x+src.width-20,1163),fill=133)
    shadow(im,tight,(13,7),15,.64)
    im.alpha_composite(src,(x,y))
    return im


def main():
    manifest=[]
    for name,fn in [('sandalwood',sandalwood),('amber',amber),('cedar',cedar),('purchase',purchase)]:
        path=OUT/f'{name}.webp'; fn().convert('RGB').save(path,'WEBP',quality=94,method=6)
        with Image.open(path) as im:
            im.load(); assert im.width>=1200 and im.height>=900
            if name=='purchase': assert im.size==(1200,1500)
            manifest.append({'file':str(path.relative_to(ROOT)).replace('\\','/'),'dimensions':list(im.size),'bytes':path.stat().st_size})
    sheet=Image.new('RGB',(1200,1050),(237,229,215))
    for idx,name in enumerate(('sandalwood','amber','cedar','purchase')):
        with Image.open(OUT/f'{name}.webp') as im:
            im.thumbnail((590,505),Image.Resampling.LANCZOS)
            x=(idx%2)*600+(600-im.width)//2; y=(idx//2)*525+(525-im.height)//2
            sheet.paste(im,(x,y))
    sheet.save(OUT/'contact-sheet.jpg',quality=93)
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps(manifest,indent=2))

if __name__=='__main__': main()
