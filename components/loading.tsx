import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

interface LoadingProps {
  visible: boolean
}

const Loading = ({ visible }: LoadingProps) => {
  if (!visible) return null

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size={100} color="#007AFF" />
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }
})

export { Loading }
