import 'dotenv/config';
import { loadProblemCatalog } from './problemCatalog';
import { computeHiddenTestCoverage } from './seedHiddenTests';

const catalog = loadProblemCatalog();
const report = computeHiddenTestCoverage(catalog);

console.log(JSON.stringify(report, null, 2));
