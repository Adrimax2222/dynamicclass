"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { generateImage } from "@/ai/flows/image-generator-flow";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const result = await generateImage({ prompt });
      setGeneratedImage(result.imageDataUri);
    } catch (err) {
      console.error("Image Generation Error:", err);
      setError("Sorry, I couldn't generate the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
          <ImageIcon className="h-7 w-7 text-primary" />
          Image Generator
        </h1>
        <p className="text-muted-foreground">
          Create images from your imagination with AI.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Describe your image</CardTitle>
          <CardDescription>
            Enter a detailed description of the image you want to create.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., A majestic lion wearing a crown, sitting on a throne in a fantasy castle"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="mt-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-muted/50 p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 font-semibold">Creating your masterpiece...</p>
                <p className="text-sm text-muted-foreground">This can take a few moments.</p>
              </div>
            )}
            {generatedImage && (
              <div className="overflow-hidden rounded-lg border shadow-lg">
                <Image
                  src={generatedImage}
                  alt={prompt}
                  width={512}
                  height={512}
                  className="w-full object-cover"
                />
              </div>
            )}
            {!isLoading && !generatedImage && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                    <p className="mt-4 font-semibold">Your generated image will appear here</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
