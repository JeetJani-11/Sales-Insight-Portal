import express from "express";
import cors from "cors";
import snowflake from "snowflake-sdk";
import 'dotenv/config'
import { ChromaClient } from "chromadb";

const app = express();
app.use(cors());

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

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
