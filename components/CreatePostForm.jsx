"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { storage } from "@/utils/firebaseConfig";
import { addData, db } from "@/utils/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { PostSchema, PostConverter } from "@/models/Posts";
import { DraftSchema, DraftConverter } from "@/models/Drafts";
import { UserSchema, UserConverter } from "@/models/Users";
import { postService } from "@/services/postService";
import { draftService } from "@/models/Drafts";

import {
  Trash2,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Send,
  Save,
  PlusCircle,
  MinusCircle,
  Scissors,
  Paintbrush,
  Edit,
  Clock,
  DollarSign,
  Package,
  Link2,
  ChevronDown,
  Check,
  ChevronUp,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CraftButton } from "@/components/ui/craft-button";
import { CraftCard } from "@/components/ui/craft-card";
import { StitchDivider } from "@/components/ui/stitch-divider";
import { CraftBadge } from "@/components/ui/craft-badge";
import { PatternBackground } from "@/components/ui/pattern-background";
import { DifficultyBadge } from "@/components/craft/DifficultyBadge";
import { MaterialsList } from "@/components/craft/MaterialsList";
import { TimeToMakeBadge } from "@/components/craft/TimeToMakeBadge";
import { YarnSpinner } from "@/components/ui/yarn-spinner";
import { toast } from "sonner";

