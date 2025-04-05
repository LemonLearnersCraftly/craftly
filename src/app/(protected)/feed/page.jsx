"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/utils/firestore";
import { DraftSchema, DraftConverter, draftService } from "@/models/Drafts";
import {
  PenTool,
  Trash2,
  Edit,
  Send,
  Clock,
  Search,
  Filter,
  SortDesc,
  Grid,
  List,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CraftButton } from "@/components/ui/craft-button";
import {
  CraftCard,
  CraftCardContent,
  CraftCardHeader,
  CraftCardTitle,
} from "@/components/ui/craft-card";
import { PatternBackground } from "@/components/ui/pattern-background";
import { StitchDivider } from "@/components/ui/stitch-divider";
import { CraftBadge } from "@/components/ui/craft-badge";
import { Input } from "@/components/ui/input";
import { YarnSpinner } from "@/components/ui/yarn-spinner";
import { toast } from "sonner";

// Empty State Component
const EmptyDrafts = () => (
  <PatternBackground
    pattern="paper"
    color="craft"
    className="p-8 rounded-xl text-center"
  >
    <div className="max-w-md mx-auto">
      <PenTool className="w-16 h-16 mx-auto mb-4 text-craft-500 opacity-50" />
      <h3 className="text-xl font-bold text-craft-800 mb-2">No drafts yet</h3>
      <p className="text-craft-600 mb-6">
        Start creating and save your work as drafts to continue later.
      </p>
      <CraftButton variant="craft" size="lg" asChild>
        <Link href="/create">
          <Plus className="w-5 h-5 mr-2" />
          Create New Post
        </Link>
      </CraftButton>
    </div>
  </PatternBackground>
);

