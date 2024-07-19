import { NextResponse } from 'next/server';

export const GET = async (req) => {
  let ip = req.headers.get('x-forwarded-for') || req.ip || req.socket.remoteAddress || null;

  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.split(':').pop();
  }

  return NextResponse.json({ ip, port: 3000 });
};
