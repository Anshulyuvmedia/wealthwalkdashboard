import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const bullish = [
    "Buy Call",
    "Sell Put",
    "Bull Call Spread",
    "Bull Put Spread",
    "Call Ratio Back Spread",
] as const;

const bearish = [
    "Buy Put",
    "Sell Call",
    "Bear Put Spread",
    "Bear Call Spread",
    "Put Ratio Back Spread",
] as const;

const neutral = [
    "Short Straddle",
    "Iron Butterfly",
    "Short Strangle",
    "Short Iron Condor",
] as const;

const others = [
    "Put Ratio Spread",
    "Call Ratio Spread",
    "Long Straddle",
    "Long Iron Butterfly",
    "Iron Strangle",
    "Long Iron Condor",
] as const;


interface ReadymadeTemplatesProps {
    /** The template that is currently selected in OrderSettings */
    selectedTemplate: string;
    /** Called when the user picks a template */
    onTemplateSelect: (template: string) => void;
}


const ReadymadeTemplates: React.FC<ReadymadeTemplatesProps> = ({
    selectedTemplate,
    onTemplateSelect,
}) => {
    const handleClick = (tmpl: string) => {
        onTemplateSelect(tmpl); // OrderLegs will instantly show the legs
    };

    /* Helper – renders a single card */
    const TemplateCard = ({
        name,
        svg,
    }: {
        name: string;
        svg: React.ReactNode;
    }) => (
        <SheetClose asChild>
            <Card
                className={`cursor-pointer hover:bg-black transition-colors ${selectedTemplate === name
                    ? "border-2 border-blue-500 bg-black text-white"
                    : ""
                    }`}
                onClick={() => handleClick(name)}
            >
                <CardContent className="px-2">{svg}</CardContent>
                <CardFooter className=" text-xs justify-center">{name}</CardFooter>
            </Card>
        </SheetClose>
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    Readymade Templates <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
            </SheetTrigger>

            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Select a Template</SheetTitle>
                </SheetHeader>

                <div className="p-3 ">
                    <Tabs defaultValue="bullish" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="bullish">Bullish</TabsTrigger>
                            <TabsTrigger value="bearish">Bearish</TabsTrigger>
                            <TabsTrigger value="neutral">Neutral</TabsTrigger>
                            <TabsTrigger value="others">Others</TabsTrigger>
                        </TabsList>

                        {/* ---------- BULLISH ---------- */}
                        <TabsContent value="bullish">
                            <div className="grid grid-cols-2 gap-3">
                                {bullish.map((name) => (
                                    <TemplateCard key={name} name={name} svg={svgMap[name]} />
                                ))}
                            </div>
                        </TabsContent>

                        {/* ---------- BEARISH ---------- */}
                        <TabsContent value="bearish">
                            <div className="grid grid-cols-2 gap-3">
                                {bearish.map((name) => (
                                    <TemplateCard key={name} name={name} svg={svgMap[name]} />
                                ))}
                            </div>
                        </TabsContent>

                        {/* ---------- NEUTRAL ---------- */}
                        <TabsContent value="neutral">
                            <div className="grid grid-cols-2 gap-3">
                                {neutral.map((name) => (
                                    <TemplateCard key={name} name={name} svg={svgMap[name]} />
                                ))}
                            </div>
                        </TabsContent>

                        {/* ---------- OTHERS ---------- */}
                        <TabsContent value="others">
                            <div className="grid grid-cols-2 gap-3">
                                {others.map((name) => (
                                    <TemplateCard key={name} name={name} svg={svgMap[name]} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <SheetFooter className="mt-6">
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default ReadymadeTemplates;

const svgMap: Record<string, React.ReactNode> = {
    "Buy Call": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M1.012 30L29.968 30 37.758 23" transform="translate(1 1)" />
                <path stroke="green" strokeWidth="2" d="M38 23L55.577 7.012" transform="translate(1 1)" />
            </g>
        </svg>
    ),
    "Sell Put": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M0.968 37L15 23" transform="translate(1 1)" />
                <path stroke="green" strokeWidth="2" d="M15 23L31.049 6 56.712 6" transform="translate(1 1)" />
            </g>
        </svg>
    ),
    "Bull Call Spread": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M0 31L14.968 31 25.095 23" transform="translate(1 1)" />
                <path stroke="green" strokeWidth="2" d="M25.095 23L45.049 6 60 6" transform="translate(1 1)" />
            </g>
        </svg>
    ),
    "Bull Put Spread": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M1 38.988L13.009 38.988 31 23" transform="translate(1 1)" />
                <path stroke="green" strokeWidth="2" d="M31 23L38.618 16 55.967 16" transform="translate(1 1)" />
            </g>
        </svg>
    ),
    "Call Ratio Back Spread": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="red" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) translate(1 8)" />
                    <path stroke="green" d="M40 16L54 0.5" transform="translate(1 1) translate(1 8)" />
                </g>
            </g>
        </svg>
    ),

    /*  BEARISH */
    "Buy Put": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="red" d="M0 22.988L28.955 22.988 36.745 15.988" transform="translate(1 1) matrix(-1 0 0 1 56 7)" />
                    <path stroke="green" d="M36.988 15.988L54.564 0" transform="translate(1 1) matrix(-1 0 0 1 56 7)" />
                </g>
            </g>
        </svg>
    ),
    "Sell Call": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 23L26.955 22.988 34.745 15.988" transform="translate(1 1) matrix(1 0 0 -1 1 39)" />
                    <path stroke="red" d="M34.988 15.988L52.564 0" transform="translate(1 1) matrix(1 0 0 -1 1 39)" />
                </g>
            </g>
        </svg>
    ),
    "Bear Put Spread": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 22.988L12.009 22.988 30 7" transform="translate(1 1) matrix(1 0 0 -1 1 30)" />
                    <path stroke="red" d="M30 7L37.618 0 54.967 0" transform="translate(1 1) matrix(1 0 0 -1 1 30)" />
                </g>
            </g>
        </svg>
    ),
    "Bear Call Spread": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 14L60 14" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 22.988L12.009 22.988 19.491 16.031" transform="translate(1 1) matrix(1 0 0 -1 1 30)" />
                    <path stroke="red" d="M19.491 16.031L37.618 0 54.967 0" transform="translate(1 1) matrix(1 0 0 -1 1 30)" />
                </g>
            </g>
        </svg>
    ),
    "Put Ratio Back Spread": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="red" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) matrix(-1 0 0 1 55 7)" />
                    <path stroke="green" d="M40 16L54 0.5" transform="translate(1 1) matrix(-1 0 0 1 55 7)" />
                </g>
            </g>
        </svg>
    ),

    /*  NEUTRAL */
    "Short Straddle": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="red" d="M0 33L7.936 23.988 13.985 16.988" transform="translate(1 1) translate(0 6)" />
                    <path stroke="green" d="M13.985 16.988L29 0" transform="translate(1 1) translate(0 6)" />
                    <g>
                        <path stroke="red" d="M0 33L7.936 23.988 13.985 16.988" transform="translate(1 1) translate(0 6) matrix(-1 0 0 1 57 0)" />
                        <path stroke="green" d="M13.985 16.988L29 0" transform="translate(1 1) translate(0 6) matrix(-1 0 0 1 57 0)" />
                    </g>
                </g>
            </g>
        </svg>
    ),
    "Iron Butterfly": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M0.5 32.5L17.918 32.5 21.5 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M35.5 32.5L52.918 32.5 56.5 23" transform="translate(1 1) matrix(-1 0 0 1 92 0)" />
                <path stroke="green" strokeWidth="2" d="M21.5 23L28.244 4 35.5 23" transform="translate(1 1)" />
            </g>
        </svg>
    ),
    "Short Strangle": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M1.918 38.5L7.668 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M49.44 38.5L54.452 23" transform="translate(1 1) matrix(-1 0 0 1 103.892 0)" />
                <path stroke="green" strokeWidth="2" d="M7.668 23L12.244 10 45.528 10 49.44 23" transform="translate(1 1)" />
            </g>
        </svg>
    ),
    "Short Iron Condor": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M0.5 32.5L12.918 32.5 16.5 23" transform="translate(1 1)" />
                <path stroke="red" strokeWidth="2" d="M40.5 32.5L52.918 32.5 56.5 23" transform="translate(1 1) matrix(-1 0 0 1 97 0)" />
                <path stroke="green" strokeWidth="2" d="M16.5 23L23.244 4 34.528 4 40.5 23" transform="translate(1 1)" />
            </g>
        </svg>
    ),

    /*  OTHERS */
    "Put Ratio Spread": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) rotate(180 27.5 19.5)" />
                    <path stroke="red" d="M40 16L54 0.5" transform="translate(1 1) rotate(180 27.5 19.5)" />
                </g>
            </g>
        </svg>
    ),
    "Call Ratio Spread": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) matrix(1 0 0 -1 1 39)" />
                    <path stroke="red" d="M40 16L54 0.5" transform="translate(1 1) matrix(1 0 0 -1 1 39)" />
                </g>
            </g>
        </svg>
    ),
    "Long Straddle": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 33L7.936 23.988 13.985 16.988" transform="translate(1 1) matrix(1 0 0 -1 0 39)" />
                    <path stroke="red" d="M13.985 16.988L29 0" transform="translate(1 1) matrix(1 0 0 -1 0 39)" />
                    <g>
                        <path stroke="green" d="M0 33L7.936 23.988 13.985 16.988" transform="translate(1 1) matrix(1 0 0 -1 0 39) matrix(-1 0 0 1 57 0)" />
                        <path stroke="red" d="M13.985 16.988L29 0" transform="translate(1 1) matrix(1 0 0 -1 0 39) matrix(-1 0 0 1 57 0)" />
                    </g>
                </g>
            </g>
        </svg>
    ),
    "Long Iron Butterfly": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 19L60 19" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 28.5L17.418 28.5 21 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)" />
                    <path stroke="green" d="M35 28.5L52.418 28.5 56 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38) matrix(-1 0 0 1 91 0)" />
                    <path stroke="red" d="M21 19L27.744 0 35 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)" />
                </g>
            </g>
        </svg>
    ),
    "Iron Strangle": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 28.5L5.75 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36)" />
                    <path stroke="green" d="M47.521 28.5L52.534 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36) matrix(-1 0 0 1 100.055 0)" />
                    <path stroke="red" d="M5.75 13L10.325 0 43.61 0 47.521 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36)" />
                </g>
            </g>
        </svg>
    ),
    "Long Iron Condor": (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
            <g fill="none" fillRule="evenodd">
                <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)" />
                <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 19L60 19" transform="translate(1 1)" />
                <g strokeWidth="2">
                    <path stroke="green" d="M0 28.5L12.418 28.5 16 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)" />
                    <path stroke="green" d="M40 28.5L52.418 28.5 56 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38) matrix(-1 0 0 1 96 0)" />
                    <path stroke="red" d="M16 19L22.744 0 34.028 0 40 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)" />
                </g>
            </g>
        </svg>
    ),
};