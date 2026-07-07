import { Box, Typography, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text) return;
    setMessages([...messages, { text, sender: "me" }]);
    setText("");
  };

  return (
    <Box sx={{ bgcolor: "#0e0e0e", minHeight: "100dvh", color: "#fff", pb: 10, overflowX: "hidden", width: "100%" }}>
      <Box sx={{ maxWidth: { xs: "100%", md: "800px", lg: "1200px" }, mx: "auto", width: "100%" }}>
        {/* MESSAGES */}
        <Box sx={{ p: 2 }}>
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                mb: 1,
                display: "flex",
                justifyContent: msg.sender === "me" ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  background:
                    msg.sender === "me"
                      ? "linear-gradient(45deg,#FF6129,#FC3B00)"
                      : "#111",
                }}
              >
                <Typography>{msg.text}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* INPUT */}
        <Box
          sx={{
            position: "fixed",
            bottom: 10,
            width: "90%",
            maxWidth: { xs: "100%", md: "800px", lg: "1200px" },
            display: "flex",
            gap: 1,
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          <TextField
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message..."
            sx={{ bgcolor: "#111", borderRadius: 2 }}
          />

          <IconButton onClick={sendMessage} sx={{ color: "#fff" }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}