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
  auditConversion: 0,
  totalGrants: 0,
  organizations: [],
  energyData: [],
  recommendedActions: [],
  reports: [],
  applicationStatus: {
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    total: 0
  },
  auditors: [],
  regions: [],
  industries: [],
  recommendedGrants: []
};

// Initialize with sample data (only for dev/demo purposes)
function initializeSampleData() {
  // Only initialize if no data exists yet
  if (dashboardData.totalAudits === 0) {
    dashboardData = {
      totalAudits: 130,
      totalEmissionsSaved: 578.45,
      totalEuroSaved: 425000,
      auditConversion: 68,
      totalGrants: 185000,
      organizations: ["Tech Solutions Inc.", "EcoFriendly Manufacturing", "Dublin City Council", "Cork Hospital", "Galway University", "Limerick Retail Center"],
      energyData: [
        { type: "Electricity", usage: 250000, cost: 45000, emissions: 120 },
        { type: "Natural Gas", usage: 320000, cost: 32000, emissions: 180 },
        { type: "Oil", usage: 150000, cost: 18000, emissions: 90 }
      ],
      recommendedActions: [
        { name: "Solar PV Installation", energySavings: 75000, costSavings: 12000, emissionsReduction: 35.2, status: "Implemented" },
        { name: "LED Lighting Upgrade", energySavings: 45000, costSavings: 8500, emissionsReduction: 22.5, status: "In Progress" },
        { name: "Heat Pump Replacement", energySavings: 62000, costSavings: 9800, emissionsReduction: 31.0, status: "Pending" },
        { name: "Building Insulation", energySavings: 54000, costSavings: 7200, emissionsReduction: 27.8, status: "Implemented" },
        { name: "Smart Energy Management", energySavings: 38000, costSavings: 6400, emissionsReduction: 19.5, status: "In Progress" }
      ],
      recommendedGrants: [
        { name: "SEAI Commercial Grant", amount: 45000, status: "Applied" },
        { name: "Energy Efficiency Fund", amount: 75000, status: "Eligible" },
        { name: "Green Business Fund", amount: 35000, status: "Recommended" },
        { name: "Renewable Heat Incentive", amount: 28000, status: "Eligible" }
      ],
      reports: [
        {
          fileName: "TechSolutions_Audit_2023.pdf",
          organizationName: "Tech Solutions Inc.",
          uploadDate: "2023-10-15T08:30:00.000Z",
          data: {
            totalCostSavings: 85000,
            totalEmissionsSaved: 120.5,
            emissionsReductionPct: 42,
            implementationStatus: "implemented",
            region: "dublin",
            industry: "technology"
          }
        },
        {
          fileName: "EcoFriendly_EnergyReport.pdf",
          organizationName: "EcoFriendly Manufacturing",
          uploadDate: "2023-11-20T10:45:00.000Z",
          data: {
            totalCostSavings: 105000,
            totalEmissionsSaved: 155.2,
            emissionsReductionPct: 38,
            implementationStatus: "in-progress",
            region: "cork",
            industry: "manufacturing"
          }
        },
        {
          fileName: "DublinCC_Audit.pdf",
          organizationName: "Dublin City Council",
          uploadDate: "2023-12-05T14:20:00.000Z",
          data: {
            totalCostSavings: 78000,
            totalEmissionsSaved: 95.5,
            emissionsReductionPct: 35,
            implementationStatus: "pending",
            region: "dublin",
            industry: "public"
          }
        },
        {
          fileName: "Hospital_Energy_Report.pdf",
          organizationName: "Cork Hospital",
          uploadDate: "2024-01-10T09:15:00.000Z",
          data: {
            totalCostSavings: 92000,
            totalEmissionsSaved: 110.8,
            emissionsReductionPct: 40,
            implementationStatus: "implemented",
            region: "cork",
            industry: "healthcare"
          }
        }
      ],
      applicationStatus: {
        pending: 15,
        inProgress: 28,
        completed: 45,
        rejected: 12,
        total: 100
      },
      auditors: [
        { 
          name: "Emma Thompson", 
          role: "Senior Auditor",
          avatar: "",
          auditsCompleted: 52, 
          conversionRate: 68, 
          avgEnergySavings: 45000, 
          avgCostSavings: 3200 
        },
        { 
          name: "Michael Chen", 
          role: "Energy Consultant",
          avatar: "",
          auditsCompleted: 38, 
          conversionRate: 72, 
          avgEnergySavings: 52000, 
          avgCostSavings: 4100 
        },
        { 
          name: "Sarah Johnson", 
          role: "Audit Specialist",
          avatar: "",
          auditsCompleted: 47, 
          conversionRate: 65, 
          avgEnergySavings: 41000, 
          avgCostSavings: 3500 
        },
        { 
          name: "David Okoro", 
          role: "Technical Advisor",
          avatar: "",
          auditsCompleted: 35, 
          conversionRate: 70, 
          avgEnergySavings: 47000, 
          avgCostSavings: 3800 
        }
      ],
      regions: ["Dublin", "Cork", "Galway", "Limerick"],
      industries: ["Manufacturing", "Commercial", "Healthcare", "Education", "Hospitality", "Technology"]
    };
  }
}

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
      recommendedActions: [],
      grantAmount: 0, // New field for tracking grants
      implementationStatus: "pending", // New field for tracking implementation status
      region: "", // Region field
      industry: "" // Industry field
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
    
    // Extract grant amount (new feature)
    const grantMatch = allText.match(/grant amount.*?[€$]([0-9,]+)/i);
    if (grantMatch) {
      extractedData.grantAmount = parseFloat(grantMatch[1].replace(/,/g, ''));
      console.log(`Found grant amount: €${extractedData.grantAmount}`);
    } else {
      // Generate a random grant amount for demo purposes
      extractedData.grantAmount = Math.round(extractedData.totalCostSavings * 0.3);
      console.log(`Generated sample grant amount: €${extractedData.grantAmount}`);
    }

    // Try to extract region and industry
    if (allText.includes("Dublin") || allText.includes("dublin")) {
      extractedData.region = "dublin";
    } else if (allText.includes("Cork") || allText.includes("cork")) {
      extractedData.region = "cork";
    } else if (allText.includes("Galway") || allText.includes("galway")) {
      extractedData.region = "galway";
    } else if (allText.includes("Limerick") || allText.includes("limerick")) {
      extractedData.region = "limerick";
    }

    // Try to determine industry
    if (allText.includes("manufacturing") || allText.includes("Manufacturing")) {
      extractedData.industry = "manufacturing";
    } else if (allText.includes("commercial") || allText.includes("Commercial")) {
      extractedData.industry = "commercial";
    } else if (allText.includes("healthcare") || allText.includes("Healthcare") || allText.includes("Hospital")) {
      extractedData.industry = "healthcare";
    } else if (allText.includes("education") || allText.includes("Education") || allText.includes("School") || allText.includes("University")) {
      extractedData.industry = "education";
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
            // Randomly assign a status for demo purposes
            const statuses = ["Pending", "In Progress", "Implemented"];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            const action = {
              name: actionName,
              energySavings: energySavings,
              costSavings: costSavings,
              emissionsReduction: emissionsReduction,
              status: randomStatus
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
    console.log(`- Grant amount: €${extractedData.grantAmount}`);
    console.log(`- Region: ${extractedData.region}`);
    console.log(`- Industry: ${extractedData.industry}`);
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
      grantAmount: 0,
      implementationStatus: "pending",
      region: "",
      industry: "",
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
    
    // Extract or generate a grant amount
    const grantMatch = text.match(/grant amount.*?[€$]([0-9,]+)/i);
    if (grantMatch) {
      extractedData.grantAmount = parseFloat(grantMatch[1].replace(/,/g, ''));
      console.log(`Found grant amount: €${extractedData.grantAmount}`);
    } else {
      // For demo purposes, estimate grant as 30% of cost savings
      extractedData.grantAmount = Math.round((extractedData.totalCostSavings || 0) * 0.3);
      console.log(`Generated sample grant amount: €${extractedData.grantAmount}`);
    }
    
    // Try to extract region and industry based on the organization name or content
    if (text.includes("Dublin") || text.includes("dublin")) {
      extractedData.region = "dublin";
    } else if (text.includes("Cork") || text.includes("cork")) {
      extractedData.region = "cork";
    } else if (text.includes("Galway") || text.includes("galway")) {
      extractedData.region = "galway";
    } else if (text.includes("Limerick") || text.includes("limerick")) {
      extractedData.region = "limerick";
    }

    // Try to determine industry
    if (text.includes("manufacturing") || text.includes("Manufacturing")) {
      extractedData.industry = "manufacturing";
    } else if (text.includes("commercial") || text.includes("Commercial")) {
      extractedData.industry = "commercial";
    } else if (text.includes("healthcare") || text.includes("Healthcare") || text.includes("Hospital")) {
      extractedData.industry = "healthcare";
    } else if (text.includes("education") || text.includes("Education") || text.includes("School") || text.includes("University")) {
      extractedData.industry = "education";
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
      grantAmount: 0,
      implementationStatus: "pending",
      region: "",
      industry: "",
      energyData: [],
      recommendedActions: []
    };
  }
}

