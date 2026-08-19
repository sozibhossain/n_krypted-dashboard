"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RestaurantBarChartProps {
  data?: { day: string; active: number; total: number }[];
}

const defaultData = [
  { day: "Sonne", active: 25000, total: 19000 },
  { day: "Mein", active: 10000, total: 8000 },
  { day: "Di.", active: 27000, total: 22000 },
  { day: "Heiraten", active: 18000, total: 16500 },
  { day: "Sammeln", active: 16000, total: 14000 },
  { day: "Freitag", active: 10000, total: 8500 },
  { day: "Sa", active: 30000, total: 24000 },
];

export function RestaurantBarChart({ data = defaultData }: RestaurantBarChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0ECE1] p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#1E1E1E]">
          Gesamtzahl der Restaurants
        </h3>
        <p className="text-xs text-[#718096] mt-0.5">
          Sehen Sie Ihre Restaurants pro Woche.
        </p>
      </div>

      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} stroke="#F0F4F8" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#718096" }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#718096" }}
              tickFormatter={(val) => {
                if (val >= 1000) return `${val / 1000}k`;
                return `${val}`;
              }}
              domain={[0, 30000]}
              ticks={[5000, 10000, 15000, 20000, 25000, 30000]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1E1E1E] text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#0097A7]" />
                        <span>Aktiv: {payload[0]?.value?.toLocaleString("de-DE")}</span>
                      </div>
                      {payload[1] && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#B2EBF2]" />
                          <span>Gesamt: {payload[1]?.value?.toLocaleString("de-DE")}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="active" fill="#0097A7" radius={[4, 4, 0, 0]} maxBarSize={14} />
            <Bar dataKey="total" fill="#B2EBF2" radius={[4, 4, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
