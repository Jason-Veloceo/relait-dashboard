import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as net from 'net';

type ForwardKey = `${string}:${number}`; // remoteHost:remotePort

const forwards: Map<string, { child: ChildProcess; localPort: number; ready: Promise<void> }> = new Map();

async function ensureFixieWrenchBinary(): Promise<string> {
  const binPath = path.join('/tmp', 'fixie-wrench');
  try {
    await fs.promises.access(binPath, fs.constants.X_OK);
    return binPath;
  } catch {}
  const url = 'https://github.com/usefixie/fixie-wrench/releases/latest/download/fixie-wrench-linux-amd64';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download fixie-wrench: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(binPath, buf);
  await fs.promises.chmod(binPath, 0o755);
  return binPath;
}

function waitForLocalPort(port: number, timeoutMs: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const s = net.createConnection({ host: '127.0.0.1', port }, () => {
        s.destroy();
        resolve();
      });
      s.on('error', () => {
        s.destroy();
        if (Date.now() - start > timeoutMs) reject(new Error('Timeout waiting for fixie-wrench port'));
        else setTimeout(attempt, 150);
      });
    };
    attempt();
  });
}

export async function ensureForward(localPort: number, remoteHost: string, remotePort: number): Promise<void> {
  if (!process.env.FIXIE_SOCKS_HOST) return; // nothing to do

  const key: ForwardKey = `${remoteHost}:${remotePort}`;
  const existing = forwards.get(key);
  if (existing) {
    return existing.ready;
  }

  const bin = await ensureFixieWrenchBinary();
  const args = ['-v', `${localPort}:${remoteHost}:${remotePort}`];
  const child = spawn(bin, args, {
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const ready = waitForLocalPort(localPort, 20000);
  forwards.set(key, { child, localPort, ready });
  await ready;
}


