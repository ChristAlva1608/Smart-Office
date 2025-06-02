import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { isLoggedIn } from "./useAuth"

export interface Alarm {
  id: string
  type: string
  threshold_type: string
  value: number
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export function useAlarms() {
  return useQuery<Alarm[]>({
    queryKey: ["alarms"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("Not authenticated")
      }
      const response = await axios.get<{ data: Alarm[] }>(
        "http://localhost:8000/api/v1/alarms",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      )
      return response.data.data
    },
    enabled: isLoggedIn(),
  })
} 