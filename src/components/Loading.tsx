import { Dialog } from "@rneui/themed";
import { Text, View, DeviceEventEmitter } from "react-native";
import { MyStyleSheet } from "../utils/MyStyleSheet";
import { globalStyle } from "../styles";
import { useState, useEffect } from "react";
const { pb2, tac } = globalStyle;

export default () => {

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const isShow = (e: any) => {
    console.log(e);
    
    setLoading(e.show);
    setTitle(e.title || '');
  };

  useEffect(() => {
    DeviceEventEmitter.addListener('loading', isShow);
  }, []);

  return (
    <Dialog isVisible={loading}
      backdropStyle={{ backgroundColor: 'rgba(0,0,0,0)' }}
      overlayStyle={styles.box}>
      <View>
        <Dialog.Loading loadingProps={{ size: 'large', color: '#e8e8e8' }}></Dialog.Loading>
        <Text style={{ ...pb2, ...tac, color: '#e8e8e8' }} numberOfLines={2}>{title || 'loading...'}</Text>
      </View>
    </Dialog>
  )
};

const styles = MyStyleSheet.create({
  box: {
    backgroundColor: 'rgba(0,0,0,.5)',
    elevation: 0,  // android
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0, // 透明
    shadowRadius: 0,
    borderWidth: 0,
    width: 150,
    padding: 0,
  }
});