export interface SalesRecord {
  Order_ID: string;
  Order_Date: string;
  Customer: string;
  Product: string;
  Category: string;
  Region: string;
  Quantity: number;
  Sales: number;
  Discount: number;
  Profit: number;
}

export const SAMPLE_SALES_DATA: SalesRecord[] = [
  { Order_ID: "ORD-1001", Order_Date: "2024-01-15", Customer: "Acme Corp", Product: "MacBook Pro 16", Category: "Technology", Region: "North", Quantity: 2, Sales: 4800.0, Discount: 0.05, Profit: 1250.0 },
  { Order_ID: "ORD-1002", Order_Date: "2024-01-18", Customer: "Apex Systems", Product: "Ergonomic Chair", Category: "Furniture", Region: "West", Quantity: 5, Sales: 1750.0, Discount: 0.1, Profit: 380.0 },
  { Order_ID: "ORD-1003", Order_Date: "2024-01-22", Customer: "Global Tech", Product: "Wireless Mouse", Category: "Electronics", Region: "East", Quantity: 12, Sales: 360.0, Discount: 0.0, Profit: 110.0 },
  { Order_ID: "ORD-1004", Order_Date: "2024-01-28", Customer: "Nexus Labs", Product: "Standing Desk", Category: "Furniture", Region: "North", Quantity: 3, Sales: 2100.0, Discount: 0.15, Profit: 420.0 },
  { Order_ID: "ORD-1005", Order_Date: "2024-02-03", Customer: "Starlight Media", Product: "Dell UltraSharp 32", Category: "Technology", Region: "South", Quantity: 4, Sales: 3200.0, Discount: 0.08, Profit: 820.0 },
  { Order_ID: "ORD-1006", Order_Date: "2024-02-09", Customer: "Innovate Inc", Product: "Mechanical Keyboard", Category: "Electronics", Region: "Central", Quantity: 8, Sales: 960.0, Discount: 0.05, Profit: 280.0 },
  { Order_ID: "ORD-1007", Order_Date: "2024-02-14", Customer: "Quantum Dynamics", Product: "Gel Ink Pens 20pk", Category: "Office Supplies", Region: "North", Quantity: 25, Sales: 250.0, Discount: 0.0, Profit: 75.0 },
  { Order_ID: "ORD-1008", Order_Date: "2024-02-21", Customer: "Vertex Global", Product: "AirPods Pro 2", Category: "Electronics", Region: "East", Quantity: 6, Sales: 1494.0, Discount: 0.05, Profit: 390.0 },
  { Order_ID: "ORD-1009", Order_Date: "2024-03-02", Customer: "BlueWave Energy", Product: "Executive Leather Sofa", Category: "Furniture", Region: "South", Quantity: 2, Sales: 3800.0, Discount: 0.12, Profit: 650.0 },
  { Order_ID: "ORD-1010", Order_Date: "2024-03-08", Customer: "Aura Retail", Product: "LaserJet Pro Printer", Category: "Technology", Region: "West", Quantity: 3, Sales: 1650.0, Discount: 0.1, Profit: 310.0 },
  { Order_ID: "ORD-1011", Order_Date: "2024-03-15", Customer: "Zenith Logistics", Product: "Smart Watch Ultra", Category: "Electronics", Region: "Central", Quantity: 5, Sales: 1995.0, Discount: 0.05, Profit: 520.0 },
  { Order_ID: "ORD-1012", Order_Date: "2024-03-24", Customer: "Pulse Health", Product: "Heavy Duty Stapler", Category: "Office Supplies", Region: "North", Quantity: 15, Sales: 375.0, Discount: 0.0, Profit: 120.0 },
  { Order_ID: "ORD-1013", Order_Date: "2024-04-05", Customer: "CyberCloud LLC", Product: "ThinkPad X1 Carbon", Category: "Technology", Region: "East", Quantity: 4, Sales: 6400.0, Discount: 0.05, Profit: 1680.0 },
  { Order_ID: "ORD-1014", Order_Date: "2024-04-12", Customer: "Horizon Ventures", Product: "Mesh Task Chair", Category: "Furniture", Region: "West", Quantity: 8, Sales: 1920.0, Discount: 0.1, Profit: 410.0 },
  { Order_ID: "ORD-1015", Order_Date: "2024-04-19", Customer: "Acme Corp", Product: "4K Conference Webcam", Category: "Electronics", Region: "North", Quantity: 6, Sales: 1194.0, Discount: 0.05, Profit: 310.0 },
  { Order_ID: "ORD-1016", Order_Date: "2024-04-27", Customer: "Apex Systems", Product: "Steel Filing Cabinet", Category: "Furniture", Region: "South", Quantity: 4, Sales: 1400.0, Discount: 0.15, Profit: 190.0 },
  { Order_ID: "ORD-1017", Order_Date: "2024-05-04", Customer: "Global Tech", Product: "iPad Air 256GB", Category: "Technology", Region: "East", Quantity: 5, Sales: 3745.0, Discount: 0.05, Profit: 890.0 },
  { Order_ID: "ORD-1018", Order_Date: "2024-05-11", Customer: "Nexus Labs", Product: "Noise Canceling Headphones", Category: "Electronics", Region: "North", Quantity: 7, Sales: 2443.0, Discount: 0.1, Profit: 610.0 },
  { Order_ID: "ORD-1019", Order_Date: "2024-05-18", Customer: "Starlight Media", Product: "Sticky Notes Bulk", Category: "Office Supplies", Region: "Central", Quantity: 30, Sales: 180.0, Discount: 0.0, Profit: 54.0 },
  { Order_ID: "ORD-1020", Order_Date: "2024-05-25", Customer: "Innovate Inc", Product: "Conference Table 10ft", Category: "Furniture", Region: "North", Quantity: 1, Sales: 3200.0, Discount: 0.2, Profit: 480.0 },
  { Order_ID: "ORD-1021", Order_Date: "2024-06-02", Customer: "Quantum Dynamics", Product: "Server Rack 42U", Category: "Technology", Region: "West", Quantity: 2, Sales: 5200.0, Discount: 0.05, Profit: 1420.0 },
  { Order_ID: "ORD-1022", Order_Date: "2024-06-09", Customer: "Vertex Global", Product: "USB-C Docking Station", Category: "Electronics", Region: "East", Quantity: 10, Sales: 1890.0, Discount: 0.05, Profit: 480.0 },
  { Order_ID: "ORD-1023", Order_Date: "2024-06-16", Customer: "BlueWave Energy", Product: "A4 Copy Paper Case", Category: "Office Supplies", Region: "South", Quantity: 40, Sales: 960.0, Discount: 0.05, Profit: 240.0 },
  { Order_ID: "ORD-1024", Order_Date: "2024-06-23", Customer: "Aura Retail", Product: "MacBook Air 15", Category: "Technology", Region: "West", Quantity: 3, Sales: 3897.0, Discount: 0.05, Profit: 920.0 },
  { Order_ID: "ORD-1025", Order_Date: "2024-07-03", Customer: "Zenith Logistics", Product: "Dual Monitor Arm", Category: "Furniture", Region: "Central", Quantity: 6, Sales: 720.0, Discount: 0.1, Profit: 180.0 },
  { Order_ID: "ORD-1026", Order_Date: "2024-07-10", Customer: "Pulse Health", Product: "Bluetooth Speaker Pro", Category: "Electronics", Region: "North", Quantity: 8, Sales: 1440.0, Discount: 0.05, Profit: 360.0 },
  { Order_ID: "ORD-1027", Order_Date: "2024-07-17", Customer: "CyberCloud LLC", Product: "Presentation Clicker", Category: "Office Supplies", Region: "East", Quantity: 14, Sales: 420.0, Discount: 0.0, Profit: 140.0 },
  { Order_ID: "ORD-1028", Order_Date: "2024-07-25", Customer: "Horizon Ventures", Product: "Cisco Enterprise Router", Category: "Technology", Region: "West", Quantity: 2, Sales: 7600.0, Discount: 0.08, Profit: 2150.0 },
  { Order_ID: "ORD-1029", Order_Date: "2024-08-02", Customer: "Acme Corp", Product: "Whiteboard Magnetic 6x4", Category: "Furniture", Region: "North", Quantity: 4, Sales: 960.0, Discount: 0.1, Profit: 220.0 },
  { Order_ID: "ORD-1030", Order_Date: "2024-08-11", Customer: "Apex Systems", Product: "iPad Pro 13", Category: "Technology", Region: "West", Quantity: 4, Sales: 5196.0, Discount: 0.05, Profit: 1340.0 },
  { Order_ID: "ORD-1031", Order_Date: "2024-08-18", Customer: "Global Tech", Product: "Wireless Presenter Hub", Category: "Electronics", Region: "East", Quantity: 7, Sales: 1050.0, Discount: 0.05, Profit: 270.0 },
  { Order_ID: "ORD-1032", Order_Date: "2024-08-27", Customer: "Nexus Labs", Product: "Document Shredder Crosscut", Category: "Office Supplies", Region: "North", Quantity: 3, Sales: 750.0, Discount: 0.1, Profit: 165.0 },
  { Order_ID: "ORD-1033", Order_Date: "2024-09-04", Customer: "Starlight Media", Product: "Gaming Monitor 240Hz", Category: "Electronics", Region: "South", Quantity: 4, Sales: 2396.0, Discount: 0.1, Profit: 540.0 },
  { Order_ID: "ORD-1034", Order_Date: "2024-09-12", Customer: "Innovate Inc", Product: "Electric Height Desk", Category: "Furniture", Region: "Central", Quantity: 5, Sales: 3495.0, Discount: 0.15, Profit: 680.0 },
  { Order_ID: "ORD-1035", Order_Date: "2024-09-20", Customer: "Quantum Dynamics", Product: "Workstation GPU RTX4090", Category: "Technology", Region: "North", Quantity: 2, Sales: 9800.0, Discount: 0.0, Profit: 2850.0 },
  { Order_ID: "ORD-1036", Order_Date: "2024-09-29", Customer: "Vertex Global", Product: "Label Maker Industrial", Category: "Office Supplies", Region: "East", Quantity: 6, Sales: 540.0, Discount: 0.05, Profit: 150.0 },
  { Order_ID: "ORD-1037", Order_Date: "2024-10-06", Customer: "BlueWave Energy", Product: "Steelcase Gesture Chair", Category: "Furniture", Region: "South", Quantity: 3, Sales: 3897.0, Discount: 0.1, Profit: 870.0 },
  { Order_ID: "ORD-1038", Order_Date: "2024-10-14", Customer: "Aura Retail", Product: "Studio Display 27", Category: "Technology", Region: "West", Quantity: 2, Sales: 3198.0, Discount: 0.05, Profit: 790.0 },
  { Order_ID: "ORD-1039", Order_Date: "2024-10-22", Customer: "Zenith Logistics", Product: "Barcode Scanner Wireless", Category: "Electronics", Region: "Central", Quantity: 12, Sales: 1440.0, Discount: 0.1, Profit: 340.0 },
  { Order_ID: "ORD-1040", Order_Date: "2024-10-30", Customer: "Pulse Health", Product: "Sanitizer Dispenser 10pk", Category: "Office Supplies", Region: "North", Quantity: 20, Sales: 600.0, Discount: 0.05, Profit: 180.0 },
  { Order_ID: "ORD-1041", Order_Date: "2024-11-05", Customer: "CyberCloud LLC", Product: "Synology NAS Storage 8Bay", Category: "Technology", Region: "East", Quantity: 2, Sales: 4200.0, Discount: 0.05, Profit: 1080.0 },
  { Order_ID: "ORD-1042", Order_Date: "2024-11-12", Customer: "Horizon Ventures", Product: "Acoustic Privacy Panel", Category: "Furniture", Region: "West", Quantity: 10, Sales: 2500.0, Discount: 0.15, Profit: 550.0 },
  { Order_ID: "ORD-1043", Order_Date: "2024-11-19", Customer: "Acme Corp", Product: "Thunderbolt 4 Hub", Category: "Electronics", Region: "North", Quantity: 8, Sales: 2240.0, Discount: 0.05, Profit: 580.0 },
  { Order_ID: "ORD-1044", Order_Date: "2024-11-26", Customer: "Apex Systems", Product: "Laser Pointer Pro", Category: "Office Supplies", Region: "West", Quantity: 22, Sales: 440.0, Discount: 0.0, Profit: 130.0 },
  { Order_ID: "ORD-1045", Order_Date: "2024-12-03", Customer: "Global Tech", Product: "Mac Studio M2 Ultra", Category: "Technology", Region: "East", Quantity: 1, Sales: 4499.0, Discount: 0.05, Profit: 1150.0 },
  { Order_ID: "ORD-1046", Order_Date: "2024-12-10", Customer: "Nexus Labs", Product: "Executive Wooden Desk", Category: "Furniture", Region: "North", Quantity: 2, Sales: 4600.0, Discount: 0.12, Profit: 890.0 },
  { Order_ID: "ORD-1047", Order_Date: "2024-12-17", Customer: "Starlight Media", Product: "Sony A7 IV Camera Kit", Category: "Electronics", Region: "South", Quantity: 2, Sales: 5798.0, Discount: 0.05, Profit: 1420.0 },
  { Order_ID: "ORD-1048", Order_Date: "2024-12-24", Customer: "Innovate Inc", Product: "Color Toner Set 4pk", Category: "Office Supplies", Region: "Central", Quantity: 8, Sales: 1200.0, Discount: 0.1, Profit: 310.0 },
  { Order_ID: "ORD-1049", Order_Date: "2025-01-08", Customer: "Quantum Dynamics", Product: "Nvidia A100 Tensor Cloud", Category: "Technology", Region: "North", Quantity: 1, Sales: 14500.0, Discount: 0.02, Profit: 4800.0 },
  { Order_ID: "ORD-1050", Order_Date: "2025-01-16", Customer: "Vertex Global", Product: "Air Purifier Pro", Category: "Electronics", Region: "East", Quantity: 5, Sales: 1995.0, Discount: 0.08, Profit: 460.0 },
  { Order_ID: "ORD-1051", Order_Date: "2025-01-24", Customer: "BlueWave Energy", Product: "Bookcase 5-Tier Oak", Category: "Furniture", Region: "South", Quantity: 4, Sales: 1360.0, Discount: 0.1, Profit: 280.0 },
  { Order_ID: "ORD-1052", Order_Date: "2025-02-02", Customer: "Aura Retail", Product: "Binder Clips Jumbo Box", Category: "Office Supplies", Region: "West", Quantity: 35, Sales: 175.0, Discount: 0.0, Profit: 52.0 },
  { Order_ID: "ORD-1053", Order_Date: "2025-02-10", Customer: "Zenith Logistics", Product: "Thermal Receipt Printer", Category: "Electronics", Region: "Central", Quantity: 6, Sales: 1140.0, Discount: 0.05, Profit: 290.0 },
  { Order_ID: "ORD-1054", Order_Date: "2025-02-18", Customer: "Pulse Health", Product: "Medical Grade Tablet", Category: "Technology", Region: "North", Quantity: 3, Sales: 3297.0, Discount: 0.05, Profit: 820.0 },
  { Order_ID: "ORD-1055", Order_Date: "2025-02-26", Customer: "CyberCloud LLC", Product: "Herman Miller Aeron", Category: "Furniture", Region: "East", Quantity: 4, Sales: 5580.0, Discount: 0.1, Profit: 1350.0 },
  { Order_ID: "ORD-1056", Order_Date: "2025-03-05", Customer: "Horizon Ventures", Product: "Ergonomic Footrest", Category: "Office Supplies", Region: "West", Quantity: 18, Sales: 720.0, Discount: 0.05, Profit: 210.0 },
  { Order_ID: "ORD-1057", Order_Date: "2025-03-14", Customer: "Acme Corp", Product: "Sony WH-1000XM5", Category: "Electronics", Region: "North", Quantity: 9, Sales: 3591.0, Discount: 0.08, Profit: 920.0 },
  { Order_ID: "ORD-1058", Order_Date: "2025-03-22", Customer: "Apex Systems", Product: "Fiber Optic Switch 24P", Category: "Technology", Region: "West", Quantity: 2, Sales: 3800.0, Discount: 0.05, Profit: 980.0 },
  { Order_ID: "ORD-1059", Order_Date: "2025-03-30", Customer: "Global Tech", Product: "Modular Lounge Seating", Category: "Furniture", Region: "East", Quantity: 1, Sales: 2800.0, Discount: 0.15, Profit: 460.0 },
  { Order_ID: "ORD-1060", Order_Date: "2025-04-08", Customer: "Nexus Labs", Product: "Heavy Punch 3-Hole", Category: "Office Supplies", Region: "North", Quantity: 12, Sales: 360.0, Discount: 0.0, Profit: 105.0 },
  { Order_ID: "ORD-1100", Order_Date: "2026-03-19", Customer: "Quantum Dynamics", Product: "Special Enterprise AI Server", Category: "Technology", Region: "North", Quantity: 1, Sales: 28500.0, Discount: 0.0, Profit: 8900.0 }
];

export const sampleSalesDataset = SAMPLE_SALES_DATA;

