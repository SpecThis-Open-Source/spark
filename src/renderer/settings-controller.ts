export class SettingsController {
  private panelEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private statusEl: HTMLElement;
  private onKeySaved: (() => void) | null = null;

  constructor() {
    this.panelEl = document.getElementById('settings-panel')!;
    this.inputEl = document.getElementById('api-key-input') as HTMLInputElement;
    this.statusEl = document.getElementById('api-key-status')!;

    document.getElementById('settings-btn')!.addEventListener('click', () => this.open());
    document.getElementById('close-settings-btn')!.addEventListener('click', () => this.close());
    document.getElementById('save-key-btn')!.addEventListener('click', () => this.save());
  }

  setOnKeySaved(cb: () => void): void {
    this.onKeySaved = cb;
  }

  open(): void {
    this.panelEl.classList.remove('hidden');
    this.inputEl.value = '';
    this.statusEl.textContent = '';
    this.checkStatus();
  }

  close(): void {
    this.panelEl.classList.add('hidden');
  }

  private async checkStatus(): Promise<void> {
    try {
      const status = await window.electronAPI.getApiKeyStatus();
      if (status.isSet) {
        this.statusEl.textContent = 'API key is configured.';
        this.statusEl.style.color = '#4caf50';
      } else {
        this.statusEl.textContent = 'No API key set.';
        this.statusEl.style.color = '#ff6b6b';
      }
    } catch {
      this.statusEl.textContent = 'Could not check status.';
    }
  }

  private async save(): Promise<void> {
    const key = this.inputEl.value.trim();
    console.log('[settings] save clicked, key length:', key.length);
    if (!key) {
      this.statusEl.textContent = 'Please enter an API key.';
      this.statusEl.style.color = '#ff6b6b';
      return;
    }

    try {
      console.log('[settings] calling setApiKey via IPC');
      const result = await window.electronAPI.setApiKey(key);
      console.log('[settings] setApiKey result:', result);
      if (result.success) {
        this.statusEl.textContent = 'API key saved!';
        this.statusEl.style.color = '#4caf50';
        this.onKeySaved?.();
        setTimeout(() => this.close(), 800);
      } else {
        this.statusEl.textContent = result.error ?? 'Failed to save.';
        this.statusEl.style.color = '#ff6b6b';
      }
    } catch (err) {
      console.error('[settings] setApiKey threw:', err);
      this.statusEl.textContent = 'Failed to save API key.';
      this.statusEl.style.color = '#ff6b6b';
    }
  }
}
