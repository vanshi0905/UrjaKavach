import type { Metadata } from "next";
import { ContactTeam } from "@/components/watermelon/contact-team";

export const metadata: Metadata = {
  title: "Team Hind | JSL Decarbonization Cockpit",
  description:
    "Meet Team Hind: Engineers building the closed-loop pyrometallurgical carbon and energy cockpit for Jindal Stainless Limited.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ContactTeam />
    </div>
  );
}
