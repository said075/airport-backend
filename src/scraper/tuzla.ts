import axios from "axios";
import * as cheerio from "cheerio";

const TUZLA_API_URL = "https://tuzla-airport.ba/wp-json/wp/v2/pages/12058";

export interface TuzlaFlight {
  airport: string;
  date: string;
  type: string;
  time: string;
  airline: string;
  city: string;
  iata: string;
}

export async function scrapeTuzlaFlights(): Promise<TuzlaFlight[]> {
  const { data } = await axios.get<{ content?: { rendered?: string } }>(TUZLA_API_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const html = data?.content?.rendered ?? "";
  const load =
    (cheerio as unknown as { load?: (h: string) => unknown; default?: (h: string) => unknown }).load ??
    (cheerio as unknown as { default?: (h: string) => unknown }).default;
  if (typeof load !== "function") throw new Error("cheerio.load not available");
  const $ = load(html) as ReturnType<typeof import("cheerio")["load"]>;
  const schedules: TuzlaFlight[] = [];

  const container = $(".msi-schedule-container");
  if (!container.length) return schedules;

  container.find(".msi-date-section").each((_, sectionEl) => {
    const section = $(sectionEl);
    const date = section.find(".msi-date-header").first().text().trim();
    section.find(".msi-schedule-table").each((i, table) => {
      const type = section.find(".msi-flight-type-header").eq(i).text().trim();
      $(table)
        .find("tbody tr")
        .each((__, row) => {
          const cols = $(row).find("td");
          if (cols.length >= 4) {
            const time = $(cols[0]).text().trim();
            const airlineCell = $(cols[1]);
            const airline = airlineCell.find("img").attr("alt")?.trim() || airlineCell.text().trim();
            const city = $(cols[2]).text().trim();
            const iata = $(cols[3]).text().trim();
            if (time && city && iata) {
              schedules.push({
                airport: "Tuzla",
                date,
                type: type || "Other",
                time,
                airline,
                city,
                iata,
              });
            }
          }
        });
    });
  });

  return schedules;
}
