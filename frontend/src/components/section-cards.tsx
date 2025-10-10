import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

type SectionCard = {
  path: string;
  icon: React.ReactNode;
  title: string;
};

interface SectionCardsProps {
  cards: SectionCard[];
}

export function SectionCards({ cards }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="bg-card/50 text-card-foreground backdrop-blur-md border border-white/20 hover:bg-accent/50 transition-colors"
        >
          <Link to={card.path} className="block h-full">
            <CardHeader className="flex flex-col items-center pb-2">
              <div className="text-3xl mb-2">{card.icon}</div>
              <CardTitle className="text-sm font-medium text-center">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {/* Add more content if needed */}
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}