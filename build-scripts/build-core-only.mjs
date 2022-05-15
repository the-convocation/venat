import * as fs from 'fs/promises';
import * as path from 'path';

const jsonPath = path.resolve('package.json');

const pkg = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
pkg.workspaces = pkg.workspaces.filter(w => !w.includes('modules/'));

// save the new package.json
await fs.writeFile(jsonPath, JSON.stringify(pkg, null, 2));
console.log('Modified package.json to build without modules.');