// Initialize default data on server start
initializeSampleData();

// API Endpoints
app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log("----------------------------");
  console.log("Upload endpoint called");
  console.log("----------------------------");
  
  // Log any additional form fields
  console.log("Form data received:", req.body);
  
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
      
      // Incorporate additional form data into the extracted data
      if (req.body.grantAmount) {
        extractedData.grantAmount = parseFloat(req.body.grantAmount);
      }
      
      if (req.body.implementationStatus) {
        extractedData.implementationStatus = req.body.implementationStatus;
      }
      
      if (req.body.auditorName) {
        extractedData.auditorName = req.body.auditorName;
      }
      
      if (req.body.buildingType) {
        extractedData.buildingType = req.body.buildingType;
      }
      
      if (req.body.region) {
        extractedData.region = req.body.region;
      }
      
      if (req.body.industry) {
        extractedData.industry = req.body.industry;
      }
      
      if (req.body.notes) {
        extractedData.notes = req.body.notes;
      }
      
      console.log("Enhanced extracted data with form inputs:", extractedData);
      
      // Initialize dashboard with sample data if it's the first upload
      if (dashboardData.totalAudits === 0) {
        initializeSampleData();
      }
      
      // Update dashboard data
      dashboardData.totalAudits += 1;
      dashboardData.totalEmissionsSaved += extractedData.totalEmissionsSaved || 0;
      dashboardData.totalEuroSaved += extractedData.totalCostSavings || 0;
      dashboardData.totalGrants += extractedData.grantAmount || 0;
      
      if (!dashboardData.organizations.includes(extractedData.organizationName)) {
        dashboardData.organizations.push(extractedData.organizationName);
      }
      
      // Track new regions and industries
      if (extractedData.region && !dashboardData.regions.includes(extractedData.region)) {
        dashboardData.regions.push(extractedData.region);
      }
      
      if (extractedData.industry && !dashboardData.industries.includes(extractedData.industry)) {
        dashboardData.industries.push(extractedData.industry);
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
      
      // Update application status
      dashboardData.applicationStatus.total += 1;
      
      if (extractedData.implementationStatus === 'pending') {
        dashboardData.applicationStatus.pending += 1;
      } else if (extractedData.implementationStatus === 'in-progress') {
        dashboardData.applicationStatus.inProgress += 1;
      } else if (extractedData.implementationStatus === 'implemented') {
        dashboardData.applicationStatus.completed += 1;
      } else {
        // Default to pending if status is unrecognized
        dashboardData.applicationStatus.pending += 1;
      }
      
      // Generate a recommended grant if not already present
      if (extractedData.grantAmount > 0) {
        const grantTypes = ["SEAI Commercial Grant", "Energy Efficiency Fund", "Green Business Fund", "Renewable Heat Incentive"];
        const grantStatuses = ["Applied", "Eligible", "Recommended"];
        
        const newGrant = {
          name: grantTypes[Math.floor(Math.random() * grantTypes.length)],
          amount: extractedData.grantAmount,
          status: grantStatuses[Math.floor(Math.random() * grantStatuses.length)],
          organization: extractedData.organizationName
        };
        
        dashboardData.recommendedGrants.push(newGrant);
      }
      
      // Calculate and update audit conversion rate
      const conversionReports = dashboardData.reports.filter(function(r) {
        return r.data && r.data.implementationStatus === 'implemented';
      });
      
      if (dashboardData.reports.length > 0) {
        dashboardData.auditConversion = Math.round((conversionReports.length / dashboardData.reports.length) * 100);
      }
      
      // Add the new report
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
  
  // Ensure we have sample data for demo purposes
  if (dashboardData.totalAudits === 0) {
    initializeSampleData();
  }
  
  res.json(dashboardData);
});

app.get('/api/reports', (req, res) => {
  console.log("Reports endpoint called");
  console.log(`Returning ${dashboardData.reports.length} reports`);
  
  // Ensure we have sample data for demo purposes
  if (dashboardData.reports.length === 0) {
    initializeSampleData();
  }
  
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