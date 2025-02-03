import { useEffect, useState } from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { fetchBinCounts, deleteBinCount } from "../../utils/binApi"; // Import your API functions

const BinCount = () => {
  const [binCounts, setBinCounts] = useState([]);

  useEffect(() => {
    const getBinCounts = async () => {
      try {
        const data = await fetchBinCounts();
        setBinCounts(data);
      } catch (error) {
        console.error("Error fetching bin counts:", error);
      }
    };
    getBinCounts();
  }, []);

  const handleDeleteCount = async (id) => {
    try {
      await deleteBinCount(id);
      setBinCounts(binCounts.filter(count => count.id !== id));
    } catch (error) {
      console.error("Error deleting bin count:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Bin Count
      </Typography>
      <Button variant="contained" onClick={() => {/* Logic to add a new bin count */}}>
        Add Bin Count
      </Button>
      <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: 1 }}>
          <Box sx={{ flex: 1 }}>Bin #</Box>
          <Box sx={{ flex: 1 }}>Condition</Box>
          <Box sx={{ flex: 1 }}>Email Address</Box>
          <Box sx={{ flex: 1 }}>Total Tally</Box>
          <Box sx={{ flex: 1 }}>Actions</Box>
        </Box>
        {binCounts.map((count) => (
          <Box key={count.id} sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
            <Box sx={{ flex: 1 }}>{count.binId}</Box>
            <Box sx={{ flex: 1 }}>{count.condition}</Box>
            <Box sx={{ flex: 1 }}>{count.email}</Box>
            <Box sx={{ flex: 1 }}>{count.totalTally}</Box>
            <Box sx={{ flex: 1 }}>
              <Button onClick={() => handleDeleteCount(count.id)}>Delete</Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default BinCount;