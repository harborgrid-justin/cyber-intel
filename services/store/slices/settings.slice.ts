
import { createSlice } from '../createStore';
import { SettingsState, ThemeSettings, DisplaySettings, PrivacySettings } from '../types';

const initialState: SettingsState = {
  theme: {
    mode: 'dark',
    primaryColor: '#3b82f6',
    fontSize: 'medium',
    compactMode: false
  },
  display: {
    layout: 'grid',
    density: 'comfortable',
    showThumbnails: true,
    animationsEnabled: true
  },
  privacy: {
    analytics: false,
    crashReporting: true,
    dataSharingEnabled: false
  },
  locale: 'en-US',
  timezone: 'UTC',
  notifications: {
    email: true,
    push: true,
    desktop: true
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReader: false
  }
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Theme settings
    setTheme: (state, theme: Partial<ThemeSettings>) => ({
      ...state,
      theme: { ...state.theme, ...theme }
    }),

    setThemeMode: (state, mode: 'light' | 'dark' | 'auto') => ({
      ...state,
      theme: { ...state.theme, mode }
    }),

    setPrimaryColor: (state, color: string) => ({
      ...state,
      theme: { ...state.theme, primaryColor: color }
    }),

    setFontSize: (state, fontSize: 'small' | 'medium' | 'large') => ({
      ...state,
      theme: { ...state.theme, fontSize }
    }),

    setCompactMode: (state, enabled: boolean) => ({
      ...state,
      theme: { ...state.theme, compactMode: enabled }
    }),

    // Display settings
    setDisplay: (state, display: Partial<DisplaySettings>) => ({
      ...state,
      display: { ...state.display, ...display }
    }),

    setLayout: (state, layout: 'grid' | 'list' | 'table') => ({
      ...state,
      display: { ...state.display, layout }
    }),

    setDensity: (state, density: 'comfortable' | 'compact' | 'spacious') => ({
      ...state,
      display: { ...state.display, density }
    }),

    toggleAnimations: (state) => ({
      ...state,
      display: {
        ...state.display,
        animationsEnabled: !state.display.animationsEnabled
      }
    }),

    // Privacy settings
    setPrivacy: (state, privacy: Partial<PrivacySettings>) => ({
      ...state,
      privacy: { ...state.privacy, ...privacy }
    }),

    toggleAnalytics: (state) => ({
      ...state,
      privacy: {
        ...state.privacy,
        analytics: !state.privacy.analytics
      }
    }),

    toggleCrashReporting: (state) => ({
      ...state,
      privacy: {
        ...state.privacy,
        crashReporting: !state.privacy.crashReporting
      }
    }),

    // Locale & timezone
    setLocale: (state, locale: string) => ({
      ...state,
      locale
    }),

    setTimezone: (state, timezone: string) => ({
      ...state,
      timezone
    }),

    // Notification settings
    setNotificationSettings: (state, settings: Partial<SettingsState['notifications']>) => ({
      ...state,
      notifications: { ...state.notifications, ...settings }
    }),

    toggleEmailNotifications: (state) => ({
      ...state,
      notifications: {
        ...state.notifications,
        email: !state.notifications.email
      }
    }),

    togglePushNotifications: (state) => ({
      ...state,
      notifications: {
        ...state.notifications,
        push: !state.notifications.push
      }
    }),

    toggleDesktopNotifications: (state) => ({
      ...state,
      notifications: {
        ...state.notifications,
        desktop: !state.notifications.desktop
      }
    }),

    // Accessibility settings
    setAccessibility: (state, settings: Partial<SettingsState['accessibility']>) => ({
      ...state,
      accessibility: { ...state.accessibility, ...settings }
    }),

    toggleReducedMotion: (state) => ({
      ...state,
      accessibility: {
        ...state.accessibility,
        reducedMotion: !state.accessibility.reducedMotion
      }
    }),

    toggleHighContrast: (state) => ({
      ...state,
      accessibility: {
        ...state.accessibility,
        highContrast: !state.accessibility.highContrast
      }
    }),

    // Reset settings
    resetSettings: () => initialState,

    resetTheme: (state) => ({
      ...state,
      theme: initialState.theme
    }),

    resetDisplay: (state) => ({
      ...state,
      display: initialState.display
    })
  }
});

export const settingsActions = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

// Selectors
export const settingsSelectors = {
  selectTheme: (state: SettingsState) => state.theme,

  selectThemeMode: (state: SettingsState) => state.theme.mode,

  selectPrimaryColor: (state: SettingsState) => state.theme.primaryColor,

  selectFontSize: (state: SettingsState) => state.theme.fontSize,

  selectDisplay: (state: SettingsState) => state.display,

  selectLayout: (state: SettingsState) => state.display.layout,

  selectDensity: (state: SettingsState) => state.display.density,

  selectPrivacy: (state: SettingsState) => state.privacy,

  selectLocale: (state: SettingsState) => state.locale,

  selectTimezone: (state: SettingsState) => state.timezone,

  selectNotificationSettings: (state: SettingsState) => state.notifications,

  selectAccessibility: (state: SettingsState) => state.accessibility,

  selectIsReducedMotion: (state: SettingsState) => state.accessibility.reducedMotion,

  selectIsHighContrast: (state: SettingsState) => state.accessibility.highContrast
};
