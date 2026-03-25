import { Box } from "@mui/material";
import BottomNav from "../components/BottomNav";
import RideCard from "../components/RideCard";
import SectionHeader from "../components/SectionHeader";
import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ActiveRides() {
  const [rides, setRides] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/rides/").then((res) => {
      setRides(res.data.rides || []);
    }).catch(err => console.error("Error fetching active rides:", err));
  }, []);

  return (
    <Box sx={{ bgcolor: "#000", minHeight: "100vh", color: "#fff", pb: 10, maxWidth: 420, mx: "auto" }}>
      
      <Box sx={{ p: 2 }}>
        <SectionHeader title="Active Rides" />
      </Box>

      {/* GRID */}
      <Box
        sx={{
          px: 2,
          display: "grid",
          gridTemplateColumns: "repeat(1,1fr)",
          gap: 2,
        }}
      >
        {rides.map((ride) => (
          <RideCard key={ride._id} ride={ride} />
        ))}
      </Box>

      <BottomNav active="Campaigns" />
    </Box>
  );
}