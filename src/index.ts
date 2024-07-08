import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
// import helmet from "helmet";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

import "dotenv/config";
import { tools } from "./lib/db/schema";
import { db } from "./lib/db";

const PORT = process.env.PORT || 4000;
const app = express();

app.use(morgan("dev"));
// app.use(helmet());
app.use(cors());
app.use(express.json());

// (async () => {
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
// Note you must call `start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
await server.start();

app.use("/graphql", cors(), json(), expressMiddleware(server));

app.get("/", async (_, res) => {
  const toolsRes = await db.select().from(tools);
  res.status(200).send({ message: "I am aliveee...", toolsRes });
});

app.get("/test", async (_, res) => {
  res.status(200).send({ message: "I am aliveee..." });
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Express server is running on: http://localhost:${PORT}`);
  console.log(`GraphQL server is running on: http://localhost:${PORT}/graphql`);
});
// })();
