import { analytics } from "./analytics";
import { api } from "./api";
import { auth } from "./auth";
import { bookings } from "./bookings";
import { common } from "./common";
import { customers } from "./customers";
import { dashboard } from "./dashboard";
import { editor } from "./editor";
import { emails } from "./emails";
import { guideEmbed } from "./guide-embed";
import { landing } from "./landing";
import { legal } from "./legal";
import { marketing } from "./marketing";
import { pricing } from "./pricing";
import { profile } from "./profile";
import { reviews } from "./reviews";
import { settings } from "./settings";

export const en: Record<string, Record<string, string>> = {
  analytics,
  api,
  auth,
  bookings,
  common,
  customers,
  dashboard,
  editor,
  emails,
  "guide-embed": guideEmbed,
  landing,
  legal,
  marketing,
  pricing,
  profile,
  reviews,
  settings,
};
