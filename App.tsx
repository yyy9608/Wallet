import MyApp from "./src/router/routes";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './src/redux';
import Loading from "./src/components/Loading";
import SplashScreen from 'react-native-splash-screen';
import { useEffect } from "react";


const App = () => {

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <MyApp />
      </PersistGate>
      <Loading />
    </Provider>
  );
};




export default App;
