
"use client";

import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { MessageSquare, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Center } from "@/lib/types";
import { useMemo } from "react";
import { doc } from "firebase/firestore";

export default function ClassChatBubble() {
  const { isClassChatBubbleVisible, user, isStudyBubbleVisible } = useApp();
  const router = useRouter();
  const firestore = useFirestore();

  const centerDocRef = useMemoFirebase(() => {
    if (!user?.organizationId) return null;
    return doc(firestore, "centers", user.organizationId);
  }, [user?.organizationId, firestore]);

  const { data: centerData } = useDoc<Center>(centerDocRef);

  const isChatEnabled = useMemo(() => {
    if (!user || user.center === 'personal' || !centerData) return false;
    const userClassName = `${user.course.replace('eso','ESO')}-${user.className}`;
    const classDef = centerData.classes.find(c => c.name === userClassName);
    return classDef?.isChatEnabled ?? true;
  }, [user, centerData]);


  const showClassChatBubble = isClassChatBubbleVisible && user && user.center !== 'personal' && isChatEnabled;

  return (
    <>
        {isStudyBubbleVisible && (
            <Link href="/study" passHref>
              <Button
                size="icon"
                className="fixed bottom-52 right-4 h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg transition-transform hover:scale-110 active:scale-95 z-40"
                aria-label="Abrir Modo Estudio"
              >
                <BrainCircuit className="h-7 w-7" />
              </Button>
            </Link>
        )}
        {showClassChatBubble && (
            <Button
                size="icon"
                className="fixed bottom-36 right-4 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 shadow-lg transition-transform hover:scale-110 active:scale-95"
                onClick={() => router.push('/class-chat')}
                aria-label="Abrir Chat de Clase"
            >
                <MessageSquare className="h-7 w-7" />
            </Button>
        )}
    </>
  );
}
