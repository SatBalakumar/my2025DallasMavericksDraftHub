import { useState, useMemo } from "react"
import { useParams, Link as RouterLink } from "react-router-dom"
import {
TextField,Autocomplete,Container,Box,Typography,Tabs,
Tab,Grid,IconButton,Button,Menu,
MenuItem,FormControlLabel,Checkbox,Accordion,AccordionSummary,AccordionDetails,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import StarIcon from "@mui/icons-material/Star"
import StarBorderIcon from "@mui/icons-material/Star"
import SettingsIcon from "@mui/icons-material/Settings"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { useTheme } from "@mui/material/styles"

export default function PlayerProfile({ data, favoritePlayers = [], onToggleFavorite }) {
  const { playerId } = useParams()
  const id = Number(playerId)
  const player = data.bio.find((p) => p.playerId === id)
  const meas = data.measurements.find((m) => m.playerId === id) || {}

  const gameLog = data.game_logs?.filter((g) => g.playerId === id) || []
  const seasonLog = data.seasonLogs?.filter((s) => s.playerId === id) || []
  const ranking = data.scoutRankings?.find((r) => r.playerId === id) || {}
  const reports = data.scoutingReports?.filter((r) => r.playerId === id) || []

  const [tab, setTab] = useState(0)
  const theme = useTheme()
  const [seasonMode, setSeasonMode] = useState("avg")
  const handleTab = (_, v) => setTab(v)

  // Custom scouting state
  const [customRating, setCustomRating] = useState("")
  const [customText, setCustomText] = useState("")
  const [myReports, setMyReports] = useState([])

  // Compare Players state
  const [compareId, setCompareId] = useState(null)
  const comparePlayer = data.bio.find((p) => p.playerId === compareId)

  // Accordion open/closed
  const [openSections, setOpenSections] = useState({
    season: true,
    scouting: true,
    measurements: true,
  })

  // Visible fields per section
  const allFields = {
    season: ["PPG", "APG", "RPG", "3P%", "FT%", "MPG", "PTS", "FGM", "FGA"],
    scouting: Object.keys(ranking).filter((k) => k !== "playerId"),
    measurements: [
      "heightNoShoes",
      "heightShoes",
      "wingspan",
      "reach",
      "maxVertical",
      "noStepVertical",
      "weight",
      "bodyFat",
      "handLength",
      "handWidth",
      "shuttleBest",
      "sprint",
    ],
  }

  const [visibleFields, setVisibleFields] = useState({
    season: ["MPG", "PPG", "APG", "RPG", "3P%", "FT%"],
    scouting: allFields.scouting,
    measurements: ["heightNoShoes", "weight", "wingspan", "maxVertical"],
  })

  // Settings menu state
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentSec, setCurrentSec] = useState(null)

  const openSettings = (e, sec) => {
    e.stopPropagation()
    setCurrentSec(sec)
    setAnchorEl(e.currentTarget)
  }

  const closeSettings = () => setAnchorEl(null)

  const toggleField = (sec, field) => {
    setVisibleFields((v) => {
      const list = v[sec]
      return {
        ...v,
        [sec]: list.includes(field) ? list.filter((f) => f !== field) : [...list, field],
      }
    })
  }

  // Helpers to build stat maps
  const playerSeasonStats = useMemo(() => {
    const s = seasonLog[0] || {}
    return {
      PPG: s.PTS,
      APG: s.AST,
      RPG: s.TRB,
      "3P%": s["3P%"],
      "FT%": s["FTP"],
      MPG: s.MP,
      PTS: s.PTS,
      FGM: s.FGM,
      FGA: s.FGA,
    }
  }, [seasonLog])

  const compareSeasonStats = useMemo(() => {
    const s = data.seasonLogs?.find((s) => s.playerId === compareId) || {}
    return {
      PPG: s.PTS,
      APG: s.AST,
      RPG: s.TRB,
      "3P%": s["3P%"],
      "FT%": s["FTP"],
      MPG: s.MP,
      PTS: s.PTS,
      FGM: s.FGM,
      FGA: s.FGA,
    }
  }, [compareId, data.seasonLogs])

  const playerMeasure = meas
  const compareMeasure = data.measurements?.find((m) => m.playerId === compareId) || {}

  const seasonColumns = useMemo(() => {
    if (seasonMode === "tot") {
      return [
        { label: "Season", getValue: (s) => s.Season },
        { label: "League", getValue: (s) => s.League },
        { label: "Team", getValue: (s) => s.Team },
        { label: "Record", getValue: (s) => `${s.w}-${s.l}` },
        { label: "GP", getValue: (s) => s.GP },
        { label: "GS", getValue: (s) => s.GS },
        { label: "MP", getValue: (s) => (s.MP * s.GP).toFixed(1) },
        { label: "PTS", getValue: (s) => (s.PTS * s.GP).toFixed(1) },
        { label: "FGA-FGM", getValue: (s) => `${(s.FGA * s.GP).toFixed(0)}-${(s.FGM * s.GP).toFixed(0)}` },
        { label: "2PM-2PA", getValue: (s) => `${(s.FG2M * s.GP).toFixed(0)}-${(s.FG2A * s.GP).toFixed(0)}` },
        { label: "3PM-3PA", getValue: (s) => `${(s["3PM"] * s.GP).toFixed(0)}-${(s["3PA"] * s.GP).toFixed(0)}` },
        { label: "FT", getValue: (s) => `${(s.FT * s.GP).toFixed(0)}-${(s.FTA * s.GP).toFixed(0)}` },
        { label: "ORB", getValue: (s) => (s.ORB * s.GP).toFixed(1) },
        { label: "DRB", getValue: (s) => (s.DRB * s.GP).toFixed(1) },
        { label: "REB", getValue: (s) => (s.TRB * s.GP).toFixed(1) },
        { label: "AST", getValue: (s) => (s.AST * s.GP).toFixed(1) },
        { label: "STL", getValue: (s) => (s.STL * s.GP).toFixed(1) },
        { label: "BLK", getValue: (s) => (s.BLK * s.GP).toFixed(1) },
        { label: "TO", getValue: (s) => (s.TOV * s.GP).toFixed(1) },
        { label: "PF", getValue: (s) => (s.PF * s.GP).toFixed(1) },
      ]
    } else {
      return [
        { label: "Season", getValue: (s) => s.Season },
        { label: "League", getValue: (s) => s.League },
        { label: "Team", getValue: (s) => s.Team },
        { label: "MPG", getValue: (s) => s.MP },
        { label: "PPG", getValue: (s) => s.PTS },
        { label: "FGM", getValue: (s) => s.FGM },
        { label: "FGA", getValue: (s) => s.FGA },
        { label: "2PM", getValue: (s) => s.FG2M },
        { label: "2PA", getValue: (s) => s.FG2A },
        { label: "2P%", getValue: (s) => `${s["FG2%"]}%` },
        { label: "3PA", getValue: (s) => s["3PA"] },
        { label: "3P%", getValue: (s) => `${s["3P%"]}%` },
        { label: "EFG%", getValue: (s) => `${s["eFG%"]}%` },
        { label: "FTA", getValue: (s) => s.FTA },
        { label: "FT%", getValue: (s) => `${s["FTP"]}%` },
        { label: "ORB", getValue: (s) => s.ORB },
        { label: "DRB", getValue: (s) => s.DRB },
        { label: "REB", getValue: (s) => s.TRB },
        { label: "APG", getValue: (s) => s.AST },
        { label: "SPG", getValue: (s) => s.STL },
        { label: "BPG", getValue: (s) => s.BLK },
        { label: "TO", getValue: (s) => s.TOV },
        { label: "PF", getValue: (s) => s.PF },
      ]
    }
  }, [seasonMode])

  if (!player) return <Typography>Player not found</Typography>

  const isFavorited = favoritePlayers.includes(id)

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      onToggleFavorite(id)
    }
  }

  // Handle adding custom scouting report
  const handleAddReport = () => {
    if (!customRating || !customText.trim()) return
    setMyReports((prev) => [...prev, { rating: customRating, text: customText }])
    setCustomRating("")
    setCustomText("")
  }

  // format height to nearest 1/4 inch and total inches
  const formatHeight = (inches) => {
    if (!inches) return "-"
    const totalInches = Math.round(inches * 4) / 4 // Round to nearest 1/4 inch
    const ft = Math.floor(totalInches / 12)
    const remainingInches = totalInches % 12

    // Format the fractional part
    const wholeInches = Math.floor(remainingInches)
    const fraction = remainingInches - wholeInches

    let inchDisplay = wholeInches.toString()
    if (fraction === 0.25) inchDisplay += "¼"
    else if (fraction === 0.5) inchDisplay += "½"
    else if (fraction === 0.75) inchDisplay += "¾"

    return `${ft}-${inchDisplay}" (${totalInches} inches)`
  }

  const formatAge = () => {
    if (!player.birthDate) return "-"
    const b = new Date(player.birthDate)
    const now = new Date()
    let years = now.getFullYear() - b.getFullYear()
    const m = now.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) years--

    const dd = String(b.getDate()).padStart(2, "0")
    const mm = String(b.getMonth() + 1).padStart(2, "0")
    const yyyy = b.getFullYear()
    return `${years} (born ${mm}/${dd}/${yyyy})`
  }

  const formatHometown = () => {
    const parts = []
    if (player.homeTown) parts.push(player.homeTown)
    if (player.homeState) parts.push(player.homeState)
    if (player.homeCountry) parts.push(player.homeCountry)
    return parts.length > 0 ? parts.join(", ") : "-"
  }


  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #0053BC 0%, #00285E 100%)',
        pt: 3,
        pb: 6,
      }}
    >
      <Container maxWidth="xl">
        {/* Back link */}
        <Box sx={{ mb: 3 }}>
          <RouterLink
            to="/"
            style={{
              textDecoration: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            <ArrowBackIcon sx={{ mr: 1 }} /> Back to Draft Hub
          </RouterLink>
        </Box>

        {/* Player Bio Section */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 4,
            mb: 3,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box
                component="img"
                src={player.photoUrl}
                alt={player.name}
                sx={{
                  width: "100%",
                  maxWidth: 250,
                  height: 250,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: "2px solid #00538C",
                }}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    color: "#00223E",
                    mr: 2,
                  }}
                >
                  {player.name}
                </Typography>
                <IconButton
                  onClick={handleFavoriteClick}
                  sx={{
                    color: isFavorited ? "#FFD700" : "#ccc",
                    "&:hover": {
                      color: isFavorited ? "#FFA500" : "#FFD700",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  size="large"
                >
                  {isFavorited ? <StarIcon sx={{ fontSize: 40 }} /> : <StarBorderIcon sx={{ fontSize: 40 }} />}
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <strong>Height:</strong> {formatHeight(meas.heightShoes)}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <strong>Weight:</strong> {meas.weight ? `${meas.weight} lbs` : "-"}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <strong>High School:</strong>{" "}
                    {player.highSchool ? `${player.highSchool} (${player.highSchoolState || "-"})` : "-"}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <strong>Current Team:</strong> {player.currentTeam || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <strong>League:</strong> {player.league || "-"}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <strong>Hometown:</strong> {formatHometown()}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <strong>Nationality:</strong> {player.nationality || "-"}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    <strong>Age:</strong> {formatAge()}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

        {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTab}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                minWidth: 120,
              },
              "& .Mui-selected": {
                color: "#00538C !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#00538C",
              },
            }}
          >
            <Tab label="Measurements" />
            <Tab label="Stats" />
            <Tab label="Compare" />
            <Tab label="Scouting" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 4 }}>
            {/* Measurements Tab */}
            {tab === 0 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, color: "#00223E", fontWeight: "bold" }}>
                  Physical Measurements
                </Typography>
                <Grid container spacing={3}>
                  {/* Column 1 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Height (no shoes):</strong> {formatHeight(meas.heightNoShoes)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Height (with shoes):</strong> {formatHeight(meas.heightShoes)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Wingspan:</strong> {formatHeight(meas.wingspan)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Standing Reach:</strong> {meas.reach ? `${meas.reach} inches` : "-"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Max Vertical:</strong> {meas.maxVertical ? `${meas.maxVertical}"` : "-"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>No-Step Vertical:</strong> {meas.noStepVertical ? `${meas.noStepVertical}"` : "-"}
                    </Typography>
                  </Grid>

                  {/* Column 2 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Weight:</strong> {meas.weight ? `${meas.weight} lbs` : "-"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Body Fat:</strong> {meas.bodyFat != null ? `${meas.bodyFat}%` : "-"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Hand Length:</strong> {meas.handLength ? `${meas.handLength}"` : "-"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Hand Width:</strong> {meas.handWidth ? `${meas.handWidth}"` : "-"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Agility (shuttle):</strong> {meas.shuttleBest ? `${meas.shuttleBest} sec` : "-"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: "1.1rem" }}>
                      <strong>Sprint:</strong> {meas.sprint ? `${meas.sprint} sec` : "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Stats Tab */}
            {tab === 1 && (
              <Box>
                {/* Game Logs header + table */}
                <Box sx={{ mb: 2 }}>
                  {/* header */}
                  <Box
                    sx={{
                      backgroundColor: "#00538C",
                      color: "white",
                      px: 2,
                      py: 1,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    }}
                  >
                    <Typography variant="h6">Game Logs</Typography>
                  </Box>

                  {/* table container */}
                  <Box
                    sx={{
                      overflowX: "auto",
                      border: "1px solid #ddd",
                      borderTop: "none",
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
                      "& table th, & table td": { textAlign: "center" },
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead style={{ backgroundColor: "#00538C", color: "white" }}>
                        <tr>
                          {[
                            "Date",
                            "Opponent",
                            "MIN",
                            "PTS",
                            "FGM-FGA",
                            "FG%",
                            "3PM-3PA",
                            "3P%",
                            "AST",
                            "TOV",
                            "REB",
                            "ORB",
                            "DRB",
                            "STL",
                            "BLK",
                            "FLS",
                            "Result",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                                fontSize: "0.9rem",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {gameLog.length > 0 ? (
                          gameLog.map((g, i) => {
                            const isWin = g.homeTeamPts > g.visitorTeamPts
                            const dateOnly = g.date.split(" ")[0]
                            return (
                              <tr key={i} style={{ backgroundColor: i % 2 ? "#f9f9f9" : "white" }}>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{dateOnly}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.opponent}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.timePlayed}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.pts}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{`${g.fgm}-${g.fga}`}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                  {`${g["fg%"]}%` || g.fgPct || "-"}
                                </td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{`${g.tpm}-${g.tpa}`}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                                  {(g.tpa ?? 0) > 0 ? `${g["tp%"] ?? g.threePct ?? 0}%` : "-"}
                                </td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.ast}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.tov}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.reb}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.oreb}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.dreb}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.stl}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.blk}</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{g.pf}</td>
                                <td
                                  style={{
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    color: isWin ? "green" : "red",
                                  }}
                                >
                                  {isWin ? "W" : "L"}
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan="17" style={{ padding: "20px", color: "#666" }}>
                              No game log data available for this player
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Box>
                </Box>

                {/* Season Logs (header + table) */}
                <Box sx={{ mb: 2 }}>
                  {/* header */}
                  <Box
                    sx={{
                      backgroundColor: "#00538C",
                      color: "white",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Typography variant="h6">Season Logs</Typography>
                    <Box>
                      <Button
                        size="small"
                        onClick={() => setSeasonMode("avg")}
                        sx={{
                          border: seasonMode === "avg" ? "2px solid white" : "none",
                          color: "#fff",
                          textTransform: "none",
                          backgroundColor: "transparent",
                          "&:hover": { backgroundColor: "black" },
                        }}
                      >
                        AVG
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setSeasonMode("tot")}
                        sx={{
                          ml: 1,
                          border: seasonMode === "tot" ? "2px solid white" : "none",
                          color: "#fff",
                          textTransform: "none",
                          backgroundColor: "transparent",
                          "&:hover": { backgroundColor: "black" },
                        }}
                      >
                        TOT
                      </Button>
                    </Box>
                  </Box>

                  {/* table */}
                  <Box sx={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ backgroundColor: "#00538C", color: "white" }}>
                        <tr>
                          {seasonColumns.map((col) => (
                            <th
                              key={col.label}
                              style={{
                                padding: "10px",
                                border: "1px solid #ddd",
                                fontSize: "0.9rem",
                                textAlign: "center",
                              }}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {seasonLog.length > 0 ? (
                          seasonLog.map((s, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 ? "#f9f9f9" : "white" }}>
                              {seasonColumns.map((col) => (
                                <td
                                  key={col.label}
                                  style={{
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    fontSize: "0.85rem",
                                    textAlign: "center",
                                  }}
                                >
                                  {col.getValue(s)}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={seasonColumns.length}
                              style={{ padding: "20px", textAlign: "center", color: "#666" }}
                            >
                              No season stats data available for this player
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Compare Players Tab */}
            {tab === 2 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, color: "#00223E", fontWeight: "bold" }}>
                  Choose Player Comparison
                </Typography>

                {/* Enhanced Player Selection */}
                <Box sx={{ mb: 4 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: "#00538C",
                          borderRadius: 2,
                          color: "white",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {player.name}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {player.currentTeam} • {player.league}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={1} sx={{ textAlign: "center" }}>
                      <Typography variant="h4" sx={{ color: "#00538C", fontWeight: "bold" }}>
                        VS
                      </Typography>
                    </Grid>

                    <Grid item xs={12}
                    md={8}
                    container
                    justifyContent="flex-end"
                    >
                      {!comparePlayer ? (
                        <Box
                          sx={{
                            p: 3,
                            border: "2px dashed #ccc",
                            borderRadius: 2,
                            width : 400,
                            bgcolor: "#f9f9f9",
                          }}
                        >
                          <Autocomplete
                            options={data.bio.filter((p) => p.playerId !== id)}
                            getOptionLabel={(p) => p.name}
                            onChange={(_, p) => setCompareId(p?.playerId || null)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select player to compare"
                                variant="outlined"
                                sx={{
                                  width: "100%",
                                  "& .MuiOutlinedInput-root": {
                                    bgcolor: "white",
                                  },
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props} sx={{ p: 2, minWidth: "400px" }}>
                                <Box sx={{ width: "100%" }}>
                                  <Typography variant="body1" sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                                    {option.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                    {option.currentTeam} • {option.league}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            ListboxProps={{
                              sx: {
                                maxHeight: "300px",
                                "& .MuiAutocomplete-option": {
                                  minWidth: "400px",
                                },
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            p: 3,
                            bgcolor: "#FF6B35",
                            borderRadius: 2,
                            color: "white",
                            textAlign: "center",
                            position: "relative",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => setCompareId(null)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              color: "white",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                            }}
                          >
                            ✕
                          </IconButton>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {comparePlayer.name}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {comparePlayer.currentTeam} • {comparePlayer.league}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>

                {!comparePlayer && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary" variant="h6">
                      Select a player above to start comparing
                    </Typography>
                  </Box>
                )}

                {comparePlayer && (
                  <>
                    {/* Season Statistics with Bar Charts */}
                    <Accordion
                      expanded={openSections.season}
                      onChange={() => setOpenSections((s) => ({ ...s, season: !s.season }))}
                      sx={{ mb: 2 , backgroundColor: "#f5f5f5" }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                          <Typography sx={{ flexGrow: 1 }}>Season Statistics</Typography>
                          <IconButton size="small" onClick={(e) => openSettings(e, "season")}>
                            <SettingsIcon />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ p: 2 }}>
                          {visibleFields.season.map((metric) => {
                            const left = Number.parseFloat(playerSeasonStats[metric]) || 0
                            const right = Number.parseFloat(compareSeasonStats[metric]) || 0
                            // Define realistic maximum values for proper scaling
                            const getMaxValue = (metric) => {
                              switch (metric) {
                                case "PPG":
                                case "PTS":
                                  return 40 // 40 points per game is elite
                                case "APG":
                                  return 15 // 15 assists per game is elite
                                case "RPG":
                                  return 20 // 20 rebounds per game is elite
                                case "MPG":
                                  return 40 // 40 minutes per game is maximum
                                case "3P%":
                                case "FT%":
                                  return 100 // Percentages go to 100%
                                case "FGM":
                                  return 20 // 20 field goals made per game is elite
                                case "FGA":
                                  return 30 // 30 field goal attempts per game is high volume
                                default:
                                  return Math.max(left, right, 10) // Fallback for other stats
                              }
                            }

                            const maxValue = getMaxValue(metric)

                            // Format display values based on metric type
                            const formatValue = (val) => {
                              if (!val && val !== 0) return "-"
                              if (metric.includes("%")) return `${val}%`
                              return typeof val === "number" ? val.toFixed(1) : val
                            }

                            return (
                              <Box key={metric} sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#00538C" }}>
                                  {metric}
                                </Typography>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                  {/* Left player bar */}
                                  <Box sx={{ flex: 1, textAlign: "right" }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        mb: 0.5,
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{ mr: 1, minWidth: "50px", color: "#00538C", fontWeight: "bold" }}
                                      >
                                        {formatValue(left)}
                                      </Typography>
                                      <Box
                                        sx={{
                                          height: 20,
                                          width: `${left ? (left / maxValue) * 100 : 0}%`,
                                          maxWidth: "200px",
                                          bgcolor: "#00538C",
                                          borderRadius: "4px 0 0 4px",
                                          transition: "width 0.3s ease",
                                          minWidth: left > 0 ? "8px" : "0px",
                                        }}
                                      />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {player.name}
                                    </Typography>
                                  </Box>

                                  {/* Center divider */}
                                  <Box sx={{ width: 2, height: 30, bgcolor: "#ddd", borderRadius: 1 }} />

                                  {/* Right player bar */}
                                  <Box sx={{ flex: 1, textAlign: "left" }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        mb: 0.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          height: 20,
                                          width: `${right ? (right / maxValue) * 100 : 0}%`,
                                          maxWidth: "200px",
                                          bgcolor: "#FF6B35",
                                          borderRadius: "0 4px 4px 0",
                                          transition: "width 0.3s ease",
                                          minWidth: right > 0 ? "8px" : "0px",
                                        }}
                                      />
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1, minWidth: "50px", color: "#FF6B35", fontWeight: "bold" }}
                                      >
                                        {formatValue(right)}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {comparePlayer.name}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Show advantage indicator */}
                                {left !== 0 && right !== 0 && (
                                  <Box sx={{ textAlign: "center", mt: 1 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: left > right ? "#00538C" : "#FF6B35",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {left > right
                                        ? `${player.name} leads by ${formatValue(Math.trunc((left - right) * 100) / 100)}`
                                        : `${comparePlayer.name} leads by ${formatValue(Math.trunc((right - left) * 100) / 100)}`}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            )
                          })}
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    {/* Scout Rankings */}
                    <Accordion
                    expanded={openSections.scouting}
                    onChange={() => setOpenSections(s => ({ ...s, scouting: !s.scouting }))}
                    sx={{ mb: 2, backgroundColor: "#f5f5f5" }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <Typography sx={{ flexGrow: 1 }}>Scout Rankings</Typography>
                        <IconButton size="small" onClick={e => openSettings(e, "scouting")}>
                          <SettingsIcon />
                        </IconButton>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                        {visibleFields.scouting.length > 0 ? (
                          <Box sx={{ p: 2 }}>
                            {visibleFields.scouting.map((scout) => {
                              const playerRank = ranking[scout] ?? null
                              const compareRank =
                                (data.scoutRankings.find((r) => r.playerId === compareId) || {})[scout] ?? null

                              // For rankings, lower numbers are better, so we need to handle the comparison differently
                              const formatRank = (rank) => (rank ? `#${rank}` : "Unranked")

                              return (
                                <Box key={scout} sx={{ mb: 3 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#00538C" }}>
                                    {scout
                                      .replace(/ Rank$/, "")
                                      .replace(/([A-Z])/g, " $1")
                                      .trim()}
                                  </Typography>

                                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    {/* Left player */}
                                    <Box sx={{ flex: 1, textAlign: "right" }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "flex-end",
                                          mb: 0.5,
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ mr: 1, minWidth: "80px", color: "#00538C", fontWeight: "bold" }}
                                        >
                                          {formatRank(playerRank)}
                                        </Typography>
                                        <Box
                                          sx={{
                                            height: 20,
                                            width: playerRank ? `${Math.max(10, (61 - playerRank) * 1.5)}px` : "0px",
                                            maxWidth: "150px",
                                            bgcolor: "#00538C",
                                            borderRadius: "4px 0 0 4px",
                                            transition: "width 0.3s ease",
                                          }}
                                        />
                                      </Box>
                                      <Typography variant="caption" color="text.secondary">
                                        {player.name}
                                      </Typography>
                                    </Box>

                                    {/* Center divider */}
                                    <Box sx={{ width: 2, height: 30, bgcolor: "#ddd", borderRadius: 1 }} />

                                    {/* Right player */}
                                    <Box sx={{ flex: 1, textAlign: "left" }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "flex-start",
                                          mb: 0.5,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            height: 20,
                                            width: compareRank ? `${Math.max(10, (61 - compareRank) * 1.5)}px` : "0px",
                                            maxWidth: "150px",
                                            bgcolor: "#FF6B35",
                                            borderRadius: "0 4px 4px 0",
                                            transition: "width 0.3s ease",
                                          }}
                                        />
                                        <Typography
                                          variant="body2"
                                          sx={{ ml: 1, minWidth: "80px", color: "#FF6B35", fontWeight: "bold" }}
                                        >
                                          {formatRank(compareRank)}
                                        </Typography>
                                      </Box>
                                      <Typography variant="caption" color="text.secondary">
                                        {comparePlayer.name}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Show advantage indicator */}
                                  {playerRank && compareRank && (
                                    <Box sx={{ textAlign: "center", mt: 1 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: playerRank < compareRank ? "#00538C" : "#FF6B35",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {playerRank < compareRank
                                          ? `${player.name} ranked ${compareRank - playerRank} spots higher`
                                          : `${comparePlayer.name} ranked ${playerRank - compareRank} spots higher`}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              )
                            })}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            No scout rankings available for comparison.
                          </Typography>
                        )}
                      </AccordionDetails>
                  </Accordion>



                    {/* Measurements with Bar Charts */}
                    <Accordion
                      expanded={openSections.measurements}
                      onChange={() => setOpenSections((s) => ({ ...s, measurements: !s.measurements }))}
                      sx={{ mb: 2 , backgroundColor: "#f5f5f5"}}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                          <Typography sx={{ flexGrow: 1 }}>Measurements</Typography>
                          <IconButton size="small" onClick={(e) => openSettings(e, "measurements")}>
                            <SettingsIcon />
                          </IconButton>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ p: 2 }}>
                          {visibleFields.measurements.map((m) => {
                            const left = playerMeasure[m] ?? 0
                            const right = compareMeasure[m] ?? 0
                            // Define realistic maximum values for measurements
                            const getMaxValue = (measurement) => {
                              switch (measurement) {
                                case "heightNoShoes":
                                case "heightShoes":
                                  return 84 // 7 feet in inches
                                case "wingspan":
                                  return 90 // 7'6" wingspan
                                case "reach":
                                  return 120 // 10 feet standing reach
                                case "weight":
                                  return 300 // 300 lbs
                                case "maxVertical":
                                case "noStepVertical":
                                  return 50 // 50 inch vertical
                                case "bodyFat":
                                  return 25 // 25% body fat
                                case "handLength":
                                case "handWidth":
                                  return 12 // 12 inches
                                case "shuttleBest":
                                case "sprint":
                                  return 15 // 15 seconds (lower is better, but for bar length)
                                default:
                                  return Math.max(left, right, 10)
                              }
                            }

                            const maxValue = getMaxValue(m)

                            return (
                              <Box key={m} sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#00538C" }}>
                                  {m.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </Typography>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                  {/* Left player bar */}
                                  <Box sx={{ flex: 1, textAlign: "right" }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        mb: 0.5,
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{ mr: 1, minWidth: "40px", color: "#00538C", fontWeight: "bold" }}
                                      >
                                        {left || "-"}
                                      </Typography>
                                      <Box
                                        sx={{
                                          height: 20,
                                          width: `${left ? (left / maxValue) * 100 : 0}%`,
                                          maxWidth: "200px",
                                          bgcolor: "#00538C",
                                          borderRadius: "4px 0 0 4px",
                                          transition: "width 0.3s ease",
                                        }}
                                      />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {player.name}
                                    </Typography>
                                  </Box>

                                  {/* Center divider */}
                                  <Box sx={{ width: 2, height: 30, bgcolor: "#ddd", borderRadius: 1 }} />

                                  {/* Right player bar */}
                                  <Box sx={{ flex: 1, textAlign: "left" }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        mb: 0.5,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          height: 20,
                                          width: `${right ? (right / maxValue) * 100 : 0}%`,
                                          maxWidth: "200px",
                                          bgcolor: "#FF6B35",
                                          borderRadius: "0 4px 4px 0",
                                          transition: "width 0.3s ease",
                                        }}
                                      />
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1, minWidth: "40px", color: "#FF6B35", fontWeight: "bold" }}
                                      >
                                        {right || "-"}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {comparePlayer.name}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )
                          })}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}

                {/* Settings Menu */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeSettings}>
                  {allFields[currentSec]?.map((field) => (
                    <MenuItem key={field}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={visibleFields[currentSec]?.includes(field)}
                            onChange={() => toggleField(currentSec, field)}
                          />
                        }
                        label={field}
                      />
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}

            {/* Scouting Information Tab */}
            {tab === 3 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 3, color: "#00223E", fontWeight: "bold" }}>
                  Scouting Information
                </Typography>

                {/* Numeric Rankings */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "#00538C", fontWeight: "bold" }}>
                    Scout Ratings
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(ranking)
                      .filter(([k]) => k !== "playerId")
                      .map(([scout, val]) => (
                        <Grid item xs={12} sm={6} md={4} key={scout}>
                          <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="body1">
                              <strong>{scout.replace(/ Rank$/, "")}:</strong> {val ?? "-"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                  </Grid>
                  {Object.keys(ranking).length <= 1 && (
                    <Typography variant="body2" color="text.secondary">
                      No scout rankings available for this player.
                    </Typography>
                  )}
                </Box>

                {/* Official Written Reports */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "#00538C", fontWeight: "bold" }}>
                    Scout Reports
                  </Typography>
                  {reports.length > 0 ? (
                    reports.map((r, i) => (
                      <Box
                        key={i}
                        sx={{ mb: 3, p: 3, bgcolor: "#f9f9f9", borderRadius: 2, border: "1px solid #e0e0e0" }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#00538C", mb: 1 }}>
                          {r.scout || r.scoutName || "Anonymous Scout"}
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {r.report}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No official reports available for this player.
                    </Typography>
                  )}
                </Box>

                {/* Form to add your own */}
                <Box variant="outlined" sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "#00538C", fontWeight: "bold" }}>
                    Add Your Own Report
                  </Typography>
                  <Box>
                    {/* Ranking selector */}
                    <Box>
                      <TextField
                        label="Your Draft Ranking"
                        type="number"
                        value={customRating}
                        onChange={(e) => setCustomRating(e.target.value)}
                        fullWidth
                        inputProps={{ min: 1, max: 100 }}
                        placeholder="Enter draft position (1-100)"
                      />
                    </Box>

                    {/* Free-text report */}
                    <TextField
                      label="Your Comments"
                      placeholder="What did you like? What can they improve?"
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                    />

                    {/* Submit button */}
                    <Box sx={{ textAlign: "right" }}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddReport}
                        disabled={!customRating || !customText.trim()}
                        sx={{
                          backgroundColor: "#00538C",
                          "&:hover": { backgroundColor: "#00223E" },
                        }}
                      >
                        Add Report
                      </Button>
                    </Box>
                  </Box>
                </Box>

                {/* Display your own reports */}
                {myReports.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ color: "#00538C", fontWeight: "bold" }}>
                      Your Reports
                    </Typography>
                    {myReports.map((r, i) => (
                      <Box
                        key={i}
                        sx={{ mb: 2, p: 3, bgcolor: "#e8f5e8", borderRadius: 2, border: "1px solid #c8e6c9" }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#2e7d32", mb: 1 }}>
                          Your Ranking: #{r.rating}
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                          {r.text}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
