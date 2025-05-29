import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { isLoggedIn } from "./useAuth"

interface CoreIoTData {
  temperature: number
  humidity: number
  timestamp: string
}

interface ChartDataPoint {
  value: number
  timestamp: string
  unit: string
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

export function useDailySensorData(type: 'temperature' | 'humidity') {
  return useQuery({
    queryKey: ['coreiot-daily-data', type],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }
      
      const response = await axios.get<CoreIoTData[]>('http://localhost:8000/api/v1/coreiot/daily-data', {
        params: { type },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      // Transform data for charting
      const chartData: ChartDataPoint[] = response.data.map(data => ({
        value: data[type],
        timestamp: data.timestamp,
        unit: type === 'temperature' ? '°C' : '%'
      }))
      
      return chartData
    },
    refetchInterval: 5000, // Refetch every 5 seconds for daily data
    enabled: isLoggedIn()
  })
} 