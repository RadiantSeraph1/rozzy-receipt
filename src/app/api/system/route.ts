import { NextResponse } from 'next/server';
import { getServerData, saveServerData } from '@/lib/serverStorage';
import { DEFAULT_COUNTERS } from '@/lib/storage';

export async function GET() {
  try {
    const data = getServerData();
    return NextResponse.json({
      success: true,
      hasPinSet: Boolean(data.pin && data.pin.length > 0),
      counters: data.counters,
      history: data.history,
    });
  } catch (error) {
    console.error('API GET /api/system error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pin, counters, history, doc } = body;
    const current = getServerData();

    if (action === 'setup') {
      if (!pin || pin.length < 4) {
        return NextResponse.json({ success: false, message: 'Passcode too short' }, { status: 400 });
      }
      const updated = saveServerData({ pin });
      return NextResponse.json({
        success: true,
        hasPinSet: Boolean(updated.pin),
      });
    }

    if (action === 'login') {
      if (!current.pin) {
        // No PIN set on server yet
        return NextResponse.json({ success: true, valid: true });
      }
      const isValid = current.pin === pin;
      return NextResponse.json({ success: true, valid: isValid });
    }

    if (action === 'reset_pin') {
      saveServerData({ pin: null });
      return NextResponse.json({ success: true, hasPinSet: false });
    }

    if (action === 'update_counters') {
      const updated = saveServerData({ counters });
      return NextResponse.json({ success: true, counters: updated.counters });
    }

    if (action === 'update_history') {
      const updated = saveServerData({ history });
      return NextResponse.json({ success: true, history: updated.history });
    }

    if (action === 'save_doc') {
      const newHistory = [doc, ...current.history.filter((d) => d.id !== doc.id)];
      const updated = saveServerData({ history: newHistory, counters: counters || current.counters });
      return NextResponse.json({
        success: true,
        history: updated.history,
        counters: updated.counters,
      });
    }

    if (action === 'factory_reset') {
      const updated = saveServerData({
        pin: null,
        counters: DEFAULT_COUNTERS,
        history: [],
      });
      return NextResponse.json({
        success: true,
        hasPinSet: false,
        counters: updated.counters,
        history: updated.history,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('API POST /api/system error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
