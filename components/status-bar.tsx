'use client'

import { useNetworkState } from 'expo-network'
import type React from 'react'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

const formatDateTime = (date: Date, dateFormat: string) => {
  return date.toLocaleString(dateFormat, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

interface StatusBarProps {
  showWifi?: boolean
  dateFormat?: 'ru-RU' | 'en-US'
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderRadius?: number
}

const StatusBar = ({
  showWifi = true,
  dateFormat = 'ru-RU',
  backgroundColor = '#ffffff',
  textColor = '#000000',
  borderColor = '#e5e7eb',
  borderRadius = 8
}: StatusBarProps) => {
  const { isConnected } = useNetworkState()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderRadius
        }
      ]}
    >
      {showWifi && (
        <View style={styles.wifiContainer}>
          {isConnected && (
            <MaterialIcons name="wifi" size={18} weight="medium" color="#000" />
          )}

          <Text style={[styles.wifiText, { color: textColor }]}>
            {isConnected ? 'Подключено' : 'Нет соединения'}
          </Text>
        </View>
      )}

      <Text style={[styles.timeText, { color: textColor }]}>
        {formatDateTime(currentTime, dateFormat)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1
  },
  wifiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  wifiText: {
    fontSize: 14,
    fontWeight: '500'
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'monospace'
  }
})

export { StatusBar, type StatusBarProps }
