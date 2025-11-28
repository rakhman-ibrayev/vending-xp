'use client'

import { useNetworkState } from 'expo-network'
import type React from 'react'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import VendingMachineAPI from '../services/vending-machine'
import { ExitModal } from '@/components/exit-modal'

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
  const [temperature, setTemperature] = useState<number | null>(null)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  const toggleExitModal = () => setIsExitModalOpen(prev => !prev)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleTemperatureChange = (temp: number) => {
      setTemperature(temp)
    }

    VendingMachineAPI.onTemperatureChange(handleTemperatureChange)

    return () => {
      VendingMachineAPI.offTemperatureChange(handleTemperatureChange)
    }
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
        <TouchableOpacity
          style={styles.wifiContainer}
          onPress={toggleExitModal}
        >
          {isConnected && (
            <MaterialIcons name="wifi" size={18} weight="medium" color="#000" />
          )}

          <Text style={[styles.wifiText, { color: textColor }]}>
            {isConnected ? 'Подключено' : 'Нет соединения'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.rightContainer}>
        <Text style={[styles.timeText, { color: textColor }]}>
          {formatDateTime(currentTime, dateFormat)}
        </Text>

        {temperature !== null && (
          <View style={styles.temperatureContainer}>
            <MaterialIcons name="thermostat" size={18} color={textColor} />

            <Text style={[styles.temperatureText, { color: textColor }]}>
              {temperature.toFixed(1)}°C
            </Text>
          </View>
        )}
      </View>

      <ExitModal onClose={toggleExitModal} isOpen={isExitModalOpen} />
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
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  temperatureText: {
    fontSize: 14,
    fontWeight: '500'
  }
})

export { StatusBar, type StatusBarProps }
