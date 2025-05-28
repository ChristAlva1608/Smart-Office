import { Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import Sidebar from "@/components/Common/Sidebar"
import UserMenu from "@/components/Common/UserMenu"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Flex flex="1" direction="column" overflow="hidden">
        <Flex justify="flex-end" p={4}>
          <UserMenu />
        </Flex>
        <Flex flex="1" direction="column" p={4} overflowY="auto">
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Layout
