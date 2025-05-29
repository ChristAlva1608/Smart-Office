import { Box, Container, Text, Flex, Heading, Icon, Button } from "@chakra-ui/react"
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
      <Flex 
        align="center" 
        h="120px" 
        px={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
      >
        <Link to="/iot">
          <Button 
            variant="ghost" 
            mr={4}
            _hover={{ bg: 'gray.100' }}
          >
            <Icon as={FiArrowLeft} mr={2} />
            Back to Dashboard
          </Button>
        </Link>
        <Flex align="center" gap={3}>
          <Icon as={FiDroplet} boxSize={8} color="blue.500" />
          <Heading size="lg">Humidity Details</Heading>
        </Flex>
      </Flex>

      <Box p={4}>
        <Box p={6} bg="white" borderRadius="lg" shadow="sm" h="400px">
          <Line data={chartData} options={options} />
        </Box>

        <Box mt={6} p={6} bg="white" borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Humidity Statistics</Heading>
          <Flex gap={6} wrap="wrap">
            <Box>
              <Text color="gray.500" fontSize="sm">Current Humidity</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {latestData ? `${latestData.value}%` : "No data"}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">Last Updated</Text>
              <Text fontSize="2xl" fontWeight="bold">
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
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default HumidityDetail 