export const industries = {
  "Advertising": {
    "revenue": [
      {"name": "Ad spend growth", "multiplicative": false, "method": "direct"},
      {"name": "Digital transformation projects", "multiplicative": false, "method": "direct"}
    ],
    "cogs": [
      {"name": "Media buying costs", "multiplicative": false, "method": "% of revenue"}
    ],
    "operating_expenses": [
      {"name": "Content creation expenses", "multiplicative": false, "method": "% of revenue"},
      {"name": "Client acquisition expenses", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Aerospace/Defense": {
    "revenue": [
      {"name": "Government contract revenue", "multiplicative": false, "method": "direct"},
      {"name": "Commercial aircraft sales", "multiplicative": false, "method": "direct"}
    ],
    "cogs": [
      {"name": "Raw material costs", "multiplicative": false, "method": "% of revenue"}
    ],
    "operating_expenses": [
      {"name": "Labor costs", "multiplicative": false, "method": "% of revenue"},
      {"name": "R&D expenses", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Air Transport": {
    "revenue": [
      {"name": "Passenger revenue", "multiplicative": true, "factors": ["ASK", "Load Factor", "Yield"]}
    ],
    "cogs": [
      {"name": "Fuel costs", "multiplicative": true, "factors": ["Fuel price", "Fuel consumption"]}
    ],
    "operating_expenses": [
      {"name": "Crew salaries", "multiplicative": false, "method": "% of revenue"},
      {"name": "Maintenance costs", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Apparel": {
    "revenue": [
      {"name": "Product line sales", "multiplicative": true, "factors": ["Units sold", "Average price"]}
    ],
    "cogs": [
      {"name": "Cost per unit", "multiplicative": true, "factors": ["Units sold", "Unit cost"]}
    ],
    "operating_expenses": [
      {"name": "SG&A", "multiplicative": false, "method": "% of revenue"},
      {"name": "Marketing expenses", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Auto & Truck": {
    "revenue": [
      {"name": "Vehicle sales volume", "multiplicative": true, "factors": ["Units sold", "Average selling price"]}
    ],
    "cogs": [
      {"name": "Raw materials cost", "multiplicative": false, "method": "% of vehicle revenue"}
    ],
    "operating_expenses": [
      {"name": "Labor costs", "multiplicative": false, "method": "% of revenue"},
      {"name": "Supply chain logistics", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Bank (Money Center)": {
    "revenue": [
      {"name": "Net interest income", "multiplicative": false, "method": "direct"},
      {"name": "Fee income", "multiplicative": false, "method": "direct"}
    ],
    "cogs": [],
    "operating_expenses": [
      {"name": "Compensation expense", "multiplicative": false, "method": "% of revenue"},
      {"name": "Technology costs", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [
      {"name": "Trading revenue", "multiplicative": false, "method": "direct"}
    ],
    "other_expenses": [
      {"name": "Loan loss provisions", "multiplicative": false, "method": "% of loans"}
    ]
  },
  "Banks (Regional)": {
    "revenue": [
      {"name": "Interest income", "multiplicative": false, "method": "direct"}
    ],
    "cogs": [],
    "operating_expenses": [
      {"name": "Branch network costs", "multiplicative": false, "method": "% of assets"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Beverage (Alcoholic)": {
    "revenue": [
      {"name": "Sales volume", "multiplicative": true, "factors": ["Units sold", "Average price"]}
    ],
    "cogs": [
      {"name": "Ingredients cost", "multiplicative": false, "method": "% of revenue"}
    ],
    "operating_expenses": [
      {"name": "Marketing expense", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Beverage (Soft)": {
    "revenue": [
      {"name": "Sales volume", "multiplicative": true, "factors": ["Units sold", "Average price"]}
    ],
    "cogs": [
      {"name": "Packaging cost", "multiplicative": false, "method": "% of revenue"}
    ],
    "operating_expenses": [
      {"name": "Distribution costs", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Biotechnology": {
    "revenue": [
      {"name": "Licensing income", "multiplicative": false, "method": "direct"}
    ],
    "cogs": [],
    "operating_expenses": [
      {"name": "R&D expenses", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Broadcasting": {
    "revenue": [
      {"name": "Advertising revenue", "multiplicative": false, "method": "% of viewership"}
    ],
    "cogs": [],
    "operating_expenses": [
      {"name": "Content acquisition costs", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Business & Consumer Services": {
    "revenue": [
      {"name": "Contract revenue", "multiplicative": false, "method": "direct"}
    ],
    "cogs": [],
    "operating_expenses": [
      {"name": "Labor expenses", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Brokerage & Investment Banking": {
    "revenue": [
      {"name": "Advisory fees", "multiplicative": false, "method": "% of deal value"},
      {"name": "Trading commissions", "multiplicative": true, "factors": ["Trade volume", "Commission per trade"]},
      {"name": "Underwriting fees", "multiplicative": false, "method": "% of issuance value"}
    ],
    "cogs": [],
    "operating_expenses": [
      {"name": "Compensation expense", "multiplicative": false, "method": "% of revenue"},
      {"name": "Technology and infrastructure", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [
      {"name": "Interest income on capital", "multiplicative": false, "method": "% of capital deployed"}
    ],
    "other_expenses": [
      {"name": "Provision for credit losses", "multiplicative": false, "method": "% of loans"}
    ]
  },
  "Building Materials": {
    "revenue": [
      {"name": "Volume of materials sold", "multiplicative": true, "factors": ["Tonnage sold", "Average price per ton"]}
    ],
    "cogs": [
      {"name": "Raw material costs", "multiplicative": true, "factors": ["Tonnage produced", "Cost per ton"]},
      {"name": "Energy costs", "multiplicative": false, "method": "% of revenue"}
    ],
    "operating_expenses": [
      {"name": "Maintenance and repairs", "multiplicative": false, "method": "% of revenue"},
      {"name": "SG&A", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": [
      {"name": "Environmental compliance costs", "multiplicative": false, "method": "direct"}
    ]
  },
  "Cable TV": {
    "revenue": [
      {"name": "Subscription revenue", "multiplicative": true, "factors": ["Subscribers", "ARPU"]},
      {"name": "Advertising revenue", "multiplicative": false, "method": "% of subscriber revenue"}
    ],
    "cogs": [
      {"name": "Content licensing costs", "multiplicative": false, "method": "% of revenue"},
      {"name": "Network maintenance", "multiplicative": false, "method": "% of revenue"}
    ],
    "operating_expenses": [
      {"name": "Customer service", "multiplicative": false, "method": "% of revenue"},
      {"name": "SG&A", "multiplicative": false, "method": "% of revenue"}
    ],
    "other_income": [],
    "other_expenses": []
  },
  "Chemical (Basic)": {
    "revenue": [
      { "name": "Volume sold", "multiplicative": true, "factors": ["Tonnes sold", "Average selling price per tonne"] },
      { "name": "By-product sales", "multiplicative": false, "method": "% of main product revenue" }
    ],
    "cogs": [
      { "name": "Feedstock costs", "multiplicative": true, "factors": ["Input volume", "Input unit cost"] },
      { "name": "Energy costs", "multiplicative": false, "method": "% of revenue" }
    ],
    "operating_expenses": [
      { "name": "R&D expense", "multiplicative": false, "method": "% of revenue" },
      { "name": "SG&A", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Government grants", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Environmental remediation", "multiplicative": false, "method": "direct" }
    ]
  },
  "Chemical (Diversified)": {
    "revenue": [
      { "name": "Specialty chemicals", "multiplicative": false, "method": "% of total revenue" },
      { "name": "Basic chemicals", "multiplicative": false, "method": "% of total revenue" }
    ],
    "cogs": [
      { "name": "Raw materials", "multiplicative": false, "method": "% of segment revenue" },
      { "name": "Processing costs", "multiplicative": false, "method": "% of revenue" }
    ],
    "operating_expenses": [
      { "name": "Innovation & development", "multiplicative": false, "method": "% of revenue" },
      { "name": "Corporate overhead", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Joint venture income", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Asset write-downs", "multiplicative": false, "method": "direct" }
    ]
  },
  "Chemical (Specialty)": {
    "revenue": [
      { "name": "Niche product sales", "multiplicative": true, "factors": ["Units sold", "Price per unit"] },
      { "name": "Contract manufacturing", "multiplicative": false, "method": "direct" }
    ],
    "cogs": [
      { "name": "Custom feedstock cost", "multiplicative": true, "factors": ["Input volume", "Unit cost"] },
      { "name": "Quality control", "multiplicative": false, "method": "% of revenue" }
    ],
    "operating_expenses": [
      { "name": "Technical service expense", "multiplicative": false, "method": "% of revenue" },
      { "name": "Sales & marketing", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Licensing fees", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Regulatory compliance", "multiplicative": false, "method": "% of revenue" }
    ]
  },
  "Coal & Related Energy": {
    "revenue": [
      { "name": "Thermal coal sales", "multiplicative": true, "factors": ["Tonnes sold", "Price per tonne"] },
      { "name": "Metallurgical coal sales", "multiplicative": true, "factors": ["Tonnes sold", "Price per tonne"] }
    ],
    "cogs": [
      { "name": "Mining cost per tonne", "multiplicative": true, "factors": ["Tonnes produced", "Cost per tonne"] },
      { "name": "Processing cost", "multiplicative": false, "method": "% of revenue" }
    ],
    "operating_expenses": [
      { "name": "Site administration", "multiplicative": false, "method": "% of revenue" },
      { "name": "Rehabilitation provisions", "multiplicative": false, "method": "direct" }
    ],
    "other_income": [
      { "name": "Methane capture credits", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Environmental penalties", "multiplicative": false, "method": "direct" }
    ]
  },
  "Computer Services": {
    "revenue": [
      { "name": "Managed services", "multiplicative": true, "factors": ["Client count", "Average contract value"] },
      { "name": "Consulting fees", "multiplicative": false, "method": "direct" }
    ],
    "cogs": [
      { "name": "Labor cost", "multiplicative": true, "factors": ["Billable hours", "Hourly rate"] },
      { "name": "Software licensing", "multiplicative": false, "method": "% of revenue" }
    ],
    "operating_expenses": [
      { "name": "SG&A", "multiplicative": false, "method": "% of revenue" },
      { "name": "Infrastructure maintenance", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Reseller commissions", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Bad debt expense", "multiplicative": false, "method": "% of revenue" }
    ]
  },
  "Computers/Peripherals": {
    "revenue": [
      { "name": "Hardware unit sales", "multiplicative": true, "factors": ["Units sold", "Average selling price"] },
      { "name": "Service & warranty revenue", "multiplicative": false, "method": "% of hardware revenue" }
    ],
    "cogs": [
      { "name": "Component costs", "multiplicative": true, "factors": ["Units produced", "Cost per unit"] },
      { "name": "Manufacturing overhead", "multiplicative": false, "method": "% of revenue" }
    ],
    "operating_expenses": [
      { "name": "R&D expense", "multiplicative": false, "method": "% of revenue" },
      { "name": "SG&A", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Licensing & royalties", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Inventory obsolescence", "multiplicative": false, "method": "% of inventory value" }
    ]
  },
  "Construction Supplies": {
    "revenue": [
      { "name": "Material sales", "multiplicative": true, "factors": ["Tonnes sold", "Price per tonne"] },
      { "name": "Contract supply services", "multiplicative": false, "method": "direct" }
    ],
    "cogs": [
      { "name": "Raw material cost", "multiplicative": true, "factors": ["Quantity", "Unit cost"] },
      { "name": "Logistics", "multiplicative": false, "method": "% of revenue" }
    ],
    "operating_expenses": [
      { "name": "Distribution center costs", "multiplicative": false, "method": "% of revenue" },
      { "name": "SG&A", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Rebates & allowances", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_expenses": [
      { "name": "Warranty provisions", "multiplicative": false, "method": "% of product sales" }
    ]
  },
  "Diversified": {
    "revenue": [
      { "name": "Segmented revenue streams", "multiplicative": false, "method": "direct per segment" }
    ],
    "cogs": [
      { "name": "Aggregate COGS", "multiplicative": false, "method": "% of total revenue" }
    ],
    "operating_expenses": [
      { "name": "Corporate overhead", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Investment income", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Restructuring costs", "multiplicative": false, "method": "direct" }
    ]
  },
  "Drugs (Biotechnology)": {
    "revenue": [
      { "name": "Milestone payments", "multiplicative": false, "method": "direct" },
      { "name": "Royalty income", "multiplicative": false, "method": "% of partner revenue" }
    ],
    "cogs": [
      { "name": "Manufacturing R&D transfers", "multiplicative": false, "method": "% of revenue" }
    ],
    "operating_expenses": [
      { "name": "Clinical trial costs", "multiplicative": false, "method": "% of revenue" },
      { "name": "SG&A", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Grants & subsidies", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Patent defense costs", "multiplicative": false, "method": "direct" }
    ]
  },
  "Drugs (Pharmaceutical)": {
    "revenue": [
      { "name": "Prescription drug sales", "multiplicative": true, "factors": ["Units sold", "Price per unit"] },
      { "name": "In-market sales growth", "multiplicative": false, "method": "% of prior year" }
    ],
    "cogs": [
      { "name": "Active pharmaceutical ingredient cost", "multiplicative": true, "factors": ["Quantity", "Cost per kg"] }
    ],
    "operating_expenses": [
      { "name": "Marketing & promotion", "multiplicative": false, "method": "% of revenue" },
      { "name": "R&D", "multiplicative": false, "method": "% of revenue" }
    ],
    "other_income": [
      { "name": "Licensing revenue", "multiplicative": false, "method": "direct" }
    ],
    "other_expenses": [
      { "name": "Regulatory penalty", "multiplicative": false, "method": "direct" }
    ]
  },
  "Education": {
    "revenue": [
      {
        "name": "Tuition & fees",
        "multiplicative": true,
        "factors": ["Student enrollment", "Average tuition per student"]
      },
      {
        "name": "Government funding",
        "multiplicative": false,
        "method": "% of total revenue"
      }
    ],
    "cogs": [
      {
        "name": "Instructional costs",
        "multiplicative": false,
        "method": "% of tuition revenue"
      },
      {
        "name": "Facilities maintenance",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Faculty salaries",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Administrative expenses",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Endowment returns",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Scholarship expense",
        "multiplicative": false,
        "method": "% of tuition revenue"
      }
    ]
  },
  "Electrical Equipment": {
    "revenue": [
      {
        "name": "Equipment sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average selling price"]
      },
      {
        "name": "Service contracts",
        "multiplicative": false,
        "method": "% of equipment revenue"
      }
    ],
    "cogs": [
      {
        "name": "Raw material costs",
        "multiplicative": false,
        "method": "direct or % of revenue"
      },
      {
        "name": "Component procurement",
        "multiplicative": true,
        "factors": ["Units installed", "Cost per unit"]
      }
    ],
    "operating_expenses": [
      {
        "name": "R&D expenses",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Licensing & royalties",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty provisions",
        "multiplicative": false,
        "method": "% of equipment revenue"
      }
    ]
  },
  "Electronics (Consumer & Office)": {
    "revenue": [
      {
        "name": "Consumer device sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average selling price"]
      },
      {
        "name": "Office equipment sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average selling price"]
      }
    ],
    "cogs": [
      {
        "name": "Chipset costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Assembly costs",
        "multiplicative": true,
        "factors": ["Units assembled", "Cost per unit"]
      }
    ],
    "operating_expenses": [
      {
        "name": "Product development",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Marketing & distribution",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Extended warranty sales",
        "multiplicative": false,
        "method": "% of warranty base"
      }
    ],
    "other_expenses": [
      {
        "name": "Obsolescence write-downs",
        "multiplicative": false,
        "method": "% of inventory"
      }
    ]
  },
  "Electronics (General)": {
    "revenue": [
      {
        "name": "General electronics sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average price"]
      },
      {
        "name": "Service revenue",
        "multiplicative": false,
        "method": "% of sales"
      }
    ],
    "cogs": [
      {
        "name": "Material costs",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Research & development",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Scrap sales",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty repairs",
        "multiplicative": false,
        "method": "% of product revenue"
      }
    ]
  },
  "Engineering/Construction": {
    "revenue": [
      {
        "name": "Project revenue",
        "multiplicative": true,
        "factors": ["Project count", "Average contract value"]
      },
      {
        "name": "Change order revenue",
        "multiplicative": false,
        "method": "% of base project revenue"
      }
    ],
    "cogs": [
      {
        "name": "Subcontractor costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Material & labor",
        "multiplicative": true,
        "factors": ["Labor hours", "Cost per hour"]
      }
    ],
    "operating_expenses": [
      {
        "name": "Project management",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Equipment depreciation",
        "multiplicative": false,
        "method": "% of asset base"
      }
    ],
    "other_income": [
      {
        "name": "Equipment rental income",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Cost overruns",
        "multiplicative": false,
        "method": "% of project revenue"
      }
    ]
  },
  "Entertainment": {
    "revenue": [
      {
        "name": "Box office sales",
        "multiplicative": true,
        "factors": ["Tickets sold", "Average ticket price"]
      },
      {
        "name": "Streaming/subscription revenue",
        "multiplicative": false,
        "method": "% of subscriber base"
      }
    ],
    "cogs": [
      {
        "name": "Production costs",
        "multiplicative": false,
        "method": "% of box office revenue"
      },
      {
        "name": "Licensing fees",
        "multiplicative": false,
        "method": "% of streaming revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Marketing & promotion",
        "multiplicative": false,
        "method": "% of total revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Merchandising & licensing",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_expenses": [
      {
        "name": "Residual payments",
        "multiplicative": false,
        "method": "% of content revenue"
      }
    ]
  },
  "Environmental & Waste Services": {
    "revenue": [
      {
        "name": "Collection & disposal fees",
        "multiplicative": true,
        "factors": ["Tons collected", "Fee per ton"]
      },
      {
        "name": "Recycling sales",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "cogs": [
      {
        "name": "Fuel & vehicle operating cost",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Landfill/processing fees",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Labor costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Equipment maintenance",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Environmental credits",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Regulatory fines",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Farming/Agriculture": {
    "revenue": [
      {
        "name": "Crop sales",
        "multiplicative": true,
        "factors": ["Acres harvested", "Yield per acre", "Price per unit"]
      },
      {
        "name": "Livestock sales",
        "multiplicative": true,
        "factors": ["Headcount", "Average price per head"]
      }
    ],
    "cogs": [
      {
        "name": "Seed & feed costs",
        "multiplicative": false,
        "method": "% of crop revenue"
      },
      {
        "name": "Fertilizer & pesticide",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Labor",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Equipment depreciation",
        "multiplicative": false,
        "method": "% of asset base"
      }
    ],
    "other_income": [
      {
        "name": "Government subsidies",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Crop insurance",
        "multiplicative": false,
        "method": "% of crop revenue"
      }
    ]
  },
  "Financial Svcs. (Non-bank & Insur)": {
    "revenue": [
      {
        "name": "Fee & commission income",
        "multiplicative": false,
        "method": "% of AUM or premiums"
      },
      {
        "name": "Investment income",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "cogs": [
      {
        "name": "Claims paid",
        "multiplicative": false,
        "method": "% of premiums"
      },
      {
        "name": "Cost of funds",
        "multiplicative": false,
        "method": "% of lending portfolio"
      }
    ],
    "operating_expenses": [
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Technology & operations",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Reinsurance recoveries",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Provision for credit losses",
        "multiplicative": false,
        "method": "% of exposure"
      }
    ]
  },
  "Food Processing": {
    "revenue": [
      {
        "name": "Packaged food sales",
        "multiplicative": true,
        "factors": ["Units sold", "Price per unit"]
      },
      {
        "name": "Private label contracts",
        "multiplicative": false,
        "method": "% of total revenue"
      }
    ],
    "cogs": [
      {
        "name": "Raw ingredient costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Manufacturing overhead",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Packaging & distribution",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "By-product sales",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Product recall costs",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Food Wholesalers": {
    "revenue": [
      {
        "name": "Wholesale volume",
        "multiplicative": true,
        "factors": ["Tonnes distributed", "Average price per tonne"]
      },
      {
        "name": "Logistics service fees",
        "multiplicative": false,
        "method": "% of product revenue"
      }
    ],
    "cogs": [
      {
        "name": "Purchase cost of goods",
        "multiplicative": true,
        "factors": ["Units purchased", "Cost per unit"]
      },
      {
        "name": "Storage costs",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Distribution center operating costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Rebates & allowances",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Spoilage & shrinkage",
        "multiplicative": false,
        "method": "% of goods handled"
      }
    ]
  },
  "Furn/Home Furnishings": {
    "revenue": [
      {
        "name": "Furniture unit sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average selling price"]
      },
      {
        "name": "Home décor accessories",
        "multiplicative": false,
        "method": "% of total revenue"
      }
    ],
    "cogs": [
      {
        "name": "Material costs",
        "multiplicative": false,
        "method": "% of product revenue"
      },
      {
        "name": "Manufacturing labor",
        "multiplicative": true,
        "factors": ["Labor hours", "Cost per hour"]
      }
    ],
    "operating_expenses": [
      {
        "name": "Showroom and retail rent",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Design service fees",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty repairs",
        "multiplicative": false,
        "method": "% of product revenue"
      }
    ]
  },
  "Green & Renewable Energy": {
    "revenue": [
      {
        "name": "Energy generation",
        "multiplicative": true,
        "factors": ["MWh generated", "Average price per MWh"]
      },
      {
        "name": "Renewable incentives",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "cogs": [
      {
        "name": "Fuel and feedstock",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Plant operating costs",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Maintenance & repairs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Carbon credits sales",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Grid balancing costs",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Healthcare Products": {
    "revenue": [
      {
        "name": "Medical device sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average price"]
      },
      {
        "name": "Consumables and supplies",
        "multiplicative": false,
        "method": "% of device sales"
      }
    ],
    "cogs": [
      {
        "name": "Component costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Manufacturing overhead",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "R&D expense",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Sales & marketing",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Service & maintenance contracts",
        "multiplicative": false,
        "method": "% of device base"
      }
    ],
    "other_expenses": [
      {
        "name": "Product recall costs",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Healthcare Support Services": {
    "revenue": [
      {
        "name": "Facility management fees",
        "multiplicative": true,
        "factors": ["Number of facilities", "Fee per facility"]
      },
      {
        "name": "Lab testing services",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "cogs": [
      {
        "name": "Staff wages",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Medical supplies",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Facility maintenance",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Government subsidies",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Compliance costs",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ]
  },
  "Heathcare Information and Techno": {
    "revenue": [
      {
        "name": "Software licensing fees",
        "multiplicative": true,
        "factors": ["Number of licenses", "Average license fee"]
      },
      {
        "name": "Service & support contracts",
        "multiplicative": false,
        "method": "% of license revenue"
      }
    ],
    "cogs": [
      {
        "name": "Hosting & infrastructure costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Third-party software fees",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "R&D expense",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Sales & marketing",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Data analytics services",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Regulatory compliance costs",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ]
  },
  "Homebuilding": {
    "revenue": [
      {
        "name": "New home sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average selling price"]
      },
      {
        "name": "Land development income",
        "multiplicative": false,
        "method": "% of total revenue"
      }
    ],
    "cogs": [
      {
        "name": "Construction costs",
        "multiplicative": true,
        "factors": ["Square feet built", "Cost per square foot"]
      },
      {
        "name": "Land acquisition cost",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Interest on inventory financing",
        "multiplicative": false,
        "method": "% of land inventory"
      }
    ],
    "other_income": [
      {
        "name": "Warranty extension fees",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty claims",
        "multiplicative": false,
        "method": "% of home sales"
      }
    ]
  },
  "Hospitals/Healthcare Facilities": {
    "revenue": [
      {
        "name": "Patient service revenue",
        "multiplicative": false,
        "method": "direct input by service line"
      },
      {
        "name": "Ancillary services",
        "multiplicative": false,
        "method": "% of patient revenue"
      }
    ],
    "cogs": [
      {
        "name": "Medical supplies & drugs",
        "multiplicative": false,
        "method": "% of patient revenue"
      },
      {
        "name": "Staff salaries",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Facility maintenance",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Administrative expenses",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Government subsidies",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Malpractice costs",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ]
  },
  "Hotel/Gaming": {
    "revenue": [
      {
        "name": "Room revenue (RevPAR)",
        "multiplicative": true,
        "factors": ["Available room nights", "Revenue per available room"]
      },
      {
        "name": "Gaming win per unit",
        "multiplicative": false,
        "method": "direct input or % growth"
      },
      {
        "name": "Food & beverage",
        "multiplicative": false,
        "method": "% of room revenue"
      }
    ],
    "cogs": [
      {
        "name": "Cost of food & beverage",
        "multiplicative": false,
        "method": "% of F&B revenue"
      },
      {
        "name": "Utilities & maintenance",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Labor costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Marketing & promotions",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Other gaming income",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Gaming taxes & levies",
        "multiplicative": false,
        "method": "% of gaming revenue"
      }
    ]
  },
  "Household Products": {
    "revenue": [
      {
        "name": "Unit sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average price per unit"]
      },
      {
        "name": "Aftermarket sales",
        "multiplicative": false,
        "method": "% of product revenue"
      }
    ],
    "cogs": [
      {
        "name": "Raw material costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Packaging & labeling",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "R&D",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Licensing revenue",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Product recall costs",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Information Services": {
    "revenue": [
      {
        "name": "Subscription & licensing fees",
        "multiplicative": true,
        "factors": ["Subscribers/users", "Average fee per subscriber"]
      },
      {
        "name": "Data sales & analytics",
        "multiplicative": false,
        "method": "% of subscription revenue"
      }
    ],
    "cogs": [
      {
        "name": "Data acquisition costs",
        "multiplicative": false,
        "method": "% of data sales"
      },
      {
        "name": "Platform hosting",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "R&D / platform development",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Sales & marketing",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Professional services",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Third-party content fees",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ]
  },
  "Insurance (General)": {
    "revenue": [
      {
        "name": "Premiums earned",
        "multiplicative": false,
        "method": "direct input by segment"
      },
      {
        "name": "Policy fees & charges",
        "multiplicative": false,
        "method": "% of premiums"
      }
    ],
    "cogs": [
      {
        "name": "Claims paid",
        "multiplicative": false,
        "method": "% of premiums"
      },
      {
        "name": "Reinsurance cost",
        "multiplicative": false,
        "method": "% of premiums"
      }
    ],
    "operating_expenses": [
      {
        "name": "Acquisition costs (commissions)",
        "multiplicative": false,
        "method": "% of premiums"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Investment income",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Loss adjustment expenses",
        "multiplicative": false,
        "method": "% of claims"
      }
    ]
  },
  "Insurance (Life)": {
    "revenue": [
      {
        "name": "Premiums & annuity sales",
        "multiplicative": false,
        "method": "direct by product line"
      },
      {
        "name": "Policy fees",
        "multiplicative": false,
        "method": "% of premiums"
      }
    ],
    "cogs": [
      {
        "name": "Policy benefits paid",
        "multiplicative": false,
        "method": "% of premiums"
      }
    ],
    "operating_expenses": [
      {
        "name": "Acquisition costs",
        "multiplicative": false,
        "method": "% of premiums"
      },
      {
        "name": "Administrative expenses",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Investment income",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Surrender charges",
        "multiplicative": false,
        "method": "% of policy base"
      }
    ]
  },
  "Insurance (Prop/Cas.)": {
    "revenue": [
      {
        "name": "Property & casualty premiums",
        "multiplicative": false,
        "method": "direct input"
      }
    ],
    "cogs": [
      {
        "name": "Loss & loss adjustment expenses",
        "multiplicative": false,
        "method": "% of premiums"
      }
    ],
    "operating_expenses": [
      {
        "name": "Acquisition costs",
        "multiplicative": false,
        "method": "% of premiums"
      },
      {
        "name": "Underwriting expenses",
        "multiplicative": false,
        "method": "% of premiums"
      }
    ],
    "other_income": [
      {
        "name": "Reinsurance recoveries",
        "multiplicative": false,
        "method": "% of claims"
      }
    ],
    "other_expenses": [
      {
        "name": "Reserve strengthening",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Investments & Asset Management": {
    "revenue": [
      {
        "name": "Management fees",
        "multiplicative": true,
        "factors": ["AUM", "Fee rate"]
      },
      {
        "name": "Performance fees",
        "multiplicative": false,
        "method": "% of performance above hurdle"
      }
    ],
    "cogs": [
      {
        "name": "Platform & custody costs",
        "multiplicative": false,
        "method": "% of AUM"
      }
    ],
    "operating_expenses": [
      {
        "name": "Compensation",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Research & compliance",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Interest & dividends",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Distribution & service fees",
        "multiplicative": false,
        "method": "% of AUM"
      }
    ]
  },
  "Machinery": {
    "revenue": [
      {
        "name": "Equipment sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average selling price"]
      },
      {
        "name": "After-sales service",
        "multiplicative": false,
        "method": "% of equipment sales"
      }
    ],
    "cogs": [
      {
        "name": "Component costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Manufacturing overhead",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "R&D",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Rental income",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty provisions",
        "multiplicative": false,
        "method": "% of equipment sales"
      }
    ]
  },
  "Metals & Mining": {
    "revenue": [
      {
        "name": "Metal sales",
        "multiplicative": true,
        "factors": ["Tonnes sold", "Price per tonne"]
      }
    ],
    "cogs": [
      {
        "name": "Extraction cost per tonne",
        "multiplicative": true,
        "factors": ["Tonnes produced", "Cost per tonne"]
      },
      {
        "name": "Processing cost",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Site maintenance",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Environmental compliance",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_income": [
      {
        "name": "By-product sales",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Mine closure provisions",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Office Equipment & Services": {
    "revenue": [
      {
        "name": "Equipment sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average price"]
      },
      {
        "name": "Service & maintenance contracts",
        "multiplicative": false,
        "method": "% of equipment revenue"
      }
    ],
    "cogs": [
      {
        "name": "Parts and materials",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Logistics",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Lease financing income",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Provision for service warranties",
        "multiplicative": false,
        "method": "% of service revenue"
      }
    ]
  },
  "Oil/Gas (Integrated)": {
    "revenue": [
      {
        "name": "Upstream production sales",
        "multiplicative": true,
        "factors": ["Barrels produced", "Price per barrel"]
      },
      {
        "name": "Downstream refining margins",
        "multiplicative": false,
        "method": "direct input"
      }
    ],
    "cogs": [
      {
        "name": "Upstream lifting cost",
        "multiplicative": false,
        "method": "% of upstream revenue"
      },
      {
        "name": "Downstream feedstock cost",
        "multiplicative": false,
        "method": "% of refining revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of total revenue"
      },
      {
        "name": "Maintenance & turnaround",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Trading income",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Environmental fines",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Oil/Gas (Production and Exploratio": {
    "revenue": [
      {
        "name": "Crude oil sales",
        "multiplicative": true,
        "factors": ["Barrels produced", "Price per barrel"]
      },
      {
        "name": "Natural gas sales",
        "multiplicative": true,
        "factors": ["MMBtu produced", "Price per MMBtu"]
      }
    ],
    "cogs": [
      {
        "name": "Lifting & operating cost",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Exploration expense",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Royalty income",
        "multiplicative": false,
        "method": "% of production revenue"
      }
    ],
    "other_expenses": [
      {
        "name": "Abandonment provisions",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Oil/Gas (Distribution)": {
    "revenue": [
      {
        "name": "Wholesale product sales",
        "multiplicative": true,
        "factors": ["Volume distributed", "Average unit price"]
      },
      {
        "name": "Transportation fees",
        "multiplicative": false,
        "method": "% of sales volume"
      }
    ],
    "cogs": [
      {
        "name": "Product procurement cost",
        "multiplicative": true,
        "factors": ["Volume purchased", "Cost per unit"]
      }
    ],
    "operating_expenses": [
      {
        "name": "Pipeline and storage costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Terminal fees",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Spill remediation costs",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Oilfield Svcs/Equip.": {
    "revenue": [
      {
        "name": "Services revenue",
        "multiplicative": false,
        "method": "% of client billings"
      },
      {
        "name": "Equipment rental",
        "multiplicative": true,
        "factors": ["Days rented", "Rate per day"]
      }
    ],
    "cogs": [
      {
        "name": "Fuel & maintenance",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Labor costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Depreciation",
        "multiplicative": false,
        "method": "% of equipment base"
      }
    ],
    "other_income": [
      {
        "name": "Spare parts sales",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Rig relocation costs",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Packaging & Container": {
    "revenue": [
      {
        "name": "Container sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average price"]
      },
      {
        "name": "Packaging services",
        "multiplicative": false,
        "method": "% of product sales"
      }
    ],
    "cogs": [
      {
        "name": "Raw material cost",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Plant overhead",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Tooling rental",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Tooling depreciation",
        "multiplicative": false,
        "method": "% of tooling base"
      }
    ]
  },
  "Paper/Forest Products": {
    "revenue": [
      {
        "name": "Pulp and paper sales",
        "multiplicative": true,
        "factors": ["Tonnes sold", "Price per tonne"]
      }
    ],
    "cogs": [
      {
        "name": "Wood fiber cost",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Energy cost",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Forest management",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Mill maintenance",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "By-product sales",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Environmental compliance",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ]
  },
  "Power": {
    "revenue": [
      {
        "name": "Electricity sales",
        "multiplicative": true,
        "factors": ["MWh sold", "Price per MWh"]
      },
      {
        "name": "Capacity payments",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "cogs": [
      {
        "name": "Fuel cost",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Purchased power",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Transmission & distribution",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Renewable energy credits",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Network losses",
        "multiplicative": false,
        "method": "% of energy sold"
      }
    ]
  },
  "Precious Metals": {
    "revenue": [
      {
        "name": "Gold sales",
        "multiplicative": true,
        "factors": ["Ounces sold", "Price per ounce"]
      },
      {
        "name": "Silver & other metals sales",
        "multiplicative": true,
        "factors": ["Ounces sold", "Price per ounce"]
      }
    ],
    "cogs": [
      {
        "name": "Mining cost per ounce",
        "multiplicative": true,
        "factors": ["Ounces produced", "Cost per ounce"]
      }
    ],
    "operating_expenses": [
      {
        "name": "Refining & smelting",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Hedging gains",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Mine reclamation provisions",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Publishing & Newspapers": {
    "revenue": [
      {
        "name": "Subscription revenue",
        "multiplicative": true,
        "factors": ["Subscribers", "Subscription fee"]
      },
      {
        "name": "Advertising revenue",
        "multiplicative": false,
        "method": "% of pageviews or circulation"
      }
    ],
    "cogs": [
      {
        "name": "Printing & distribution",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Newsroom salaries",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Digital platform costs",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Events & sponsorships",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Copyright payments",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ]
  },
  "R.E.I.T.": {
    "revenue": [
      {
        "name": "Rental income",
        "multiplicative": true,
        "factors": ["Occupied square footage", "Rent per square foot"]
      }
    ],
    "cogs": [
      {
        "name": "Property operating expenses",
        "multiplicative": false,
        "method": "% of rental income"
      }
    ],
    "operating_expenses": [
      {
        "name": "General & administrative",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "Property management fees",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Tenant reimbursements",
        "multiplicative": false,
        "method": "% of operating expenses"
      }
    ],
    "other_expenses": [
      {
        "name": "Real estate taxes",
        "multiplicative": false,
        "method": "% of rental income"
      }
    ]
  },
  "Real Estate (Development)": {
    "revenue": [
      {
        "name": "Project sales",
        "multiplicative": true,
        "factors": ["Units sold", "Price per unit"]
      }
    ],
    "cogs": [
      {
        "name": "Development cost",
        "multiplicative": true,
        "factors": ["Square feet developed", "Cost per square foot"]
      }
    ],
    "operating_expenses": [
      {
        "name": "Land holding costs",
        "multiplicative": false,
        "method": "% of project cost"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Government grants",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Interest during construction",
        "multiplicative": false,
        "method": "% of project cost"
      }
    ]
  },
  "Real Estate (General/Diversified)": {
    "revenue": [
      {
        "name": "Rental & leasing revenue",
        "multiplicative": false,
        "method": "direct per segment"
      }
    ],
    "cogs": [
      {
        "name": "Property operating costs",
        "multiplicative": false,
        "method": "% of rental revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Corporate overhead",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Asset sales gains",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Asset impairment",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Retail (Building Supply)": {
    "revenue": [
      {
        "name": "Building materials sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average price per unit"]
      },
      {
        "name": "Installation services",
        "multiplicative": false,
        "method": "% of product sales"
      }
    ],
    "cogs": [
      {
        "name": "Cost of goods sold",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Store operating costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Vendor rebates",
        "multiplicative": false,
        "method": "% of purchases"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty and service costs",
        "multiplicative": false,
        "method": "% of installation revenue"
      }
    ]
  },
  "Retail (Distributors)": {
    "revenue": [
      {
        "name": "Wholesale distribution sales",
        "multiplicative": true,
        "factors": ["Units distributed", "Average distribution fee"]
      }
    ],
    "cogs": [
      {
        "name": "Purchase cost of goods",
        "multiplicative": true,
        "factors": ["Units purchased", "Cost per unit"]
      }
    ],
    "operating_expenses": [
      {
        "name": "Logistics & warehousing",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Shipping fees",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_expenses": [
      {
        "name": "Inventory shrinkage",
        "multiplicative": false,
        "method": "% of goods handled"
      }
    ]
  },
  "Retail (General)": {
    "revenue": [
      {
        "name": "Store sales",
        "multiplicative": false,
        "method": "direct input or % of prior year"
      }
    ],
    "cogs": [
      {
        "name": "COGS",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Rent & utilities",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Promotional rebates",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_expenses": [
      {
        "name": "Store closure costs",
        "multiplicative": false,
        "method": "direct"
      }
    ]
  },
  "Retail (Grocery and Food)": {
    "revenue": [
      {
        "name": "Grocery sales",
        "multiplicative": false,
        "method": "direct input or % growth"
      }
    ],
    "cogs": [
      {
        "name": "Food cost",
        "multiplicative": false,
        "method": "% of grocery revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Labor & benefits",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Manufacturer rebates",
        "multiplicative": false,
        "method": "% of purchases"
      }
    ],
    "other_expenses": [
      {
        "name": "Shrink & spoilage",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ]
  },
  "Retail (REITs)": {
    "revenue": [
      {
        "name": "Rental revenue",
        "multiplicative": true,
        "factors": ["Leased sq ft", "Rent per sq ft"]
      }
    ],
    "cogs": [
      {
        "name": "Property operating expenses",
        "multiplicative": false,
        "method": "% of rental revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Property management fees",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Tenant reimbursements",
        "multiplicative": false,
        "method": "% of operating expenses"
      }
    ],
    "other_expenses": [
      {
        "name": "Real estate taxes",
        "multiplicative": false,
        "method": "% of rental revenue"
      }
    ]
  },
  "Retail (Special Lines)": {
    "revenue": [
      {
        "name": "Specialized product sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average price"]
      }
    ],
    "cogs": [
      {
        "name": "Cost of specialty inventory",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Boutique store costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Customization fees",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Return and warranty costs",
        "multiplicative": false,
        "method": "% of sales"
      }
    ]
  },
  "Rubber& Tires": {
    "revenue": [
      {
        "name": "Tire unit sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average selling price"]
      }
    ],
    "cogs": [
      {
        "name": "Raw rubber & material costs",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Manufacturing overhead",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Recycling credits",
        "multiplicative": false,
        "method": "direct"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty reserves",
        "multiplicative": false,
        "method": "% of sales"
      }
    ]
  },
  "Semiconductor": {
    "revenue": [
      {
        "name": "Chip sales",
        "multiplicative": true,
        "factors": ["Units shipped", "Average selling price"]
      }
    ],
    "cogs": [
      {
        "name": "Wafer fabrication cost",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "R&D",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Licensing royalties",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_expenses": [
      {
        "name": "Equipment depreciation",
        "multiplicative": false,
        "method": "% of asset base"
      }
    ]
  },
  "Semiconductor Equip": {
    "revenue": [
      {
        "name": "Equipment sales",
        "multiplicative": true,
        "factors": ["Units sold", "Average selling price"]
      }
    ],
    "cogs": [
      {
        "name": "Component and parts cost",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "R&D",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Service & maintenance",
        "multiplicative": false,
        "method": "% of equipment revenue"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty provisions",
        "multiplicative": false,
        "method": "% of equipment revenue"
      }
    ]
  },
  "Shipbuilding & Marine": {
    "revenue": [
      {
        "name": "Ship contract revenue",
        "multiplicative": true,
        "factors": ["Number of vessels", "Contract value per vessel"]
      }
    ],
    "cogs": [
      {
        "name": "Material & steel costs",
        "multiplicative": false,
        "method": "% of contract revenue"
      }
    ],
    "operating_expenses": [
      {
        "name": "Labor & yard costs",
        "multiplicative": false,
        "method": "% of revenue"
      },
      {
        "name": "SG&A",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_income": [
      {
        "name": "Repair & conversion services",
        "multiplicative": false,
        "method": "% of revenue"
      }
    ],
    "other_expenses": [
      {
        "name": "Warranty & rectification",
        "multiplicative": false,
        "method": "% of contract revenue"
      }
    ]
  }
}
  