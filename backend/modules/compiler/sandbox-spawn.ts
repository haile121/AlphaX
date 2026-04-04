import { spawn } from 'child_process';
import type { SandboxResult } from './sandbox-types';

export function spawnWithTimeout(
  cmd: string,
  args: string[],
  timeoutMs: number,
  env?: NodeJS.ProcessEnv
): Promise<SandboxResult> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { shell: false, env: env ?? process.env });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, timeoutMs);

    proc.stdout.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    proc.stderr.on('data', (d: Buffer) => {
      stderr += d.toString();
    });

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode, timedOut });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      const msg =
        (err as NodeJS.ErrnoException).code === 'ENOENT'
          ? `Executable not found: '${cmd}'.`
          : err.message;
      resolve({ stdout: '', stderr: msg, exitCode: null, timedOut: false });
    });
  });
}
