import { useQuery, useMutation } from "@tanstack/react-query"
import axios from "axios"
import { isLoggedIn } from "./useAuth"

interface CoreIoTData {
  temperature: number
  humidity: number
  light: number
  timestamp: string
}

interface ChartDataPoint {
  value: number
  timestamp: string
  unit: string
}

export function useSensorData(type: 'temperature' | 'humidity' | 'light') {
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
        unit: type === 'temperature' ? '°C' : type === 'humidity' ? '%' : 'lux'
      }
    },
    refetchInterval: 1000, // Refetch every 1 second
    enabled: isLoggedIn()
  })
} 

export function useDailySensorData(type: 'temperature' | 'humidity' | 'light') {
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
        unit: type === 'temperature' ? '°C' : type === 'humidity' ? '%' : 'lux'
      }))
      
      return chartData
    },
    refetchInterval: 5000, // Refetch every 5 seconds for daily data
    enabled: isLoggedIn()
  })
} 

export function usePredictNextMetric(type: 'temperature' | 'humidity' | 'light') {
  return useQuery({
    queryKey: ['coreiot-predict-next', type],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }
      const response = await axios.get<{ predicted_next: number }>('http://localhost:8000/api/v1/coreiot/predict-next', {
        params: { type },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return {
        value: response.data.predicted_next,
        unit: type === 'temperature' ? '°C' : type === 'humidity' ? '%' : 'lux'
      }
    },
    refetchInterval: 1000, // Refetch every 1 second
    enabled: isLoggedIn()
  })
} 

export function useAllSensorData() {
  return useQuery({
    queryKey: ['coreiot-data'],
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
      return response.data
    },
    refetchInterval: 1000, // Refetch every 1 second
    enabled: isLoggedIn()
  })
} 

export function useControlFan() {
  return useMutation({
    mutationFn: async (turnOn: boolean) => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }
      try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/coreiot/control-fan',
        { turn_on: turnOn },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
      } catch (error) {
        window.alert('Failed to control fan')
        throw new Error('Failed to control fan')
      }
    },
  })
} 