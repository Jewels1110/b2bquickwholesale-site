/**
 * Checks the demo order form's ordering rules against the real portal's.
 *
 * The demo is a replica of what buyers see, so when it disagrees with the app
 * it misleads people before they install. Two disagreements reached the live
 * site: a product whose minimum (6) exceeded its stock (3) kept an enabled Add
 * button that silently did nothing, and stock of 0 was read as "no limit", so
 * quantities on a sold-out product counted upwards behind a disabled button.
 *
 * This reads the rules straight out of assets/demo.js rather than duplicating
 * them, so it fails if they drift. It checks the rules, not the rendering.
 *
 *   node tools/demo-check.mjs
 */
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../assets/demo.js", import.meta.url), "utf8");

const catalogSource = source.match(/const CATALOG = (\[[\s\S]*?\]);/);
const fitSource = source.match(/const fit = (\(product, wanted\) => \{[\s\S]*?\n {2}\});/);
if (!catalogSource || !fitSource) {
  console.error("FAIL: could not find CATALOG or fit() in assets/demo.js — has the demo been restructured?");
  process.exit(1);
}
const CATALOG = eval(catalogSource[1]);
const fit = eval(fitSource[1].replace(/;$/, ""));

/* The portal's rule, from extensions-src/wholesale-portal/portal.js:
   a product is orderable only when some multiple of its increment, at or above
   its minimum, fits within stock — and the Add button is disabled when it isn't. */
const orderable = (product) => fit(product, product.min) > 0;

const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

for (const product of CATALOG) {
  const name = `${product.sku} (min ${product.min}, step ${product.step}, stock ${product.stock})`;

  if (product.stock === 0) {
    check(!orderable(product), `${name}: sold out but still orderable`);
    check(fit(product, product.step) === 0, `${name}: sold out but a quantity can still be set — stock 0 is being read as "no limit"`);
  }

  if (product.stock > 0 && product.stock < product.min) {
    check(!orderable(product), `${name}: cannot meet its own minimum from stock, so Add must be disabled, not silently inert`);
  }

  if (orderable(product)) {
    const first = fit(product, product.step);
    check(first >= product.min, `${name}: first click gives ${first}, below the minimum`);
    check(first % product.step === 0, `${name}: first click gives ${first}, not a multiple of the increment`);
    check(first <= product.stock, `${name}: first click gives ${first}, more than the ${product.stock} in stock`);
  }
}

/* At least one product must exercise the case that broke, or the check is vacuous. */
check(
  CATALOG.some((p) => p.stock > 0 && p.stock < p.min),
  "the demo catalogue no longer contains a product whose minimum exceeds its stock — that case now goes untested",
);

if (failures.length) {
  console.error(`${failures.length} problem(s) in the demo order form:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`ok — ${CATALOG.length} products, ordering rules agree with the portal`);
