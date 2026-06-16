"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { DEFAULT_INTERESTS, MIN_INTERESTS } from "@/lib/constants";
import { completeOnboarding } from "@/actions/user.actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * 2-step onboarding page shown after registration.
 * Step 1: Set bio + avatar URL
 * Step 2: Select at least 3 interests for feed personalization
 */
export default function WelcomePage() {
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleComplete() {
    if (interests.length < MIN_INTERESTS) {
      toast.error(`Please select at least ${MIN_INTERESTS} interests`);
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeOnboarding({ bio, image, interests });
      if (result && "error" in result) {
        toast.error(result.error);
      }
      // redirects to "/" on success
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to InkSpace</h1>
        <p className="text-muted-foreground">
          Let&apos;s personalize your experience
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 justify-center mb-8">
        <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 1 ? "bg-primary" : "bg-muted")} />
        <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 2 ? "bg-primary" : "bg-muted")} />
      </div>

      {step === 1 ? (
        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>About you</CardTitle>
            <CardDescription>Tell the community a bit about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="A short bio about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
            <Button onClick={() => setStep(2)} className="w-full gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle>Your interests</CardTitle>
            <CardDescription>
              Select at least {MIN_INTERESTS} topics to personalize your feed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DEFAULT_INTERESTS.map((interest) => (
                <Badge
                  key={interest}
                  variant={interests.includes(interest) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer text-sm py-1.5 px-3 transition-all",
                    interests.includes(interest)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {interests.length}/{MIN_INTERESTS} minimum selected
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isLoading || interests.length < MIN_INTERESTS}
                className="flex-1"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Complete setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
