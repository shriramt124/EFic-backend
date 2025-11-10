import mysql from 'mysql2/promise';

type MySqlPool = mysql.Pool;

interface GlobalMySQL {
  pool: MySqlPool | null;
  promise: Promise<MySqlPool> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mysqlGlobal: GlobalMySQL | undefined;
}

if (!global._mysqlGlobal) {
  global._mysqlGlobal = { pool: null, promise: null };
}

export async function connectDB(): Promise<MySqlPool> {
  const state = global._mysqlGlobal!;
  if (state.pool) {
    return state.pool;
  }

  if (!state.promise) {
    const host = process.env.MYSQL_HOST || 'localhost';
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'eficsy_content';

    const pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    state.promise = pool
      .query('SELECT 1')
      .then(() => pool)
      .catch((error: unknown) => {
        // Clear the promise so future attempts can retry
        state.promise = null;
        // Best-effort pool shutdown
        pool.end().catch(() => undefined);

        // Build a helpful message for common connection problems
        const host = process.env.MYSQL_HOST || 'localhost';
        const user = process.env.MYSQL_USER || 'unknown';
        let msg = 'Failed to connect to MySQL';
        try {
          // some mysql2 errors include message property
          // keep typesafe access
          const e: any = error;
          if (e && e.message) msg = `${msg}: ${e.message}`;
        } catch {}

        const help = `\n- Host: ${host}\n- User: ${user}\nPossible causes: MySQL server not running, incorrect host/port, firewall/remote access blocked by host provider, or wrong credentials. If you are running the app locally and the DB is hosted on Hostinger, either run the app on the same host or enable remote DB access / use the provider's external hostname.`;

        const err = new Error(msg + help);
        // preserve original stack if present
        (err as any).original = error;
        throw err;
      });
  }

  state.pool = await state.promise;
  return state.pool;
}

export async function disconnectDB() {
  const state = global._mysqlGlobal;
  if (state?.pool) {
    await state.pool.end();
    state.pool = null;
    state.promise = null;
  }
}
