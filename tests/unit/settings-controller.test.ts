import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsController } from '../../src/renderer/settings-controller';

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  document.body.innerHTML = `
    <div id="settings-panel" class="hidden"></div>
    <input id="api-key-input" />
    <div id="api-key-status"></div>
    <button id="settings-btn"></button>
    <button id="close-settings-btn"></button>
    <button id="save-key-btn"></button>
  `;
  (window as any).electronAPI = {
    getApiKeyStatus: vi.fn().mockResolvedValue({ isSet: true, isValid: true }),
    setApiKey: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe('SettingsController', () => {
  it('constructor wires up button click handlers', () => {
    new SettingsController();
    // Verify settings-btn click opens panel
    const settingsBtn = document.getElementById('settings-btn')!;
    settingsBtn.click();
    const panel = document.getElementById('settings-panel')!;
    expect(panel.classList.contains('hidden')).toBe(false);
  });

  it('open() removes "hidden" class from panel', () => {
    const controller = new SettingsController();
    controller.open();
    const panel = document.getElementById('settings-panel')!;
    expect(panel.classList.contains('hidden')).toBe(false);
  });

  it('close() adds "hidden" class to panel', () => {
    const controller = new SettingsController();
    controller.open();
    controller.close();
    const panel = document.getElementById('settings-panel')!;
    expect(panel.classList.contains('hidden')).toBe(true);
  });

  it('save with empty input shows "Please enter an API key." in status', async () => {
    new SettingsController();
    const input = document.getElementById('api-key-input') as HTMLInputElement;
    input.value = '';
    const saveBtn = document.getElementById('save-key-btn')!;
    saveBtn.click();
    await flushPromises();
    const status = document.getElementById('api-key-status')!;
    expect(status.textContent).toBe('Please enter an API key.');
  });

  it('save with valid key calls setApiKey and shows success message', async () => {
    new SettingsController();
    const input = document.getElementById('api-key-input') as HTMLInputElement;
    input.value = 'sk-ant-test-key-12345';
    const saveBtn = document.getElementById('save-key-btn')!;
    saveBtn.click();
    await flushPromises();
    const status = document.getElementById('api-key-status')!;
    expect(status.textContent).toBe('API key saved!');
    expect((window as any).electronAPI.setApiKey).toHaveBeenCalledWith('sk-ant-test-key-12345');
  });
});
