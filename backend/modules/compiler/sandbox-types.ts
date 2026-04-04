export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
}

export type SandboxWebResult = SandboxResult & { previewHtml?: string };
