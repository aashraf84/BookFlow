import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Settings file path — stored as JSON outside the database for flexibility
const SETTINGS_DIR = join(process.cwd(), 'db')
const SETTINGS_FILE = join(SETTINGS_DIR, 'settings.json')

function ensureSettingsFile() {
  if (!existsSync(SETTINGS_DIR)) {
    mkdirSync(SETTINGS_DIR, { recursive: true })
  }
  if (!existsSync(SETTINGS_FILE)) {
    writeFileSync(SETTINGS_FILE, JSON.stringify({}, null, 2), 'utf-8')
  }
}

function readSettings(): Record<string, unknown> {
  try {
    ensureSettingsFile()
    const data = readFileSync(SETTINGS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

function writeSettings(settings: Record<string, unknown>): void {
  ensureSettingsFile()
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
}

// GET /api/settings — Retrieve all settings
export async function GET() {
  try {
    const settings = readSettings()
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings — Update all settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate that the body is a plain object with settings sections
    const allowedSections = [
      'general', 'pos', 'inventory', 'tax', 'sales',
      'email', 'notifications', 'security', 'printing',
      'receiptFormat', 'invoiceFormat',
      'appearance', 'backup', 'integrations',
    ]

    const filteredSettings: Record<string, unknown> = {}
    for (const section of allowedSections) {
      if (body[section] && typeof body[section] === 'object') {
        filteredSettings[section] = body[section]
      }
    }

    // Merge with existing settings
    const existingSettings = readSettings()
    const mergedSettings = { ...existingSettings, ...filteredSettings }

    writeSettings(mergedSettings)

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings: mergedSettings,
    })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
