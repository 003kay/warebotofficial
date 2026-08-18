import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

// TanStack Start's request handler is responsible for:
// - SSR page requests
// - server routes such as /api/public/auth/discord/login
// - server functions used by the dashboard
const fetch = createStartHandler(defaultStreamHandler);

export default createServerEntry({
  fetch,
});
