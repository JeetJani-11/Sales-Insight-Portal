import express from "express";
import cors from "cors";
import snowflake from "snowflake-sdk";
import { ChromaClient } from "chromadb";

const app = express();
app.use(cors());

export const snowflakeConnection = snowflake.createConnection({
  account: "sqsksom-lc92516",
  username: "JNJMAVLON",
  password: "eufPWTrsknj!CG9",
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
