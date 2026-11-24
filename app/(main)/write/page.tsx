"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/post/PostEditor";
import { TagInput } from "@/components/post/TagInput";
import { PostSummaryBlock } from "@/components/post/PostSummaryBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Save, Sparkles } from "lucide-react";
import { createPost } from "@/actions/post.actions";
import { generateSummary } from "@/actions/ai.actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { toast } from "sonner";

/**
 * Write page — create a new blog post with the Tiptap editor.
 * Supports title, content, tags, AI summary generation, and publish/draft.
 */
export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [isPublishing, startPublishTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

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
        const result = await createPost({
          title,
          content,
          summary: summary || undefined,
          tags,
          published: true,
        });
        if (result && "error" in result) {
          toast.error(result.error);
        }
        // Redirects to post page on success
      } catch (err) {
        if (isRedirectError(err)) throw err;
        toast.error("Failed to publish post");
      }
    });
  }

  function handleSaveDraft() {
    startSaveTransition(async () => {
      try {
        const result = await createPost({
          title,
          content,
          summary: summary || undefined,
          tags,
          published: false,
        });
        if (result && "error" in result) {
          toast.error(result.error);
        }
        // Redirects to post page on success
      } catch (err) {
        if (isRedirectError(err)) throw err;
        toast.error("Failed to save draft");
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">Create a new post</h1>

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
            Publish
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
            Save draft
          </Button>
        </div>
      </div>
    </div>
  );
}
