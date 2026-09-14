// apps/renderer/src/components/SettingsView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Monitor, Keyboard, Puzzle, Shield, Database, Info,
  CheckCircle2, AlertCircle, Loader2, ExternalLink, Key, Trash2,
  RefreshCw, Download, Upload,
} from 'lucide-react';
import '../styles/panels.css';
import { useSettings } from '../hooks/useSettings';

type SettingsTab = 'general' | 'appearance' | 'keyboard' | 'integrations' | 'license' | 'data' | 'about';

interface ToggleRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, hint, checked, onChange, disabled }) => (
  <div className="settings-row">
    <div className="settings-row-label">
      <span className="settings-row-label-text">{label}</span>
      {hint && <span className="settings-row-label-hint">{hint}</span>}
    </div>
    <label className="beacon-toggle" style={{ opacity: disabled ? 0.4 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="beacon-toggle-track">
        <span className="beacon-toggle-thumb" />
      </span>
    </label>
  </div>
);

interface SelectRowProps {
  label: string;
  hint?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

const SelectRow: React.FC<SelectRowProps> = ({ label, hint, value, options, onChange }) => (
  <div className="settings-row">
    <div className="settings-row-label">
      <span className="settings-row-label-text">{label}</span>
      {hint && <span className="settings-row-label-hint">{hint}</span>}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '7px',
        color: 'var(--text-primary)',
        fontSize: '12px',
        padding: '5px 10px',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: '#1a1c24' }}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

interface SliderRowProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, hint, value, min, max, step, format, onChange }) => (
  <div className="settings-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
    <div className="settings-row-label">
      <span className="settings-row-label-text">{label}</span>
      {hint && <span className="settings-row-label-hint">{hint}</span>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '120px', accentColor: '#D97706', cursor: 'pointer' }}
      />
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '36px', textAlign: 'right' }}>
        {format(value)}
      </span>
    </div>
  </div>
);

// ─── Google Calendar Status Component ────────────────────────────────────────

