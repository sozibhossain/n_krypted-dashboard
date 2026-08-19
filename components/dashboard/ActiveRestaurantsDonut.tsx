"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ActiveRestaurantsDonutProps {
  activePercent?: number;
}

export function ActiveRestaurantsDonut({
  activePercent = 78,
}: ActiveRestaurantsDonutProps) {
  const data = [
    { name: "Aktive Restaurants", value: activePercent, color: "#0097A7" },
    { name: "Inaktive Restaurants", value: 100 - activePercent, color: "#E0F7FA" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#F0ECE1] p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="text-base font-bold text-[#1E1E1E]">
          Aktive Restaurants
        </h3>
        <p className="text-xs text-[#718096] mt-0.5">
          Sehen Sie Ihre Nutzer pro Jahr.
        </p>
      </div>

      <div className="relative w-full h-56 flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-[#0097A7] tracking-tight">
            {activePercent} %
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2 text-xs text-[#718096]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0097A7]" />
          <span>Aktive Restaurants</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E0F7FA] border border-[#CBD5E1]" />
          <span>Inaktive Restaurants</span>
        </div>
      </div>
    </div>
  );
}
