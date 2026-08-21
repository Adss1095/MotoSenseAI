import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Float } from '@react-three/drei';

function TestObject() {
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.15}
      floatIntensity={0.25}
    >
      <mesh rotation={[0.4, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />

        <meshStandardMaterial color="#176BFF" />
      </mesh>
    </Float>
  );
}

export default function Motorcycle3D() {
  return (
    <View style={styles.container}>
      <Canvas
        camera={{
          position: [0, 0, 4],
          fov: 45,
        }}
      >
        <ambientLight intensity={0.8} />

        <directionalLight
          position={[3, 4, 5]}
          intensity={2}
        />

        <pointLight
          position={[-3, 1, 2]}
          color="#00E5FF"
          intensity={3}
        />

        <pointLight
          position={[3, -1, 1]}
          color="#7C3AED"
          intensity={2}
        />

        <TestObject />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
  },
});