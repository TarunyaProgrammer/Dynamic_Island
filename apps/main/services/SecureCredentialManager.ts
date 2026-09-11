// apps/main/services/SecureCredentialManager.ts - macOS Keychain Credential Vault
import { safeStorage } from '@electron-bridge';
import { CredentialRepository } from '@database/repository/credential-repository';
import { AIProviderId } from '@core/ai/types';

export class SecureCredentialManager {
  constructor(private credentialRepo: CredentialRepository) {}

  private getVaultKey(provider: AIProviderId): string {
    return `ai:key:${provider}`;
  }

  async setApiKey(provider: AIProviderId, apiKey: string): Promise<void> {
    if (!apiKey || !apiKey.trim()) {
      await this.removeApiKey(provider);
      return;
    }

    const cleanKey = apiKey.trim();
    const vaultKey = this.getVaultKey(provider);

    if (safeStorage.isEncryptionAvailable()) {
      const encryptedBuffer = safeStorage.encryptString(cleanKey);
      const base64 = encryptedBuffer.toString('base64');
      this.credentialRepo.setEncrypted(vaultKey, `safe:${base64}`);
    } else {
      // Fallback for non-keychain environments (dev/tests)
      const base64 = Buffer.from(cleanKey, 'utf-8').toString('base64');
      this.credentialRepo.setEncrypted(vaultKey, `plain:${base64}`);
    }
  }

  async getApiKey(provider: AIProviderId): Promise<string | null> {
    const vaultKey = this.getVaultKey(provider);
    const stored = this.credentialRepo.getEncrypted(vaultKey);
    if (!stored) return null;

    try {
      if (stored.startsWith('safe:')) {
        const rawBase64 = stored.slice(5);
        const buffer = Buffer.from(rawBase64, 'base64');
        return safeStorage.decryptString(buffer);
      } else if (stored.startsWith('plain:')) {
        const rawBase64 = stored.slice(6);
        return Buffer.from(rawBase64, 'base64').toString('utf-8');
      } else {
        return stored;
      }
    } catch (err) {
      console.error(`Failed to decrypt API key for provider ${provider}:`, err);
      return null;
    }
  }

  async hasApiKey(provider: AIProviderId): Promise<boolean> {
    const vaultKey = this.getVaultKey(provider);
    return this.credentialRepo.has(vaultKey);
  }

  async removeApiKey(provider: AIProviderId): Promise<boolean> {
    const vaultKey = this.getVaultKey(provider);
    return this.credentialRepo.remove(vaultKey);
  }
}
