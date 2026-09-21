import { configureTextBuilder } from 'troika-three-text';
// Keep text-worker configuration out of the public homepage bundle.
configureTextBuilder({ useWorker: false, defaultFontURL: '/fonts/Inter.ttf' });
