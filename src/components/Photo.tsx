import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Camera,
  CameraProps,
  useCameraDevices,
} from 'react-native-vision-camera';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

type Props = {
  goBack: () => void;
};

export const Photo: React.VFC<Props> = ({goBack}) => {
  const devices = useCameraDevices();
  const device = devices.back;
  const zoom = useSharedValue(0);

  const cameraRef = useRef<Camera>(null);

  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();

      if (cameraPermission === 'authorized') {
        setAuthorized(true);
      } else if (
        cameraPermission === 'not-determined' ||
        cameraPermission === 'denied'
      ) {
        const newCameraPermission = await Camera.requestCameraPermission();
        if (newCameraPermission === 'authorized') {
          setAuthorized(true);
        }
      }
    })();
  }, []);

  const onRandomZoomPress = useCallback(() => {
    zoom.value = withSpring(0.8);
  }, [zoom]);

  const animatedProps = useAnimatedProps<Partial<CameraProps>>(
    () => ({zoom: zoom.value}),
    [zoom],
  );

  const takePhoto = async () => {
    const result = await cameraRef.current?.takePhoto({
      enableAutoStabilization: true,
      enableAutoRedEyeReduction: true,
      qualityPrioritization: 'quality',
    });
    console.log({result});
  };

  if (device === undefined || !authorized) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <Text>loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ReanimatedCamera
        ref={cameraRef}
        device={device}
        isActive={authorized}
        photo
        animatedProps={animatedProps}
        style={styles.container}
      />

      <SafeAreaView style={styles.contentContainer}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonLabel}>{'<'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          // style={styles.zoomButton}
          onPress={onRandomZoomPress}>
          <Text>Zoom randomly!</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={takePhoto}>
          <Text>photo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 0,
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: 'space-between',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  backButton: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  backButtonLabel: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});
