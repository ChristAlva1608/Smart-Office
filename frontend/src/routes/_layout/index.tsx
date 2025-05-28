import { Box, Container, Text, Flex } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <Container maxW="full">
      <Flex 
        align="center" 
        h="120px" 
        px={4}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="2xl" fontWeight="medium">
          Welcome, {currentUser?.full_name || currentUser?.email?.split('@')[0]} 👋
        </Text>
      </Flex>
      <Box p={4}>
        <Text color="gray.600">Welcome back, nice to see you again!</Text>
      </Box>
    </Container>
  )
}

export default Dashboard
