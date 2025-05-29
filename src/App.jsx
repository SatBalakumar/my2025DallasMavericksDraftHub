import { useState, useEffect } from "react"
import { Routes, Route, Link as RouterLink, useNavigate, useSearchParams, useParams } from "react-router-dom"
import { AppBar,Toolbar,IconButton,Box,Button,Menu,MenuItem,createTheme,ThemeProvider,CssBaseline, } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import ExpandMore from "@mui/icons-material/ExpandMore"
import BigBoard from "./components/BigBoard"
import PlayerProfile from "./components/PlayerProfile"
import LoginPage from "./components/LoginPage"
import SendDraftPick from "./components/SendDraftPick"
import ScoutBoard from './components/ScoutBoard';
import draftData from "../data/intern_project_data.json"
import mavsPicksData from "../data/mavericks_draft_picks.json"

const mavsTheme = createTheme({
  palette: {
    primary: { main: "#0053BC" },
    secondary: { main: "#000000" },
    text: { primary: "#00223E" },
    background: { default: "#FFFFFF" },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
})

function ScoutBoardWrapper(props) {
  const { scoutName } = useParams();
  // Pass the relevant data as props, along with the scout name
  return (
    <ScoutBoard
      scoutName={scoutName}
      bio={draftData.bio}
      scoutRankings={draftData.scoutRankings}
      measurements={draftData.measurements}
      {...props}
    />
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [playersAnchor, setPlayersAnchor] = useState(null)
  const [scoutAnchor, setScoutAnchor] = useState(null);
  const [actionsAnchor, setActionsAnchor] = useState(null)
  const [mavsAnchor, setMavsAnchor] = useState(null)

  // Add shared favorites state
  const [favoritePlayers, setFavoritePlayers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem("mavsAuth") === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (rememberMe) => {
    setIsAuthenticated(true)
    if (rememberMe) {
      localStorage.setItem("mavsAuth", "true")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("mavsAuth")
    setFavoritePlayers([]) // Clear all favorites on logout
    setPlayersAnchor(null)
    setMavsAnchor(null)
    navigate("/")
  }

  // Add toggle favorite function
  const handleToggleFavorite = (playerId) => {
    setFavoritePlayers((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId)
      } else {
        return [...prev, playerId]
      }
    })
  }

  const openPlayers = (e) => setPlayersAnchor(e.currentTarget)
  const closePlayers = () => setPlayersAnchor(null)
  const openScouts = (e) => setScoutAnchor(e.currentTarget);
  const closeScouts = () => setScoutAnchor(null);
  const openActions = (e) => setActionsAnchor(e.currentTarget)
  const closeActions = () => setActionsAnchor(null)
  const openMavs = (e) => setMavsAnchor(e.currentTarget)
  const closeMavs = () => setMavsAnchor(null)

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={mavsTheme}>
        <CssBaseline />
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={mavsTheme}>
      <CssBaseline />

      <AppBar position="sticky" sx={{ backgroundColor: "#0053BC" }}>
        <Toolbar sx={{ minHeight: "60px" }}>
          <IconButton color="inherit" edge="start" sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          {/* NBA Logo */}
          <Box
            component="img"
            src="https://cdn.nba.com/logos/nba/nba-logoman-word-white.svg"
            alt="NBA Logo"
            sx={{height: 40, mr: 3, display: { xs: "none", sm: "block" },}}
          />

          {/* Left side nav */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2, flexGrow: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{
                color: "#FFFFFF",
                textTransform: "none",
                "&:hover": {
                  textDecorationLine: "underline",
                  textDecorationColor: "inherit", // uses the current text color
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "8px", // control gap from text
                },
              }}
            >
              DraftHub Home
            </Button>

            <Button
              endIcon={<ExpandMore sx={{ color: "#FFFFFF" }} />}
              onClick={openPlayers}
              sx={{
                color: "#FFFFFF",
                textTransform: "none",
                "&:hover": {
                  textDecorationLine: "underline",
                  textDecorationColor: "inherit", // uses the current text color
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "8px", // control gap from text
                },
              }}
            >
              View Options
            </Button>
            <Menu
              anchorEl={playersAnchor}
              open={Boolean(playersAnchor)}
              onClose={closePlayers}
              slotProps={{
                list: {
                  sx: {
                    // MenuList (the dropdown "sheet") background
                    bgcolor: "#FFFFFF",
                    // Style each MenuItem
                    "& .MuiMenuItem-root": {
                      color: "#00285E", // dark blue text by default
                      "&:hover": {
                        bgcolor: "#E0E0E0", // grey hover background
                        color: "#007DC7", // light-blue hover text
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={() => {closePlayers(); navigate("/") }} >
                View All Players
              </MenuItem>
              <MenuItem onClick={openScouts} endIcon={<ExpandMore sx={{ color: "#FFFFFF" }} />}>
                View Scouting Reports
              </MenuItem>
              <MenuItem onClick={closePlayers}>View Player fit</MenuItem>
            </Menu>

            {/* Submenu: scouts list */}
            <Menu
              anchorEl={scoutAnchor}
              open={Boolean(scoutAnchor)}
              onClose={closeScouts}
              // align the submenu to the right side of the parent menu
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              slotProps={{ list: { sx: { bgcolor: "#FFFFFF" } } }}
            >
              {["espn","samvecenie","kevinoconnor","kyleboone","garyparrish"].map((key) => (
                <MenuItem
                  key={key}
                  onClick={() => {
                    closeScouts();
                    closePlayers();
                    navigate(`/scout/${key}`);
                  }}
                >
                  {key === "espn"
                    ? "ESPN"
                    : key === "samvecenie"
                    ? "Sam Vecenie"
                    : key === "kevinoconnor"
                    ? "Kevin O'Connor"
                    : key === "kyleboone"
                    ? "Kyle Boone"
                    : "Gary Parrish"}
                </MenuItem>
              ))}
            </Menu>

            <Button
              sx={{
                color: "#FFFFFF",
                textTransform: "none",
                "&:hover": {
                  textDecorationLine: "underline",
                  textDecorationColor: "inherit", // uses the current text color
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "8px", // control gap from text
                },
              }}
            >
              News
            </Button>
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2, alignItems: "center" }}>
            {/* Draft Actions dropdown */}
            <Button
              endIcon={<ExpandMore sx={{ color: "#FFFFFF" }} />}
              sx={{
                color: "#FFFFFF",
                textTransform: "none",
                "&:hover": { textDecoration: "underline", textDecorationThickness: "3px" },
              }}
              onClick={openActions}
            >
              Draft Actions
            </Button>
            <Menu
              anchorEl={actionsAnchor}
              open={Boolean(actionsAnchor)}
              onClose={closeActions}
              slotProps={{
                list: {
                  sx: {
                    bgcolor: "#FFFFFF",
                    "& .MuiMenuItem-root": {
                      color: "#00285E",
                      "&:hover": { bgcolor: "#E0E0E0", color: "#007DC7" },
                    },
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  closeActions() /* propose trade logic */
                }}
              >
                Propose Trade
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeActions()
                  navigate("/send-pick")
                }}
              >
                Send Pick
              </MenuItem>
            </Menu>

            <IconButton onClick={openMavs} sx={{ p: 0 }}>
              <Box
                component="img"
                src="https://www.mavs.com/wp-content/themes/mavs/images/logo.svg"
                alt="Mavs Logo"
                sx={{ height: 32 }}
              />
            </IconButton>
            <Menu
              anchorEl={mavsAnchor}
              open={Boolean(mavsAnchor)}
              onClose={closeMavs}
              slotProps={{
                list: {
                  sx: {
                    // MenuList (the dropdown "sheet") background
                    bgcolor: "#FFFFFF",
                    // Style each MenuItem
                    "& .MuiMenuItem-root": {
                      color: "#00285E", // dark blue text by default
                      "&:hover": {
                        bgcolor: "#E0E0E0", // grey hover background
                        color: "#007DC7", // light-blue hover text
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  closeMavs()
                  handleLogout()
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={ <BigBoard data={draftData} favoritePlayers={favoritePlayers} onToggleFavorite={handleToggleFavorite} onLogout={handleLogout} /> }/>
        <Route path="/send-pick" element={<SendDraftPick draftData={draftData} mavsPicksData={mavsPicksData} /> } />
        <Route path="/player/:playerId" element={ <PlayerProfile data={draftData} favoritePlayers={favoritePlayers} onToggleFavorite={handleToggleFavorite} /> }/>
        <Route path="/scout/:scoutKey" element={<ScoutBoard data={draftData}  />} />
      </Routes>
    </ThemeProvider>
  )
}
