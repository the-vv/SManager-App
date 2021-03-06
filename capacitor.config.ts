import { CapacitorConfig } from '@capacitor/cli';
/// <reference types='@capacitor/splash-screen" />
const config: CapacitorConfig = {
  appId: 'com.vv.smanager',
  appName: 'SManager',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },
    GoogleAuth: {
      scopes: [
        'profile',
        'email'
      ],
      serverClientId: '592151284779-qaohe9j1un25j18brp0ba451dlip85jk.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
