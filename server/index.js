import express from "express";
import cors from "cors";
import snowflake from "snowflake-sdk";
import "dotenv/config";
import AccountRouter from "./routes/account.js";
import NeedsAndRiskRouter from "./routes/needsAndRisks.js";
import RecentUpdates from "./routes/recentUpdates.js";
import ContactSummaryRouter from "./routes/contactSummary.js";
import NextStepsRouter from "./routes/nextSteps.js";
import RecentActivitiesRouter from "./routes/recentActivities.js";
import SearchRouter from "./routes/search.js";
import StrategyRouter from "./routes/strategy.js";
import { createClient } from "redis";

const port = process.env.PORT || 10000 ;
const redisClient = createClient({
  username: "default",
  password: process.env.REDISPASS,
  socket: {
    host: process.env.REDISHOST,
    port: 16950,
  },
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

const app = express();
app.use(cors());
app.use(express.json());
app.use(AccountRouter);
app.use(NeedsAndRiskRouter);
app.use(RecentUpdates);
app.use(ContactSummaryRouter);
app.use(NextStepsRouter);
app.use(RecentActivitiesRouter);
app.use(SearchRouter);
app.use(StrategyRouter);

export const snowflakeConnection = snowflake.createConnection({
  account: process.env.SNOWFLAKEACCOUNT,
  username: process.env.SNOWFLAKEUNAME,
  password: process.env.SNOWFLAKEPASS,
  role: "ACCOUNTADMIN",
  clientSessionKeepAlive: true,
});

snowflakeConnection.connect((err, conn) => {
  if (err) {
    console.error("Failed to connect to Snowflake", err);
  } else {
    console.log("Connected to Snowflake.");
  }
});

app.listen(port, () => {
  console.log("Server is running on http://localhost:3000");
});

export { redisClient };
