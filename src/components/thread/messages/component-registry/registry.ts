import StockAnalysisComponent from "../stock-analysis/stock-analysis";
import LineChart from "./charts/LineChart";
import SimulationChart from "./charts/SimulationChart";
import TradingViewSymbolOverview from "./charts/TradingViewSymbolOverview";
import StockLivePrice from "./StockLivePrice";

export const ComponentRegistry = {
  line_chart: LineChart,
  trading_view_symbol_overview: TradingViewSymbolOverview,
  stock_live_price: StockLivePrice,
  simulation_chart: SimulationChart,
  stock_analysis: StockAnalysisComponent,
};
