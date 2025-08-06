export interface TdPlan {
    id?: string;
    planName: string;
    Duration: string;
    durationValue: number;
    fetures: { title: string }[];
    pricing: number;
    createdAt: string;
    updateAt: string;
}