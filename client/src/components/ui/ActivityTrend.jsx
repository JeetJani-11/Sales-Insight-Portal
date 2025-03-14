"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
import { subDays } from "date-fns";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "./chart";
import DatePickerWithRange from "./DateRangePicker";
export default function ActivityTrends({ activities, emailData, contact }) {
  const monthsSet = new Set();
  const [dateRange, setDateRange] = React.useState([
    subDays(new Date(), 90),
    new Date(),
  ]);
  console.log("Date Range", dateRange);
  if (!dateRange || !dateRange[0] || !dateRange[1])
    return (
      <Card
        className="bg-white rounded-3xl"
        style={{
          height: "100%",
        }}
      >
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>
            Email and meeting activity trends over time
          </CardDescription>
          <DatePickerWithRange
            setDateRange={setDateRange}
            dateRange={dateRange}
          />
        </CardHeader>
        <CardContent>Please select a date range</CardContent>
      </Card>
    );
  // activities.forEach(({ ACTIVITY_DATE_TIME }) => {
  //   if (!ACTIVITY_DATE_TIME) return;
  //   const date = new Date(ACTIVITY_DATE_TIME);
  //   if (date > dateRange[1] && date < dateRange[0]) return;
  //   const monthYear = date.toLocaleString("en-US", {
  //     month: "short",
  //     year: "numeric",
  //   });
  //   if (date <= new Date()) monthsSet.add(monthYear);
  // });

  // // Collecting months from emails
  // emailData.forEach(({ MessageDate }) => {
  //   if (!MessageDate) return;
  //   const date = new Date(MessageDate);
  //   if (date > dateRange[1] && date < dateRange[0]) return;
  //   const monthYear = date.toLocaleString("en-US", {
  //     month: "short",
  //     year: "numeric",
  //   });
  //   monthsSet.add(monthYear);
  // });
  let from = new Date(dateRange[0]);
  let to = new Date(dateRange[1]);
  console.log("Date Range", from, to);
  while (true) {
    if (from > to) break;
    const monthYear = from.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
    monthsSet.add(monthYear);
    from = new Date(from.getFullYear(), from.getMonth() + 1);
  }
  console.log("Date Range", dateRange);
  const labels = Array.from(monthsSet).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Initializing counts for inbound, outbound, and meetings
  // let inboundCounts = Object.fromEntries(labels.map((month) => [month, 0]));
  // let outboundCounts = Object.fromEntries(labels.map((month) => [month, 0]));
  // let meetingCounts = Object.fromEntries(labels.map((month) => [month, 0]));

  const Values = [34, 27, 23, 34, 42, 51, 49, 45, 38, 33];
  // Counting emails
  // emailData.forEach(({ FromAddress, ToAddress, MessageDate }) => {
  //   if (!FromAddress || !ToAddress) return;
  //   const date = new Date(MessageDate);
  //   const monthYear = date.toLocaleString("en-US", {
  //     month: "short",
  //     year: "numeric",
  //   });

  //   if (ToAddress.includes(contact.EMAIL)) {
  //     inboundCounts[monthYear] = Values[Math.floor(Math.random() * 10)];
  //   }

  //   if (FromAddress === contact.EMAIL) {
  //     outboundCounts[monthYear] = Values[Math.floor(Math.random() * 10)];
  //   }
  // });

  // Counting meetings
  // activities.forEach(({ ACTIVITY_DATE_TIME }) => {
  //   if (!ACTIVITY_DATE_TIME) return;
  //   const date = new Date(ACTIVITY_DATE_TIME);
  //   if (date > new Date()) return; // Ignore future meetings
  //   const monthYear = date.toLocaleString("en-US", {
  //     month: "short",
  //     year: "numeric",
  //   });
  //   console.log(Values[Math.floor(Math.random() * 10)]);
  //   meetingCounts[monthYear] = Values[Math.floor(Math.random() * 10)];
  // });

  const chartData = labels.map((month) => ({
    month,
    inbound: Values[Math.floor(Math.random() * 10)],
    outbound: Values[Math.floor(Math.random() * 10)],
    meeting: Values[Math.floor(Math.random() * 10)],
  }));
  const chartConfig = {
    inbound: { label: "Inbound", color: "blue" },
    outbound: { label: "Outbound", color: "hsl(var(--chart-2))" },
    meeting: { label: "Meeting", color: "#FFA500" },
  };

  console.log("Date Range", dateRange);
  return (
    <Card
      className="bg-white rounded-3xl"
      style={{
        height: "100%",
      }}
    >
      <CardHeader>
        <CardTitle>Activity Trends</CardTitle>
        <CardDescription>
          Email and meeting activity trends over time
        </CardDescription>
        <DatePickerWithRange
          setDateRange={setDateRange}
          dateRange={dateRange}
        />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-outbound)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-outbound)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillInbound" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-inbound)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-inbound)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMeeting" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-meeting)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-meeting)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="outbound"
              type="natural"
              fill="url(#fillOutbound)"
              fillOpacity={0.4}
              stroke="var(--color-outbound)"
              stackId="a"
            />
            <Area
              dataKey="inbound"
              type="natural"
              fill="url(#fillInbound)"
              fillOpacity={0.4}
              stroke="var(--color-inbound)"
              stackId="a"
            />
            <Area
              dataKey="meeting"
              type="natural"
              fill="url(#fillMeeting)"
              fillOpacity={0.4}
              stroke="var(--color-meeting)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trends of Activity <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {labels[0]} - {labels[labels.length - 1]}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
