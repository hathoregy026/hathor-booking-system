import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try to create a test cruise
    const testCruise = await prisma.cruise.create({
      data: {
        name: 'Debug Test Cruise',
        slug: 'debug-test-cruise',
        description: 'This is a test to see if database works',
        basePriceCents: 5000,
        ports: 'Test Port',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cruise created successfully!',
      cruise: testCruise
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to create cruise',
      error: error.message,
      errorCode: error.code,
      fullError: error.toString()
    }, { status: 500 });
  }
}
