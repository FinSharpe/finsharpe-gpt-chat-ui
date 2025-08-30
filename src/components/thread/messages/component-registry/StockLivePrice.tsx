"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // CarouselNext,
  // CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useYfLatestPrice } from "@/hooks/queries/use-yf-api";
import Autoplay from "embla-carousel-autoplay";

type Props = {
  tickers?: string[];
};

export default function StockLivePrice({ tickers }: Props) {
  if (!tickers) return null;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      className="max-w-3xl"
    >
      <CarouselContent className="-ml-6">
        {tickers?.map((ticker) => (
          <CarouselItem
            className="basis-1/2 pl-6"
            key={ticker}
          >
            <StockCard ticker={ticker} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious />
      <CarouselNext /> */}
    </Carousel>
  );
}

function StockCard({ ticker }: { ticker: string }) {
  const { data, isLoading, error } = useYfLatestPrice(ticker);

  const price = data?.regularMarketPrice ?? 0;
  const change = data?.regularMarketChange ?? 0;
  const changePct = data?.regularMarketChangePercent ?? 0;
  const currency = data?.currency ?? "";
  const name = data?.shortName || data?.longName || data?.symbol || ticker;

  const isUp = change >= 0;
  const changeColor = isUp ? "text-emerald-600" : "text-rose-600";
  const changeBg = isUp ? "bg-emerald-500/10" : "bg-rose-500/10";

  return (
    <Card className="w-96">
      <CardHeader className="flex-row items-center gap-3">
        <Avatar>
          <AvatarImage
            src={getCompanyLogoUrl(ticker)}
            alt={`${ticker} logo`}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <AvatarFallback className="font-medium">
            {getTickerInitials(ticker)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="truncate">{name}</CardTitle>
          <CardDescription className="truncate">
            {ticker.toUpperCase()} • {data?.fullExchangeName ?? "Yahoo Finance"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-baseline gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
        ) : error ? (
          <div className="text-sm text-rose-600">
            Failed to load price. Please try again.
          </div>
        ) : (
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-semibold tracking-tight">
                {formatNumber(price)}
              </div>
              <div className="text-muted-foreground text-sm">{currency}</div>
            </div>
            <div
              className={`${changeBg} ${changeColor} rounded-full px-2 py-1 text-sm font-medium`}
            >
              {isUp ? "▲" : "▼"} {formatSigned(change)} (
              {formatSigned(changePct)}%)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getTickerInitials(symbol: string): string {
  return (symbol || "").trim().slice(0, 3).toUpperCase();
}

// Use Clearbit company logo as a convenient free logo CDN. If the ticker looks like
// a domain (contains a dot and no spaces), we use it directly; otherwise, attempt
// common mappings for major exchanges. Fallback will show initials.
function getCompanyLogoUrl(symbol: string): string {
  const s = (symbol || "").trim().toUpperCase();
  // Very light-weight heuristic mapping for well-known tickers
  const map: Record<string, string> = {
    AAPL: "apple.com",
    MSFT: "microsoft.com",
    GOOGL: "abc.xyz",
    GOOG: "abc.xyz",
    AMZN: "amazon.com",
    META: "meta.com",
    TSLA: "tesla.com",
    NVDA: "nvidia.com",
    NFLX: "netflix.com",
    AMD: "amd.com",
    INTC: "intel.com",
    ORCL: "oracle.com",
    CRM: "salesforce.com",
    SHOP: "shopify.com",
    PYPL: "paypal.com",
    SQ: "block.xyz",
    IBM: "ibm.com",
    UBS: "ubs.com",
  };
  const domain = map[s];
  return domain
    ? `https://logo.clearbit.com/${domain}`
    : `https://logo.clearbit.com/${s.toLowerCase()}.com`;
}

function formatNumber(n: number): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "-";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(n);
}

function formatSigned(n: number): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "-";
  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    signDisplay: "always",
  });
  return formatter.format(n);
}
