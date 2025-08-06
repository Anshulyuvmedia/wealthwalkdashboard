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
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiService } from "./types";
import type { CourseFormData, TdCourse } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Video {
    title: string;
    duration: string;
    videoUrl: string;
    description: string;
}

interface Module {
    topic: string;
    videos: Video[];
}

interface FormErrors {
    courseName?: string;
    pricing?: string;
    language?: string;
    duration?: string;
    rating?: string;
    totalRatings?: string;
    enrollments?: string;
    modules?: string;
    moduleTopics?: string[];
    videoFields?: { title?: string; duration?: string; videoUrl?: string; description?: string }[][];
}

export default function CourseDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = React.useState<TdCourse | null>(null);
    const [coverImagePreview, setCoverImagePreview] = React.useState<string | null>(null);
    const [instructorImagePreview, setInstructorImagePreview] = React.useState<string | null>(null);
    const [modules, setModules] = React.useState<Module[]>([]);
    const [formData, setFormData] = React.useState<CourseFormData>({
        courseName: "",
        pricing: 0,
        language: "English",
        rating: 0,
        totalRatings: 0,
        enrollments: 0,
        isFeatured: false,
        isPublished: false,
        modules: [],
    });
    const [errors, setErrors] = React.useState<FormErrors>({});
    const [loading, setLoading] = React.useState(true);

    // Fetch course and initialize form data
    React.useEffect(() => {
        if (id) {
            setLoading(true);
            apiService
                .getCourse(id)
                .then((fetchedCourse) => {
                    setCourse(fetchedCourse);
                    // Initialize formData with fetched course data
                    setFormData({
                        courseName: fetchedCourse.courseName || "",
                        subTitle: fetchedCourse.subTitle || "",
                        description: fetchedCourse.description || "",
                        pricing: fetchedCourse.pricing || 0,
                        language: fetchedCourse.language || "English",
                        duration: fetchedCourse.duration || "",
                        level: fetchedCourse.level || "",
                        instructorName: fetchedCourse.instructorName || "",
                        rating: fetchedCourse.rating || 0,
                        totalRatings: fetchedCourse.totalRatings || 0,
                        enrollments: fetchedCourse.enrollments || 0,
                        tags: fetchedCourse.tags?.join(", ") || "",
                        isFeatured: fetchedCourse.isFeatured || false,
                        isPublished: fetchedCourse.isPublished || false,
                        modules: fetchedCourse.modules?.map((m) => ({
                            topic: m.topic,
                            videos: m.videos,
                        })) || [],
                        coverImage: fetchedCourse.coverImage, // Add existing image URL
                        instructorProfileImage: fetchedCourse.instructorProfileImage, // Add existing image URL
                    });
                    // Initialize modules state
                    setModules(
                        fetchedCourse.modules?.map((m) => ({
                            topic: m.topic,
                            videos: m.videos,
                        })) || []
                    );
                    // Set image previews if available
                    if (fetchedCourse.coverImage) {
                        // If only file name is stored, prepend the base URL
                        const coverUrl = fetchedCourse.coverImage.startsWith("http")
                            ? fetchedCourse.coverImage
                            : `http://localhost:3000/Uploads/${fetchedCourse.coverImage}`;
                        setCoverImagePreview(coverUrl);
                    }
                    if (fetchedCourse.instructorProfileImage) {
                        const InstructorImageUrl = fetchedCourse.instructorProfileImage.startsWith("http")
                            ? fetchedCourse.instructorProfileImage
                            : `http://localhost:3000/Uploads/${fetchedCourse.instructorProfileImage}`;
                        setInstructorImagePreview(InstructorImageUrl);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching course:", error);
                    toast.error("Failed to load course data");
                    navigate("/courses");
                })
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    // Validate form data
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!formData.courseName.trim()) {
            newErrors.courseName = "Course name is required";
            isValid = false;
        }
        if (formData.pricing < 0) {
            newErrors.pricing = "Pricing cannot be negative";
            isValid = false;
        }
        if (!formData.language.trim()) {
            newErrors.language = "Language is required";
            isValid = false;
        }
        if (formData.rating < 0 || formData.rating > 5) {
            newErrors.rating = "Rating must be between 0 and 5";
            isValid = false;
        }
        if (formData.totalRatings < 0) {
            newErrors.totalRatings = "Total ratings cannot be negative";
            isValid = false;
        }
        if (formData.enrollments < 0) {
            newErrors.enrollments = "Enrollments cannot be negative";
            isValid = false;
        }
        if (formData.duration && !/^\d+h\s*\d*m$/.test(formData.duration)) {
            newErrors.duration = "Duration must be in format 'Xh Ym' (e.g., 5h 30m)";
            isValid = false;
        }

        // Validate modules
        if (modules.length === 0) {
            newErrors.modules = "At least one module is required";
            isValid = false;
        } else {
            newErrors.moduleTopics = [];
            newErrors.videoFields = [];
            modules.forEach((module, moduleIndex) => {
                if (!module.topic.trim()) {
                    newErrors.moduleTopics![moduleIndex] = "Module topic is required";
                    isValid = false;
                }
                if (module.videos.length === 0) {
                    newErrors.videoFields![moduleIndex] = [
                        { title: "At least one video is required" },
                    ];
                    isValid = false;
                } else {
                    newErrors.videoFields![moduleIndex] = module.videos.map((video) => ({
                        title: video.title.trim() ? undefined : "Video title is required",
                        duration: video.duration.trim()
                            ? /^\d+m$/.test(video.duration)
                                ? undefined
                                : "Duration must be in format 'Xm' (e.g., 30m)"
                            : "Video duration is required",
                        videoUrl: video.videoUrl.trim()
                            ? /^https?:\/\/.*/.test(video.videoUrl)
                                ? undefined
                                : "Valid URL is required"
                            : "Video URL is required",
                        description: video.description.trim()
                            ? undefined
                            : "Video description is required",
                    }));
                    if (
                        newErrors.videoFields![moduleIndex].some(
                            (errors) =>
                                errors.title || errors.duration || errors.videoUrl || errors.description
                        )
                    ) {
                        isValid = false;
                    }
                }
            });
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "cover" | "instructor"
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === "cover") {
                    setCoverImagePreview(reader.result as string);
                    setFormData({ ...formData, coverImageFile: file, coverImage: undefined });
                } else {
                    setInstructorImagePreview(reader.result as string);
                    setFormData({
                        ...formData,
                        instructorProfileImageFile: file,
                        instructorProfileImage: undefined,
                    });
                }
            };
            reader.readAsDataURL(file);
        } else {
            if (type === "cover") {
                setCoverImagePreview(course?.coverImage || null);
                setFormData({ ...formData, coverImageFile: undefined });
            } else {
                setInstructorImagePreview(course?.instructorProfileImage || null);
                setFormData({ ...formData, instructorProfileImageFile: undefined });
            }
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        try {
            if (id) {
                const updatedFormData = {
                    ...formData,
                    modules: modules,
                };
                await apiService.updateCourse(id, updatedFormData);
                toast.success("Course updated successfully!");
                // Refetch course to ensure UI reflects updated data
                const updatedCourse = await apiService.getCourse(id);
                setCourse(updatedCourse);
                setFormData({
                    courseName: updatedCourse.courseName || "",
                    subTitle: updatedCourse.subTitle || "",
                    description: updatedCourse.description || "",
                    pricing: updatedCourse.pricing || 0,
                    language: updatedCourse.language || "English",
                    duration: updatedCourse.duration || "",
                    level: updatedCourse.level || "",
                    instructorName: updatedCourse.instructorName || "",
                    rating: updatedCourse.rating || 0,
                    totalRatings: updatedCourse.totalRatings || 0,
                    enrollments: updatedCourse.enrollments || 0,
                    tags: updatedCourse.tags?.join(", ") || "",
                    isFeatured: updatedCourse.isFeatured || false,
                    isPublished: updatedCourse.isPublished || false,
                    modules: updatedCourse.modules?.map((m) => ({
                        topic: m.topic,
                        videos: m.videos,
                    })) || [],
                });
                setModules(
                    updatedCourse.modules?.map((m) => ({
                        topic: m.topic,
                        videos: m.videos,
                    })) || []
                );
                navigate(`/courses`);
            }
        } catch (error) {
            console.error("Error updating course:", error);
            toast.error("Failed to update course");
        }
    };

    const handleDelete = async () => {
        if (course && id) {
            if (
                confirm(`Are you sure you want to delete the course "${course.courseName}"? This action cannot be undone.`)
            ) {
                try {
                    await apiService.deleteCourse(id);
                    toast.success("Course deleted successfully!");
                    navigate("/courses");
                } catch (error) {
                    console.error("Error deleting course:", error);
                    toast.error("Failed to delete course");
                }
            }
        }
    };

    const addModule = () => {
        setModules([...modules, { topic: "", videos: [] }]);
    };

    const removeModule = (moduleIndex: number) => {
        setModules(modules.filter((_, i) => i !== moduleIndex));
    };

    const addVideo = (moduleIndex: number) => {
        const updatedModules = [...modules];
        updatedModules[moduleIndex].videos.push({
            title: "",
            duration: "",
            videoUrl: "",
            description: "",
        });
        setModules(updatedModules);
    };

    const removeVideo = (moduleIndex: number, videoIndex: number) => {
        const updatedModules = [...modules];
        updatedModules[moduleIndex].videos = updatedModules[moduleIndex].videos.filter(
            (_, i) => i !== videoIndex
        );
        setModules(updatedModules);
    };

    const handleModuleChange = (
        moduleIndex: number,
        field: keyof Module,
        value: string
    ) => {
        const updatedModules = [...modules];
        updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], [field]: value };
        setModules(updatedModules);
    };

    const handleVideoChange = (
        moduleIndex: number,
        videoIndex: number,
        field: keyof Video,
        value: string
    ) => {
        const updatedModules = [...modules];
        updatedModules[moduleIndex].videos[videoIndex] = {
            ...updatedModules[moduleIndex].videos[videoIndex],
            [field]: value,
        };
        setModules(updatedModules);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!course) {
        return <div>Course not found</div>;
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
                <SiteHeader title="Edit Course" />
                <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 ">
                    <form onSubmit={handleSubmit} className="space-y-6 ">
                        <div className="flex justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold">Edit Course: {course.courseName}</h1>
                            </div>
                            <div className="flex justify-between gap-4">
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
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="courseName" className="text-sm font-medium text-gray-300">
                                            Course Name *
                                        </Label>
                                        <Input
                                            id="courseName"
                                            name="courseName"
                                            value={formData.courseName}
                                            onChange={handleInputChange}
                                            placeholder="Enter course name"
                                            className={`mt-1 ${errors.courseName ? "border-red-500" : ""}`}
                                        />
                                        {errors.courseName && (
                                            <p className="text-sm text-red-500 mt-1">{errors.courseName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="subTitle" className="text-sm font-medium text-gray-300">
                                            Subtitle
                                        </Label>
                                        <Input
                                            id="subTitle"
                                            name="subTitle"
                                            value={formData.subTitle || ""}
                                            onChange={handleInputChange}
                                            placeholder="Enter subtitle"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            name="description"
                                            value={formData.description || ""}
                                            onChange={handleInputChange}
                                            placeholder="Enter course description"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="pricing" className="text-sm font-medium text-gray-300">
                                            Pricing
                                        </Label>
                                        <Input
                                            id="pricing"
                                            name="pricing"
                                            type="number"
                                            value={formData.pricing}
                                            onChange={handleInputChange}
                                            placeholder="Enter price"
                                            className={`mt-1 ${errors.pricing ? "border-red-500" : ""}`}
                                            step="0.01"
                                        />
                                        {errors.pricing && (
                                            <p className="text-sm text-red-500 mt-1">{errors.pricing}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="language" className="text-sm font-medium text-gray-300">
                                            Language *
                                        </Label>
                                        <Input
                                            id="language"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            placeholder="Enter language"
                                            className={`mt-1 ${errors.language ? "border-red-500" : ""}`}
                                        />
                                        {errors.language && (
                                            <p className="text-sm text-red-500 mt-1">{errors.language}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="duration" className="text-sm font-medium text-gray-300">
                                            Duration (e.g., 5h 30m)
                                        </Label>
                                        <Input
                                            id="duration"
                                            name="duration"
                                            value={formData.duration || ""}
                                            onChange={handleInputChange}
                                            placeholder="Enter duration"
                                            className={`mt-1 ${errors.duration ? "border-red-500" : ""}`}
                                        />
                                        {errors.duration && (
                                            <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="level" className="text-sm font-medium text-gray-300">
                                            Level
                                        </Label>
                                        <Select
                                            name="level"
                                            value={formData.level || ""}
                                            onValueChange={(value) => handleSelectChange("level", value)}
                                        >
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
                                        <Label htmlFor="instructorName" className="text-sm font-medium text-gray-300">
                                            Instructor Name
                                        </Label>
                                        <Input
                                            id="instructorName"
                                            name="instructorName"
                                            value={formData.instructorName || ""}
                                            onChange={handleInputChange}
                                            placeholder="Enter instructor name"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rating" className="text-sm font-medium text-gray-300">
                                            Rating
                                        </Label>
                                        <Input
                                            id="rating"
                                            name="rating"
                                            type="number"
                                            value={formData.rating}
                                            onChange={handleInputChange}
                                            placeholder="Enter rating"
                                            className={`mt-1 ${errors.rating ? "border-red-500" : ""}`}
                                            step="0.1"
                                            min="0"
                                            max="5"
                                        />
                                        {errors.rating && (
                                            <p className="text-sm text-red-500 mt-1">{errors.rating}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="totalRatings" className="text-sm font-medium text-gray-300">
                                            Total Ratings
                                        </Label>
                                        <Input
                                            id="totalRatings"
                                            name="totalRatings"
                                            type="number"
                                            value={formData.totalRatings}
                                            onChange={handleInputChange}
                                            placeholder="Enter total ratings"
                                            className={`mt-1 ${errors.totalRatings ? "border-red-500" : ""}`}
                                            min="0"
                                        />
                                        {errors.totalRatings && (
                                            <p className="text-sm text-red-500 mt-1">{errors.totalRatings}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="enrollments" className="text-sm font-medium text-gray-300">
                                            Enrollments
                                        </Label>
                                        <Input
                                            id="enrollments"
                                            name="enrollments"
                                            type="number"
                                            value={formData.enrollments}
                                            onChange={handleInputChange}
                                            placeholder="Enter enrollments"
                                            className={`mt-1 ${errors.enrollments ? "border-red-500" : ""}`}
                                            min="0"
                                        />
                                        {errors.enrollments && (
                                            <p className="text-sm text-red-500 mt-1">{errors.enrollments}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="tags" className="text-sm font-medium text-gray-300">
                                            Tags (comma-separated)
                                        </Label>
                                        <Input
                                            id="tags"
                                            name="tags"
                                            value={formData.tags || ""}
                                            onChange={handleInputChange}
                                            placeholder="Enter tags (e.g., Python, Coding)"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="isFeatured" className="text-sm font-medium text-gray-300">
                                            Featured
                                        </Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Switch
                                                id="isFeatured"
                                                name="isFeatured"
                                                checked={formData.isFeatured}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, isFeatured: checked })
                                                }
                                            />
                                            <span>{formData.isFeatured ? "Featured" : "Not Featured"}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="isPublished" className="text-sm font-medium text-gray-300">
                                            Published
                                        </Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Switch
                                                id="isPublished"
                                                name="isPublished"
                                                checked={formData.isPublished}
                                                onCheckedChange={(checked) =>
                                                    setFormData({ ...formData, isPublished: checked })
                                                }
                                            />
                                            <span>{formData.isPublished ? "Published" : "Unpublished"}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="coverImageFile" className="text-sm font-medium text-gray-300">
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
                                                className="mt-2 h-32 w-32 rounded object-cover border"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="instructorProfileImageFile"
                                            className="text-sm font-medium text-gray-300"
                                        >
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
                                                className="mt-2 h-32 w-32 rounded-full object-cover border"
                                            />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Modules</CardTitle>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={addModule}
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Add Module
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {errors.modules && (
                                    <p className="text-sm text-red-500">{errors.modules}</p>
                                )}
                                {modules.map((module, moduleIndex) => (
                                    <div key={moduleIndex} className="space-y-4 border p-4 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor={`module-topic-${moduleIndex}`}
                                                className="text-sm font-medium text-gray-300"
                                            >
                                                Module {moduleIndex + 1} Topic *
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeModule(moduleIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            id={`module-topic-${moduleIndex}`}
                                            value={module.topic}
                                            onChange={(e) =>
                                                handleModuleChange(moduleIndex, "topic", e.target.value)
                                            }
                                            placeholder="Enter module topic"
                                            className={errors.moduleTopics?.[moduleIndex] ? "border-red-500" : ""}
                                        />
                                        {errors.moduleTopics?.[moduleIndex] && (
                                            <p className="text-sm text-red-500">
                                                {errors.moduleTopics[moduleIndex]}
                                            </p>
                                        )}
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-300">Videos</h4>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="flex items-center gap-2"
                                                onClick={() => addVideo(moduleIndex)}
                                            >
                                                <PlusCircle className="h-4 w-4" />
                                                Add Video
                                            </Button>
                                        </div>
                                        {errors.videoFields?.[moduleIndex]?.[0]?.title && (
                                            <p className="text-sm text-red-500">
                                                {errors.videoFields[moduleIndex][0].title}
                                            </p>
                                        )}
                                        {module.videos.map((video, videoIndex) => (
                                            <div
                                                key={videoIndex}
                                                className="space-y-4 border p-4 rounded-md bg-[#050e24]"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-medium text-gray-300">
                                                        Video {videoIndex + 1}
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeVideo(moduleIndex, videoIndex)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <Label
                                                            htmlFor={`video-title-${moduleIndex}-${videoIndex}`}
                                                            className="text-sm font-medium text-gray-300"
                                                        >
                                                            Title *
                                                        </Label>
                                                        <Input
                                                            id={`video-title-${moduleIndex}-${videoIndex}`}
                                                            value={video.title}
                                                            onChange={(e) =>
                                                                handleVideoChange(
                                                                    moduleIndex,
                                                                    videoIndex,
                                                                    "title",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Enter video title"
                                                            className={
                                                                errors.videoFields?.[moduleIndex]?.[videoIndex]?.title
                                                                    ? "border-red-500"
                                                                    : ""
                                                            }
                                                        />
                                                        {errors.videoFields?.[moduleIndex]?.[videoIndex]?.title && (
                                                            <p className="text-sm text-red-500">
                                                                {errors.videoFields[moduleIndex][videoIndex].title}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor={`video-duration-${moduleIndex}-${videoIndex}`}
                                                            className="text-sm font-medium text-gray-300"
                                                        >
                                                            Duration (e.g., 30m) *
                                                        </Label>
                                                        <Input
                                                            id={`video-duration-${moduleIndex}-${videoIndex}`}
                                                            value={video.duration}
                                                            onChange={(e) =>
                                                                handleVideoChange(
                                                                    moduleIndex,
                                                                    videoIndex,
                                                                    "duration",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Enter video duration"
                                                            className={
                                                                errors.videoFields?.[moduleIndex]?.[videoIndex]?.duration
                                                                    ? "border-red-500"
                                                                    : ""
                                                            }
                                                        />
                                                        {errors.videoFields?.[moduleIndex]?.[videoIndex]?.duration && (
                                                            <p className="text-sm text-red-500">
                                                                {errors.videoFields[moduleIndex][videoIndex].duration}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label
                                                            htmlFor={`video-url-${moduleIndex}-${videoIndex}`}
                                                            className="text-sm font-medium text-gray-300"
                                                        >
                                                            Video URL *
                                                        </Label>
                                                        <Input
                                                            id={`video-url-${moduleIndex}-${videoIndex}`}
                                                            value={video.videoUrl}
                                                            onChange={(e) =>
                                                                handleVideoChange(
                                                                    moduleIndex,
                                                                    videoIndex,
                                                                    "videoUrl",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Enter video URL"
                                                            className={
                                                                errors.videoFields?.[moduleIndex]?.[videoIndex]?.videoUrl
                                                                    ? "border-red-500"
                                                                    : ""
                                                            }
                                                        />
                                                        {errors.videoFields?.[moduleIndex]?.[videoIndex]?.videoUrl && (
                                                            <p className="text-sm text-red-500">
                                                                {errors.videoFields[moduleIndex][videoIndex].videoUrl}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label
                                                            htmlFor={`video-description-${moduleIndex}-${videoIndex}`}
                                                            className="text-sm font-medium text-gray-300"
                                                        >
                                                            Description *
                                                        </Label>
                                                        <Input
                                                            id={`video-description-${moduleIndex}-${videoIndex}`}
                                                            value={video.description}
                                                            onChange={(e) =>
                                                                handleVideoChange(
                                                                    moduleIndex,
                                                                    videoIndex,
                                                                    "description",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Enter video description"
                                                            className={
                                                                errors.videoFields?.[moduleIndex]?.[videoIndex]?.description
                                                                    ? "border-red-500"
                                                                    : ""
                                                            }
                                                        />
                                                        {errors.videoFields?.[moduleIndex]?.[videoIndex]?.description && (
                                                            <p className="text-sm text-red-500">
                                                                {errors.videoFields[moduleIndex][videoIndex].description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}