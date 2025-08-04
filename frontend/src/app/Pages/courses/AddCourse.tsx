import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiService } from "./types";
import type { CourseFormData } from "./types";

export default function AddCourse() {
    const navigate = useNavigate();
    const [coverImagePreview, setCoverImagePreview] = React.useState<string | null>(null);
    const [instructorImagePreview, setInstructorImagePreview] = React.useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cover" | "instructor") => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === "cover") {
                    setCoverImagePreview(reader.result as string);
                } else {
                    setInstructorImagePreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        } else {
            if (type === "cover") {
                setCoverImagePreview(null);
            } else {
                setInstructorImagePreview(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData: CourseFormData = {
            courseName: (form.elements.namedItem("courseName") as HTMLInputElement).value,
            subTitle: (form.elements.namedItem("subTitle") as HTMLInputElement).value || undefined,
            description: (form.elements.namedItem("description") as HTMLInputElement).value || undefined,
            pricing: Number((form.elements.namedItem("pricing") as HTMLInputElement).value) || 0,
            language: (form.elements.namedItem("language") as HTMLInputElement).value || "English",
            duration: (form.elements.namedItem("duration") as HTMLInputElement).value || undefined,
            level: (form.elements.namedItem("level") as HTMLSelectElement).value || undefined,
            instructorName: (form.elements.namedItem("instructorName") as HTMLInputElement).value || undefined,
            rating: Number((form.elements.namedItem("rating") as HTMLInputElement).value) || 0,
            totalRatings: Number((form.elements.namedItem("totalRatings") as HTMLInputElement).value) || 0,
            enrollments: Number((form.elements.namedItem("enrollments") as HTMLInputElement).value) || 0,
            tagsInput: (form.elements.namedItem("tags") as HTMLInputElement).value || undefined,
            isFeatured: (form.elements.namedItem("isFeatured") as HTMLInputElement).checked,
            isPublished: (form.elements.namedItem("isPublished") as HTMLInputElement).checked,
            modules: (form.elements.namedItem("modules") as HTMLInputElement).value
                ? JSON.parse((form.elements.namedItem("modules") as HTMLInputElement).value)
                : [],
            coverImageFile: (form.elements.namedItem("coverImageFile") as HTMLInputElement).files?.[0],
            instructorProfileImageFile: (form.elements.namedItem("instructorProfileImageFile") as HTMLInputElement).files?.[0],
        };

        try {
            await apiService.createCourse(formData);
            navigate("/courses");
        } catch (error) {
            console.error("Error creating course:", error);
        }
    };

    return (
        <SidebarProvider>
            <Toaster />
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Add Course" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <h1 className="text-2xl font-semibold">Add New Course</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="courseName" className="text-sm font-medium text-gray-700">
                                    Course Name *
                                </Label>
                                <Input
                                    id="courseName"
                                    name="courseName"
                                    placeholder="Enter course name"
                                    className="mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="subTitle" className="text-sm font-medium text-gray-700">
                                    Subtitle
                                </Label>
                                <Input
                                    id="subTitle"
                                    name="subTitle"
                                    placeholder="Enter subtitle"
                                    className="mt-1"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                    Description
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="Enter course description"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="pricing" className="text-sm font-medium text-gray-700">
                                    Pricing
                                </Label>
                                <Input
                                    id="pricing"
                                    name="pricing"
                                    type="number"
                                    placeholder="Enter price"
                                    className="mt-1"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                                    Language
                                </Label>
                                <Input
                                    id="language"
                                    name="language"
                                    defaultValue="English"
                                    placeholder="Enter language"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                                    Duration (e.g., 5h 30m)
                                </Label>
                                <Input
                                    id="duration"
                                    name="duration"
                                    placeholder="Enter duration"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="level" className="text-sm font-medium text-gray-700">
                                    Level
                                </Label>
                                <Select name="level">
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="instructorName" className="text-sm font-medium text-gray-700">
                                    Instructor Name
                                </Label>
                                <Input
                                    id="instructorName"
                                    name="instructorName"
                                    placeholder="Enter instructor name"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="rating" className="text-sm font-medium text-gray-700">
                                    Rating
                                </Label>
                                <Input
                                    id="rating"
                                    name="rating"
                                    type="number"
                                    placeholder="Enter rating"
                                    className="mt-1"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="totalRatings" className="text-sm font-medium text-gray-700">
                                    Total Ratings
                                </Label>
                                <Input
                                    id="totalRatings"
                                    name="totalRatings"
                                    type="number"
                                    placeholder="Enter total ratings"
                                    className="mt-1"
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="enrollments" className="text-sm font-medium text-gray-700">
                                    Enrollments
                                </Label>
                                <Input
                                    id="enrollments"
                                    name="enrollments"
                                    type="number"
                                    placeholder="Enter enrollments"
                                    className="mt-1"
                                    min="0"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                                    Tags (comma-separated)
                                </Label>
                                <Input
                                    id="tags"
                                    name="tags"
                                    placeholder="Enter tags (e.g., Python, Coding)"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                                    Featured
                                </Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Switch id="isFeatured" name="isFeatured" />
                                    <span>Not Featured</span>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                                    Published
                                </Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Switch id="isPublished" name="isPublished" />
                                    <span>Unpublished</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="modules" className="text-sm font-medium text-gray-700">
                                    Modules (JSON)
                                </Label>
                                <Input
                                    id="modules"
                                    name="modules"
                                    placeholder='Enter modules JSON (e.g., [{"index": 1, "topic": "Basics", "videos": []}])'
                                    className="mt-1"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="coverImageFile" className="text-sm font-medium text-gray-700">
                                    Cover Image
                                </Label>
                                <Input
                                    id="coverImageFile"
                                    name="coverImageFile"
                                    type="file"
                                    accept="image/*"
                                    className="mt-1"
                                    onChange={(e) => handleFileChange(e, "cover")}
                                />
                                {coverImagePreview && (
                                    <img
                                        src={coverImagePreview}
                                        alt="Cover Preview"
                                        className="mt-2 h-20 w-20 rounded object-cover"
                                    />
                                )}
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="instructorProfileImageFile" className="text-sm font-medium text-gray-700">
                                    Instructor Profile Image
                                </Label>
                                <Input
                                    id="instructorProfileImageFile"
                                    name="instructorProfileImageFile"
                                    type="file"
                                    accept="image/*"
                                    className="mt-1"
                                    onChange={(e) => handleFileChange(e, "instructor")}
                                />
                                {instructorImagePreview && (
                                    <img
                                        src={instructorImagePreview}
                                        alt="Instructor Profile Preview"
                                        className="mt-2 h-20 w-20 rounded-full object-cover"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate("/courses")}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                Create Course
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}