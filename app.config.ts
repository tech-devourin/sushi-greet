import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT == "development";
const IS_PREVIEW = process.env.APP_VARIANT == "preview";

//IMG KDS FOR SUSHI
const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.relfor.devourinsushigreet.dev';
  }
  else if (IS_PREVIEW) {
    return 'com.relfor.devourinsushigreet.preview';
  }
  return 'com.relfor.devourinsushigreet';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'Devourin Greet (Dev)';
  }
  else if (IS_PREVIEW) {
    return 'Devourin Greet (Preview)';
  }
  return 'Devourin Greet';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  "name": getAppName(),
  "slug": "sushi-greet",
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/icons/app_icon.png",
  "scheme": "sushigreet",
  "userInterfaceStyle": "automatic",
  "newArchEnabled": true,
  "ios": {
    "supportsTablet": true
  },
  "android": {
    "adaptiveIcon": {
      "backgroundColor": "#ffffff",
      "foregroundImage": "./assets/icons/adaptive_icon.png",
      "monochromeImage": "./assets/icons/adaptive_icon.png"
    },
    "edgeToEdgeEnabled": true,
    "predictiveBackGestureEnabled": false,
    "package": getUniqueIdentifier(),
    "allowBackup": false,
  },
  "web": {
    "output": "single",
    "favicon": "./assets/icons/adaptive_icon.png"
  },
  "plugins": [
    [
      "expo-build-properties",
      {
        "android": {
          "usesCleartextTraffic": true
        }
      }
    ],
    [
      "expo-splash-screen",
      {
        "image": "./assets/icons/app_icon.png",
        "imageWidth": 200,
        "backgroundColor": "#ffffff"
      }
    ],
    [
      "expo-font",
      {
        "fonts": [
          "src/assets/fonts/Poppins-Black.ttf",
          "src/assets/fonts/Poppins-Bold.ttf",
          "src/assets/fonts/Poppins-Light.ttf",
          "src/assets/fonts/Poppins-Medium.ttf",
          "src/assets/fonts/Poppins-Regular.ttf",
          "src/assets/fonts/Poppins-SemiBold.ttf",
        ]
      }
    ],
  ],
  "experiments": {
    "typedRoutes": true,
    "reactCompiler": true
  }
});
