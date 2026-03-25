// src/components/BottomNav.jsx
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const tabs = [
  { label: "Home", path: "/home" },
  { label: "Community", path: "/community" },
  { label: "Campaigns", path: "/campaign" },
  { label: "Profile", path: "/profile" },
];

export default function BottomNav({ active }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: 420,
        bgcolor: "#111",
        borderRadius: "30px",
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        p: 1,
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => (
        <Box
          key={tab.label}
          onClick={() => navigate(tab.path)}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background:
                active === tab.label
                  ? "linear-gradient(45deg,#FF6129,#FC3B00)"
                  : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <Typography sx={{ fontSize: 11, color: "#fff" }}>
            {tab.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}