// Reconstructed photo plates + layered clouds + a rigged greeting. Not generative video.
// Uses the same isolated render dependencies as render-office-journey.mjs.
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';

const require = createRequire(path.resolve('artifacts/journey-tools/package.json'));
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const ffmpeg = require('ffmpeg-static');
const root = 'public/brand/journey';
const [earth, office, person, clouds, logo] = await Promise.all([
  `${root}/earth.jpg`, `${root}/v2/office-car.png`, `${root}/v2/advisor-wave.png`,
  `${root}/v2/clouds.png`, 'public/brand/logo.png',
].map(async file => loadImage(await readFile(file))));
const W = 1920, H = 1080, FPS = 30, DURATION = 24;
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
const clamp = n => Math.min(1, Math.max(0, n));
const smooth = n => { const p = clamp(n); return p * p * (3 - 2 * p); };
const lerp = (a, b, p) => a + (b - a) * p;
const win = (t, a, b, c, d) => smooth((t-a)/(b-a)) * (1-smooth((t-c)/(d-c)));
await mkdir('artifacts/journey-preview/v2', { recursive: true });

function text(message, x, y, size, color = '#fff', weight = 400) {
  ctx.font = `${weight} ${size}px Arial`;
  ctx.fillStyle = color; ctx.fillText(message, x, y);
}
function photo(image, scale = 1, panX = 0, panY = 0) {
  const fit = Math.max(W/image.width,H/image.height) * scale;
  ctx.drawImage(image, (W-image.width*fit)/2+panX, (H-image.height*fit)/2+panY,
    image.width*fit, image.height*fit);
}
function wordmark(x, y, width) {
  const height = logo.height / logo.width * width;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x-13,y-10,width+26,height+20,12); ctx.fill();
  ctx.drawImage(logo, x,y,width,height);
}

// Mesh animation keeps the elbow anchored and progressively rotates only the forearm.
// Source and destination triangles share vertices, keeping the cutout continuous.
function triangle(target, source, s, d) {
  const [p0,p1,p2] = s, [q0,q1,q2] = d;
  const determinant = p0.x*(p1.y-p2.y)+p1.x*(p2.y-p0.y)+p2.x*(p0.y-p1.y);
  const a = (q0.x*(p1.y-p2.y)+q1.x*(p2.y-p0.y)+q2.x*(p0.y-p1.y))/determinant;
  const c = (q0.x*(p2.x-p1.x)+q1.x*(p0.x-p2.x)+q2.x*(p1.x-p0.x))/determinant;
  const e = (q0.x*(p1.x*p2.y-p2.x*p1.y)+q1.x*(p2.x*p0.y-p0.x*p2.y)+q2.x*(p0.x*p1.y-p1.x*p0.y))/determinant;
  const b = (q0.y*(p1.y-p2.y)+q1.y*(p2.y-p0.y)+q2.y*(p0.y-p1.y))/determinant;
  const f = (q0.y*(p1.x*p2.y-p2.x*p1.y)+q1.y*(p2.x*p0.y-p0.x*p2.y)+q2.y*(p0.x*p1.y-p1.x*p0.y))/determinant;
  const dd = (q0.y*(p2.x-p1.x)+q1.y*(p0.x-p2.x)+q2.y*(p1.x-p0.x))/determinant;
  const center={x:(q0.x+q1.x+q2.x)/3,y:(q0.y+q1.y+q2.y)/3};
  const expanded=[q0,q1,q2].map(p=>{
    const dx=p.x-center.x,dy=p.y-center.y,dist=Math.hypot(dx,dy);
    return {x:p.x+dx/dist*.65,y:p.y+dy/dist*.65};
  });
  target.save(); target.beginPath(); target.moveTo(expanded[0].x,expanded[0].y);
  target.lineTo(expanded[1].x,expanded[1].y); target.lineTo(expanded[2].x,expanded[2].y); target.closePath(); target.clip();
  target.transform(a,b,c,dd,e,f); target.drawImage(source,0,0); target.restore();
}
const rig = createCanvas(person.width,person.height), rc = rig.getContext('2d');
function renderAdvisor(t) {
  rc.clearRect(0,0,rig.width,rig.height);
  const envelope = win(t,15.5,16.4,21.8,23);
  const angle = Math.sin((t-15.5)*Math.PI*1.32)*.145*envelope;
  // Region isolates the raised arm from the head and shirt; everything else is drawn once.
  const left=638, right=882, top=65, bottom=540;
  rc.save(); rc.beginPath(); rc.rect(0,0,rig.width,rig.height);
  rc.rect(left,top,right-left,bottom-top); rc.clip('evenodd'); rc.drawImage(person,0,0); rc.restore();
  const warp = (x,y) => {
    const influence = smooth((x-638)/66) * smooth((522-y)/128);
    const turn = angle*influence, ox=x-735, oy=y-477;
    return {x:735+ox*Math.cos(turn)-oy*Math.sin(turn),y:477+ox*Math.sin(turn)+oy*Math.cos(turn)};
  };
  const nx=12,ny=18;
  for(let row=0;row<ny;row++) for(let col=0;col<nx;col++) {
    const x=left+(right-left)*col/nx,y=top+(bottom-top)*row/ny;
    const xx=left+(right-left)*(col+1)/nx,yy=top+(bottom-top)*(row+1)/ny;
    const s=[{x,y},{x:xx,y},{x:xx,y:yy},{x,y:yy}],d=s.map(p=>warp(p.x,p.y));
    triangle(rc,person,[s[0],s[1],s[2]],[d[0],d[1],d[2]]);
    triangle(rc,person,[s[0],s[2],s[3]],[d[0],d[2],d[3]]);
  }
  // Use the actual company artwork instead of relying on generated small lettering.
  rc.fillStyle='#fff';rc.beginPath();rc.roundRect(522,363,69,44,6);rc.fill();
  rc.drawImage(logo,527,372,59,59*logo.height/logo.width);
  return rig;
}

