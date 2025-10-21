import { createRequestHandler } from "@remix-run/vercel";
import * as build from "../build/index.js";

export default createRequestHandler({ build });
