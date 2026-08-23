"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UserGrowthChartProps {
  data?: { month: string; users: number }[];
}

export function UserGrowthChart({ data = [] }: UserGrowthChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0ECE1] p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#1E1E1E]">
          Gesamtzahl der Nutzer
        </h3>
        <p className="text-xs text-[#718096] mt-0.5">
          Sehen Sie Ihre Nutzer pro Jahr.
        </p>
      </div>

      <div className="w-full h-64 mt-2">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[#718096]">
            Keine Nutzerdaten verfügbar.
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00BCD4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00BCD4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#F0F4F8" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#718096" }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#718096" }}
              tickFormatter={(val) => `${val.toLocaleString("de-DE")}`}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#1E1E1E] text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                      <span className="font-semibold">
                        {payload[0].value?.toLocaleString("de-DE")} Nutzer
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#00BCD4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#userGrowthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
