import { promises as fs } from 'fs';

async function addSwHandler() {
  const indexHtmlPath = './public/index.html';

  const indexHtmlFile = await fs.readFile(indexHtmlPath, 'utf-8');

  let newValue = indexHtmlFile.replace(
    '.then((function()',
    '.then((function(swReg)'
  );
  newValue = newValue.replace(
    `console.log('ServiceWorker registered from "sw.js".')`,
    `console.log('ServiceWorker registered.');globalThis.rbbSwReg = swReg;`
  );

  await fs.writeFile(indexHtmlPath, newValue, 'utf-8');
}

addSwHandler();
