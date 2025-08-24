export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import * as net from 'net';

async function ensureFixieWrench(): Promise<string> {
  const binPath = path.join('/tmp', 'fixie-wrench');
  try {
    await fs.promises.access(binPath, fs.constants.X_OK);
    return binPath;
  } catch {}
  // Download linux-amd64 binary suitable for Vercel Node.js runtime
  const url = 'https://github.com/usefixie/fixie-wrench/releases/latest/download/fixie-wrench-linux-amd64';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download fixie-wrench: ${res.status} ${res.statusText}`);
  const arrayBuf = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  await fs.promises.writeFile(binPath, buf);
  await fs.promises.chmod(binPath, 0o755);
  return binPath;
}

async function waitForPortOpen(port: number, timeoutMs: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const socket = net.createConnection({ host: '127.0.0.1', port }, () => {
        socket.destroy();
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Timeout waiting for local forward to open'));
        } else {
          setTimeout(tryOnce, 150);
        }
      });
    };
    tryOnce();
  });
}

export async function GET() {
  try {
    const fixie = process.env.FIXIE_SOCKS_HOST;
    if (!fixie) {
      return NextResponse.json({ success: false, error: 'FIXIE_SOCKS_HOST not set' });
    }

    const dbHost = process.env.UAT_DB_HOST || process.env.DB_HOST;
    const dbPort = parseInt(process.env.UAT_DB_PORT || process.env.DB_PORT || '5432', 10);
    const dbUser = process.env.UAT_DB_USER || process.env.DB_USER;
    const dbPassword = process.env.UAT_DB_PASSWORD || process.env.DB_PASSWORD;
    const dbName = process.env.UAT_DB_DATABASE || process.env.DB_DATABASE;

    const bin = await ensureFixieWrench();

    // Pick an ephemeral local port
    const localPort = 12345 + Math.floor(Math.random() * 1000);
    const args = [ `${localPort}:${dbHost}:${dbPort}`, '-v' ];

    const child = spawn(bin, args, {
      env: { ...process.env, FIXIE_SOCKS_HOST: fixie },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });

    let killed = false;
    const killChild = () => { if (!killed) { killed = true; try { child.kill('SIGTERM'); } catch {} } };

    // Wait for forward to open
    await waitForPortOpen(localPort, 8000);

    // Connect via local forward
    const client = new Client({
      host: '127.0.0.1',
      port: localPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: { rejectUnauthorized: false },
      statement_timeout: 8000,
      query_timeout: 8000,
    } as any);

    try {
      await client.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as db_version');
      await client.end();
      killChild();
      return NextResponse.json({
        success: true,
        method: 'fixie-wrench',
        message: 'Connected via local forward through Fixie',
        logs: { stdout, stderr },
        result: result.rows[0]
      });
    } catch (err: any) {
      try { await client.end(); } catch {}
      killChild();
      return NextResponse.json({
        success: false,
        method: 'fixie-wrench',
        error: err.message,
        logs: { stdout, stderr }
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}


