export interface AIProvider {
  analyze(change: string): Promise<string>;
}
