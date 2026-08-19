import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';


export async function POST(request: NextRequest) {

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || !session.user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (session.user.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Forbidden: Admins only' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json(); // Parses incoming JSON body

    if (!body.vendor_name) {
      return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 });
    }
    if (!body.device_name) {
      return NextResponse.json({ error: 'Device name is required' }, { status: 400 });
    }
    if (body.delete_entry === undefined) {
      return NextResponse.json({ error: 'Delete entry flag is required' }, { status: 400 });
    }
    if (!body.id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (body.delete_entry) {
      await prisma.other_device_names.delete({
        where: { id: BigInt(body.id) },
      });
      return NextResponse.json({ message: 'Deleted', id: body.id }, { status: 200 });
    }

    const updatedOtherName = await prisma.other_device_names.update({
      where: { id: BigInt(body.id) },
      data: {
        vendor_name: body.vendor_name,
        device_name: body.device_name,
      },
    });

    return NextResponse.json({ message: 'Other name updated', vendor_name: updatedOtherName.vendor_name, device_name: updatedOtherName.device_name }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload', details: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
