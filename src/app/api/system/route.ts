import { NextResponse } from 'next/server';
import { getServerData, saveServerData, DEFAULT_MASTER_PIN } from '@/lib/serverStorage';
import { DEFAULT_COUNTERS } from '@/lib/storage';

export async function GET() {
  try {
    const data = await getServerData();
    return NextResponse.json({
      success: true,
      hasPinSet: true,
      counters: data.counters,
      history: data.history,
    });
  } catch (error) {
    console.error('API GET /api/system error:', error);
    return NextResponse.json({
      success: true,
      hasPinSet: true,
      counters: DEFAULT_COUNTERS,
      history: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pin, counters, history, doc } = body;
    const current = await getServerData();

    if (action === 'setup' || action === 'update_pin') {
      if (!pin || pin.length < 4) {
        return NextResponse.json({ success: false, message: 'Passcode must be at least 4 characters' }, { status: 400 });
      }
      await saveServerData({ pin });
      return NextResponse.json({
        success: true,
        hasPinSet: true,
      });
    }

    if (action === 'login') {
      const isValid = (current.pin || DEFAULT_MASTER_PIN) === pin;
      return NextResponse.json({ success: true, valid: isValid });
    }

    if (action === 'reset_pin') {
      await saveServerData({ pin: DEFAULT_MASTER_PIN });
      return NextResponse.json({ success: true, hasPinSet: true });
    }

    if (action === 'update_counters') {
      const updated = await saveServerData({ counters });
      return NextResponse.json({ success: true, counters: updated.counters });
    }

    if (action === 'update_history') {
      const updated = await saveServerData({ history });
      return NextResponse.json({ success: true, history: updated.history });
    }

    if (action === 'save_doc') {
      const newHistory = [doc, ...current.history.filter((d) => d.id !== doc.id)];
      const updated = await saveServerData({ history: newHistory, counters: counters || current.counters });
      return NextResponse.json({
        success: true,
        history: updated.history,
        counters: updated.counters,
      });
    }

    if (action === 'factory_reset') {
      const updated = await saveServerData({
        pin: DEFAULT_MASTER_PIN,
        counters: DEFAULT_COUNTERS,
        history: [],
      });
      return NextResponse.json({
        success: true,
        hasPinSet: true,
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
