import { Router } from "express";
import snowflake from "snowflake-sdk";

const router = Router();

try {
  const snowflakeConnection = snowflake.createConnection({
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
} catch (err) {
  console.error("Unable to connect to snowflake: " + err.message);
}

function executeQuery(query, binds = []) {
  return new Promise((resolve, reject) => {
    snowflakeConnection.execute({
      sqlText: query,
      binds: binds,
      complete: function (err, stmt, rows) {
        if (err) {
          reject(err);
        } else {
          resolve({ stmt, rows });
        }
      },
    });
  });
}

router.post("/search", async (req, res) => {
  try {
    const searchQuery = req.body.searchQuery;
    await executeQuery("USE DATABASE PC_FIVETRAN_DB");
    await executeQuery("USE WAREHOUSE PC_FIVETRAN_WH");
    const sql = `
      SELECT NAME, TYPE, WEBSITE,
             JAROWINKLER_SIMILARITY(NAME, ?) AS similarity_score
      FROM PC_FIVETRAN_DB.SALESFORCE.ACCOUNT
      ORDER BY similarity_score DESC
      LIMIT 3
    `;
    const { rows } = await executeQuery(sql, [searchQuery]);

    if (rows && rows.length > 0) {
      const finalData = rows.filter((row) => Number(row.SIMILARITY_SCORE) > 55);
      return res.json({ searchResults: finalData });
    } else {
      console.log("Failed to search due to no data found.");
      return res.status(200).json({ error: "No data found" });
    }
  } catch (e) {
    console.error("Failed to search:", e);
    return res.status(200).json({ error: "Failed to search" });
  }
});

