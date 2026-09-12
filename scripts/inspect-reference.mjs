import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({channel:'msedge', headless:true});
const page = await browser.newPage({viewport:{width:1000,height:700}});
await page.goto('file:///C:/Users/DELL/Downloads/c45a3b67b2178b35d31bcaec7c727b00_720w%20(1).mp4');
await page.waitForSelector('video');
await page.evaluate(async()=>{const v=document.querySelector('video'); v.pause(); if(v.readyState<2) await new Promise(r=>v.addEventListener('loadeddata',r,{once:true}));});
const info=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));
console.log(info);
await mkdir('test-results/reference',{recursive:true});
for(const fraction of [0.05,0.3,0.55,0.8]){
 await page.locator('video').evaluate(async(v,t)=>{v.currentTime=t;await new Promise(r=>v.addEventListener('seeked',r,{once:true}));}, info.duration*fraction);
 await page.locator('video').screenshot({path:`test-results/reference/frame-${fraction}.png`});
}
await browser.close();
