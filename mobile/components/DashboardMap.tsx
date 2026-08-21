import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function DashboardMap() {
  return (
    <View style={styles.container}>
      <View style={styles.mapContent}>
        <Text style={styles.mapText}>
          Navigation Map
        </Text>

        <Text style={styles.mapSubtext}>
          Loading live map...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071321",
  },

  mapContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  mapText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  mapSubtext: {
    color: "#71859A",
    fontSize: 11,
    marginTop: 5,
  },
});