function street(t) {
  const p=smooth((t-12)/12), scale=lerp(1,1.055,p);
  ctx.save(); ctx.translate(W/2,H*.57); ctx.scale(scale,scale); ctx.translate(-W/2,-H*.57);
  photo(office);
  const breathing = 1+Math.sin(t*1.7)*.0015;
  const height=500*breathing, width=height*person.width/person.height;
  const px=1287,py=947-height;
  // Contact shadows align both shoes to the real sidewalk.
  const shadow=ctx.createRadialGradient(px+width*.43,947,5,px+width*.43,947,75);
  shadow.addColorStop(0,'rgba(0,0,0,.25)');shadow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.save();ctx.translate(0,947);ctx.scale(1,.18);ctx.translate(0,-947);
  ctx.fillStyle=shadow;ctx.fillRect(px,600,width,700);ctx.restore();
  ctx.drawImage(renderAdvisor(t),px,py,width,height);
  ctx.restore();
}

function cloudLayer(t) {
  const opacity=win(t,6.4,8.3,14.1,16.4);
  if(opacity<=0)return;
  ctx.save();ctx.globalAlpha=opacity;
  // Peripheral cloud banks travel outward as the camera passes between them.
  const p=clamp((t-6.4)/10), scale=lerp(.96,1.72,p);
  photo(clouds,scale,-30*p,30*p);
  ctx.globalAlpha=opacity*.72;
  ctx.save();ctx.translate(W,H);ctx.rotate(Math.PI);photo(clouds,lerp(1.2,1.9,p),100,-70);ctx.restore();
  // A close, textured cloud fills the frame at the geographic/photo handoff.
  // It is a moving photograph of cloud detail, not a plain white flash.
  ctx.globalAlpha=win(t,9.1,10.5,12.4,14.2);
  ctx.drawImage(clouds,35,450,440,370,-170+(t-10)*20,-180,W+380,H+360);
  ctx.restore();
}

