import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../authContext"; // Hook for user authentication
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary chart elements with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Register Bar chart element
  Title,
  Tooltip,
  Legend
);

const SkillsProgress = () => {
  const { user } = useAuth();
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.userId) {
      setError("You need to log in to view your skills progress.");
      setLoading(false);
      return; // Prevents further execution if there's no valid user
    }

    const fetchSkillsData = async () => {
      try {
        console.log(user);
        // Make sure the URL is correct and user.userId is passed correctly
        const response = await axios.get(
          `http://localhost:5000/api/skills/?userId=${user.userId}`
        );
        setSkillsData(response.data);
        setLoading(false); // Stop loading once data is fetched
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false); // Stop loading if there's an error
      }
    };

    fetchSkillsData();
  }, [user]); // Re-run the effect when user object changes (including logging out)

  // Aggregate skills by date and calculate cumulative skills gained up to each date
  const aggregatedData = skillsData.reduce((acc, skill) => {
    const date = new Date(skill.dateGained).toISOString().split("T")[0];
    if (acc[date]) {
      acc[date] += 1;
    } else {
      acc[date] = 1;
    }
    return acc;
  }, {});

  // Sort the dates to ensure chronological order
  const sortedDates = Object.keys(aggregatedData).sort();

  // Calculate the cumulative number of skills gained by date
  let cumulativeSkills = 0;
  const cumulativeData = sortedDates.map((date) => {
    cumulativeSkills += aggregatedData[date];
    return cumulativeSkills;
  });

  // Aggregate skills by proficiency level
  const proficiencyData = skillsData.reduce((acc, skill) => {
    const proficiency = skill.proficiency; // Assuming proficiency values are 0, 1, or 2
    if (acc[proficiency]) {
      acc[proficiency] += 1;
    } else {
      acc[proficiency] = 1;
    }
    return acc;
  }, {});

  // Prepare chart data for proficiency bar chart
  const proficiencyChartData = {
    labels: ["0", "1", "2"], // Proficiency levels (0, 1, 2)
    datasets: [
      {
        label: "Skills by Proficiency",
        data: [
          proficiencyData[0] || 0,
          proficiencyData[1] || 0,
          proficiencyData[2] || 0,
        ], // Number of skills for each proficiency
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(75, 192, 192, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare the data for the line chart (skills over time)
  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Cumulative Skills Gained Over Time",
        data: cumulativeData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
    ],
  };

  return (
    <div>
      <h1>Skills Progress Visualization</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <div>
            <h2>Cumulative Skills Over Time</h2>
            <Line
              data={chartData}
              options={{
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Dates", // x-axis label
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Skills Gained", // y-axis label
                    },
                    beginAtZero: true, // Ensure the y-axis starts at 0
                  },
                },
              }}
            />
          </div>
          <div>
            <h2>Skills by Proficiency</h2>
            <Bar
              data={proficiencyChartData}
              options={{
                indexAxis: "y", // Horizontal bar chart
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Number of Skills", // x-axis label
                    },
                    beginAtZero: true, // Start the x-axis from zero
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Proficiency", // y-axis label
                    },
                  },
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SkillsProgress;
