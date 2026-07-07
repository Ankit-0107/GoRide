import { Box } from "@mui/material";
import BottomNav from "../components/BottomNav";
import RideCard from "../components/RideCard";
import SectionHeader from "../components/SectionHeader";
import { useEffect, useState } from "react";
import api from "../api/api";

export default function ActiveRides() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    api.get("/rides/").then((res) => {
      setRides(res.data.rides || []);
    }).catch(err => console.error("Error fetching active rides:", err));
  }, []);

  return (
    <Box sx={{ bgcolor: "#0e0e0e", minHeight: "100dvh", color: "#fff", pb: 10, overflowX: "hidden", width: "100%" }}>
      <Box sx={{ maxWidth: { xs: "100%", md: "800px", lg: "1200px" }, mx: "auto", width: "100%" }}>
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
      </Box>

      <BottomNav active="explore" />
    </Box>
  );
}