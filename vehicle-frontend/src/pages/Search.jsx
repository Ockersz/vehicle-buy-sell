import { useEffect, useState } from "react";
import { searchListings } from "../services/listings";

export default function Search() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await searchListings({
          page: 1,
          page_size: 10,
        });

        console.log("LISTINGS RESPONSE:", res);
        setData(res);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load listings"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-4">Loading…</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-error">
        Error loading listings: {error}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">DEBUG: Raw API Data</h1>

      <pre className="bg-base-200 p-4 rounded-xl text-xs overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
