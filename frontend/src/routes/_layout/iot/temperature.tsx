import { Box, Text, Flex, Heading, Icon, Button } from "@chakra-ui/react"
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
          <Icon as={FiThermometer} boxSize={8} color="red.500" />
          <Heading size="lg">Temperature Details</Heading>
        </Flex>
      </Flex>

      <Box p={4}>
        <Box p={6} bg="white" borderRadius="lg" shadow="sm" h="400px">
          <Line data={chartData} options={options} />
        </Box>

        <Box mt={6} p={6} bg="white" borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Temperature Statistics</Heading>
          <Flex gap={6} wrap="wrap">
            <Box>
              <Text color="gray.500" fontSize="sm">Current Temperature</Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {latestData ? `${latestData.value}°C` : "No data"}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">Last Updated</Text>
              <Text fontSize="2xl" fontWeight="bold">
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
          </Flex>
        </Box>
      </Box>
    </Box>
  )
} 

export default TemperatureDetail