"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApp } from "@/lib/hooks/use-app";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/icons";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  center: z.string().min(1, { message: "Educational center is required." }),
  ageRange: z.string().min(1, { message: "Please select an age range." }),
  role: z.enum(["student", "teacher"], { required_error: "You need to select a role." }),
  classCode: z.string().optional(),
  avatar: z.string().min(1, { message: "Please select a profile picture." }),
});

export default function RegistrationForm() {
  const router = useRouter();
  const { login } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      center: "",
      role: "student",
      classCode: "",
      avatar: PlaceHolderImages[0].imageUrl,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login({
        name: values.fullName,
        email: values.email,
        center: values.center,
        ageRange: values.ageRange,
        role: values.role,
        avatar: values.avatar,
        trophies: Math.floor(Math.random() * 100),
      });
      setIsLoading(false);
      router.push("/home");
    }, 1500);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
       <div className="absolute top-8 left-8 flex items-center gap-2">
         <Logo className="h-8 w-8 text-primary" />
         <h1 className="text-xl font-bold tracking-tight">Dynamic Class</h1>
       </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Join Dynamic Class</CardTitle>
          <CardDescription>
            Create your account to connect with your class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="center"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educational Center</FormLabel>
                      <FormControl>
                        <Input placeholder="Springfield University" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ageRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your age range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12-15">12-15 years</SelectItem>
                          <SelectItem value="16-18">16-18 years</SelectItem>
                          <SelectItem value="19-22">19-22 years</SelectItem>
                          <SelectItem value="23+">23+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Your Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="student" />
                          </FormControl>
                          <FormLabel className="font-normal">Student</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="teacher" />
                          </FormControl>
                          <FormLabel className="font-normal">Teacher</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter code to join a class" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your teacher will provide this code.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Profile Picture</FormLabel>
                    <FormDescription>
                      Choose a default avatar or upload your own.
                    </FormDescription>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 sm:grid-cols-4 gap-4"
                    >
                      {PlaceHolderImages.slice(0,5).map((img) => (
                        <FormItem key={img.id} className="relative">
                          <FormControl>
                            <RadioGroupItem value={img.imageUrl} className="sr-only" />
                          </FormControl>
                          <FormLabel className="cursor-pointer">
                            <Image
                              src={img.imageUrl}
                              alt={img.description}
                              width={80}
                              height={80}
                              className={`rounded-full aspect-square object-cover transition-all ${
                                field.value === img.imageUrl
                                  ? 'ring-4 ring-primary ring-offset-2'
                                  : 'opacity-60 hover:opacity-100'
                              }`}
                            />
                          </FormLabel>
                        </FormItem>
                      ))}
                      <FormItem className="relative">
                         <FormLabel className="cursor-pointer">
                            <div
                            className="h-[80px] w-[80px] rounded-full flex flex-col items-center justify-center gap-1 border-2 border-dashed bg-muted hover:bg-muted/80">
                            <Camera className="h-6 w-6" />
                            <span className="text-xs">Upload</span>
                            </div>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account & Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
