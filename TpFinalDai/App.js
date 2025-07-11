import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

export default function App() {
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/') 
      .then((res) => res.text())
      .then((data) => setMensaje(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <View style={styles.container}>
      <Text>{mensaje || 'Cargando...'}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});