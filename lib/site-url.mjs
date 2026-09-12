export const SITE_URL = "https://www.luxconceptstore.com";

export function storeUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}
