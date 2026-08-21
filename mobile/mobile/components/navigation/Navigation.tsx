import { StyleSheet, Text, View } from 'react-native';

export default function NavigationWebFallback() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        MotoSense Navigation is available on mobile.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07101E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  text: {
    color: '#F5F7FA',
    fontSize: 18,
    textAlign: 'center',
  },
});