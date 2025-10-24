import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface ReadymadeTemplatesProps {
    onTemplateSelect: (template: string) => void;
}

const ReadymadeTemplates: React.FC<ReadymadeTemplatesProps> = ({ onTemplateSelect }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const handleTemplateClick = (template: string) => {
        setSelectedTemplate(template);
        onTemplateSelect(template);
    };
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Readymade Templates <ExternalLink /></Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Select A Template</SheetTitle>
                </SheetHeader>
                <div className="grid px-4">
                    <Tabs defaultValue="bullish" className="w-[350px]">
                        <TabsList>
                            <TabsTrigger className='mx-3' value="bullish">Bullish</TabsTrigger>
                            <TabsTrigger className='mx-3' value="bearish">Bearish</TabsTrigger>
                            <TabsTrigger className='mx-3' value="neutral">Neutral</TabsTrigger>
                            <TabsTrigger className='mx-3' value="others">Others</TabsTrigger>
                        </TabsList>
                        <TabsContent value="bullish" >
                            <div className="grid grid-cols-2 gap-3">
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Buy Call' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Buy Call')} >
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M1.012 30L29.968 30 37.758 23" transform="translate(1 1)"></path>
                                                    <path stroke="green" strokeWidth="2" d="M38 23L55.577 7.012" transform="translate(1 1)"></path>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Buy Call</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Sell Put' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Sell Put')} >
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M0.968 37L15 23" transform="translate(1 1)"></path>
                                                    <path stroke="green" strokeWidth="2" d="M15 23L31.049 6 56.712 6" transform="translate(1 1)"></path>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Sell Put</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Bull Call Spread' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Bull Call Spread')} >
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M0 31L14.968 31 25.095 23" transform="translate(1 1)"></path>
                                                    <path stroke="green" strokeWidth="2" d="M25.095 23L45.049 6 60 6" transform="translate(1 1)"></path>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Bull Call Spread</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Bull Put Spread' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Bull Put Spread')} >
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M1 38.988L13.009 38.988 31 23" transform="translate(1 1)"></path>
                                                    <path stroke="green" strokeWidth="2" d="M31 23L38.618 16 55.967 16" transform="translate(1 1)"></path>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Bull Put Spread</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Call Ratio Back Spread' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Call Ratio Back Spread')} >
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="red" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) translate(1 8)"></path>
                                                        <path stroke="green" d="M40 16L54 0.5" transform="translate(1 1) translate(1 8)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Call Ratio Back Spread</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                            </div>
                        </TabsContent>
                        <TabsContent value="bearish">
                            <div className="grid grid-cols-2 gap-3">
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Buy Put' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Buy Put')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="red" d="M0 22.988L28.955 22.988 36.745 15.988" transform="translate(1 1) matrix(-1 0 0 1 56 7)"></path>
                                                        <path stroke="green" d="M36.988 15.988L54.564 0" transform="translate(1 1) matrix(-1 0 0 1 56 7)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Buy Put</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Sell Call' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Sell Call')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 23L26.955 22.988 34.745 15.988" transform="translate(1 1) matrix(1 0 0 -1 1 39)"></path>
                                                        <path stroke="red" d="M34.988 15.988L52.564 0" transform="translate(1 1) matrix(1 0 0 -1 1 39)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Sell Call</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Bear Put Spread' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Bear Put Spread')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 22.988L12.009 22.988 30 7" transform="translate(1 1) matrix(1 0 0 -1 1 30)"></path>
                                                        <path stroke="red" d="M30 7L37.618 0 54.967 0" transform="translate(1 1) matrix(1 0 0 -1 1 30)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Bear Put Spread</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Bear Call Spread' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Bear Call Spread')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 14L60 14" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 22.988L12.009 22.988 19.491 16.031" transform="translate(1 1) matrix(1 0 0 -1 1 30)"></path>
                                                        <path stroke="red" d="M19.491 16.031L37.618 0 54.967 0" transform="translate(1 1) matrix(1 0 0 -1 1 30)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Bear Call Spread</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Put Ratio Back Spread' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Put Ratio Back Spread')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="red" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) matrix(-1 0 0 1 55 7)"></path>
                                                        <path stroke="green" d="M40 16L54 0.5" transform="translate(1 1) matrix(-1 0 0 1 55 7)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Put Ratio Back Spread</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                            </div>
                        </TabsContent>
                        <TabsContent value="neutral">
                            <div className="grid grid-cols-2 gap-3">
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Short Straddle' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Short Straddle')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="red" d="M0 33L7.936 23.988 13.985 16.988" transform="translate(1 1) translate(0 6)"></path>
                                                        <path stroke="green" d="M13.985 16.988L29 0" transform="translate(1 1) translate(0 6)"></path>
                                                        <g>
                                                            <path stroke="red" d="M0 33L7.936 23.988 13.985 16.988" transform="translate(1 1) translate(0 6) matrix(-1 0 0 1 57 0)"></path>
                                                            <path stroke="green" d="M13.985 16.988L29 0" transform="translate(1 1) translate(0 6) matrix(-1 0 0 1 57 0)"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Short Straddle</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Iron Butterfly' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Iron Butterfly')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M0.5 32.5L17.918 32.5 21.5 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M35.5 32.5L52.918 32.5 56.5 23" transform="translate(1 1) matrix(-1 0 0 1 92 0)"></path>
                                                    <path stroke="green" strokeWidth="2" d="M21.5 23L28.244 4 35.5 23" transform="translate(1 1)"></path>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Iron Butterfly</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Short Strangle' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Short Strangle')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M1.918 38.5L7.668 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M49.44 38.5L54.452 23" transform="translate(1 1) matrix(-1 0 0 1 103.892 0)"></path>
                                                    <path stroke="green" strokeWidth="2" d="M7.668 23L12.244 10 45.528 10 49.44 23" transform="translate(1 1)"></path>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Short Strangle</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Short Iron Condor' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Short Iron Condor')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M0.5 32.5L12.918 32.5 16.5 23" transform="translate(1 1)"></path>
                                                    <path stroke="red" strokeWidth="2" d="M40.5 32.5L52.918 32.5 56.5 23" transform="translate(1 1) matrix(-1 0 0 1 97 0)"></path>
                                                    <path stroke="green" strokeWidth="2" d="M16.5 23L23.244 4 34.528 4 40.5 23" transform="translate(1 1)"></path>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Short Iron Condor</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                            </div>
                        </TabsContent>
                        <TabsContent value="others">
                            <div className="grid grid-cols-2 gap-3">
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Put Ratio Spread' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Put Ratio Spread')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) rotate(180 27.5 19.5)"></path>
                                                        <path stroke="red" d="M40 16L54 0.5" transform="translate(1 1) rotate(180 27.5 19.5)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Put Ratio Spread</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Call Ratio Spread' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Call Ratio Spread')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 20L27 20 31.798 25 40 16" transform="translate(1 1) matrix(1 0 0 -1 1 39)"></path>
                                                        <path stroke="red" d="M40 16L54 0.5" transform="translate(1 1) matrix(1 0 0 -1 1 39)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Call Ratio Spread</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Long Straddle' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Long Straddle')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 33L7.936 23.988 13.985 16.988" transform="translate(1 1) matrix(1 0 0 -1 0 39)"></path>
                                                        <path stroke="red" d="M13.985 16.988L29 0" transform="translate(1 1) matrix(1 0 0 -1 0 39)"></path>
                                                        <g>
                                                            <path stroke="green" d="M0 33L7.936 23.988 13.985 16.988" transform="translate(1 1) matrix(1 0 0 -1 0 39) matrix(-1 0 0 1 57 0)"></path>
                                                            <path stroke="red" d="M13.985 16.988L29 0" transform="translate(1 1) matrix(1 0 0 -1 0 39) matrix(-1 0 0 1 57 0)"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Long Straddle</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Long Iron Butterfly' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Long Iron Butterfly')}>
                                        <CardContent>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45" className="SVGInline-svg jss567-svg">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 19L60 19" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 28.5L17.418 28.5 21 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)"></path>
                                                        <path stroke="green" d="M35 28.5L52.418 28.5 56 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38) matrix(-1 0 0 1 91 0)"></path>
                                                        <path stroke="red" d="M21 19L27.744 0 35 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Long Iron Butterfly</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Iron Strangle' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Iron Strangle')}>
                                        <CardContent>
                                            <svg className="SVGInline-svg jss567-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 23L60 23" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 28.5L5.75 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36)"></path>
                                                        <path stroke="green" d="M47.521 28.5L52.534 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36) matrix(-1 0 0 1 100.055 0)"></path>
                                                        <path stroke="red" d="M5.75 13L10.325 0 43.61 0 47.521 13" transform="translate(1 1) matrix(1 0 0 -1 1.918 36)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Iron Strangle</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Card className={`cursor-pointer hover:bg-black ${selectedTemplate === 'Long Iron Condor' ? 'border-2 border-blue-500 bg-black' : ''}`} onClick={() => handleTemplateClick('Long Iron Condor')}>
                                        <CardContent>
                                            <svg className="SVGInline-svg jss567-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 45">
                                                <g fill="none" fillRule="evenodd">
                                                    <path stroke="grey" strokeLinecap="square" d="M0.5 0L0.5 43.237" transform="translate(1 1)"></path>
                                                    <path stroke="grey" strokeDasharray="5 5" strokeLinecap="round" d="M0.462 19L60 19" transform="translate(1 1)"></path>
                                                    <g strokeWidth="2">
                                                        <path stroke="green" d="M0 28.5L12.418 28.5 16 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)"></path>
                                                        <path stroke="green" d="M40 28.5L52.418 28.5 56 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38) matrix(-1 0 0 1 96 0)"></path>
                                                        <path stroke="red" d="M16 19L22.744 0 34.028 0 40 19" transform="translate(1 1) matrix(1 0 0 -1 .5 38)"></path>
                                                    </g>
                                                </g>
                                            </svg>
                                        </CardContent>
                                        <CardFooter>
                                            <p>Long Iron Condor</p>
                                        </CardFooter>
                                    </Card>
                                </SheetClose>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default ReadymadeTemplates;