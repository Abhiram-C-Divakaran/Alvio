import 'dotenv/config';
import { loadProblemCatalog } from './problemCatalog';
import {
  buildCoverageInventory,
  computeHiddenTestCoverage,
  formatHiddenTestCoverageReport,
} from './seedHiddenTests';

const args = new Set(process.argv.slice(2));
const catalog = loadProblemCatalog();
const report = computeHiddenTestCoverage(catalog);

if (args.has('--text') || args.has('--pretty')) {
  console.log(formatHiddenTestCoverageReport(report));
} else if (args.has('--inventory')) {
  console.log(JSON.stringify({ ...report, inventory: buildCoverageInventory(catalog) }, null, 2));
} else {
  console.log(JSON.stringify(report, null, 2));
}
