"use client"

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Loader2, Send } from "lucide-react";
import { getCourseRecommendations } from "@/ai/flows/personalized-course-recommendations";
import { currentStudentCourses } from "@/lib/data";

export default function CoursesPage() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRecs = async () => {
    setIsLoading(true);
    setRecommendations([]);
    try {
      const result = await getCourseRecommendations({
        currentClasses: currentStudentCourses,
      });
      setRecommendations(result.recommendedCourses);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      // Optionally, set an error message to display to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
          Learning Hub
        </h1>
        <p className="text-muted-foreground">
          Discover new courses and connect with your classmates.
        </p>
      header>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="chat">Class Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Course Recommendations</CardTitle>
              <CardDescription>
                Based on your current classes, here are some courses you might
                be interested in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Your Current Courses:</h4>
                <div className="flex flex-wrap gap-2">
                    {currentStudentCourses.map(course => (
                        <div key={course} className="text-xs rounded-full bg-muted px-3 py-1">{course}</div>
                    ))}
                </div>
              </div>
              <Button onClick={handleGetRecs} disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Lightbulb className="mr-2 h-4 w-4" /> Get Recommendations</>
                )}
              </Button>
              {recommendations.length > 0 && (
                <div className="space-y-2 pt-4">
                    <h4 className="font-semibold text-sm">Recommended for you:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chat" className="mt-6">
          <Card className="h-[calc(100vh-18rem)]">
            <CardHeader>
              <CardTitle>Physics 101 Class Chat</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  <ChatMessage user="Emily" text="Hey guys, did anyone understand the last part of the lecture on relativity?" avatarSeed="avatar2" />
                  <ChatMessage user="You" text="I was a bit lost too! Especially the time dilation part." avatarSeed="avatar1" isCurrentUser />
                  <ChatMessage user="Mr. Davison" text="Good question! Time dilation is a core concept. Remember the twin paradox thought experiment we discussed? Let's go over it again." avatarSeed="avatar4" />
                  <ChatMessage user="Sam" text="Oh right, that makes more sense now. Thanks!" avatarSeed="avatar3" />
                </div>
              </ScrollArea>
              <div className="mt-4 flex w-full items-center space-x-2 pt-4 border-t">
                <Input placeholder="Type a message..." />
                <Button><Send className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChatMessage({ user, text, avatarSeed, isCurrentUser = false }: { user: string, text: string, avatarSeed: string, isCurrentUser?: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : ""}`}>
      {!isCurrentUser && <Avatar className="h-8 w-8"><AvatarImage src={`https://picsum.photos/seed/${avatarSeed}/100`} /></Avatar>}
      <div className={`rounded-lg px-3 py-2 max-w-sm ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        {!isCurrentUser && <p className="text-xs font-semibold mb-1">{user}</p>}
        <p className="text-sm">{text}</p>
      </div>
      {isCurrentUser && <Avatar className="h-8 w-8"><AvatarImage src="https://picsum.photos/seed/myavatar/100" /></Avatar>}
    </div>
  );
}
