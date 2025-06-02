import { Box, Text, Flex, Heading, Icon, Button, SimpleGrid } from "@chakra-ui/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiThermometer, FiArrowLeft } from "react-icons/fi"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useSensorData, useDailySensorData } from "@/hooks/useSensorData"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export const Route = createFileRoute("/_layout/iot/temperature")({
  component: TemperatureDetail,
})

function TemperatureDetail() {
  const { data: latestData, isLoading: isLatestLoading } = useSensorData('temperature')
  const { data: dailyTemperatureData, isLoading: isDailyLoading } = useDailySensorData('temperature')

  const chartData = {
    labels: dailyTemperatureData?.map(point => point.timestamp) || [],
    datasets: [
      {
        label: 'Temperature',
        data: dailyTemperatureData?.map(point => point.value) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Temperature Over Last 24 Hours',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Hours'
        }
      }
    }
  }

  if (isLatestLoading || isDailyLoading) {
    return <div>Loading temperature data...</div>
  }

  // Calculate min and max from daily data
  const values = dailyTemperatureData?.map(point => point.value) || []
  const maxTemperature = values.length > 0 ? Math.max(...values) : 0
  const minTemperature = values.length > 0 ? Math.min(...values) : 0

  return (
    <Box>
      {/* Header */}
      <Flex
        align="center"
        h="80px"
        px={{ base: 2, md: 6 }}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
        gap={4}
      >
        <Link to="/iot">
          <Button variant="ghost" _hover={{ bg: 'gray.100' }}>
            <Icon as={FiArrowLeft} mr={2} />
            Back to Dashboard
          </Button>
        </Link>
        <Flex align="center" gap={2}>
          <Icon as={FiThermometer} boxSize={7} color="red.500" />
          <Heading size="md">Temperature Details</Heading>
        </Flex>
      </Flex>

      {/* Main Content */}
      <Box p={{ base: 2, md: 6 }}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          {/* Chart */}
          <Box bg="white" borderRadius="lg" shadow="sm" p={4} minH="400px" display="flex" flexDir="column" justifyContent="center">
            <Line data={chartData} options={options} />
          </Box>

          {/* Statistics */}
          <Box bg="white" borderRadius="lg" shadow="sm" p={6} display="flex" flexDir="column" justifyContent="center">
            <Heading size="md" mb={4}>Temperature Statistics</Heading>
            <SimpleGrid columns={2} gap={4}>
              <Box>
                <Text color="gray.500" fontSize="sm">Current Temperature</Text>
                <Text fontSize="3xl" fontWeight="bold" color="red.500">
                  {latestData ? `${latestData.value}°C` : "No data"}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Last Updated</Text>
                <Text fontSize="xl" fontWeight="semibold">
                  {latestData ? new Date(latestData.timestamp).toLocaleTimeString() : "No data"}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Highest Temperature</Text>
                <Text fontSize="2xl" fontWeight="bold">{maxTemperature}°C</Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Lowest Temperature</Text>
                <Text fontSize="2xl" fontWeight="bold">{minTemperature}°C</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  )
} 

export default TemperatureDetail