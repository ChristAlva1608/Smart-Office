import { Box, Container, Text, Flex, Grid, Heading, Icon, Stack } from "@chakra-ui/react"
import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router"
import { FiActivity, FiThermometer, FiDroplet, FiSun } from "react-icons/fi"

import useAuth from "@/hooks/useAuth"
import { useAllSensorData } from "../../hooks/useSensorData"
import { usePredictNextMetric, useControlFan } from "@/hooks/useSensorData"
import { useState } from "react"

export const Route = createFileRoute("/_layout/iot")({
  component: IoT,
})

function IoT() {
  const { user: currentUser } = useAuth()
  const matches = useMatches()
  const isChildRoute = matches.some(match => match.routeId.includes('/temperature') || match.routeId.includes('/humidity') || match.routeId.includes('/light'))
  const { data: sensorData, isLoading: isSensorLoading } = useAllSensorData()
  const { data: predictedTemperature, isLoading: isPredictedTemperatureLoading, error: predictedTemperatureError } = usePredictNextMetric('temperature')
  const { data: predictedHumidity, isLoading: isPredictedHumidityLoading, error: predictedHumidityError } = usePredictNextMetric('humidity')
  const { data: predictedLight, isLoading: isPredictedLightLoading, error: predictedLightError } = usePredictNextMetric('light')
  const temperature = sensorData?.temperature !== undefined ? sensorData.temperature.toFixed(2) : undefined;
  const humidity = sensorData?.humidity !== undefined ? sensorData.humidity.toFixed(2) : undefined;
  const light = sensorData?.light !== undefined ? sensorData.light.toFixed(2) : undefined;
  const lastUpdated = sensorData?.timestamp;

  // Fan control state and mutation
  const [fanOn, setFanOn] = useState(false)
  const controlFan = useControlFan()

  const handleToggleFan = () => {
    controlFan.mutate(!fanOn, {
      onSuccess: () => setFanOn(prev => !prev),
    })
  }

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
      {/* Fan Control Button */}
      <Flex px={4} mt={4} mb={2}>
        <Box>
          <button
            style={{
              background: fanOn ? '#38A169' : '#3182ce',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: controlFan.status === 'pending' ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
            disabled={controlFan.status === 'pending'}
            onClick={handleToggleFan}
          >
            {controlFan.status === 'pending' ? 'Processing...' : fanOn ? 'Turn Fan Off' : 'Turn Fan On'}
          </button>
        </Box>
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
                    {isSensorLoading ? "Loading..." : `${temperature}°C`}
                  </Text>
                  <Text color="gray.600" fontSize="md">
                    {isPredictedTemperatureLoading ? "Predicting..." : predictedTemperatureError ? "Prediction unavailable" : predictedTemperature ? `Next: ${predictedTemperature.value.toFixed(2)}${predictedTemperature.unit}` : null}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Last updated: {isSensorLoading ? "..." : new Date(lastUpdated || "").toLocaleTimeString()}
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
                    {isSensorLoading ? "Loading..." : `${humidity}%`}
                  </Text>
                  <Text color="gray.600" fontSize="md">
                    {isPredictedHumidityLoading ? "Predicting..." : predictedHumidityError ? "Prediction unavailable" : predictedHumidity ? `Next: ${predictedHumidity.value.toFixed(2)}${predictedHumidity.unit}` : null}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Last updated: {isSensorLoading ? "..." : new Date(lastUpdated || "").toLocaleTimeString()}
                  </Text>
                </Stack>
              </Box>
            </Link>

            {/* Light Sensor */}
            <Link to="/iot/light">
              <Box p={6} bg="white" borderRadius="lg" shadow="sm" _hover={{ shadow: "md", transform: "translateY(-2px)", transition: "all 0.2s" }} cursor="pointer">
                <Stack direction="column" align="start" gap={3}>
                  <Flex align="center" gap={2}>
                    <Icon as={FiSun} boxSize={6} color="yellow.500" />
                    <Heading size="sm">Light Level</Heading>
                  </Flex>
                  <Text fontSize="2xl" fontWeight="bold">
                    {isSensorLoading ? "Loading..." : `${light} lux`} 
                  </Text>
                  <Text color="gray.600" fontSize="md">
                    {isPredictedLightLoading ? "Predicting..." : predictedLightError ? "Prediction unavailable" : predictedLight ? `Next: ${predictedLight.value.toFixed(2)} ${predictedLight.unit}` : null}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Last updated: {isSensorLoading ? "..." : new Date(lastUpdated || "").toLocaleTimeString()}
                  </Text>
                </Stack>
              </Box>
            </Link>

            {/* Activity Status */}
            <Box p={6} bg="white" borderRadius="lg" shadow="sm">
              <Stack direction="column" align="start" gap={3}>
                <Flex align="center" gap={2}>
                  <Icon as={FiActivity} boxSize={6} color="green.500" />
                  <Heading size="sm">System Status</Heading>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">Active</Text>
                {/* <Text color="gray.600" fontSize="md">Next: --</Text> */}
                <Text color="gray.500" fontSize="sm">All systems operational</Text>
              </Stack>
            </Box>
          </Grid>
        )}
      </Box>
    </Container>
  )
}

export default IoT 