import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor config — wraps the built Vite web app into a native iOS/Android
 * shell. To produce real .apk / .ipa binaries you need:
 *   - Android: Android Studio + JDK (any OS)
 *   - iOS:     Xcode (macOS only)
 *
 * Build flow (run from artifacts/selim-in-dhaka):
 *   1) BASE_PATH=/ pnpm run build
 *   2) pnpm exec cap add android   (first time only)
 *   3) pnpm exec cap add ios       (first time only, macOS)
 *   4) pnpm exec cap sync
 *   5) pnpm exec cap open android  (or `open ios`)
 *
 * NOTE: For native builds the Vite `base` MUST be "/" (not "/selim-in-dhaka")
 * so that asset URLs resolve correctly inside the WebView. The build script
 * above sets BASE_PATH=/ explicitly to override the dev workspace default.
 */
const config: CapacitorConfig = {
  appId: "com.selim.dhaka",
  appName: "Selim in Dhaka",
  webDir: "dist/public",
  bundledWebRuntime: false,
  backgroundColor: "#0a0604",
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#0a0604",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0a0604",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
