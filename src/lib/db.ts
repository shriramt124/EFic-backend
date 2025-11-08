import mongoose, { Connection } from 'mongoose';

interface GlobalMongoose {
  conn: Connection | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseGlobal: GlobalMongoose | undefined;
}

if (!global._mongooseGlobal) {
  global._mongooseGlobal = { conn: null, promise: null };
}

export async function connectDB() {
  const { conn, promise } = global._mongooseGlobal!;
  if (conn) return conn;

  if (!promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI environment variable');
    // Try to extract a database name from the URI path. If absent, fall back to env or a sensible default.
    let dbName: string | undefined;
    try {
      const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/(.*?)($|\?|#)/);
      const fromUri = match && match[1] ? decodeURIComponent(match[1]) : '';
      const trimmed = fromUri?.trim();
      dbName = trimmed && trimmed.length > 0 ? trimmed : (process.env.MONGODB_DB || 'eficsy-content');
    } catch {
      dbName = process.env.MONGODB_DB || 'eficsy-content';
    }

    const opts: Parameters<typeof mongoose.connect>[1] = {
      bufferCommands: false,
      maxPoolSize: 5,
    };
    if (dbName) (opts as any).dbName = dbName;

    global._mongooseGlobal!.promise = mongoose.connect(uri, opts);
  }
  const m = await global._mongooseGlobal!.promise!;
  global._mongooseGlobal!.conn = m.connection;
  return m.connection;
}

export function disconnectDB() {
  return mongoose.connection.close();
}
