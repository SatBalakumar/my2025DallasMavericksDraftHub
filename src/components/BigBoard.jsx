// src/components/BigBoard.jsx
import { useState, useMemo, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
Box,Typography,Paper,Stack,TextField,Avatar,FormControl,InputLabel,
Select,MenuItem,Table,TableBody,TableCell,TableContainer,TableHead,
TableRow,Pagination,Drawer,List,ListItem,ListItemAvatar,ListItemText,
IconButton,Button,Menu,Dialog,DialogTitle,DialogContent,DialogActions,
} from "@mui/material"
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material"

// Helpers
const calculateAge = (birthDate) => {
  if (!birthDate) return null
  const b = new Date(birthDate)
  const t = new Date()
  let age = t.getFullYear() - b.getFullYear()
  const m = t.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--
  return age
}

// convert things like 6'5" (or 6'5) into 6*12 + 5 = 77
const parseFeetInches = (str) => {
  const m = str.match(/^\s*(\d+)\s*'\s*(\d+)\s*"?\s*$/)
  if (m) return Number(m[1]) * 12 + Number(m[2])
  // otherwise just try a plain number
  const n = Number(str)
  return isNaN(n) ? NaN : n
}

const formatHeight = (inches) => {
  if (!inches) return "-"
  const ft = Math.floor(inches / 12)
  const inch = inches % 12
  return `${ft}'${inch}"`
}
const formatTeamLeague = (team, league) => {
  if (!team && !league) return "-"
  if (!team) return `(${league})`
  if (!league) return team
  return `${team} (${league})`
}

// Column definitions (same as before)…
const COLUMN_DEFINITIONS = {
  age: {
    label: "Age",
    accessor: (p) => p.age ?? "-",
  },
  height: {
    label: "Height",
    accessor: (p) => p.height,
  },
  weight: {
    label: "Weight",
    accessor: (p) => p.weight ?? "-",
  },
  espnrank: {
    label: "ESPN Rank",
    accessor: (p) => p.rankObj?.["ESPN Rank"] ?? "-",
  },
  samvecenie: {
    label: "Sam Vecenie Rank",
    accessor: (p) => p.rankObj?.["Sam Vecenie Rank"] ?? "-",
  },
  kevinoconnor: {
    label: "Kevin O'Connor Rank",
    accessor: (p) => p.rankObj?.["Kevin O'Connor Rank"] ?? "-",
  },
  kyleboone: {
    label: "Kyle Boone Rank",
    accessor: (p) => p.rankObj?.["Kyle Boone Rank"] ?? "-",
  },
  garyparrish: {
    label: "Gary Parrish Rank",
    accessor: (p) => p.rankObj?.["Gary Parrish Rank"] ?? "-",
  },
  average: {
    label: "Average Rank",
    accessor: (p) => (p.avg != null ? p.avg.toFixed(1) : "-"),
  },
}

// raw numeric extractors for filtering
const FILTER_ACCESSORS = {
  age:      (p) => p.age,
  height:   (p) => p.measurementObj?.heightShoes,
  weight:   (p) => p.measurementObj?.weight,
  wingspan: (p) => p.measurementObj?.wingspan,
  espnrank:   (p) => p.rankObj?.["ESPN Rank"],
  samvecenie: (p) => p.rankObj?.["Sam Vecenie Rank"],
  kevinoconnor:(p) => p.rankObj?.["Kevin O'Connor Rank"],
  kyleboone:  (p) => p.rankObj?.["Kyle Boone Rank"],
  garyparrish:(p) => p.rankObj?.["Gary Parrish Rank"],
  average:    (p) => p.avg,
}

export default function BigBoard({ data, favoritePlayers = [], onToggleFavorite }) {
  const navigate = useNavigate()
  const { bio, scoutRankings, measurements } = data

  // Search & enter-to-go
  const [searchTerm, setSearchTerm] = useState("")
  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      const match = players.find((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (match) navigate(`/player/${match.playerId}`)
    }
  }

  // Filtering & sorting
  const [filterField, setFilterField] = useState("age")
  const [filterComp,  setFilterComp]  = useState(">")
  const [filterValue, setFilterValue] = useState("")
  const [sortField,   setSortField]   = useState("espnrank")
  const [sortDir,     setSortDir]     = useState("asc")

  // Pagination
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  // Dynamic columns
  const [columns, setColumns] = useState([
    { key: "age",         label: "Age" },
    { key: "height",      label: "Height" },
    { key: "weight",      label: "Weight" },
    { key: "espnrank",    label: "ESPN Rank" },
    { key: "samvecenie",  label: "Sam Vecenie Rank" },
    { key: "kevinoconnor",label: "Kevin O'Connor Rank" },
    { key: "kyleboone",   label: "Kyle Boone Rank" },
    { key: "garyparrish", label: "Gary Parrish Rank" },
    { key: "average",     label: "Average Rank" },
  ])

  const [hiddenCols, setHiddenCols] = useState(() => new Set())

  // Use shared favorites instead of local state
  const favorites = favoritePlayers
  const [customRank, setCustomRank] = useState({})
  const [notes, setNotes] = useState({})
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [tmpRank, setTmpRank] = useState("")
  const [tmpNotes, setTmpNotes] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const SIDEBAR_WIDTH = sidebarOpen ? 230 : 80

  // Native DnD refs
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const toggleFavorite = (id) => {
    if (onToggleFavorite) onToggleFavorite(id)
    if (!favorites.includes(id)) {
      setCustomRank((cr) => ({ ...cr, [id]: favorites.length + 1 }))
    } else {
      const cr = { ...customRank }; delete cr[id]
      const nt = { ...notes }; delete nt[id]
      setCustomRank(cr); setNotes(nt)
    }
  }

  const openEdit = (id) => {
    setEditId(id)
    setTmpRank(customRank[id] ?? "")
    setTmpNotes(notes[id] ?? "")
    setEditOpen(true)
  }
  const saveEdit = () => {
    if (editId != null) {
      setCustomRank((cr) => ({ ...cr, [editId]: Number.parseInt(tmpRank) || 1 }))
      setNotes((n) => ({ ...n, [editId]: tmpNotes }))
    }
    setEditOpen(false)
    setEditId(null)
    setTmpRank("")
    setTmpNotes("")
  }

  // Build, filter, sort
  const players = useMemo(() => {
    return bio
      .map((player) => {
        const rankObj = scoutRankings.find((r) => r.playerId === player.playerId) || {}
        const measurementObj = measurements.find((m) => m.playerId === player.playerId) || {}
        const { playerId, ...scoutRanks } = rankObj
        const scores = Object.values(scoutRanks).filter((v) => typeof v === "number")
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
        const age = calculateAge(player.birthDate)
        const height = formatHeight(measurementObj.heightShoes)
        const weight = measurementObj.weight ? `${measurementObj.weight} lbs` : "-"
        const teamLeague = formatTeamLeague(player.currentTeam, player.league)
        return {...player,rankObj,measurementObj,avg,age,height,weight,teamLeague,}
      })
      // search by name, team or league
      .filter((p) => {
        if (!searchTerm) return true
        const t = searchTerm.toLowerCase()
        return (
          p.name.toLowerCase().includes(t) ||
          (p.currentTeam || "").toLowerCase().includes(t) ||
          (p.league || "").toLowerCase().includes(t)
        )
      })
      // favorites filter
      .filter((p) => {
        if (filterField === "favorite") {
          if (!filterValue) return true
          const isFav = favoritePlayers.includes(p.playerId)
          return filterValue === "fav" ? isFav : !isFav
        }
        return true
      })
      // numeric / height / wingspan / rank / avg filter
      .filter((p) => {
        if (filterField === "favorite" || !filterValue) return true
    
        // raw numeric value (inches / rank / age / avg)
        const raw = FILTER_ACCESSORS[filterField]?.(p)
        const pVal = raw != null ? Number(raw) : NaN
        let fVal
        if (filterField === "height" || filterField === "wingspan") {
            fVal = parseFeetInches(filterValue)
        } else {
            fVal = Number(filterValue)
        }
        if (isNaN(pVal) || isNaN(fVal)) return false
        return filterComp === ">" ? pVal > fVal : pVal < fVal
        })
        .filter((p) => {
          const scoutCols = ["espnrank","samvecenie","kevinoconnor","kyleboone","garyparrish"]
          if (scoutCols.includes(sortField)) {
              const val = FILTER_ACCESSORS[sortField]?.(p)
              return val != null && !isNaN(val)
          }
          return true
      })
      .sort((a, b) => {
        const aVal = FILTER_ACCESSORS[sortField]?.(a) ?? 0
        const bVal = FILTER_ACCESSORS[sortField]?.(b) ?? 0
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      })
  }, [bio, scoutRankings, measurements, searchTerm, filterField, filterComp, filterValue, sortField, sortDir])

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return players.slice(start, start + rowsPerPage)
  }, [players, page])

  // Prepare sidebar entries *only* from the original, un-filtered list
  // (or at least drop any that didn't survive the table filter)
  const favList = favorites
    .map((id) => {
      const bioP = bio.find((b) => b.playerId === id)
      if (!bioP) return null
      const rankObj = scoutRankings.find((r) => r.playerId === id) || {}
      const measurementObj = measurements.find((m) => m.playerId === id) || {}
      const { playerId, ...scoutRanks } = rankObj
      const scores = Object.values(scoutRanks).filter((v) => typeof v === "number")
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
      const age = calculateAge(bioP.birthDate)
      const height = formatHeight(measurementObj.heightShoes)
      const teamLeague = formatTeamLeague(bioP.currentTeam, bioP.league)
      return { ...bioP, rankObj, measurementObj, avg, age, height, teamLeague, customRank: customRank[id], notes: notes[id] }
    })
    .filter((p) => p)


  return (
    <Box sx={{ display: "flex", color: "#0053BC", minHeight: "100vh", background: 'linear-gradient(270deg, #002B5E 0%, #B8C4CA 100%)' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            p: 2,
            transition: "width .3s",
            top: "150px",
            height: "calc(100% - 150px)",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
          <IconButton onClick={() => setSidebarOpen((o) => !o)} size="small">
            {sidebarOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
        {sidebarOpen && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            Favorites
          </Typography>
        )}
        <List sx={{ p: 0 }}>
          {favList.map((p, idx) => (
            <ListItem
              key={p.playerId}
              draggable
              onDragStart={() => { dragItem.current = idx }}
              onDragEnter={() => { dragOverItem.current = idx }}
              onDragEnd={() => {
                const items = [...favorites]
                const src = dragItem.current
                const dst = dragOverItem.current
                const [moved] = items.splice(src, 1)
                items.splice(dst, 0, moved)
                // Note: This would need to update the parent state for full functionality
                // For now, this only works locally
              }}
              sx={{
                mb: 1,
                bgcolor: "#f0f0f0",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                cursor: "move",
              }}
            >
              <ListItemAvatar>
              <Avatar src={p.photoUrl} sx={{ bgcolor: "#00538C" }}>
                {p.name ? p.name.charAt(0) : ""}
              </Avatar>
              </ListItemAvatar>
              {sidebarOpen && (
                <ListItemText primary={`#${p.customRank} ${p.name}`} secondary={p.notes} sx={{ ml: 1 }} />
              )}
              {sidebarOpen && (
                <Box>
                  <IconButton onClick={() => openEdit(p.playerId)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => toggleFavorite(p.playerId)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, mr: `${SIDEBAR_WIDTH}px` }}>
        <Typography variant="h4" sx={{ mb: 3, color: "#002B5E", fontWeight: "bold" }}>
          2025 Dallas Mavericks DraftHub Home
        </Typography>

        {/* Search + Filters + Sort */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <SearchIcon sx={{ mr: 1, color: "#00538C" }} />
                <TextField
                  label="Search Players or Teams"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKey}
                />
              </Box>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  label="Filter"
                  value={filterField}
                  onChange={e => { setFilterField(e.target.value); setFilterValue(""); }}
                >
                  {[ ...Object.keys(COLUMN_DEFINITIONS), "favorite"].map(key => (
                    <MenuItem key={key} value={key}>
                      {key === "favorite" ? "Favorites" : COLUMN_DEFINITIONS[key].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {filterField !== "favorite" && (
                <FormControl size="small" sx={{ width: 80 }}>
                  <Select value={filterComp} onChange={e => setFilterComp(e.target.value)}>
                    <MenuItem value=">">&gt;</MenuItem>
                    <MenuItem value="<">&lt;</MenuItem>
                  </Select>
                </FormControl>
              )}
              {filterField === "favorite" ? (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Value</InputLabel>
                  <Select label="Value" value={filterValue} onChange={e => setFilterValue(e.target.value)} >
                    <MenuItem value="fav">Favorites</MenuItem>
                    <MenuItem value="non">Non-Favorites</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  size="small"
                  sx={{ width: 80 }}
                  value={filterValue}
                  onChange={e => setFilterValue(e.target.value)}
                />
              )}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select label="Sort By" value={sortField} onChange={(e) => setSortField(e.target.value)}>
                  {Object.keys(COLUMN_DEFINITIONS).map((key) => (
                    <MenuItem key={key} value={key}>
                      {COLUMN_DEFINITIONS[key].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select label="Dir" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
                  <MenuItem value="asc">Asc</MenuItem>
                  <MenuItem value="desc">Desc</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell>Team/League</TableCell>
                  {columns.map((col, i) => (
                    <TableCell
                      key={col.key}
                      align="center"
                      onClick={() => {
                        setHiddenCols(prev => {
                          const next = new Set(prev);
                          if (next.has(col.key)) next.delete(col.key);
                          else next.add(col.key);
                          return next;
                        });
                      }}
                      sx={{
                        cursor: "pointer",
                        color: hiddenCols.has(col.key) ? "grey" : "inherit",
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((p) => (
                  <TableRow key={p.playerId} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={p.photoUrl} sx={{ width: 30, height: 30, mr: 1 }} />
                        <Link
                          to={`/player/${p.playerId}`}
                          style={{ textDecoration: "none", color: "#00538C", fontWeight: "bold" }}
                        >
                          {p.name}
                        </Link>
                        <IconButton size="small" onClick={() => toggleFavorite(p.playerId)}>
                          {favorites.includes(p.playerId) ? (
                            <StarIcon sx={{ fontSize: 16, color: "#00538C" }} />
                          ) : (
                            <StarBorderIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "#00538C" }}>{p.teamLeague}</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} align="center">
                        {!hiddenCols.has(col.key) && COLUMN_DEFINITIONS[col.key].accessor(p)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Pagination
              count={Math.ceil(players.length / rowsPerPage)}
              page={page}
              onChange={(e, v) => setPage(v)}
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-page.Mui-selected": {
                  backgroundColor: "#00538C",
                  color: "white",
                },
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Favorite</DialogTitle>
        <DialogContent>
          <TextField
            label="Custom Rank"
            type="number"
            fullWidth
            value={tmpRank}
            onChange={(e) => setTmpRank(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            value={tmpNotes}
            onChange={(e) => setTmpNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit} sx={{ bgcolor: "#00538C" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
