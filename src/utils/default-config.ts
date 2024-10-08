import { ConfigType, KeybindType } from '@contexts/ConfigContext';

export const CONFIG_VERSION = '2.0.0';

export const defaultConfig: ConfigType = {
  CONFIG_VERSION,
  THEME: 'system',
  RUN_ON_STARTUP: false,
  LANGUAGE: 'en-gb',
  SHOW_STACK_TRACE: true,
  GATEWAY_HOST: 'localhost',
  GATEWAY_PORT: '8080',
  RANDOMIZE_SERVER_NAME: true,
  DEFAULT_SERVER_NAME: 'My Server',
  DEFAULT_SERVER_PORT: '80',
  DEFAULT_SERVER_HOST: '127.0.0.1',
  KEYBINDS: [
    { id: 'open-dashboard-page', name: 'Open Dashboard Page', keybind: 'Ctrl+1' },
    { id: 'open-servers-page', name: 'Open Servers Page', keybind: 'Ctrl+2' },
    { id: 'open-settings-page', name: 'Open Settings Page', keybind: 'Ctrl+3' },
    { id: 'select-sidebar-option-1', name: 'Select Sidebar Option 1', keybind: 'Alt+1' },
    { id: 'select-sidebar-option-2', name: 'Select Sidebar Option 2', keybind: 'Alt+2' },
    { id: 'select-sidebar-option-3', name: 'Select Sidebar Option 3', keybind: 'Alt+3' },
    { id: 'select-sidebar-option-4', name: 'Select Sidebar Option 4', keybind: 'Alt+4' },
    { id: 'select-sidebar-option-5', name: 'Select Sidebar Option 5', keybind: 'Alt+5' },
    { id: 'select-sidebar-option-6', name: 'Select Sidebar Option 6', keybind: 'Alt+6' },
    { id: 'select-sidebar-option-7', name: 'Select Sidebar Option 7', keybind: 'Alt+7' },
    { id: 'select-sidebar-option-8', name: 'Select Sidebar Option 8', keybind: 'Alt+8' },
    { id: 'select-sidebar-option-9', name: 'Select Sidebar Option 9', keybind: 'Alt+9' },
    { id: 'select-sidebar-option-10', name: 'Select Sidebar Option 10', keybind: 'Alt+0' },
    { id: 'hide-show-sidebar', name: 'Hide/Show Sidebar', keybind: 'Ctrl+Shift+S' },
  ] as KeybindType[],
};
