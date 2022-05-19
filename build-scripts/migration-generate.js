const child_process = require('child_process');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: yarn migration:generate NameOfMigration');
  console.error(
    'Do not include the file extension or path in the migration name - they will be added automatically.',
  );
  process.exit(1);
}

const cliHelper = path.join(
  __dirname,
  '../core/dist/src/database/cli-helper.datasource.js',
);
const target = path.join(
  __dirname,
  '../core/src/database/migrations',
  process.argv[2],
);
const args = process.argv.slice(3).join(' ');

child_process.spawnSync(
  `yarn build && npx typeorm migration:generate -p -d ${cliHelper} ${target} ${args}`,
  { shell: true, stdio: 'inherit' },
);
