import { useState } from "react"
import {
  Box,
  Button,
  Flex,
  IconButton,
  Heading,
  Stack,
  Spinner,
  Input,
} from "@chakra-ui/react"
import { FiEdit, FiTrash2, FiPlus, FiCheckCircle } from "react-icons/fi"
import { useAlarms } from "@/hooks/useAlarms"
import { useNotifications } from "@/hooks/useNotifications"

const API_BASE = "/api/v1/alarms"
const NOTIF_API = "/api/v1/notifications"

export default function AlarmSettings() {
  const { data: alarms = [], isLoading, error, refetch } = useAlarms()
  const { data: notifications = [], isLoading: notifLoading, refetch: refetchNotif } = useNotifications()
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({
    type: "temperature",
    threshold_type: "above",
    value: "",
    is_active: true,
  })

  async function markNotificationRead(id: string) {
    const token = localStorage.getItem("access_token")
    await fetch(`${NOTIF_API}/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
    refetchNotif()
  }

  function handleChange(e: any) {
    const { name, value, type: inputType, checked } = e.target
    setForm((f) => ({ ...f, [name]: inputType === "checkbox" ? checked : value }))
  }

  function startEdit(alarm: any) {
    setEditing(alarm)
    setForm({
      type: alarm.type,
      threshold_type: alarm.threshold_type,
      value: alarm.value,
      is_active: alarm.is_active,
    })
  }

  function stopEdit() {
    setEditing(null)
    setForm({ type: "temperature", threshold_type: "above", value: "", is_active: true })
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    const method = editing ? "PATCH" : "POST"
    const url = editing ? `${API_BASE}/${editing.id}` : API_BASE
    const token = localStorage.getItem("access_token")
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ ...form, value: parseFloat(form.value) }),
    })
    if (res.ok) {
      window.alert(`Alarm ${editing ? "updated" : "created"}!`)
      refetch()
      stopEdit()
    } else {
      window.alert("Error saving alarm")
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this alarm?")) return
    const token = localStorage.getItem("access_token")
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE", credentials: "include", headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      window.alert("Alarm deleted")
      refetch()
    }
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Notification Alarms</Heading>
      {/* Notifications Section */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="md" boxShadow="sm">
        <Heading size="sm" mb={2}>Notifications</Heading>
        {notifLoading ? (
          <Spinner size="sm" />
        ) : notifications.length === 0 ? (
          <Box color="gray.500">No notifications</Box>
        ) : (
          notifications.filter(n => !n.is_read).map((n) => (
            <Flex key={n.id} align="center" mb={2} bg="yellow.50" p={2} borderRadius="md">
              <Box flex="1">{n.message}</Box>
              <IconButton aria-label="Mark as read" size="sm" colorScheme="green" onClick={() => markNotificationRead(n.id)}><FiCheckCircle /></IconButton>
            </Flex>
          ))
        )}
      </Box>
      <form onSubmit={handleSubmit}>
        <Stack direction={{ base: "column", md: "row" }} gap={4} mb={4} alignItems="end">
          <Box w="150px">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ccc" }}>
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
            </select>
          </Box>
          <Box w="150px">
            <label>Threshold</label>
            <select name="threshold_type" value={form.threshold_type} onChange={handleChange} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ccc" }}>
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </Box>
          <Box w="120px">
            <label>Value</label>
            <Input name="value" type="number" value={form.value} onChange={handleChange} required step="any" />
          </Box>
          <Box display="flex" alignItems="center" w="120px">
            <label style={{ marginBottom: 0, marginRight: 8 }}>Active</label>
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
          </Box>
          <Button colorScheme="teal" type="submit">{editing ? <><FiEdit style={{ marginRight: 6 }} />Update</> : <><FiPlus style={{ marginRight: 6 }} />Add</>}</Button>
          {editing && <Button onClick={stopEdit} variant="ghost">Cancel</Button>}
        </Stack>
      </form>
      {isLoading ? (
        <Flex justify="center" py={8}><Spinner /></Flex>
      ) : error ? (
        <Box color="red.500">Error loading alarms</Box>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Type</th>
              <th style={{ textAlign: "left", padding: 8 }}>Threshold</th>
              <th style={{ textAlign: "left", padding: 8 }}>Value</th>
              <th style={{ textAlign: "left", padding: 8 }}>Active</th>
              <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((alarm) => (
              <tr key={alarm.id}>
                <td style={{ padding: 8 }}>{alarm.type}</td>
                <td style={{ padding: 8 }}>{alarm.threshold_type}</td>
                <td style={{ padding: 8 }}>{alarm.value}</td>
                <td style={{ padding: 8 }}>{alarm.is_active ? "Yes" : "No"}</td>
                <td style={{ padding: 8 }}>
                  <IconButton aria-label="Edit" size="sm" mr={2} onClick={() => startEdit(alarm)}><FiEdit /></IconButton>
                  <IconButton aria-label="Delete" size="sm" colorScheme="red" onClick={() => handleDelete(alarm.id)}><FiTrash2 /></IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Box>
  )
} 