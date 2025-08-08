import { capitalize, startCase } from "lodash";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReChartsLineChartComp,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data?: any[];
  colors?: {
    [key: string]: string;
  };
};

export default function LineChart({ data, colors }: Props) {
  return (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <ReChartsLineChartComp
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 30,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <YAxis
          tickFormatter={(value) => `${value.toFixed(2)}`}
          domain={["dataMin", "dataMax"]}
          unit="%"
        />
        <XAxis
          dataKey="date"
          domain={["dataMin", "dataMax"]}
          name="Time"
          tickFormatter={(unixTime) =>
            new Intl.DateTimeFormat("en-US", {
              month: "short",
              year: "2-digit",
            }).format(new Date(unixTime))
          }
          type="number"
          tickMargin={6}
          tickSize={12}
        />
        <Tooltip
          labelFormatter={(l) =>
            `Date: ${new Intl.DateTimeFormat("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date(l))}`
          }
          formatter={(value, name, props) => {
            let v = typeof value === "number" ? `${value.toFixed(2)} %` : value;
            let n = "";
            if (value) {
              n = capitalize(startCase(`${name}`));
              if (Array.isArray(value)) {
                if (!value.some((e) => e !== null)) return [];
                else v = value.join(" ~ ");
              }
            }

            return [v, n];
          }}
        />
        <Legend />
        {Object.keys(data?.[0] || {})
          .filter((k) => k !== "date")
          .map((key, index) => {
            return (
              <Line
                key={key}
                type="linear"
                dot={false}
                dataKey={key}
                stroke={colors?.[key] || "#035BFF"}
                strokeWidth={2}
              />
            );
          })}
      </ReChartsLineChartComp>
    </ResponsiveContainer>
  );
}
