import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';

export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null);

  const updateOrientation = (orientation: ScreenOrientation.Orientation) => {
    if (
      orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
      orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
    ) {
      setIsLandscape(true);
    } else if (
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
    ) {
      setIsLandscape(false);
    }
  };

  useEffect(() => {
    // Get initial orientation
    ScreenOrientation.getOrientationAsync().then(updateOrientation);

    // Subscribe to orientation changes
    const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      updateOrientation(orientationInfo.orientation);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  return isLandscape;
}
