import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { isLoggedIn } from "./useAuth"

interface CoreIoTData {
  temperature: number
  humidity: number
  timestamp: string
}

export function useSensorData(type: 'temperature' | 'humidity') {
  return useQuery({
    queryKey: ['coreiot-data', type],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }
      
      const response = await axios.get<CoreIoTData>('http://localhost:8000/api/v1/coreiot/coreiot-data', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return {
        value: response.data[type],
        timestamp: response.data.timestamp,
        unit: type === 'temperature' ? '°C' : '%'
      }
    },
    refetchInterval: 1000, // Refetch every 1 second
    enabled: isLoggedIn()
  })
} 