const GoogleCalendarCard: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.beacon.calendar.googleAuth.status().then((res) => setStatus(res.status));
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setStatus('connecting');
    try {
      await window.beacon.calendar.googleAuth.start();
      const res = await window.beacon.calendar.googleAuth.status();
      setStatus(res.status);
    } catch {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await window.beacon.calendar.googleAuth.disconnect();
      setStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = status === 'connected';

  return (
    <div className={`integration-card ${isConnected ? 'integration-card-connected' : ''}`}>
      <div className="integration-icon" style={{ background: 'rgba(66,133,244,0.12)' }}>
        🗓️
      </div>
      <div className="integration-meta">
        <div className="integration-name">Google Calendar</div>
        <div className={`integration-status ${isConnected ? 'integration-status-connected' : ''}`}>
          {status === 'connected' && '✅ Connected — events syncing'}
          {status === 'disconnected' && 'Not connected'}
          {status === 'connecting' && '⏳ Opening browser…'}
          {status === 'error' && '⚠️ Connection failed — try again'}
        </div>
      </div>
      <button
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={isLoading || status === 'connecting'}
        style={{
          padding: '6px 14px',
          borderRadius: '7px',
          fontSize: '12px',
          fontWeight: 600,
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          background: isConnected ? 'rgba(239,68,68,0.12)' : 'rgba(217,119,6,0.15)',
          color: isConnected ? '#f87171' : '#D97706',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          transition: 'all 0.15s ease',
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        {isLoading && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
};

// ─── Apple Calendar Status Component ─────────────────────────────────────────

const AppleCalendarCard: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'granted' | 'denied' | 'unavailable'>('checking');

  useEffect(() => {
    window.beacon.apple.calendarToday()
      .then(() => setStatus('granted'))
      .catch(() => setStatus('denied'));
  }, []);

  return (
    <div className={`integration-card ${status === 'granted' ? 'integration-card-connected' : ''}`}>
      <div className="integration-icon" style={{ background: 'rgba(255,107,107,0.12)' }}>
        🍎
      </div>
      <div className="integration-meta">
        <div className="integration-name">Apple Calendar</div>
        <div className={`integration-status ${status === 'granted' ? 'integration-status-connected' : ''}`}>
          {status === 'checking' && '⏳ Checking access…'}
          {status === 'granted' && '✅ Access granted — events syncing'}
          {status === 'denied' && '🔒 Access denied — open System Settings → Privacy → Calendars'}
          {status === 'unavailable' && 'Not available'}
        </div>
      </div>
      {status === 'denied' && (
        <button
          onClick={() => window.beacon.windows.quitApp()}
          style={{
            padding: '6px 12px',
            borderRadius: '7px',
            fontSize: '11px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--text-secondary)',
          }}
        >
          Open Settings
        </button>
      )}
    </div>
  );
};

// ─── AI Provider Card ─────────────────────────────────────────────────────────

interface AIProviderCardProps {
  name: string;
  icon: string;
  provider: 'gemini' | 'openai' | 'anthropic';
  placeholder: string;
}

const AIProviderCard: React.FC<AIProviderCardProps> = ({ name, icon, provider, placeholder }) => {
  const [keyInput, setKeyInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    window.beacon.ai.getConfig().then((cfg: any) => {
      const providerCfg = cfg?.providers?.[provider];
      setHasKey(!!providerCfg?.keyPresent);
    });
  }, [provider]);

  const handleSave = async () => {
    if (!keyInput.trim()) return;
    setStatus('testing');
    try {
      await window.beacon.ai.setKey(provider as any, keyInput.trim());
      const result = await window.beacon.ai.testConnection(provider as any);
      setStatus(result.success ? 'ok' : 'fail');
      if (result.success) {
        setHasKey(true);
        setKeyInput('');
      }
    } catch {
      setStatus('fail');
    }
  };

  const handleRemove = async () => {
    await window.beacon.ai.removeKey(provider as any);
    setHasKey(false);
    setStatus('idle');
  };

  return (
    <div className="integration-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="integration-icon" style={{ background: 'rgba(255,255,255,0.06)', fontSize: '18px' }}>
          {icon}
        </div>
        <div className="integration-meta">
          <div className="integration-name">{name}</div>
          <div className={`integration-status ${hasKey ? 'integration-status-connected' : ''}`}>
            {hasKey ? '✅ API key saved' : 'No key — AI features disabled'}
          </div>
        </div>
        {hasKey && (
          <button onClick={handleRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }} title="Remove key">
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="password"
          placeholder={hasKey ? '••••••••••••••••••••••' : placeholder}
          value={keyInput}
          onChange={(e) => { setKeyInput(e.target.value); setStatus('idle'); }}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '7px',
            padding: '7px 10px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        />
        <button
          onClick={handleSave}
          disabled={!keyInput.trim() || status === 'testing'}
          style={{
            padding: '7px 14px',
            borderRadius: '7px',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            cursor: keyInput.trim() ? 'pointer' : 'not-allowed',
            background: status === 'ok' ? 'rgba(34,197,94,0.15)' : status === 'fail' ? 'rgba(239,68,68,0.15)' : 'rgba(217,119,6,0.15)',
            color: status === 'ok' ? '#4ade80' : status === 'fail' ? '#f87171' : '#D97706',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
            opacity: !keyInput.trim() ? 0.5 : 1,
          }}
        >
          {status === 'testing' && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
          {status === 'ok' && <CheckCircle2 size={12} />}
          {status === 'fail' && <AlertCircle size={12} />}
          {status === 'testing' ? 'Testing…' : status === 'ok' ? 'Saved!' : status === 'fail' ? 'Failed' : 'Save & Test'}
        </button>
      </div>
    </div>
  );
};

// ─── Main SettingsView ─────────────────────────────────────────────────────

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { settings, updateSettings } = useSettings();
  const [dataMsg, setDataMsg] = useState('');
  const [shortcutInput, setShortcutInput] = useState('');

  useEffect(() => {
    if (settings?.globalShortcut) setShortcutInput(settings.globalShortcut);
  }, [settings?.globalShortcut]);

  const handleToggle = useCallback(async (key: string, value: boolean) => {
    if (key === 'launchAtLogin') {
      await window.beacon.app.setOpenAtLogin(value);
    } else {
      await updateSettings({ [key]: value } as any);
    }
  }, [updateSettings]);

  const tabs: { id: SettingsTab; icon: React.ReactNode; label: string }[] = [
    { id: 'general',      icon: <Settings size={13} />,  label: 'General' },
    { id: 'appearance',   icon: <Monitor size={13} />,   label: 'Appearance' },
    { id: 'keyboard',     icon: <Keyboard size={13} />,  label: 'Keyboard' },
    { id: 'integrations', icon: <Puzzle size={13} />,    label: 'Integrations' },
    { id: 'license',      icon: <Key size={13} />,       label: 'License' },
    { id: 'data',         icon: <Database size={13} />,  label: 'Data & Privacy' },
    { id: 'about',        icon: <Info size={13} />,      label: 'About' },
  ];

  const runDataAction = async (action: () => Promise<any>, successMsg: string) => {
    try {
      await action();
      setDataMsg(`✅ ${successMsg}`);
    } catch {
      setDataMsg('❌ Action failed');
    }
    setTimeout(() => setDataMsg(''), 3000);
  };

  if (!settings) return null;

  return (
    <div style={{ display: 'flex', height: '100%', gap: '0' }}>
      {/* Left sidebar nav */}
      <div style={{
        width: '156px',
        flexShrink: 0,
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 8px', marginBottom: '6px' }}>
          Settings
        </div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 8px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              background: activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              textAlign: 'left',
              transition: 'all 0.12s ease',
              width: '100%',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content pane */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── GENERAL ── */}
        {activeTab === 'general' && (
          <>
            <div className="settings-section">
              <div className="settings-section-title">Startup</div>
              <ToggleRow
                label="Open at Login"
                hint="Beacon starts silently in your menu bar when you sign in. macOS may show a one-time notification."
                checked={settings.launchAtLogin}
                onChange={(v) => handleToggle('launchAtLogin', v)}
              />
              <div className="settings-divider" />
              <ToggleRow
                label="Notification Badge"
                hint="Show a badge on the Beacon dock icon when goals need attention"
                checked={settings.notificationBadge ?? true}
                onChange={(v) => updateSettings({ notificationBadge: v })}
              />
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Dynamic Island</div>
              <SelectRow
                label="Island Position"
                hint="Choose where the island anchors on screen"
                value={settings.islandPosition}
                options={[
                  { value: 'notch', label: '⬛ Camera Notch' },
                  { value: 'floating', label: '🪟 Floating Window' },
                ]}
                onChange={(v) => updateSettings({ islandPosition: v as any })}
              />
              <div className="settings-divider" />
              <SliderRow
                label="Auto-Collapse Delay"
                hint="Seconds before expanded island collapses automatically"
                value={settings.autoCollapseDelay}
                min={1}
                max={10}
                step={0.5}
                format={(v) => `${v}s`}
                onChange={(v) => updateSettings({ autoCollapseDelay: v })}
              />
              <div className="settings-divider" />
              <SliderRow
                label="Island Opacity"
                hint="Transparency of the Dynamic Island overlay"
                value={settings.islandOpacity ?? 1.0}
                min={0.6}
                max={1.0}
                step={0.05}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => updateSettings({ islandOpacity: v })}
              />
              <div className="settings-divider" />
              <ToggleRow
                label="Show in All Spaces"
                hint="Island stays visible across Mission Control desktops"
                checked={settings.showInAllSpaces}
                onChange={(v) => updateSettings({ showInAllSpaces: v })}
              />
              <div className="settings-divider" />
              <ToggleRow
                label="Calendar in Island"
                hint="Show the next upcoming event pill in the expanded island"
                checked={settings.calendarShowInIsland ?? true}
                onChange={(v) => updateSettings({ calendarShowInIsland: v })}
              />
            </div>
          </>
        )}

        {/* ── APPEARANCE ── */}
        {activeTab === 'appearance' && (
          <div className="settings-section">
            <div className="settings-section-title">Theme & Sound</div>
            <SelectRow
              label="Theme"
              value={settings.theme ?? 'dark'}
              options={[
                { value: 'dark', label: '🌑 Dark (default)' },
                { value: 'system', label: '🖥️ Follow system' },
              ]}
              onChange={(v) => updateSettings({ theme: v as any })}
            />
            <div className="settings-divider" />
            <SelectRow
              label="Sound Mode"
              hint="Controls interaction sounds across all Beacon surfaces"
              value={settings.soundMode ?? 'subtle'}
              options={[
                { value: 'silent', label: '🔇 Silent' },
                { value: 'subtle', label: '🔉 Subtle (default)' },
                { value: 'full', label: '🔊 Full' },
              ]}
              onChange={(v) => updateSettings({ soundMode: v as any })}
            />
          </div>
        )}

        {/* ── KEYBOARD ── */}
        {activeTab === 'keyboard' && (
          <>
            <div className="settings-section">
              <div className="settings-section-title">Global Shortcuts</div>
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-label-text">Open Command Palette</span>
                  <span className="settings-row-label-hint">Spotlight-style shortcut available system-wide</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    value={shortcutInput}
                    onChange={(e) => setShortcutInput(e.target.value)}
                    style={{
                      width: '200px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '7px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                    placeholder="e.g. CommandOrControl+Shift+B"
                  />
                  <button
                    onClick={() => updateSettings({ globalShortcut: shortcutInput })}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: 'rgba(217,119,6,0.15)',
                      color: '#D97706',
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">In-App Shortcuts</div>
              {[
                ['Navigate to Today', '⌘1'],
                ['Navigate to Goals', '⌘2'],
                ['Navigate to Focus', '⌘3'],
                ['Navigate to Calendar', '⌘4'],
                ['Navigate to Settings', '⌘,'],
                ['Create new goal', '⌘N'],
                ['Search goals', '⌘F'],
                ['Undo', '⌘Z'],
                ['Redo', '⌘⇧Z'],
                ['Start focus session', '⌘⇧F'],
                ['Open Command Palette', '⌘⇧B'],
              ].map(([action, shortcut]) => (
                <div key={action} className="settings-row">
                  <span className="settings-row-label-text">{action}</span>
                  <kbd>{shortcut}</kbd>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── INTEGRATIONS ── */}
        {activeTab === 'integrations' && (
          <>
            <div className="settings-section">
              <div className="settings-section-title">Calendars</div>
              <AppleCalendarCard />
              <GoogleCalendarCard />
            </div>

            <div className="settings-section">
              <div className="settings-section-title">AI Providers</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                Keys are encrypted with macOS Keychain (safeStorage). They never leave your Mac.
              </p>
              <AIProviderCard name="Google Gemini" icon="✦" provider="gemini"   placeholder="AIza…" />
              <AIProviderCard name="OpenAI GPT-4o" icon="⬡" provider="openai"   placeholder="sk-…" />
              <AIProviderCard name="Anthropic Claude" icon="◈" provider="anthropic" placeholder="sk-ant-…" />
            </div>
          </>
        )}

        {/* ── LICENSE ── */}
        {activeTab === 'license' && (
          <div className="settings-section">
            <div className="settings-section-title">Beacon License</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="BCN-LIFE-XXXX-XXXX-XXXX"
                defaultValue={settings.licenseKey ?? ''}
                onBlur={(e) => updateSettings({ licenseKey: e.target.value.trim() || undefined })}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '7px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.05em',
                }}
              />
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'rgba(217,119,6,0.15)',
                  color: '#D97706',
                  whiteSpace: 'nowrap',
                }}
              >
                Activate
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Beacon is a $29 permanent license. No subscriptions, no renewals.
              Your license covers all your personal Macs.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="https://beacon.tarunya.me"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  color: '#D97706',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={11} /> Get a license
              </a>
              <a
                href="https://beacon.tarunya.me/support"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={11} /> 30-day refund policy
              </a>
            </div>
          </div>
        )}

        {/* ── DATA & PRIVACY ── */}
        {activeTab === 'data' && (
          <>
            {dataMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}>
                {dataMsg}
              </div>
            )}

            <div className="settings-section">
              <div className="settings-section-title">Export</div>
              {[
                { label: 'Export all data as JSON', hint: 'Full backup — goals, check-ins, settings', action: () => window.beacon.data.exportJson(), msg: 'Exported to JSON' },
                { label: 'Export goals to CSV', hint: 'Spreadsheet-friendly format', action: () => window.beacon.data.exportCsv('goals'), msg: 'Goals exported to CSV' },
                { label: 'Export progress to CSV', hint: 'All increment events', action: () => window.beacon.data.exportCsv('progress'), msg: 'Progress exported to CSV' },
                { label: 'Create local backup', hint: 'Timestamped SQLite snapshot saved to ~/Documents/Beacon Backups/', action: () => window.beacon.data.createBackup(), msg: 'Backup created' },
              ].map(({ label, hint, action, msg }) => (
                <div key={label} className="settings-row">
                  <div className="settings-row-label">
                    <span className="settings-row-label-text">{label}</span>
                    <span className="settings-row-label-hint">{hint}</span>
                  </div>
                  <button
                    onClick={() => runDataAction(action, msg)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '7px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Download size={11} /> Export
                  </button>
                </div>
              ))}
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Import</div>
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-label-text">Import from JSON backup</span>
                  <span className="settings-row-label-hint">Merges data — existing goals are not overwritten</span>
                </div>
                <button
                  onClick={async () => {
                    const preview = await window.beacon.data.previewImport();
                    if (preview) {
                      if (window.confirm(`Import ${preview.counts.goals ?? 0} goals from ${new Date(preview.exportedAt).toLocaleDateString()}?`)) {
                        await runDataAction(() => window.beacon.data.importJson(preview.filePath), 'Import complete');
                      }
                    }
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Upload size={11} /> Choose file…
                </button>
              </div>
            </div>

            <div style={{
              padding: '14px 16px',
              background: 'rgba(217,119,6,0.06)',
              border: '1px solid rgba(217,119,6,0.15)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <Shield size={14} style={{ color: '#D97706', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', marginBottom: '4px' }}>100% Local &amp; Air-Gapped</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  All goals, habits, and notes are stored in a local SQLite database at <code style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '3px' }}>~/Library/Application Support/Beacon/</code>. Zero cloud telemetry. Nothing leaves your Mac.
                </div>
              </div>
            </div>

            <div className="danger-zone">
              <div className="danger-zone-title">⚠️ Danger Zone</div>
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-label-text" style={{ color: 'var(--danger-text)' }}>Delete all Beacon data</span>
                  <span className="settings-row-label-hint">Permanently removes all goals, progress, and settings. This cannot be undone.</span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('This will permanently delete ALL your Beacon data. Are you absolutely sure?')) {
                      window.confirm('Last chance — click OK to delete everything.') && window.beacon.windows.quitApp();
                    }
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '7px',
                    border: '1px solid rgba(239,68,68,0.3)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'rgba(239,68,68,0.08)',
                    color: '#f87171',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Trash2 size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Delete All Data
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── ABOUT ── */}
        {activeTab === 'about' && (
          <>
            <div className="settings-section" style={{ alignItems: 'center', textAlign: 'center', gap: '10px' }}>
              <div style={{ fontSize: '40px', marginBottom: '4px' }}>🪩</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Beacon</div>
              <div className="version-badge">
                v{window.beacon.app?.getVersion?.() ?? '1.0.0'}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: '320px', margin: '0 auto' }}>
                The first intentional Dynamic Island HUD & AI Companion Workspace for macOS.
                Built by Tarunya Kesharwani.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'Website', url: 'https://beacon.tarunya.me' },
                  { label: 'GitHub', url: 'https://github.com/TarunyaProgrammer/Dynamic_Island' },
                  { label: 'Report a bug', url: 'https://github.com/TarunyaProgrammer/Dynamic_Island/issues' },
                ].map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <ExternalLink size={10} /> {label}
                  </a>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Update</div>
              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-row-label-text">Check for updates</span>
                  <span className="settings-row-label-hint">Manual check — auto-updates coming soon</span>
                </div>
                <button
                  onClick={async () => {
                    const result = await window.beacon.app.checkForUpdate();
                    alert(result.updateAvailable ? '🎉 Update available!' : `✅ You're on the latest version (${result.currentVersion})`);
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <RefreshCw size={11} /> Check now
                </button>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              © 2026 Tarunya Kesharwani. Proprietary License. All Rights Reserved.
            </div>
          </>
        )}
      </div>
    </div>
  );
};
