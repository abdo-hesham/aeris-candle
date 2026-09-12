import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
for(const name of ['fern_02','moss_01','rock_moss_set_01']){
 const manifest=await fetch(`https://api.polyhaven.com/files/${name}`).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.json();});
 const entry=manifest.gltf['1k'].gltf;
 for(const [relative,file] of [[`${name}.gltf`,entry],...Object.entries(entry.include)]){
  const destination=path.resolve('public/assets/models',name,relative);
  const root=path.resolve('public/assets/models',name)+path.sep;
  if(!destination.startsWith(root))throw new Error('Unexpected asset path');
  await mkdir(path.dirname(destination),{recursive:true});
  const response=await fetch(file.url);if(!response.ok)throw new Error(String(response.status));
  await writeFile(destination,Buffer.from(await response.arrayBuffer()));
 }
 const alpha=manifest.Alpha?.['1k']?.jpg;
 if(alpha){const response=await fetch(alpha.url);if(!response.ok)throw new Error(String(response.status));await writeFile(`public/assets/models/${name}/alpha.jpg`,Buffer.from(await response.arrayBuffer()));}
 console.log(`Saved ${name}, including local buffers and textures.`);
}
