"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { PostEditor } from "@/components/post/PostEditor";
import { TagInput } from "@/components/post/TagInput";
import { PostSummaryBlock } from "@/components/post/PostSummaryBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Send, Save, Sparkles, Trash2 } from "lucide-react";
import { updatePost, deletePost } from "@/actions/post.actions";
import { generateSummary } from "@/actions/ai.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/**
 * Edit page — edit an existing blog post.
 * Fetches the post data on mount and pre-fills the editor.
 */
export default function EditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [published, setPublished] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isPublishing, startPublishTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((post) => {
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags);
        setSummary(post.summary ?? "");
        setPublished(post.published);
      })
      .catch(() => {
        toast.error("Post not found");
        router.push("/");
      })
      .finally(() => setIsLoadingPost(false));
  }, [postId, router]);

  async function handleGenerateSummary() {
    if (!content || content.replace(/<[^>]*>/g, "").trim().length < 50) {
      toast.error("Write at least 50 characters before generating a summary");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSummary(content);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setSummary(result.summary);
        toast.success("Summary generated!");
      }
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  }

  function handlePublish() {
    startPublishTransition(async () => {
      try {
        const result = await updatePost(postId, {
          title,
          content,
          summary: summary || undefined,
          tags,
          published: true,
        });
        if (result && "error" in result) {
          toast.error(result.error);
        }
      } catch {
        toast.error("Failed to publish post");
      }
    });
  }

  function handleSaveDraft() {
    startSaveTransition(async () => {
      try {
        const result = await updatePost(postId, {
          title,
          content,
          summary: summary || undefined,
          tags,
          published: false,
        });
        if (result && "error" in result) {
          toast.error(result.error);
        }
      } catch {
        toast.error("Failed to save draft");
      }
    });
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deletePost(postId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Post deleted");
        router.push("/");
      }
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoadingPost) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit post</h1>
        <Dialog>
          <DialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1.5" />}>
              <Trash2 className="h-4 w-4" />
              Delete
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this post?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The post and all its comments will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="gap-2">
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Give your post a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold h-12"
          />
        </div>

        {/* Editor */}
        <div className="space-y-2">
          <Label>Content</Label>
          <PostEditor content={content} onChange={setContent} />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {/* AI Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>AI Summary</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="gap-1.5"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
          {summary && <PostSummaryBlock summary={summary} />}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/40">
          <Button
            onClick={handlePublish}
            disabled={isPublishing || isSaving}
            className="gap-2"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {published ? "Update" : "Publish"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isPublishing || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save as draft
          </Button>
        </div>
      </div>
    </div>
  );
}
