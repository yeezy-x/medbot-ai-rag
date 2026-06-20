import { v4 as uuid } from "uuid";

export function createRequestId() {
  return `req_${uuid()}`;
}