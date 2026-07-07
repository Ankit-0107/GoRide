import { Box, TextField, Button } from "@mui/material";
import BottomNav from "../components/BottomNav";
import SectionHeader from "../components/SectionHeader";
import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CreateRide() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    distance: "",
    time: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    api.post("/rides/", form).then(() => {
      navigate("/campaign");
    });
  };

  return (
    <Box sx={{ bgcolor: "#0e0e0e", minHeight: "100dvh", color: "#fff", pb: 10, overflowX: "hidden", width: "100%" }}>
      <Box sx={{ maxWidth: { xs: "100%", md: "800px", lg: "1200px" }, mx: "auto", width: "100%", p: 2 }}>
        <SectionHeader title="Create Ride" />

        <TextField fullWidth label="Ride Name" name="name" onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Distance" name="distance" onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Time" name="time" onChange={handleChange} sx={{ mb: 2 }} />
        <TextField fullWidth label="Description" name="description" multiline rows={3} onChange={handleChange} sx={{ mb: 2 }} />

        <Button
          fullWidth
          onClick={handleSubmit}
          sx={{
            background: "linear-gradient(45deg,#FF6129,#FC3B00)",
            color: "#fff",
            borderRadius: 2,
            py: 1.5,
          }}
        >
          Create Ride
        </Button>
      </Box>

      <BottomNav active="create" />
    </Box>
  );
}