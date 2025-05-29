import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Alert,
  Autocomplete,
} from "@mui/material"

export default function SendDraftPick({ draftData, mavsPicksData }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedPick, setSelectedPick] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const navigate = useNavigate()

  // Get all players for the autocomplete
  const allPlayers = draftData.bio || []

  // Handle sending the pick
  const handleSendPick = () => {
    if (selectedPlayer && selectedPick) {
      setShowConfirmation(true)
      // Here you would typically send the data to your backend
      console.log("Sending pick:", {
        player: selectedPlayer,
        pick: selectedPick,
      })
    }
  }

  const handleGoBack = () => {
    navigate("/")
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: "#0053BC", mb: 3 }}>
        Send a Pick
      </Typography>

      {showConfirmation ? (
        <Paper sx={{ p: 3, bgcolor: "#f5f5f5" }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Pick sent successfully!
          </Alert>
          <Typography variant="h6" gutterBottom>
            Pick Details:
          </Typography>
          <Typography>
            <strong>Player:</strong> {selectedPlayer?.name}
          </Typography>
          <Typography>
            <strong>Pick:</strong> {selectedPick}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleGoBack} sx={{ mr: 2 }}>
              Back to Draft Hub
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setShowConfirmation(false)
                setSelectedPlayer(null)
                setSelectedPick("")
              }}
            >
              Send Another Pick
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search for a Player
            </Typography>
            <Autocomplete
              options={allPlayers}
              getOptionLabel={(option) => option.name || ""}
              value={selectedPlayer}
              onChange={(event, newValue) => setSelectedPlayer(newValue)}
              renderInput={(params) => <TextField {...params} label="Search players..." variant="outlined" fullWidth />}
              sx={{ mb: 3 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Draft Pick</InputLabel>
              <Select value={selectedPick} onChange={(e) => setSelectedPick(e.target.value)} label="Select Draft Pick">
                {mavsPicksData.picks.map((pick, index) => (
                  <MenuItem key={index} value={`Round ${pick.round}, Pick ${pick.pick}`}>
                    Round {pick.round}, Pick {pick.pick}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSendPick}
              disabled={!selectedPlayer || !selectedPick}
              sx={{ bgcolor: "#0053BC" }}
            >
              Send Pick and Draft
            </Button>
            <Button variant="outlined" onClick={handleGoBack}>
              Cancel
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  )
}