// Dropdown component for categorization
const CategoryDropdown = ({
  categories,
  selectedCategories,
  setSelectedCategories,
  maxCategories = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    } else {
      if (selectedCategories.length < maxCategories) {
        setSelectedCategories((prev) => [...prev, category]);
      } else {
        toast.error(`You can only select up to ${maxCategories} categories`);
      }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-800"
      >
        <span className="text-sm font-medium">
          {selectedCategories.length === 0
            ? "Select categories"
            : `${selectedCategories.length} selected`}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedCategories.map((category) => (
            <CraftBadge
              key={category}
              variant="craft"
              className="flex items-center gap-1"
            >
              {category}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            </CraftBadge>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex-1 text-left">{category}</div>
                {selectedCategories.includes(category) && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Material input component
const MaterialsInput = ({ materials, setMaterials }) => {
  const [newMaterial, setNewMaterial] = useState("");

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setMaterials((prev) => [...prev, newMaterial.trim()]);
      setNewMaterial("");
    }
  };

  const removeMaterial = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={newMaterial}
          onChange={(e) => setNewMaterial(e.target.value)}
          placeholder="Add a material..."
          className="flex-1 p-2 border rounded-md dark:bg-gray-800"
        />
        <Button type="button" onClick={addMaterial} size="sm">
          <PlusCircle className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {materials.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {materials.map((material, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm"
            >
              {material}
              <button
                type="button"
                onClick={() => removeMaterial(index)}
                className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Tutorial step component
const TutorialSteps = ({ steps, setSteps }) => {
  const [newStep, setNewStep] = useState({ title: "", description: "" });

  const addStep = () => {
    if (newStep.description.trim()) {
      setSteps((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...newStep,
        },
      ]);
      setNewStep({ title: "", description: "" });
    }
  };

  const removeStep = (id) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const updateStep = (id, field, value) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  return (
    <div>
      <div className="space-y-4 mb-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="border rounded-md p-4 bg-white dark:bg-gray-800"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium flex items-center">
                <span className="bg-craft-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(step.id, "title", e.target.value)}
                  placeholder="Step title (optional)"
                  className="bg-transparent border-b border-dashed p-1 outline-none flex-1"
                />
              </h4>
              <button
                type="button"
                onClick={() => removeStep(step.id)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={step.description}
              onChange={(e) =>
                updateStep(step.id, "description", e.target.value)
              }
              placeholder="Describe this step..."
              className="w-full p-2 border rounded-md dark:bg-gray-700 min-h-[80px]"
            />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={newStep.title}
          onChange={(e) =>
            setNewStep((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Step title (optional)"
          className="w-full p-2 border rounded-md dark:bg-gray-800"
        />
        <textarea
          value={newStep.description}
          onChange={(e) =>
            setNewStep((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Describe this step..."
          className="w-full p-2 border rounded-md dark:bg-gray-800 min-h-[80px]"
        />
        <Button type="button" onClick={addStep} className="w-full">
          <PlusCircle className="w-4 h-4 mr-1" />
          Add Step
        </Button>
      </div>
    </div>
  );
};

// Image preview component
const ImagePreview = ({ images, setImages, isUploading }) => {
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderImages = (startIndex, endIndex) => {
    const result = [...images];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setImages(result);
  };

  const moveImage = (index, direction) => {
    if (direction === "up" && index > 0) {
      reorderImages(index, index - 1);
    } else if (direction === "down" && index < images.length - 1) {
      reorderImages(index, index + 1);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative group border rounded-lg overflow-hidden"
        >
          <img
            src={typeof image === "string" ? image : URL.createObjectURL(image)}
            alt={`Preview ${index}`}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveImage(index, "up")}
                disabled={isUploading || index === 0}
                className="p-1 bg-white/80 rounded-full disabled:opacity-50"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, "down")}
                disabled={isUploading || index === images.length - 1}
                className="p-1 bg-white/80 rounded-full disabled:opacity-50"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={isUploading}
                className="p-1 bg-white/80 rounded-full text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-md">
              Cover
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Main component
export default function CreatePostForm({
  draftId = null,
  onPostCreated,
  onCancel,
}) {
  const { user } = useUser();
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form state
  const [activeTab, setActiveTab] = useState("basic");
  const [postType, setPostType] = useState("post"); // "post" or "tutorial"
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [difficulty, setDifficulty] = useState("");
  const [timeToMake, setTimeToMake] = useState("");
  const [materials, setMaterials] = useState([]);
  const [tutorialSteps, setTutorialSteps] = useState([]);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showDraftReminder, setShowDraftReminder] = useState(false);

  // Available categories for crafts
  const craftCategories = [
    "Knitting",
    "Crochet",
    "Sewing",
    "Quilting",
    "Embroidery",
    "Cross Stitch",
    "Needlepoint",
    "Macramé",
    "Weaving",
    "Paper Crafts",
    "Cardmaking",
    "Scrapbooking",
    "Origami",
    "Pottery",
    "Ceramics",
    "Jewelry Making",
    "Beading",
    "Leatherwork",
    "Woodworking",
    "Painting",
    "Drawing",
    "Calligraphy",
    "Printmaking",
    "Photography",
    "DIY Home Decor",
    "Upcycling",
    "Recycled Crafts",
    "Mixed Media",
    "Fiber Arts",
    "Felting",
  ];

  // Difficulties
  const difficultyLevels = ["beginner", "intermediate", "advanced", "expert"];

  // Load draft if draftId is provided
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId) return;

      setIsLoadingDraft(true);
      try {
        const draft = await draftService.getDraftById(draftId);

        if (!draft) {
          toast.error("Draft not found");
          return;
        }

        // Populate form with draft data
        setDescription(draft.description || "");
        setSelectedCategories(draft.categories || []);
        setDifficulty(draft.difficulty || "");
        setTimeToMake(draft.timeToMake || "");
        setMaterials(draft.materials || []);

        if (draft.tutorial) {
          setPostType("tutorial");
          setTutorialSteps(draft.tutorialSteps || []);
        }

        // Handle images - these will already be URLs since they were uploaded
        if (draft.images && draft.images.length > 0) {
          setImageFiles(draft.images);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        toast.error("Failed to load draft");
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadDraft();
  }, [draftId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    const filesToUpload = imageFiles.filter((file) => typeof file !== "string");

    // If all images are already uploaded (strings/URLs), just return them
    if (filesToUpload.length === 0) {
      return imageFiles;
    }

    // Otherwise, upload new files and combine with existing URLs
    const uploadPromises = filesToUpload.map(async (file, index) => {
      // Create a unique path for the image
      const storagePath = `posts/${user.id}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Update progress
      setUploadProgress((prev) => prev + 100 / filesToUpload.length);

      // Get download URL
      return await getDownloadURL(storageRef);
    });

    const newUrls = await Promise.all(uploadPromises);

    // Combine new URLs with existing URLs in the correct order
    const allImages = [...imageFiles];
    filesToUpload.forEach((file, index) => {
      const fileIndex = allImages.indexOf(file);
      if (fileIndex !== -1) {
        allImages[fileIndex] = newUrls[index];
      }
    });

    return allImages.filter((img) => typeof img === "string");
  };

  const handleSaveAsDraft = async () => {
    if (!description.trim() && imageFiles.length === 0) {
      toast.error(
        "Please add a description or upload images to save as a draft"
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload images if any
      const uploadedImageURLs = await uploadImages();

      // Create a new draft object
      const newDraft = new DraftSchema(
        draftId || "",
        description,
        uploadedImageURLs,
        uploadedImageURLs.length > 1,
        user.id,
        selectedCategories,
        materials,
        difficulty,
        timeToMake,
        postType === "tutorial",
        tutorialSteps
      );

      // Save draft to Firestore
      let draftRef;
      if (draftId) {
        await draftService.updateDraft(
          draftId,
          DraftConverter.toFirestore(newDraft)
        );
        draftRef = draftId;
      } else {
        draftRef = await draftService.createDraft(newDraft);
      }

      toast.success("Draft saved successfully!");

      // Call the callback function or redirect
      if (onPostCreated) {
        onPostCreated("draft", draftRef);
      } else {
        router.push("/drafts");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error(`Failed to save draft: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreatePost = async () => {
    if (!description.trim()) {
      toast.error("Please add a description for your post");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 1. Upload images to Firebase storage
      const uploadedImageURLs = await uploadImages();

      // 2. Create a new post object
      const newPost = new PostSchema(
        "",
        description,
        uploadedImageURLs,
        uploadedImageURLs.length > 1,
        user.id,
        0,
        [],
        false,
        selectedCategories,
        materials,
        difficulty,
        timeToMake,
        postType === "tutorial",
        tutorialSteps
      );

      // 3. Add post to Firestore
      const newPostId = await postService.createPost(newPost);

      // 4. Delete draft if this was from a draft
      if (draftId) {
        try {
          await draftService.deleteDraft(draftId, user.id);
        } catch (error) {
          console.error("Error deleting draft after publishing:", error);
          // Continue even if draft deletion fails
        }
      }

      // 5. Reset form
      toast.success("Post created successfully!");

      // 6. Call the callback function or redirect
      if (onPostCreated) {
        onPostCreated("post", newPostId);
      } else {
        router.push("/feed");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(`Failed to create post: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    if (description.trim() || imageFiles.length > 0) {
      setShowDraftReminder(true);
    } else if (onCancel) {
      onCancel();
    } else {
      router.push("/feed");
    }
  };

  if (isLoadingDraft) {
    return (
      <div className="flex flex-col items-center justify-center my-8 py-8">
        <YarnSpinner size="lg" color="mint" />
        <p className="mt-4 text-gray-500">Loading draft...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <CraftCard className="overflow-hidden">
        <div className="px-6 py-4 border-b bg-craft-50 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-craft-800 dark:text-gray-100">
            {draftId ? "Edit Draft" : "Create New Post"}
          </h2>
          <p className="text-sm text-craft-600 dark:text-gray-400">
            Share your crafting journey with the community
          </p>
        </div>

        <div className="p-6">
          {/* Type selector */}
          <div className="mb-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Post Type</div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center gap-2 ${
                    postType === "post"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "bg-transparent text-gray-500 dark:text-gray-400"
                  }`}
                  onClick={() => setPostType("post")}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Regular Post</span>
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 rounded-md flex items-center justify-center gap-2 ${
                    postType === "tutorial"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "bg-transparent text-gray-500 dark:text-gray-400"
                  }`}
                  onClick={() => setPostType("tutorial")}
                >
                  <Scissors className="w-5 h-5" />
                  <span>Tutorial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs for post creation steps */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">
                {postType === "tutorial" ? "Tutorial Steps" : "Craft Details"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your craft..."
                  className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  rows={4}
                />
              </div>

              {/* Images */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Images</label>
                <div className="flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
                  >
                    <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                    <p>Click to upload images</p>
                    <p className="text-xs mt-1">JPG, PNG, GIF up to 10MB</p>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={isUploading}
                    className="hidden"
                  />

                  {imageFiles.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {imageFiles.length} image
                          {imageFiles.length !== 1 ? "s" : ""} selected
                        </p>
                        {imageFiles.length > 1 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            The first image will be used as the cover
                          </p>
                        )}
                      </div>
                      <ImagePreview
                        images={imageFiles}
                        setImages={setImageFiles}
                        isUploading={isUploading}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Categories
                </label>
                <CategoryDropdown
                  categories={craftCategories}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab("details")}>
                  Next:{" "}
                  {postType === "tutorial" ? "Tutorial Steps" : "Craft Details"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details">
              {postType === "tutorial" ? (
                /* Tutorial Steps */
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Tutorial Steps</h3>
                  </div>
                  <PatternBackground
                    pattern="paper"
                    color="craft"
                    className="p-4 rounded-lg mb-6"
                  >
                    <p className="text-sm text-craft-700 dark:text-craft-300">
                      Break down your tutorial into clear, step-by-step
                      instructions that others can follow. Add as many steps as
                      needed to fully explain your process.
                    </p>
                  </PatternBackground>
                  <TutorialSteps
                    steps={tutorialSteps}
                    setSteps={setTutorialSteps}
                  />
                </div>
              ) : (
                /* Craft Details */
                <div className="space-y-6">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {difficultyLevels.map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`p-3 rounded-md border ${
                            difficulty === level
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-gray-300 dark:border-gray-700"
                          }`}
                          onClick={() => setDifficulty(level)}
                        >
                          <DifficultyBadge level={level} className="mx-auto" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time to Make */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time to Make (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={timeToMake}
                        onChange={(e) => setTimeToMake(e.target.value)}
                        placeholder="e.g. 2 hours, 3 days"
                        className="flex-1 p-2 border rounded-md dark:bg-gray-800"
                      />
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Materials Used (optional)
                    </label>
                    <MaterialsInput
                      materials={materials}
                      setMaterials={setMaterials}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                >
                  Back: Basic Info
                </Button>

                <div className="flex gap-2">
                  <CraftButton
                    type="button"
                    variant="sage"
                    onClick={handleSaveAsDraft}
                    disabled={isUploading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </CraftButton>
                  <CraftButton
                    type="button"
                    variant="mint"
                    onClick={handleCreatePost}
                    disabled={
                      isUploading ||
                      !description.trim() ||
                      imageFiles.length === 0
                    }
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {draftId ? "Publish" : "Create Post"}
                  </CraftButton>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {isUploading && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </CraftCard>

      {/* Draft reminder dialog */}
      {showDraftReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CraftCard className="w-full max-w-md mx-4">
            <div className="p-6">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-center mb-2">
                Save as draft?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                You have unsaved changes. Would you like to save your progress
                as a draft?
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDraftReminder(false);
                    if (onCancel) onCancel();
                    else router.push("/feed");
                  }}
                >
                  Discard
                </Button>
                <CraftButton variant="mint" onClick={handleSaveAsDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </CraftButton>
              </div>
            </div>
          </CraftCard>
        </div>
      )}
    </div>
  );
}
