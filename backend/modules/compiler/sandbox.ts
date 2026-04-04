import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SandboxResult } from './sandbox-types';
import { spawnWithTimeout } from './sandbox-spawn';

export type { SandboxResult } from './sandbox-types';

const TIMEOUT_MS = 10000;

// On Windows, use the full path to g++ from MSYS2 in case PATH isn't updated yet
const GPP_CMD =
  process.platform === 'win32' ? 'C:\\msys64\\mingw64\\bin\\g++.exe' : 'g++';

// On Windows, ensure MSYS2 mingw64 DLLs are findable by adding to PATH
const spawnEnv =
  process.platform === 'win32'
    ? { ...process.env, PATH: `C:\\msys64\\mingw64\\bin;${process.env.PATH ?? ''}` }
    : process.env;

export async function runInSandbox(sourceCode: string): Promise<SandboxResult> {
  const id = randomUUID();
  const tmpDir = path.join(os.tmpdir(), `cpp_${id}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const srcFile = path.join(tmpDir, 'main.cpp');
  // On Windows the binary needs .exe extension
  const binFile = path.join(tmpDir, process.platform === 'win32' ? 'main.exe' : 'main');
  fs.writeFileSync(srcFile, sourceCode, 'utf8');

  try {
    // Step 1: Compile
    const compileResult = await spawnWithTimeout(
      GPP_CMD,
      [srcFile, '-o', binFile, '-std=c++17'],
      TIMEOUT_MS,
      spawnEnv
    );

    if (compileResult.exitCode !== 0 || compileResult.timedOut) {
      return {
        stdout: '',
        stderr: compileResult.stderr || 'Compilation timed out',
        exitCode: compileResult.exitCode,
        timedOut: compileResult.timedOut,
      };
    }

    // Step 2: Run the compiled binary
    return await spawnWithTimeout(binFile, [], TIMEOUT_MS, spawnEnv);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
