import type { Metadata } from "next";
import { ContactTeam } from "@/components/watermelon/contact-team";

export const metadata: Metadata = {
  title: "Team Hind | UrjaKavach Decarbonization Platform",
  description:
    "Meet Team Hind: Engineers building UrjaKavach — closed-loop pyrometallurgical carbon & energy intelligence platform for 3+ MTPA stainless steel production complexes.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ContactTeam />
    </div>
  );
}