function draw(t, withTitles=true) {
  ctx.globalAlpha=1;ctx.fillStyle='#03070d';ctx.fillRect(0,0,W,H);
  if(t<12.1){
    for(let i=0;i<135;i++){
      ctx.fillStyle=`rgba(222,234,255,${.15+(i%4)*.07})`;
      ctx.fillRect((i*257+19)%W,(i*149+17)%H,i%5===0?2:1,1);
    }
    const p=smooth(t/11);
    const size=1000*Math.exp(p*1.73), ratio=earth.height/earth.width;
    const x=lerp(1365,960,smooth(t/8)),y=lerp(600,540,smooth(t/8));
    ctx.drawImage(earth,x-size*.512,y-size*ratio*.583,size,size*ratio);
    if(withTitles){
      ctx.globalAlpha=1-smooth((t-4)/2.4);
      const shade=ctx.createLinearGradient(0,0,1180,0);
      shade.addColorStop(0,'#03070df5');shade.addColorStop(1,'#03070d00');
      ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
      text('RENTING CAR A&M',98,363,23,'#ffab2d',700);
      text('Todo gran viaje',94,475,76,'#fff',700);
      text('tiene un comienzo.',94,563,76,'#fff',700);
      text('El nuestro está en Surco, Lima.',99,641,31,'#c9d2df');
      ctx.globalAlpha=1;
    }
  }
  if(t>=11.8){
    ctx.save();ctx.globalAlpha=smooth((t-11.8)/.3);street(t);ctx.restore();
  }
  cloudLayer(t);
  if(t>18.5&&withTitles){
    ctx.globalAlpha=smooth((t-18.5)/2);
    const shade=ctx.createLinearGradient(0,0,800,600);
    shade.addColorStop(0,'#020812dc');shade.addColorStop(1,'#02081200');
    ctx.fillStyle=shade;ctx.fillRect(0,0,950,640);
    wordmark(83,77,225);
    text('Te esperamos',65,257,64,'#fff',700);
    text('en Surco.',65,332,64,'#fff',700);
    text('Av. Santiago de Surco 3573',69,387,27,'#fff');
    text('rentingcaraym.com',69,428,25,'#ffb33e',700);
    ctx.globalAlpha=1;
  }
  if(t>14.3){
    ctx.save();ctx.globalAlpha=smooth((t-14.3)/1.5);
    ctx.fillStyle='#07101bc7';ctx.fillRect(0,H-31,W,31);
    text('Recreación visual con IA · Fachada basada en la referencia de Google Street View',24,H-10,16,'#e4eaf2');
    ctx.restore();
  }
}

// High-quality final-frame reference for Gemini and the local player.
draw(20.3,false);
await writeFile(`${root}/v2/escena-final.jpg`,canvas.toBuffer('image/jpeg',94));
draw(22.5);
await writeFile(`${root}/v2/poster.jpg`,canvas.toBuffer('image/jpeg',90));
const sampleTimes=[0,4,7.5,9.5,11.5,13,15,16.5,17,17.4,17.8,19.5,23.9];
for(const t of sampleTimes){draw(t);await writeFile(`artifacts/journey-preview/v2/${t}.jpg`,canvas.toBuffer('image/jpeg',88));}
if(process.argv.includes('--frames-only'))process.exit(0);

const output=`${root}/tierra-a-surco-v2.mp4`;
const proc=spawn(ffmpeg,['-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgba',
  '-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast',
  '-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',output],
  {stdio:['pipe','ignore','inherit'],windowsHide:true});
const completion=new Promise((resolve,reject)=>{
  proc.once('error',reject);proc.once('exit',code=>code===0?resolve():reject(new Error(`ffmpeg exit ${code}`)));
});
for(let frame=0;frame<DURATION*FPS;frame++){
  draw(frame/FPS);
  if(!proc.stdin.write(Buffer.from(ctx.getImageData(0,0,W,H).data)))await once(proc.stdin,'drain');
  if(frame%(FPS*6)===0)console.log(`Rendering ${frame/FPS}s / ${DURATION}s`);
}
proc.stdin.end();await completion;
console.log(`Rendered ${output}: ${DURATION}s, ${W}x${H}, ${FPS}fps, silent.`);
