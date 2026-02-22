import axios from "axios";
import * as cheerio from "cheerio";

const BNX_API_URL = "https://bnx.aero/wp-json/wp/v2/pages/12779";

export interface BanjaLukaFlight {
  airport: string;
  type: string;
  day: string;
  flightNumber: string;
  destination: string;
  time: string;
  airline: string;
}

export async function scrapeBanjaLukaFlights(): Promise<BanjaLukaFlight[]> {
  const { data } = await axios.get<{ content?: { rendered?: string } }>(BNX_API_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  let html = data?.content?.rendered ?? "";
  html = html.replace(/&#8221;/g, '"').replace(/&#8243;/g, '"');
  const flights: BanjaLukaFlight[] = [];

  const load =
    (cheerio as unknown as { load?: (h: string) => unknown; default?: (h: string) => unknown }).load ??
    (cheerio as unknown as { default?: (h: string) => unknown }).default;
  if (typeof load !== "function") throw new Error("cheerio.load not available");
  const $ = load(html) as ReturnType<typeof import("cheerio")["load"]>;

  // Page has ARRIVALS then DEPARTURES; each has tabs (Monday..Sunday) with a table per day
  const sections = [
    { type: "Arrivals", marker: "ARRIVALS" },
    { type: "Departures", marker: "DEPARTURES" },
  ];

  for (const { type, marker } of sections) {
    const markerIdx = html.indexOf(marker);
    if (markerIdx === -1) continue;
    const fromMarker = html.slice(markerIdx);
    const afterH2 = fromMarker.slice(fromMarker.indexOf("</h2>") + 5);
    const rest =
      type === "Arrivals" && afterH2.includes("DEPARTURES")
        ? afterH2.slice(0, afterH2.indexOf("DEPARTURES"))
        : afterH2;

    const sectionRegex = /\[vc_tta_section\s+title="([^"]+)"[^\]]*\][\s\S]*?<table[\s\S]*?<tbody>([\s\S]*?)<\/tbody>\s*<\/table>/gi;
    let match: RegExpExecArray | null;
    while ((match = sectionRegex.exec(rest)) !== null) {
      const day = match[1].trim();
      const tbody = match[2];
      const $table = load("<table><tbody>" + tbody + "</tbody></table>") as ReturnType<typeof import("cheerio")["load"]>;
      $table("tbody tr").each((_, row) => {
        const cols = $table(row).find("td");
        if (cols.length >= 4) {
          const airline = $table(cols[0]).find("img").attr("alt")?.trim() || "";
          const flightNumber = $table(cols[1]).text().trim();
          const destination = $table(cols[2]).text().trim();
          const time = $table(cols[3]).text().trim();
          if (flightNumber && destination && time) {
            flights.push({
              airport: "Banja Luka",
              type,
              day,
              flightNumber,
              destination,
              time,
              airline,
            });
          }
        }
      });
    }
  }

  return flights;
}