// Draft Card Component
const DraftCard = ({ draft, onDelete, onPublish, viewMode }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/create?draftId=${draft.id}`);
  };

  const calculateTimeSince = (timestamp) => {
    if (!timestamp) return "Recently";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  };

  if (viewMode === "grid") {
    return (
      <CraftCard className="overflow-hidden h-full flex flex-col">
        <div className="aspect-square relative">
          {draft.images && draft.images.length > 0 ? (
            <img
              src={draft.images[0]}
              alt="Draft preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <PenTool className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <CraftBadge variant="mint">Draft</CraftBadge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
            <div className="text-sm mb-1 line-clamp-2">
              {draft.description || "No description"}
            </div>
            <div className="text-xs opacity-75 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Updated {calculateTimeSince(draft.updatedAt)}</span>
            </div>
          </div>
        </div>
        <div className="p-3 flex-1 flex flex-col">
          {draft.categories && draft.categories.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {draft.categories.slice(0, 3).map((category, i) => (
                <CraftBadge key={i} variant="craft" className="text-xs">
                  {category}
                </CraftBadge>
              ))}
              {draft.categories.length > 3 && (
                <CraftBadge variant="outline" className="text-xs">
                  +{draft.categories.length - 3}
                </CraftBadge>
              )}
            </div>
          )}
          <div className="mt-auto flex gap-2 pt-2">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <CraftButton
              size="sm"
              variant="craft"
              className="flex-1"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </CraftButton>
          </div>
        </div>

        {/* Delete confirmation dialog */}
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <CraftCard className="max-w-sm mx-4">
              <div className="p-6">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-center mb-2">
                  Delete Draft?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  This action cannot be undone. This draft will be permanently
                  deleted.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete(draft.id);
                      setIsDeleteDialogOpen(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CraftCard>
          </div>
        )}
      </CraftCard>
    );
  } else {
    // List view
    return (
      <CraftCard className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-32 shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {draft.images && draft.images.length > 0 ? (
              <img
                src={draft.images[0]}
                alt="Draft preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <PenTool className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="p-4 flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CraftBadge variant="mint">Draft</CraftBadge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated {calculateTimeSince(draft.updatedAt)}
                  </span>
                </div>
                <p className="text-sm line-clamp-2 mb-2">
                  {draft.description || "No description"}
                </p>
              </div>
            </div>

            {draft.categories && draft.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {draft.categories.slice(0, 5).map((category, i) => (
                  <CraftBadge key={i} variant="craft" className="text-xs">
                    {category}
                  </CraftBadge>
                ))}
                {draft.categories.length > 5 && (
                  <CraftBadge variant="outline" className="text-xs">
                    +{draft.categories.length - 5}
                  </CraftBadge>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <CraftButton size="sm" variant="craft" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </CraftButton>
              <CraftButton
                size="sm"
                variant="mint"
                onClick={() => onPublish(draft.id)}
              >
                <Send className="w-4 h-4 mr-1" />
                Publish
              </CraftButton>
            </div>
          </div>
        </div>

        {/* Delete confirmation dialog */}
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <CraftCard className="max-w-sm mx-4">
              <div className="p-6">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-center mb-2">
                  Delete Draft?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  This action cannot be undone. This draft will be permanently
                  deleted.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete(draft.id);
                      setIsDeleteDialogOpen(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CraftCard>
          </div>
        )}
      </CraftCard>
    );
  }
};

// Main Drafts Page Component
export default function DraftsPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [drafts, setDrafts] = useState([]);
  const [filteredDrafts, setFilteredDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch user drafts
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchDrafts = async () => {
      try {
        setIsLoading(true);

        const draftsQuery = query(
          collection(db, "drafts"),
          where("associateUser", "==", user.id),
          orderBy("updatedAt", "desc")
        );

        const draftsSnapshot = await getDocs(draftsQuery);

        const draftsData = draftsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDrafts(draftsData);
        setFilteredDrafts(draftsData);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        toast.error("Failed to load drafts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrafts();
  }, [user, isSignedIn, isLoaded]);

  // Filter and sort drafts
  useEffect(() => {
    if (drafts.length === 0) return;

    // Filter based on search term
    let filtered = drafts;
    if (searchTerm) {
      filtered = drafts.filter(
        (draft) =>
          draft.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          draft.categories?.some((category) =>
            category.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Sort drafts
    filtered.sort((a, b) => {
      // Handle cases where the field might be undefined
      if (!a[sortBy]) return 1;
      if (!b[sortBy]) return -1;

      // Convert timestamps to dates for comparison
      const valueA = a[sortBy]?.toDate ? a[sortBy].toDate() : a[sortBy];
      const valueB = b[sortBy]?.toDate ? b[sortBy].toDate() : b[sortBy];

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA > valueB ? -1 : 1;
      }
    });

    setFilteredDrafts(filtered);
  }, [drafts, searchTerm, sortBy, sortOrder]);

  const handleDelete = async (draftId) => {
    try {
      await draftService.deleteDraft(draftId, user.id);

      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
      toast.success("Draft deleted successfully");
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    }
  };

  const handlePublish = async (draftId) => {
    try {
      const postId = await draftService.publishDraft(draftId, user.id);

      // Remove from drafts list
      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));

      toast.success("Post published successfully!");
      router.push(`/post/${postId}`);
    } catch (error) {
      console.error("Error publishing draft:", error);
      toast.error("Failed to publish draft");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (!isLoaded || (isLoaded && !isSignedIn)) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-craft-800 dark:text-gray-100">
            My Drafts
          </h1>
          <p className="text-craft-600 dark:text-gray-400">
            Continue working on your saved drafts
          </p>
        </div>
        <CraftButton variant="craft" size="lg" asChild>
          <Link href="/create">
            <Plus className="w-5 h-5 mr-2" />
            Create New Post
          </Link>
        </CraftButton>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <YarnSpinner size="lg" color="craft" />
        </div>
      ) : drafts.length === 0 ? (
        <EmptyDrafts />
      ) : (
        <>
          {/* Filters and Search */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search drafts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={toggleSortOrder}
                title={`Sort ${
                  sortOrder === "desc" ? "oldest first" : "newest first"
                }`}
              >
                <SortDesc
                  className={`w-4 h-4 ${
                    sortOrder === "asc" ? "rotate-180" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {sortOrder === "desc" ? "Newest" : "Oldest"}
                </span>
              </Button>
            </div>
          </div>

          {/* Drafts Grid/List */}
          {filteredDrafts.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No matching drafts</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                We couldn't find any drafts matching your search.
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredDrafts.map((draft) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
