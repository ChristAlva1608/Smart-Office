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
  Table,
  Badge,
} from "@chakra-ui/react"
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi"
import { useAlarms } from "@/hooks/useAlarms"
import { useColorModeValue } from '@/components/ui/color-mode'

export default function AlarmSettings() {
  const { data: alarms = [], isLoading, error, refetch } = useAlarms()
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({
    type: "temperature",
    threshold_type: "above",
    value: "",
    is_active: true,
  })

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
    const token = localStorage.getItem("access_token")
    let url = "http://localhost:8000/api/v1/alarms"
    let method = "POST"
    let body: any = { ...form, value: parseFloat(form.value) }
    if (editing) {
      url = `http://localhost:8000/api/v1/alarms/${editing.id}`
      method = "PATCH"
      // Only send fields allowed by AlarmUpdate (likely partial update)
      body = {}
      if (form.type !== undefined) body.type = form.type
      if (form.threshold_type !== undefined) body.threshold_type = form.threshold_type
      if (form.value !== undefined) body.value = parseFloat(form.value)
      if (form.is_active !== undefined) body.is_active = form.is_active
    }
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify(body),
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
    const res = await fetch(`http://localhost:8000/api/v1/alarms/${id}`, { method: "DELETE", credentials: "include", headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      window.alert("Alarm deleted")
      refetch()
    }
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Notification Alarms</Heading>
      <form onSubmit={handleSubmit}>
        <Stack direction={{ base: "column", md: "row" }} gap={4} mb={4} alignItems="end">
          <Box w="150px">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ccc" }}>
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="light">Light</option>
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
        <Box mt={6} borderRadius="lg" overflow="hidden" boxShadow="md" bg={useColorModeValue('white', 'gray.800')}>
          <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader fontWeight="bold">Type</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Threshold</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Value</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Active</Table.ColumnHeader>
                <Table.ColumnHeader fontWeight="bold">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {alarms.map((alarm) => (
                <Table.Row key={alarm.id}>
                  <Table.Cell>{alarm.type.charAt(0).toUpperCase() + alarm.type.slice(1)}</Table.Cell>
                  <Table.Cell textTransform="capitalize">{alarm.threshold_type}</Table.Cell>
                  <Table.Cell>{alarm.value}</Table.Cell>
                  <Table.Cell>
                    {alarm.is_active ? (
                      <Badge colorScheme="green">Active</Badge>
                    ) : (
                      <Badge colorScheme="red">Inactive</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap={2}>
                    <IconButton aria-label="Edit" size="sm" colorScheme="teal" variant="ghost" onClick={() => startEdit(alarm)}>
                      <FiEdit />
                    </IconButton>
                    <IconButton aria-label="Delete" size="sm" colorScheme="red" variant="ghost" onClick={() => handleDelete(alarm.id)}>
                      <FiTrash2 />
                    </IconButton>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  )
} 