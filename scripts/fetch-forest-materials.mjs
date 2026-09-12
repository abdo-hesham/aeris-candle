import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('public/assets/materials',{recursive:true});
for(const asset of ['bark_brown_02','forest_ground_04']){
 const response=await fetch(`https://api.polyhaven.com/files/${asset}`);
 if(!response.ok)throw new Error(`Manifest ${response.status}`);
 const manifest=await response.json();
 for(const [key,name] of [['Diffuse','color'],['nor_gl','normal'],['Rough','roughness']]){
  const entry=manifest[key]?.['1k']?.jpg;
  if(!entry)throw new Error(`Missing ${asset} ${key}: ${Object.keys(manifest)}`);
  const file=await fetch(entry.url);if(!file.ok)throw new Error(`Texture ${file.status}`);
  await writeFile(`public/assets/materials/${asset}-${name}.jpg`,Buffer.from(await file.arrayBuffer()));
  console.log(`${asset}-${name}: ${entry.size} bytes`);
 }
}
