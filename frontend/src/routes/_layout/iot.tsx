import { Box, Container, Text, Flex, Grid, Heading, Icon, Stack } from "@chakra-ui/react"
import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router"
import { FiActivity, FiThermometer, FiDroplet, FiSun } from "react-icons/fi"

import useAuth from "@/hooks/useAuth"
import { useSensorData } from "@/hooks/useSensorData"
import { usePredictNextMetric } from "@/hooks/useSensorData"

export const Route = createFileRoute("/_layout/iot")({
  component: IoT,
})

function IoT() {
  const { user: currentUser } = useAuth()
  const matches = useMatches()
  const isChildRoute = matches.some(match => match.routeId.includes('/temperature') || match.routeId.includes('/humidity'))
  const { data: temperatureData, isLoading: isTemperatureLoading } = useSensorData('temperature')
  const { data: humidityData, isLoading: isHumidityLoading } = useSensorData('humidity')
  const { data: predictedTemperature, isLoading: isPredictedTemperatureLoading, error: predictedTemperatureError } = usePredictNextMetric('temperature')
  const { data: predictedHumidity, isLoading: isPredictedHumidityLoading, error: predictedHumidityError } = usePredictNextMetric('humidity')

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
          Welcome to IoT Dashboard,{" "}
          <Text as="span" fontWeight="bold" color="blue.500" fontStyle="italic">
            {currentUser?.full_name || currentUser?.email?.split('@')[0]}
          </Text>{" "}
          👋
        </Text>
      </Flex>

      <Box p={4}>
        <Outlet />
        {!isChildRoute && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            {/* Temperature Sensor */}
            <Link to="/iot/temperature">
              <Box 
                p={6} 
                bg="white" 
                borderRadius="lg" 
                shadow="sm"
                _hover={{
                  shadow: "md",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s"
                }}
                cursor="pointer"
              >
                <Stack direction="column" align="start" gap={3}>
                  <Flex align="center" gap={2}>
                    <Icon as={FiThermometer} boxSize={6} color="red.500" />
                    <Heading size="sm">Temperature</Heading>
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold">
                    {isTemperatureLoading ? "Loading..." : `${temperatureData?.value}°C`}
                  </Text>
                  <Text color="gray.600" fontSize="md">
                    {isPredictedTemperatureLoading ? "Predicting..." : predictedTemperatureError ? "Prediction unavailable" : predictedTemperature ? `Next: ${predictedTemperature.value.toFixed(2)}${predictedTemperature.unit}` : null}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Last updated: {isTemperatureLoading ? "..." : new Date(temperatureData?.timestamp || "").toLocaleTimeString()}
                  </Text>
                </Stack>
              </Box>
            </Link>

            {/* Humidity Sensor */}
            <Link to="/iot/humidity">
              <Box 
                p={6} 
                bg="white" 
                borderRadius="lg" 
                shadow="sm"
                _hover={{
                  shadow: "md",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s"
                }}
                cursor="pointer"
              >
                <Stack direction="column" align="start" gap={3}>
                  <Flex align="center" gap={2}>
                    <Icon as={FiDroplet} boxSize={6} color="blue.500" />
                    <Heading size="sm">Humidity</Heading>
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold">
                    {isHumidityLoading ? "Loading..." : `${humidityData?.value}%`}
                  </Text>
                  <Text color="gray.600" fontSize="md">
                    {isPredictedHumidityLoading ? "Predicting..." : predictedHumidityError ? "Prediction unavailable" : predictedHumidity ? `Next: ${predictedHumidity.value.toFixed(2)}${predictedHumidity.unit}` : null}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Last updated: {isHumidityLoading ? "..." : new Date(humidityData?.timestamp || "").toLocaleTimeString()}
                  </Text>
                </Stack>
              </Box>
            </Link>

            {/* Light Sensor */}
            <Box p={6} bg="white" borderRadius="lg" shadow="sm">
              <Stack direction="column" align="start" gap={3}>
                <Flex align="center" gap={2}>
                  <Icon as={FiSun} boxSize={6} color="yellow.500" />
                  <Heading size="sm">Light Level</Heading>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold">850 lux</Text>
                <Text color="gray.500" fontSize="sm">Last updated: 2 mins ago</Text>
              </Stack>
            </Box>

            {/* Activity Status */}
            <Box p={6} bg="white" borderRadius="lg" shadow="sm">
              <Stack direction="column" align="start" gap={3}>
                <Flex align="center" gap={2}>
                  <Icon as={FiActivity} boxSize={6} color="green.500" />
                  <Heading size="sm">System Status</Heading>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">Active</Text>
                <Text color="gray.500" fontSize="sm">All systems operational</Text>
              </Stack>
            </Box>
          </Grid>
        )}

        {!isChildRoute && (
          <Box mt={8} p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Recent Activities</Heading>
            <Text color="gray.600">No recent activities to display</Text>
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default IoT 