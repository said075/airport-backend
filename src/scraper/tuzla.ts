import axios from "axios";
import * as cheerio from "cheerio";

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
  const url = "https://tuzla-airport.ba/informacije-o-letovima/";
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const load = (cheerio as unknown as { load?: (html: string) => unknown; default?: (html: string) => unknown }).load
    ?? (cheerio as unknown as { default?: (html: string) => unknown }).default;
  if (typeof load !== "function") throw new Error("cheerio.load not available");
  const $ = load(data) as ReturnType<typeof import("cheerio")["load"]>;
  const schedules: TuzlaFlight[] = [];

  const container = $(".msi-schedule-container");
  const date = container.find(".msi-date-header").text().trim();

  container.find(".msi-schedule-table").each((i, table) => {
    const type = container.find(".msi-flight-type-header").eq(i).text().trim();

    $(table).find("tbody tr").each((_, row) => {
      const cols = $(row).find("td");
      if (cols.length >= 4) {
        schedules.push({
          airport: "Tuzla",
          date,
          type,
          time: $(cols[0]).text().trim(),
          airline: $(cols[1]).text().trim(),
          city: $(cols[2]).text().trim(),
          iata: $(cols[3]).text().trim(),
        });
      }
    });
  });

  return schedules;
}