export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: "residential" | "commercial" | "agricultural";
  size: string;
  image: string;
  description: string;
  createdAt: string;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Premium Sea-View Plot",
    price: 15000000,
    location: "ECR, Chennai",
    type: "residential",
    size: "2400 sq.ft",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
    description: "Exclusive sea-facing property in prime ECR locality with approved boundaries.",
    createdAt: "2026-03-20T10:00:00Z"
  },
  {
    id: "2",
    title: "Corner Highway Land",
    price: 3500000,
    location: "Madurai Bypass",
    type: "commercial",
    size: "1 Acre",
    image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90",
    description: "High-visibility commercial plot ideal for showrooms or warehouses.",
    createdAt: "2026-03-24T12:00:00Z"
  },
  {
    id: "3",
    title: "Eco-Valley Farmland",
    price: 1200000,
    location: "Kodaikanal Foothills",
    type: "agricultural",
    size: "5 Acres",
    image: "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6",
    description: "Fertile land with natural stream, perfect for eco-resort or organic farming.",
    createdAt: "2026-03-25T08:30:00Z"
  },
  {
    id: "4",
    title: "Urban Residential Grid",
    price: 8500000,
    location: "Coimbatore North",
    type: "residential",
    size: "1800 sq.ft",
    image: "https://images.unsplash.com/photo-1550998823-380d322ec47c",
    description: "Gated community plot with all modern amenities and 24/7 security.",
    createdAt: "2026-03-26T09:15:00Z"
  },
  {
    id: "5",
    title: "Industrial Estate Zone",
    price: 45000000,
    location: "Sriperumbudur",
    type: "commercial",
    size: "10 Acres",
    image: "https://images.unsplash.com/photo-1518398046578-8cca57782e17",
    description: "Heavy industrial zone with direct highway access and strong power grid.",
    createdAt: "2026-03-27T14:45:00Z"
  },
  {
    id: "6",
    title: "Hilltop Vista Plot",
    price: 22000000,
    location: "Ooty Main",
    type: "residential",
    size: "1.5 Acres",
    image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
    description: "Breathtaking hilltop property allowing unrestricted valley views.",
    createdAt: "2026-03-28T07:20:00Z"
  }
];
// Utility functions moved to src/lib/utils.ts
