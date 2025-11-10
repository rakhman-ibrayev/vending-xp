import * as Location from 'expo-location'
import { useEffect, useState } from 'react'

const useGetLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }

      const location = await Location.getCurrentPositionAsync({})

      setLocation(location)
    })()
  }, [])

  return { location, errorMsg, isError: Boolean(errorMsg) }
}

export { useGetLocation }
