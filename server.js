const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { PDFExtract } = require('pdf.js-extract');
const pdfExtract = new PDFExtract();
const pdfParse = require('pdf-parse');

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
      const uploadDir = process.env.UPLOAD_DIRECTORY || path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
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

// Primary PDF extraction function
async function extractDataFromPDF(filePath, fileName) {
  try {
    // Log when extraction starts
    console.log(`Starting PDF extraction for ${fileName}`);
    
    const data = await pdfExtract.extract(filePath);
    
    // Log after successful extraction
    console.log(`Successfully extracted ${data.pages.length} pages from PDF ${fileName}`);
    
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
    console.log(`Combined text length: ${allText.length} characters`);
    
    // Extract organization name
    const orgMatch = allText.match(/For:\s*([^\n]+)/);
    if (orgMatch) {
      extractedData.organizationName = orgMatch[1].trim();
      console.log(`Found organization name: ${extractedData.organizationName}`);
    } else {
      console.log("No organization name found in PDF");
    }
    
    // Extract emissions reduction
    const emissionsMatch = allText.match(/emissions by (\d+)%/);
    if (emissionsMatch) {
      extractedData.emissionsReductionPct = parseInt(emissionsMatch[1]);
      console.log(`Found emissions reduction percentage: ${extractedData.emissionsReductionPct}%`);
    } else {
      console.log("No emissions reduction percentage found in PDF");
    }
    
    // Extract cost savings
    const savingsMatch = allText.match(/energy spend by [€$]([0-9,]+)/);
    if (savingsMatch) {
      extractedData.totalCostSavings = parseFloat(savingsMatch[1].replace(/,/g, ''));
      console.log(`Found total cost savings: €${extractedData.totalCostSavings}`);
    } else {
      console.log("No cost savings found in PDF");
    }
    
    // Find energy consumption data
    for (let i = 0; i < data.pages.length; i++) {
      const pageText = data.pages[i].content.map(item => item.str).join(' ');
      
      if (pageText.includes("Energy source") && pageText.includes("Annual Cost") && pageText.includes("Annual Use")) {
        console.log(`Found energy consumption table on page ${i+1}`);
        
        // Look for electricity data
        const elecRegex = /Electricity[^\n]*?€([0-9,.]+)[^\n]*?([0-9,.]+)\s*kWh[^\n]*?([0-9,.]+)/;
        const elecMatch = pageText.match(elecRegex);
        
        if (elecMatch) {
          const item = {
            type: "Electricity",
            cost: parseFloat(elecMatch[1].replace(/,/g, '')),
            usage: parseFloat(elecMatch[2].replace(/,/g, '')),
            emissions: parseFloat(elecMatch[3].replace(/,/g, ''))
          };
          
          extractedData.energyData.push(item);
          console.log(`Found electricity data: ${JSON.stringify(item)}`);
        } else {
          console.log("No electricity data found in energy table");
        }
        
        // Look for gas/oil data
        const gasRegex = /(Gas|Oil)[^\n]*?€([0-9,.]+)[^\n]*?([0-9,.]+)\s*kWh[^\n]*?([0-9,.]+)/;
        const gasMatch = pageText.match(gasRegex);
        
        if (gasMatch) {
          const item = {
            type: gasMatch[1],
            cost: parseFloat(gasMatch[2].replace(/,/g, '')),
            usage: parseFloat(gasMatch[3].replace(/,/g, '')),
            emissions: parseFloat(gasMatch[4].replace(/,/g, ''))
          };
          
          extractedData.energyData.push(item);
          console.log(`Found ${gasMatch[1]} data: ${JSON.stringify(item)}`);
        } else {
          console.log("No gas/oil data found in energy table");
        }
      }
      
      // Look for recommended actions
      if (pageText.includes("Recommended actions") || pageText.includes("recommended actions")) {
        console.log(`Found recommended actions section on page ${i+1}`);
        
        const actionMatches = Array.from(pageText.matchAll(/([A-Za-z\s]+)\s+([0-9,.]+)\s+(?:[A-Za-z\- ]+)\s+€([0-9,.]+)\s+([0-9,.]+)/g));
        let actionsFound = 0;
        
        for (const match of actionMatches) {
          const actionName = match[1].trim();
          const energySavings = parseFloat(match[2].replace(/,/g, ''));
          const costSavings = parseFloat(match[3].replace(/,/g, ''));
          const emissionsReduction = parseFloat(match[4].replace(/,/g, ''));
          
          if (energySavings > 0 || costSavings > 0) {
            const action = {
              name: actionName,
              energySavings: energySavings,
              costSavings: costSavings,
              emissionsReduction: emissionsReduction
            };
            
            extractedData.recommendedActions.push(action);
            extractedData.totalEnergySavings += energySavings;
            extractedData.totalEmissionsSaved += emissionsReduction;
            
            actionsFound++;
            console.log(`Found action: ${actionName}, energy savings: ${energySavings}, cost savings: €${costSavings}`);
          }
        }
        
        console.log(`Total actions found: ${actionsFound}`);
      }
    }
    
    // Log the final extracted data summary
    console.log("Extraction complete. Summary:");
    console.log(`- Organization: ${extractedData.organizationName}`);
    console.log(`- Total energy savings: ${extractedData.totalEnergySavings} kWh`);
    console.log(`- Total cost savings: €${extractedData.totalCostSavings}`);
    console.log(`- Total emissions saved: ${extractedData.totalEmissionsSaved} tonnes`);
    console.log(`- Energy data entries: ${extractedData.energyData.length}`);
    console.log(`- Recommended actions: ${extractedData.recommendedActions.length}`);
    
    return extractedData;
  } catch (error) {
    console.error(`ERROR processing ${fileName}:`, error);
    console.error(`Error stack: ${error.stack}`);
    return null;
  }
}

