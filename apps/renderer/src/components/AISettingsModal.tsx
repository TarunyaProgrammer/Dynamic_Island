// apps/renderer/src/components/AISettingsModal.tsx - Luxury Apple HIG AI Settings Modal
import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronRight, X, ExternalLink } from 'lucide-react';
import { AIConfigSummary, AIProviderId, ConnectionResult, IntelligenceProfile } from '@core/ai/types';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AIConfigSummary | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>('openrouter');
  const [selectedProfile, setSelectedProfile] = useState<IntelligenceProfile>('balanced');
  const [customModel, setCustomModel] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isKeyDirty, setIsKeyDirty] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadConfig = async () => {
      try {
        const summary = await window.beacon.ai.getConfig();
        setConfig(summary);
        setSelectedProvider(summary.activeProvider);
        setSelectedProfile(summary.profile);
        setCustomModel(summary.customModel || '');
        setApiKeyInput('');
        setIsKeyDirty(false);
        setTestResult(null);
      } catch (err) {
        console.error('Failed to load AI config:', err);
      }
    };

    loadConfig();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProviderConfig = config?.availableProviders.find((p) => p.id === selectedProvider);
  const isCurrentProviderConfigured = currentProviderConfig?.isConfigured && !isKeyDirty;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // If user typed a new key, save it first
      if (isKeyDirty && apiKeyInput.trim()) {
        await window.beacon.ai.setKey(selectedProvider, apiKeyInput.trim());
        setIsKeyDirty(false);
        const updated = await window.beacon.ai.getConfig();
        setConfig(updated);
      }

      const result = await window.beacon.ai.testConnection(selectedProvider);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndClose = async () => {
    setSaving(true);
    try {
      if (isKeyDirty && apiKeyInput.trim()) {
        await window.beacon.ai.setKey(selectedProvider, apiKeyInput.trim());
      }

      await window.beacon.ai.updateConfig({
        activeProvider: selectedProvider,
        profile: selectedProfile,
        customModel: customModel.trim() || undefined,
      });

      onClose();
    } catch (err) {
      console.error('Failed to save AI config:', err);
    } finally {
      setSaving(false);
    }
  };

  const getProviderLink = () => {
    switch (selectedProvider) {
      case 'openrouter':
        return 'https://openrouter.ai/keys';
      case 'openai':
        return 'https://platform.openai.com/api-keys';
      case 'gemini':
        return 'https://aistudio.google.com/app/apikey';
      case 'anthropic':
        return 'https://console.anthropic.com/settings/keys';
      default:
        return 'https://openrouter.ai/keys';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 8, 11, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '520px',
          maxWidth: '92vw',
          backgroundColor: 'rgba(14, 17, 25, 0.95)',
          borderRadius: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.16)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          borderLeft: '1px solid var(--border-subtle)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 1px rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s var(--ease-spring)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 122, 0, 0.16)',
                border: '1px solid rgba(255, 122, 0, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="var(--accent-solar, #ff7a00)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Beacon Companion AI
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Choose how Beacon understands and manages your goals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxHeight: '75vh',
            overflowY: 'auto',
          }}
        >
          {/* Provider Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              AI Provider
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { id: 'openrouter', name: 'OpenRouter', badge: 'Recommended', desc: 'Universal (Claude, GPT, Gemini)' },
                { id: 'openai', name: 'OpenAI', badge: 'Direct', desc: 'GPT-4o & GPT-4o-mini' },
                { id: 'gemini', name: 'Google Gemini', badge: 'Direct', desc: 'Gemini 1.5 & 2.0 Flash' },
                { id: 'anthropic', name: 'Anthropic', badge: 'Direct', desc: 'Claude 3.5 Sonnet & Haiku' },
              ].map((p) => {
                const isSelected = selectedProvider === p.id;
                const isConfigured = config?.availableProviders.find((x) => x.id === p.id)?.isConfigured;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProvider(p.id as AIProviderId);
                      setTestResult(null);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(255, 122, 0, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      borderTop: isSelected ? '1px solid rgba(255, 122, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderBottom: isSelected ? '1px solid rgba(255, 122, 0, 0.25)' : '1px solid rgba(255, 255, 255, 0.03)',
                      borderLeft: isSelected ? '1px solid rgba(255, 122, 0, 0.35)' : '1px solid var(--border-subtle)',
                      borderRight: isSelected ? '1px solid rgba(255, 122, 0, 0.35)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--accent-solar, #ff7a00)' : '#ffffff' }}>
                        {p.name}
                      </span>
                      {isConfigured && (
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          ✓
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {selectedProvider.toUpperCase()} API KEY
              </span>
              <a
                href={getProviderLink()}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '10px', color: 'var(--accent-cyan, #38bdf8)', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
              >
                <span>Get API key</span>
                <ExternalLink size={10} />
              </a>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  flex: 1,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }}>
                  <Key size={13} />
                </div>
                <input
                  type="password"
                  placeholder={isCurrentProviderConfigured ? '••••••••••••••••••••••••••••••••' : 'Paste API Key (sk-...)'}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setIsKeyDirty(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                onClick={handleTestConnection}
                disabled={testing || (!isCurrentProviderConfigured && !apiKeyInput.trim())}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: testing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                {testing && <Loader2 size={12} className="animate-spin" />}
                <span>Test</span>
              </button>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: testResult.success ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: testResult.success ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: testResult.success ? '#34d399' : '#f87171',
                }}
              >
                {testResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>
                  {testResult.success
                    ? `Connected successfully! (${testResult.latencyMs}ms)`
                    : testResult.error || 'Connection failed'}
                </span>
              </div>
            )}

            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              🔒 Hardware-encrypted via macOS Keychain (`safeStorage`). Never sent in plaintext.
            </span>
          </div>

          {/* Intelligence Profiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Intelligence Profile
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'balanced', name: 'Balanced', desc: 'Recommended for daily tasks & edits' },
                { id: 'fast', name: 'Fast', desc: 'Ultra-low latency & cost' },
                { id: 'powerful', name: 'Powerful', desc: 'Deep planning & analysis' },
              ].map((prof) => {
                const isSelected = selectedProfile === prof.id;

                return (
                  <div
                    key={prof.id}
                    onClick={() => setSelectedProfile(prof.id as IntelligenceProfile)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(255, 122, 0, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      borderTop: isSelected ? '1px solid rgba(255, 122, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderBottom: isSelected ? '1px solid rgba(255, 122, 0, 0.25)' : '1px solid rgba(255, 255, 255, 0.03)',
                      borderLeft: isSelected ? '1px solid rgba(255, 122, 0, 0.35)' : '1px solid var(--border-subtle)',
                      borderRight: isSelected ? '1px solid rgba(255, 122, 0, 0.35)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--accent-solar, #ff7a00)' : '#ffffff' }}>
                      {prof.name}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: 1.3 }}>{prof.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Model Override Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px 0',
                color: 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {showAdvanced ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>Advanced Model Configuration</span>
            </button>

            {showAdvanced && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  Custom Model ID (Overrides Profile)
                </span>
                <input
                  type="text"
                  placeholder="e.g. anthropic/claude-3.5-sonnet:beta"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: 'rgba(7, 8, 11, 0.4)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSaveAndClose}
            disabled={saving}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-solar, #ff7a00)',
              border: 'none',
              color: '#07080b',
              fontSize: '12px',
              fontWeight: 700,
              cursor: saving ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            <span>Save & Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
