declare module 'troika-three-text' {
  export function configureTextBuilder(options: {
    useWorker?: boolean;
    defaultFontURL?: string;
  }): void;
}
