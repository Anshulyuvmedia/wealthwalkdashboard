// Updated EditSignal.tsx
import * as React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { TdSignal } from "./types";
import { mockSignals } from "./mockData";
import { toast } from "sonner";

interface SignalFormData {
    signalType: string;
    category: string;
    stockName: string;
    marketSentiments: string;
    entry: number;
    target: number;
    stopLoss: number;
    exit: number;
    tradeType: string;
    Strategy: string;
    createdAt: string;
    updatedAt: string;
}

interface FormErrors {
    category?: string;
    stockName?: string;
    marketSentiments?: string;
    entry?: string;
    target?: string;
    stopLoss?: string;
    exit?: string;
    tradeType?: string;
    Strategy?: string;
}

const EditSignal = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const isPaid = pathname.includes('/paidsignals');
    const basePath = isPaid ? '/paidsignals' : '/freesignals';
    const [formData, setFormData] = React.useState<SignalFormData>({
        signalType: '',
        category: '',
        stockName: '',
        marketSentiments: '',
        entry: 0,
        target: 0,
        stopLoss: 0,
        exit: 0,
        tradeType: '',
        Strategy: '',
        createdAt: '',
        updatedAt: '',
    });
    const [errors, setErrors] = React.useState<FormErrors>({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSignal = async () => {
            if (!id) {
                toast.error('Invalid signal ID');
                navigate(basePath);
                return;
            }
            const signal = mockSignals.find(s => s.id === parseInt(id || '0'));
            if (signal) {
                setFormData({
                    signalType: signal.signalType,
                    category: signal.category,
                    stockName: signal.stockName,
                    marketSentiments: signal.marketSentiments,
                    entry: signal.entry,
                    target: signal.target,
                    stopLoss: signal.stopLoss,
                    exit: signal.exit,
                    tradeType: signal.tradeType,
                    Strategy: signal.Strategy,
                    createdAt: signal.createdAt,
                    updatedAt: signal.updatedAt,
                });
            } else {
                toast.error('Signal not found');
                navigate(basePath);
            }
            setLoading(false);
        };
        fetchSignal();
    }, [id, navigate, basePath]);

    const categoryOptions = {
        Index: ['banknifty', 'Nifty50'],
        Stocks: ['tcs', 'hdfc'],
        Futures: ['goldfutures', 'crudeoilfutures'],
    };

    const getStockOptions = (category: string): string[] => {
        return categoryOptions[category as keyof typeof categoryOptions] || [];
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.stockName) newErrors.stockName = 'Stock name is required';
        if (!formData.marketSentiments) newErrors.marketSentiments = 'Market sentiment is required';
        if (formData.entry <= 0) newErrors.entry = 'Entry must be a positive number';
        if (formData.target <= 0) newErrors.target = 'Target must be a positive number';
        if (formData.stopLoss <= 0) newErrors.stopLoss = 'Stop loss must be a positive number';
        if (formData.exit <= 0) newErrors.exit = 'Exit must be a positive number';
        if (!formData.tradeType) newErrors.tradeType = 'Trade type is required';
        if (!formData.Strategy) newErrors.Strategy = 'Strategy is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (['entry', 'target', 'stopLoss', 'exit'].includes(name)) {
            setFormData({ ...formData, [name]: parseFloat(value) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
        if (name === 'category' && !getStockOptions(value).includes(formData.stockName)) {
            setFormData(prev => ({ ...prev, stockName: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        const updatedFormData = {
            ...formData,
            updatedAt: new Date().toISOString(),
        };
        toast.success('Signal updated successfully!');
        console.log('Updating signal:', updatedFormData);
        navigate(basePath);
    };

    const handleCancel = () => {
        navigate(basePath);
    };

    if (loading) {
        return (
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 50)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader title="Edit Signal" />
                    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                        <div className="text-center">Loading...</div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 50)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Edit Signal" />
                <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">Edit {formData.signalType} Signal</h1>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                    Update Signal
                                </Button>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex justify-content-between col-span-6">
                                    <div>
                                        <CardTitle>{formData.signalType} Signal Details</CardTitle>
                                    </div>
                                    <div>{new Date(formData.createdAt).toLocaleString()}</div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div>
                                        <Label htmlFor="category" className="text-sm font-medium text-gray-300">
                                            Category *
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => handleSelectChange("category", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Index">Index</SelectItem>
                                                <SelectItem value="Stocks">Stocks</SelectItem>
                                                <SelectItem value="Futures">Futures</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="stockName" className="text-sm font-medium text-gray-300">
                                            Stock Name *
                                        </Label>
                                        <Select
                                            value={formData.stockName}
                                            onValueChange={(value) => handleSelectChange("stockName", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Stock" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getStockOptions(formData.category).map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option.charAt(0).toUpperCase() + option.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.stockName && (
                                            <p className="text-sm text-red-500 mt-1">{errors.stockName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="marketSentiments" className="text-sm font-medium text-gray-300">
                                            Market Sentiment *
                                        </Label>
                                        <Select
                                            value={formData.marketSentiments}
                                            onValueChange={(value) => handleSelectChange("marketSentiments", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select sentiment" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Bullish">Bullish</SelectItem>
                                                <SelectItem value="Bearish">Bearish</SelectItem>
                                                <SelectItem value="Neutral">Neutral</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.marketSentiments && (
                                            <p className="text-sm text-red-500 mt-1">{errors.marketSentiments}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="tradeType" className="text-sm font-medium text-gray-300">
                                            Trade Type *
                                        </Label>
                                        <Select
                                            value={formData.tradeType}
                                            onValueChange={(value) => handleSelectChange("tradeType", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select trade type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Options">Options</SelectItem>
                                                <SelectItem value="Equity">Equity</SelectItem>
                                                <SelectItem value="Futures">Futures</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.tradeType && (
                                            <p className="text-sm text-red-500 mt-1">{errors.tradeType}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="entry" className="text-sm font-medium text-gray-300">
                                            Entry *
                                        </Label>
                                        <Input
                                            id="entry"
                                            name="entry"
                                            type="number"
                                            value={formData.entry || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter entry price"
                                            className={`mt-1 ${errors.entry ? "border-red-500" : ""}`}
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.entry && (
                                            <p className="text-sm text-red-500 mt-1">{errors.entry}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="target" className="text-sm font-medium text-gray-300">
                                            Target *
                                        </Label>
                                        <Input
                                            id="target"
                                            name="target"
                                            type="number"
                                            value={formData.target || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter target price"
                                            className={`mt-1 ${errors.target ? "border-red-500" : ""}`}
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.target && (
                                            <p className="text-sm text-red-500 mt-1">{errors.target}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="stopLoss" className="text-sm font-medium text-gray-300">
                                            Stop Loss *
                                        </Label>
                                        <Input
                                            id="stopLoss"
                                            name="stopLoss"
                                            type="number"
                                            value={formData.stopLoss || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter stop loss price"
                                            className={`mt-1 ${errors.stopLoss ? "border-red-500" : ""}`}
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.stopLoss && (
                                            <p className="text-sm text-red-500 mt-1">{errors.stopLoss}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="exit" className="text-sm font-medium text-gray-300">
                                            Exit *
                                        </Label>
                                        <Input
                                            id="exit"
                                            name="exit"
                                            type="number"
                                            value={formData.exit || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter exit price"
                                            className={`mt-1 ${errors.exit ? "border-red-500" : ""}`}
                                            step="0.01"
                                            min="0"
                                        />
                                        {errors.exit && (
                                            <p className="text-sm text-red-500 mt-1">{errors.exit}</p>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor="Strategy" className="text-sm font-medium text-gray-300">
                                            Strategy *
                                        </Label>
                                        <Input
                                            id="Strategy"
                                            name="Strategy"
                                            value={formData.Strategy}
                                            onChange={handleInputChange}
                                            placeholder="Enter strategy (e.g., Momentum)"
                                            className={`mt-1 ${errors.Strategy ? "border-red-500" : ""}`}
                                        />
                                        {errors.Strategy && (
                                            <p className="text-sm text-red-500 mt-1">{errors.Strategy}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default EditSignal