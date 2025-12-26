import ListingCard from "../components/listing/ListingCard";
import { useNavigate } from "react-router-dom";

const featured = [
  {
    id: 1,
    title: "Toyota Prius 2017 S Touring",
    district: "Colombo",
    city: "Nugegoda",
    year: 2017,
    mileage: 78000,
    price: 7850000,
    featured: true,
    boosted: true,
    priceLabel: "FAIR",
    image: "https://picsum.photos/600/400?car=1",
  },
  {
    id: 2,
    title: "Honda Fit GP5 2015 (Hybrid)",
    district: "Gampaha",
    city: "Negombo",
    year: 2015,
    mileage: 92000,
    price: 6250000,
    featured: true,
    boosted: false,
    priceLabel: "BELOW",
    image: "https://picsum.photos/600/400?car=2",
  },
  {
    id: 3,
    title: "Suzuki Alto 2020 (Auto)",
    district: "Kandy",
    city: "Kandy",
    year: 2020,
    mileage: 41000,
    price: 4450000,
    featured: false,
    boosted: true,
    priceLabel: "ABOVE",
    image: "https://picsum.photos/600/400?car=3",
  },
];

const latest = Array.from({ length: 8 }).map((_, i) => ({
  id: 100 + i,
  title: i % 2 === 0 ? "Toyota Aqua 2016" : "Nissan X-Trail 2014",
  district: i % 2 === 0 ? "Colombo" : "Kurunegala",
  city: i % 2 === 0 ? "Colombo" : "Kuliyapitiya",
  year: i % 2 === 0 ? 2016 : 2014,
  mileage: 60000 + i * 3500,
  price: 5200000 + i * 180000,
  featured: false,
  boosted: false,
  priceLabel: null,
  image: `https://picsum.photos/600/400?car=latest-${i}`,
}));

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="p-4 md:p-0 space-y-5">
      {/* Hero/Search */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Find your next ride</h1>
              <p className="text-sm text-base-content/70">
                Cars, bikes, vans, 3-wheelers & more — Sri Lanka.
              </p>
            </div>

            <div className="hidden md:flex gap-2">
              <button className="btn btn-outline">Post Ad</button>
              <button className="btn btn-primary">Login</button>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <input
              className="input input-bordered w-full"
              placeholder="Search make/model (e.g., Prius, Alto, CB150)"
            />
            <button className="btn btn-primary" onClick={() => nav("/search")}>
              Search
            </button>
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            <button className="btn btn-sm">Cars</button>
            <button className="btn btn-sm">Bikes</button>
            <button className="btn btn-sm">Vans</button>
            <button className="btn btn-sm">3-Wheel</button>
            <button className="btn btn-sm">Lorries</button>
            <button className="btn btn-sm">Tractors</button>
          </div>
        </div>
      </div>

      {/* Featured */}
      <SectionHeader title="Featured picks" action="View all" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {featured.map((x) => (
          <ListingCard key={x.id} item={x} />
        ))}
      </div>

      {/* Latest */}
      <SectionHeader title="Latest listings" action="Browse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {latest.map((x) => (
          <ListingCard key={x.id} item={x} />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button className="btn btn-link btn-sm">{action}</button>
    </div>
  );
}
