import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Animated,
  Dimensions,
  Easing
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { BarcodeFormat, useScanBarcodes } from 'vision-camera-code-scanner';
import { globalStyle } from '../styles';
import { MyStyleSheet } from '../utils/MyStyleSheet';
const { plr1, rowBetween, alignItems, tac, fz20, fw550, fz16 } = globalStyle;
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

type Props = {
  goBack: Function;
  cb: (value: string) => void;
};

export const QRCodeScreen: React.VFC<Props> = ({ goBack, cb }) => {
  const devices = useCameraDevices();
  const device = devices.back;
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE]);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [animatedValue] = useState(new Animated.Value(0));
  let scanBarAnimation: any = null;
  const animatedStyle = {
    transform: [{ translateY: animatedValue }],
  };

  // 扫描动画
  const scanBarMove = () => {
    scanBarAnimation = Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 2000,
        easing: Easing.linear,
        isInteraction: false,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: deviceHeight,
        duration: 2000,
        easing: Easing.linear,
        isInteraction: false,
        useNativeDriver: true,
      })
    ]).start(() => scanBarMove())
  }

  useEffect(() => {
    if (barcodes.length > 0) {
      cb(barcodes[0].displayValue!);
    }
  }, [barcodes]);

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


  return (
    <SafeAreaView style={{ width: deviceWidth, height: deviceHeight, position: 'relative' }}>
      {
        device === undefined || !authorized
          ?
          <Text></Text>
          :
          <Camera
            style={{ width: deviceWidth, height: deviceHeight }}
            device={device}
            isActive={authorized}
            frameProcessor={frameProcessor}
            frameProcessorFps={5}
          />
      }
      <View style={{ ...plr1, ...styles.qrcodeHeader, ...rowBetween, ...alignItems }}>
        <Text onPress={() => goBack(false)} style={{ color: '#fff', width: '20%', ...fz16 }}>{'< 返回'}</Text>
        <Text style={{ color: '#fff', width: '60%', ...tac, ...fz20, ...fw550 }}>扫描二维码</Text>
        <Text style={{ width: '20%' }}></Text>
      </View>
    </SafeAreaView>
  );
};

const styles = MyStyleSheet.create({
  qrcodeHeader: {
    height: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    with: deviceWidth
  }
})
