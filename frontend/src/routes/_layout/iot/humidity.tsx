import { Box, Text, Flex, Heading, Icon, Button, SimpleGrid } from "@chakra-ui/react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FiDroplet, FiArrowLeft } from "react-icons/fi"
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

export const Route = createFileRoute("/_layout/iot/humidity")({
  component: HumidityDetail,
})

function HumidityDetail() {
  const { data: latestData, isLoading: isLatestLoading } = useSensorData('humidity')
  const { data: dailyHumidityData, isLoading: isDailyLoading } = useDailySensorData('humidity')

  const chartData = {
    labels: dailyHumidityData?.map(point => point.timestamp) || [],
    datasets: [
      {
        label: 'Humidity',
        data: dailyHumidityData?.map(point => point.value) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
        text: 'Humidity Over Last 24 Hours',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Humidity (%)'
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
    return <div>Loading humidity data...</div>
  }

  // Calculate min and max from daily data
  const values = dailyHumidityData?.map(point => point.value) || []
  const maxHumidity = values.length > 0 ? Math.max(...values) : 0
  const minHumidity = values.length > 0 ? Math.min(...values) : 0

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
          <Icon as={FiDroplet} boxSize={7} color="blue.500" />
          <Heading size="md">Humidity Details</Heading>
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
            <Heading size="md" mb={4}>Humidity Statistics</Heading>
            <SimpleGrid columns={2} gap={4}>
              <Box>
                <Text color="gray.500" fontSize="sm">Current Humidity</Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {latestData ? `${latestData.value}%` : "No data"}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Last Updated</Text>
                <Text fontSize="xl" fontWeight="semibold">
                  {latestData ? new Date(latestData.timestamp).toLocaleTimeString() : "No data"}
                </Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Highest Humidity</Text>
                <Text fontSize="2xl" fontWeight="bold">{maxHumidity}%</Text>
              </Box>
              <Box>
                <Text color="gray.500" fontSize="sm">Lowest Humidity</Text>
                <Text fontSize="2xl" fontWeight="bold">{minHumidity}%</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default HumidityDetail 