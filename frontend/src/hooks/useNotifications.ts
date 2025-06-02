import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { isLoggedIn } from "./useAuth"

export interface Notification {
  id: string
  message: string
  is_read: boolean
  alarm_id?: string | null
  user_id: string
  created_at: string
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("Not authenticated")
      }
      const response = await axios.get<{ data: Notification[] }>(
        "http://localhost:8000/api/v1/notifications",
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