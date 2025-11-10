import axios from 'axios'

let machineSerialNumber: string | null = null

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL
})

api.interceptors.request.use(
  config => {
    if (machineSerialNumber) {
      config.headers['x-serial-number'] = machineSerialNumber
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data) {
      const { message } = error.response.data
      error.response.data = { error: message || 'Request failed' }
    }

    return Promise.reject(error)
  }
)

export const setMachineSerialNumber = (serialNumber: string) => {
  machineSerialNumber = serialNumber
}

export default api
