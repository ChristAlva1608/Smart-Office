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
import { useSensorData } from "@/hooks/useSensorData"

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
  const { data: humidityData, isLoading: isHumidityLoading } = useSensorData('humidity')

  // Generate sample data for 24 hours
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = {
    labels,
    datasets: [
      {
        label: 'Humidity (%)',
        data: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Humidity (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Hour'
        }
      }
    }
  }

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
          <Line options={options} data={data} />
        </Box>

        <Box mt={6} p={6} bg="white" borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Humidity Statistics</Heading>
          <Flex gap={6} wrap="wrap">
            <Box>
              <Text color="gray.500" fontSize="sm">Current Humidity</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {isHumidityLoading ? "Loading..." : `${humidityData?.value}%`}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">Last Updated</Text>
              <Text fontSize="2xl" fontWeight="bold">
                {isHumidityLoading ? "..." : new Date(humidityData?.timestamp || "").toLocaleTimeString()}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">Highest Humidity</Text>
              <Text fontSize="2xl" fontWeight="bold">88%</Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">Lowest Humidity</Text>
              <Text fontSize="2xl" fontWeight="bold">65%</Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default HumidityDetail 