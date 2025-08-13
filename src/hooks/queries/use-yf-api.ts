import { useQuery } from "@tanstack/react-query";

export const useYfLatestPrice = (ticker: string) => {
  return useQuery({
    queryKey: ["yf-latest-price", ticker?.toUpperCase?.() ?? ticker],
    queryFn: async () => {
      const url = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${url}/stock-details/quote/${ticker}`);
      const data = await response.json();
      return data;
    },
    enabled: !!ticker,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });
};
