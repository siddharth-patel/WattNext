const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PDFExtract } = require('pdf.js-extract');
const pdfExtract = new PDFExtract();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Store the extracted data
let dashboardData = {
  totalAudits: 0,
  totalEmissionsSaved: 0,
  totalEuroSaved: 0,
  organizations: [],
  energyData: [],
  recommendedActions: [],
  reports: []
};

// Extract data from PDF
async function extractDataFromPDF(filePath, fileName) {
  try {
    const data = await pdfExtract.extract(filePath);
    
    // Initialize extracted data
    let extractedData = {
      organizationName: "Unknown",
      totalCostSavings: 0,
      totalEmissionsSaved: 0,
      totalEnergySavings: 0,
      energyData: [],
      recommendedActions: []
    };
    
    // Combine all page content for searching
    const allText = data.pages.map(page => page.content.map(item => item.str).join(' ')).join(' ');
    
    // Extract organization name
    const orgMatch = allText.match(/For:\s*([^\n]+)/);
    if (orgMatch) {
      extractedData.organizationName = orgMatch[1].trim();
    }
    
    // Extract emissions reduction
    const emissionsMatch = allText.match(/emissions by (\d+)%/);
    if (emissionsMatch) {
      extractedData.emissionsReductionPct = parseInt(emissionsMatch[1]);
    }
    
    // Extract cost savings
    const savingsMatch = allText.match(/energy spend by [€$]([0-9,]+)/);
    if (savingsMatch) {
      extractedData.totalCostSavings = parseFloat(savingsMatch[1].replace(/,/g, ''));
    }
    
    // Find energy consumption data
    for (let i = 0; i < data.pages.length; i++) {
      const pageText = data.pages[i].content.map(item => item.str).join(' ');
      
      if (pageText.includes("Energy source") && pageText.includes("Annual Cost") && pageText.includes("Annual Use")) {
        // Look for electricity data
        const elecRegex = /Electricity[^\n]*?€([0-9,.]+)[^\n]*?([0-9,.]+)\s*kWh[^\n]*?([0-9,.]+)/;
        const elecMatch = pageText.match(elecRegex);
        
        if (elecMatch) {
          extractedData.energyData.push({
            type: "Electricity",
            cost: parseFloat(elecMatch[1].replace(/,/g, '')),
            usage: parseFloat(elecMatch[2].replace(/,/g, '')),
            emissions: parseFloat(elecMatch[3].replace(/,/g, ''))
          });
        }
        
        // Look for gas/oil data
        const gasRegex = /(Gas|Oil)[^\n]*?€([0-9,.]+)[^\n]*?([0-9,.]+)\s*kWh[^\n]*?([0-9,.]+)/;
        const gasMatch = pageText.match(gasRegex);
        
        if (gasMatch) {
          extractedData.energyData.push({
            type: gasMatch[1],
            cost: parseFloat(gasMatch[2].replace(/,/g, '')),
            usage: parseFloat(gasMatch[3].replace(/,/g, '')),
            emissions: parseFloat(gasMatch[4].replace(/,/g, ''))
          });
        }
      }
      
      // Look for recommended actions
      if (pageText.includes("Recommended actions") || pageText.includes("recommended actions")) {
        const actionMatches = pageText.matchAll(/([A-Za-z\s]+)\s+([0-9,.]+)\s+(?:[A-Za-z\- ]+)\s+€([0-9,.]+)\s+([0-9,.]+)/g);
        
        for (const match of actionMatches) {
          const actionName = match[1].trim();
          const energySavings = parseFloat(match[2].replace(/,/g, ''));
          const costSavings = parseFloat(match[3].replace(/,/g, ''));
          const emissionsReduction = parseFloat(match[4].replace(/,/g, ''));
          
          if (energySavings > 0 || costSavings > 0) {
            extractedData.recommendedActions.push({
              name: actionName,
              energySavings: energySavings,
              costSavings: costSavings,
              emissionsReduction: emissionsReduction
            });
            
            extractedData.totalEnergySavings += energySavings;
            extractedData.totalEmissionsSaved += emissionsReduction;
          }
        }
      }
    }
    
    return extractedData;
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return null;
  }
}

// API Endpoints
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    
    const extractedData = await extractDataFromPDF(filePath, fileName);
    
    if (!extractedData) {
      return res.status(400).json({ error: 'Failed to extract data from PDF' });
    }
    
    // Update dashboard data
    dashboardData.totalAudits += 1;
    dashboardData.totalEmissionsSaved += extractedData.totalEmissionsSaved || 0;
    dashboardData.totalEuroSaved += extractedData.totalCostSavings || 0;
    
    if (!dashboardData.organizations.includes(extractedData.organizationName)) {
      dashboardData.organizations.push(extractedData.organizationName);
    }
    
    dashboardData.energyData = dashboardData.energyData.concat(
      extractedData.energyData.map(item => ({
        ...item,
        organization: extractedData.organizationName
      }))
    );
    
    dashboardData.recommendedActions = dashboardData.recommendedActions.concat(
      extractedData.recommendedActions.map(item => ({
        ...item,
        organization: extractedData.organizationName
      }))
    );
    
    dashboardData.reports.push({
      fileName,
      organizationName: extractedData.organizationName,
      uploadDate: new Date().toISOString(),
      data: extractedData
    });
    
    res.json({
      success: true,
      extractedData,
      dashboardData
    });
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dashboard', (req, res) => {
  res.json(dashboardData);
});

app.get('/api/reports', (req, res) => {
  res.json(dashboardData.reports);
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});