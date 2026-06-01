/**
 * Ensures Node meets Next.js 16 requirements before running npm scripts.
 */
const MIN_MAJOR = 20;
const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);

if (major < MIN_MAJOR) {
  console.error(
    `\n❌ Node.js ${process.version} is too old for this project (need >= ${MIN_MAJOR}).\n`,
  );
  console.error("Fix (nvm):");
  console.error("  nvm install 22");
  console.error("  nvm use 22");
  console.error("  npm install -g npm@latest");
  console.error("  npm run dev\n");
  process.exit(1);
}
