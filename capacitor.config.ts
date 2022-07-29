import { CapacitorConfig } from '@capacitor/cli';
/// <reference types='@capacitor/splash-screen" />
const config: CapacitorConfig = {
  appId: 'com.vv.smanager',
  appName: 'SManager',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      // launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '298206622192-ke686j1gaesu2t9fj72oad9tfep3esb9.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    DatePickerPlugin: {
      locale: 'en',
      theme: 'dark',
      format: 'dd/MM/yyyy'
    }
  }
};

export default config;
