import axios from "axios";

const MOSTAR_API_URL =
  "https://api.mostar-airport.ba/redirect?url=https://omo.nais.aero/as-frontend/schedule/current?after=99999999";

interface MostarApiRow {
  AD: string;
  brlet: string;
  fromto: string;
  operlong: string;
  schtime: string;
  sifFromto?: string;
}

export interface MostarFlight {
  airport: string;
  type: string;
  flightNumber: string;
  destination: string;
  time: string;
  airline: string;
  iata: string;
  date: string;
}

function formatTime(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toTimeString().slice(0, 5);
  } catch {
    return iso.slice(11, 16);
  }
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return iso.slice(0, 10);
  }
}

export async function scrapeMostarFlights(): Promise<MostarFlight[]> {
  const { data } = await axios.get<MostarApiRow[]>(MOSTAR_API_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!Array.isArray(data)) return [];

  return data
    .filter((row) => row.brlet && row.fromto && row.schtime)
    .map((row) => ({
      airport: "Mostar",
      type: row.AD === "ARRIVAL" ? "Arrivals" : "Departures",
      flightNumber: row.brlet.trim(),
      destination: row.fromto.trim(),
      time: formatTime(row.schtime),
      airline: (row.operlong || "").trim(),
      iata: (row.sifFromto || "").trim(),
      date: formatDate(row.schtime),
    }));
}