// Fallback extraction function
async function extractDataWithFallback(filePath, fileName) {
  try {
    // Try the primary method
    console.log("Attempting primary extraction method...");
    let result = null;
    
    try {
      result = await extractDataFromPDF(filePath, fileName);
    } catch (err) {
      console.log("Primary extraction failed:", err.message);
    }
    
    if (result) {
      console.log("Primary extraction succeeded");
      return result;
    }
    
    // If primary method fails, try the fallback
    console.log("Primary extraction failed or returned no data, trying fallback method...");
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    // Process the text content from pdf-parse
    const text = pdfData.text;
    console.log(`Extracted ${text.length} characters of text using fallback method`);
    
    // Create basic extracted data
    let extractedData = {
      organizationName: "Unknown",
      totalCostSavings: 0,
      totalEmissionsSaved: 0,
      totalEnergySavings: 0,
      energyData: [],
      recommendedActions: []
    };
    
    // Extract organization name
    const orgMatch = text.match(/For:\s*([^\n]+)/);
    if (orgMatch) {
      extractedData.organizationName = orgMatch[1].trim();
      console.log(`Found organization name: ${extractedData.organizationName}`);
    }
    
    // Extract emissions reduction
    const emissionsMatch = text.match(/emissions by (\d+)%/);
    if (emissionsMatch) {
      extractedData.emissionsReductionPct = parseInt(emissionsMatch[1]);
      console.log(`Found emissions reduction percentage: ${extractedData.emissionsReductionPct}%`);
    }
    
    // Extract cost savings
    const savingsMatch = text.match(/energy spend by [€$]([0-9,]+)/);
    if (savingsMatch) {
      extractedData.totalCostSavings = parseFloat(savingsMatch[1].replace(/,/g, ''));
      console.log(`Found total cost savings: €${extractedData.totalCostSavings}`);
    }
    
    return extractedData;
  } catch (error) {
    console.error(`Error in fallback extraction for ${fileName}:`, error);
    
    // Return a minimal data structure to prevent further errors
    return {
      organizationName: fileName.replace(".pdf", ""),
      totalCostSavings: 0,
      totalEmissionsSaved: 0,
      totalEnergySavings: 0,
      energyData: [],
      recommendedActions: []
    };
  }
}

// API Endpoints
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log("----------------------------");
  console.log("Upload endpoint called");
  console.log("----------------------------");
  
  try {
    if (!req.file) {
      console.log("Error: No file uploaded");
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log(`File received: ${req.file.originalname}, size: ${req.file.size} bytes`);
    console.log(`Saved to: ${req.file.path}`);
    
    try {
      const extractedData = await extractDataWithFallback(req.file.path, req.file.originalname);
      
      if (!extractedData) {
        console.log("Failed to extract data from PDF");
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
        fileName: req.file.originalname,
        organizationName: extractedData.organizationName,
        uploadDate: new Date().toISOString(),
        data: extractedData
      });
      
      console.log("Successfully processed file and updated dashboard data");
      
      res.json({
        success: true,
        extractedData,
        dashboardData
      });
    } catch (extractionError) {
      console.error("Error during PDF extraction:", extractionError);
      return res.status(500).json({ error: `Error extracting data: ${extractionError.message}` });
    }
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test upload endpoint - just for testing file uploads without PDF processing
app.post('/api/test-upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({ 
        status: 'error', 
        message: 'No file uploaded' 
      });
    }
    
    // Just acknowledge receipt of the file without processing
    res.json({
      status: 'success',
      message: 'File received successfully',
      file: {
        name: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error in test upload:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.get('/api/dashboard', (req, res) => {
  console.log("Dashboard endpoint called");
  console.log(`Returning data with ${dashboardData.reports.length} reports`);
  res.json(dashboardData);
});

app.get('/api/reports', (req, res) => {
  console.log("Reports endpoint called");
  console.log(`Returning ${dashboardData.reports.length} reports`);
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