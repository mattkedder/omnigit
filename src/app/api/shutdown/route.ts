import { NextResponse } from 'next/server';

export async function POST() {
  // Give the server a tiny bit of time to send the response before exiting
  setTimeout(() => {
    process.exit(0);
  }, 500);

  return NextResponse.json({ message: 'Shutting down...' });
}
