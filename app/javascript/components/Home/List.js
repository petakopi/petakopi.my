import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/inertia-react";
import { applyFiltersToUrl } from "../../utils/filters";

const MAPS_API_URL = "/api/v1/maps";

export default function List({ filters = {} }) {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoffeeShops = async () => {
      setLoading(true);
      try {
        // Build URL with filters
        const url = new URL(MAPS_API_URL, window.location.origin);

        // Apply filters using the shared function
        applyFiltersToUrl(url, filters);

        const response = await fetch(url);
        const { data } = await response.json();
        setCoffeeShops(data.coffee_shops);
      } catch (error) {
        console.error("Error fetching coffee shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoffeeShops();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {coffeeShops.map((shop) => (
        <Link
          key={shop.id}
          href={shop.url}
          className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            {shop.logo_url && (
              <img
                src={shop.logo_url}
                alt={`${shop.name} logo`}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
              <p className="text-sm text-gray-600">{shop.address}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
