import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import type { CourseFormData, TdCourse } from "./types";

export default function CourseDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = React.useState<TdCourse | null>(null);
    const [coverImagePreview, setCoverImagePreview] = React.useState<string | null>(null);
    const [instructorImagePreview, setInstructorImagePreview] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (id) {
            apiService.getCourse(id).then(setCourse).catch(() => navigate("/courses"));
        }
    }, [id, navigate]);

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
            if (id) {
                await apiService.updateCourse(id, formData);
                navigate("/courses");
            }
        } catch (error) {
            console.error("Error updating course:", error);
        }
    };

    const handleDelete = async () => {
        if (course && id) {
            if (confirm(`Are you sure you want to delete the course "${course.courseName}"? This action cannot be undone.`)) {
                try {
                    await apiService.deleteCourse(id);
                    navigate("/courses");
                } catch (error) {
                    console.error("Error deleting course:", error);
                }
            }
        }
    };

    if (!course) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarProvider>
            <Toaster />
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Edit Course" />
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                    <h1 className="text-2xl font-semibold">Edit Course: {course.courseName}</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="courseName" className="text-sm font-medium text-gray-700">
                                    Course Name *
                                </Label>
                                <Input
                                    id="courseName"
                                    name="courseName"
                                    defaultValue={course.courseName}
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
                                    defaultValue={course.subTitle || ""}
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
                                    defaultValue={course.description || ""}
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
                                    defaultValue={course.pricing}
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
                                    defaultValue={course.language}
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
                                    defaultValue={course.duration || ""}
                                    placeholder="Enter duration"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="level" className="text-sm font-medium text-gray-700">
                                    Level
                                </Label>
                                <Select name="level" defaultValue={course.level || ""}>
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
                                    defaultValue={course.instructorName || ""}
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
                                    defaultValue={course.rating}
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
                                    defaultValue={course.totalRatings}
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
                                    defaultValue={course.enrollments}
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
                                    defaultValue={course.tags?.join(", ") || ""}
                                    placeholder="Enter tags (e.g., Python, Coding)"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                                    Featured
                                </Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Switch id="isFeatured" name="isFeatured" defaultChecked={course.isFeatured} />
                                    <span>{course.isFeatured ? "Featured" : "Not Featured"}</span>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                                    Published
                                </Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Switch id="isPublished" name="isPublished" defaultChecked={course.isPublished} />
                                    <span>{course.isPublished ? "Published" : "Unpublished"}</span>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="modules" className="text-sm font-medium text-gray-700">
                                    Modules (JSON)
                                </Label>
                                <Input
                                    id="modules"
                                    name="modules"
                                    defaultValue={JSON.stringify(course.modules || [], null, 2)}
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
                                {coverImagePreview || course.coverImage ? (
                                    <img
                                        src={coverImagePreview || course.coverImage}
                                        alt="Cover Preview"
                                        className="mt-2 h-20 w-20 rounded object-cover"
                                    />
                                ) : null}
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
                                {instructorImagePreview || course.instructorProfileImage ? (
                                    <img
                                        src={instructorImagePreview || course.instructorProfileImage}
                                        alt="Instructor Profile Preview"
                                        className="mt-2 h-20 w-20 rounded-full object-cover"
                                    />
                                ) : null}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate("/courses")}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                                Update Course
                            </Button>
                            <Button
                                type="button"
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={handleDelete}
                            >
                                Delete Course
                            </Button>
                        </div>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}