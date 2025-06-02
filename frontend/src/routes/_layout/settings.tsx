import { Container, Heading, Tabs } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { FiUser, FiLock, FiSettings, FiAlertTriangle } from "react-icons/fi"

import Appearance from "@/components/UserSettings/Appearance"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import AlarmSettings from "@/components/UserSettings/AlarmSettings"
import useAuth from "@/hooks/useAuth"

const tabsConfig = [
  { value: "my-profile", title: "My profile", icon: FiUser, component: UserInformation },
  { value: "password", title: "Password", icon: FiLock, component: ChangePassword },
  { value: "appearance", title: "Appearance", icon: FiSettings, component: Appearance },
  { value: "alarms", title: "Notification Alarms", icon: FiAlertTriangle, component: AlarmSettings },
  { value: "danger-zone", title: "Danger zone", icon: FiAlertTriangle, component: DeleteAccount },
]

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
        User Settings
      </Heading>
      <Tabs.Root defaultValue="my-profile" variant="outline" colorScheme="teal" mt={6} mb={8}>
        <Tabs.List gap={4} px={2} py={2} bg="gray.50" borderRadius="xl" boxShadow="sm">
          {finalTabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} px={5} py={2} fontWeight="semibold" fontSize="md" _selected={{ bg: "teal.500", color: "white" }} _hover={{ bg: "teal.100" }}>
              <tab.icon style={{ marginRight: 8, verticalAlign: "middle" }} />
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {finalTabs.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value}>
            <tab.component />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Container>
  )
}
