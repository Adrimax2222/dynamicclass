
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Sparkles,
  ChevronDown,
  BadgeCheck,
  Shield,
  MoreHorizontal,
  X,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/hooks/use-app";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  type Timestamp,
  doc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  increment,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AvatarDisplay } from "@/components/profile/avatar-creator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// ─────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────

interface BasePost {
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: Timestamp;
  likedBy: string[];
  parentId?: string;
  replyCount?: number;
  topic: string;
}

interface Post extends BasePost {
  uid: string;
}

interface Reply extends BasePost {
  uid: string;
}

type Role = "alumne" | "moderador";

const TOPICS = [
  { key: 'Tots', label: 'Tots', icon: '✦' },
  { key: 'Dubtes', label: 'Dubtes', icon: '❓' },
  { key: 'Exàmens', label: 'Exàmens', icon: '📝' },
  { key: 'Recursos', label: 'Recursos', icon: '📚' },
  { key: 'Cafeteria', label: 'Cafeteria', icon: '☕' },
  { key: 'Intel·ligència Artificial', label: 'IA', icon: '🤖' },
  { key: 'Política', label: 'Política', icon: '🏛️' },
  { key: 'Notícies', label: 'Notícies', icon: '📰' },
  { key: 'General', label: 'General', icon: '💬' },
];


// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getRole = (userRole: string): Role => {
  return userRole === "admin" ? "moderador" : "alumne";
};

const formatTimeAgo = (timestamp: Timestamp | null): string => {
    if (!timestamp) return 'ara mateix';
    const date = timestamp.toDate();
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ara mateix';
    if (diffMins < 60) return `Fa ${diffMins} ${diffMins === 1 ? 'min' : 'mins'}`;
    if (diffHours < 24) return `Fa ${diffHours} ${diffHours === 1 ? 'hora' : 'hores'}`;
    return `Fa ${diffDays} ${diffDays === 1 ? 'dia' : 'dies'}`;
}


const ROLE_CONFIG: Record<Role, { label: string; color: string; icon: React.ReactNode }> = {
  alumne: {
    label: "Alumne",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    icon: null,
  },
  moderador: {
    label: "Moderador",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: <Shield size={10} className="inline mr-0.5" />,
  },
};

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// REPLY CARD & LIST
// ─────────────────────────────────────────────

function ReplyCard({ reply, postId, onLikeReply, onAddReply, onDeleteReply, onUpdateReply }: { 
    reply: Reply; 
    postId: string;
    onLikeReply: (replyId: string) => Promise<void>;
    onAddReply: (content: string, parentId?: string) => Promise<void>;
    onDeleteReply: (postId: string, reply: Reply) => Promise<void>;
    onUpdateReply: (postId: string, replyId: string, newContent: string) => Promise<void>;
}) {
  const { user } = useApp();
  const likedByMe = user ? reply.likedBy.includes(user.uid) : false;
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(reply.content);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const canManage = user?.uid === reply.authorId || user?.role === 'admin';

  const handleSubReply = async () => {
    if (!replyText.trim()) return;
    await onAddReply(replyText, reply.uid);
    setReplyText("");
    setShowReplyInput(false);
    setShowReplies(true);
  };
  
  const handleSaveEdit = async () => {
    if (editedText.trim() && editedText !== reply.content) {
        setIsSaving(true);
        await onUpdateReply(postId, reply.uid, editedText);
        setIsSaving(false);
    }
    setIsEditing(false);
  };

  return (
    <>
        <div className="flex gap-3 group">
        <div className="flex flex-col items-center">
            <AvatarDisplay user={{name: reply.authorName, avatar: reply.authorAvatar}} className="w-10 h-10 flex-shrink-0" />
        </div>
        <div className="flex-1 bg-background/60 backdrop-blur-sm border border-border/70 rounded-2xl px-4 py-3 hover:border-primary/30 transition-all">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-sm text-foreground">
                {reply.authorName}
            </span>
            <RoleBadge role={getRole(reply.authorRole)} />
            <span className="text-xs text-muted-foreground ml-auto">{formatTimeAgo(reply.createdAt)}</span>
             {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted">
                        <MoreHorizontal size={16} />
                      </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                          <Edit className="mr-2 h-4 w-4"/>
                          <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4"/>
                          <span>Eliminar</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2 my-2">
                  <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="text-sm"
                      autoFocus
                      rows={3}
                  />
                  <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Guardar'}
                      </Button>
                  </div>
              </div>
          ) : (
             <p className="text-sm text-secondary-foreground leading-relaxed">{reply.content}</p>
          )}
            
            <div className="flex items-center gap-1 mt-2">
                <button
                    onClick={() => onLikeReply(reply.uid)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all ${
                        likedByMe
                        ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                        : "text-muted-foreground hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    }`}
                >
                    <Heart size={13} className={cn("transition-all", likedByMe && "fill-rose-500")} />
                    <span>{reply.likedBy.length}</span>
                </button>
                <button
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                >
                    <MessageCircle size={13} />
                    <span>Respondre</span>
                </button>
                {(reply.replyCount || 0) > 0 && (
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="ml-auto flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-all"
                    >
                        {showReplies ? "Amaga" : `Veure ${reply.replyCount} respostes`}
                        <ChevronDown size={14} className={`transition-transform ${showReplies ? "rotate-180" : ""}`}/>
                    </button>
                )}
            </div>
            
            {showReplyInput && (
            <div className="mt-3 flex gap-2 items-center animate-in slide-in-from-top-2 duration-200">
                {user && <AvatarDisplay user={user} className="w-8 h-8 flex-shrink-0"/>}
                <div className="flex-1 flex gap-2 bg-muted/50 border border-border/70 rounded-2xl px-3 py-2">
                <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubReply()}
                    placeholder="Escriu la teva resposta..."
                    className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder-muted-foreground"
                    autoFocus
                />
                <button
                    onClick={handleSubReply}
                    disabled={!replyText.trim()}
                    className="text-primary hover:text-primary/80 disabled:opacity-30 transition-all"
                >
                    <Send size={15} />
                </button>
                </div>
            </div>
            )}

            {showReplies && (
                <RepliesList 
                    postId={postId} 
                    parentId={reply.uid} 
                    onAddReply={onAddReply}
                    onLikeReply={onLikeReply}
                    onDeleteReply={onDeleteReply}
                    onUpdateReply={onUpdateReply}
                />
            )}
        </div>
        </div>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Seguro que quieres eliminarlo?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer. La respuesta se eliminará permanentemente.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteReply(postId, reply)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RepliesList({ postId, parentId, onAddReply, onLikeReply, onDeleteReply, onUpdateReply }: { 
    postId: string;
    parentId?: string;
    onAddReply: (content: string, parentId?: string) => Promise<void>;
    onLikeReply: (replyId: string) => Promise<void>;
    onDeleteReply: (postId: string, reply: Reply) => Promise<void>;
    onUpdateReply: (postId: string, replyId: string, newContent: string) => Promise<void>;
}) {
    const firestore = useFirestore();

    const repliesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `discussions/${postId}/replies`), orderBy('createdAt', 'asc'));
    }, [firestore, postId]);
    
    const { data: allReplies, isLoading } = useCollection<Reply>(repliesQuery);

    const filteredReplies = useMemo(() => {
        if (!allReplies) return [];
        if (!parentId) {
            return allReplies.filter(reply => !reply.parentId);
        }
        return allReplies.filter(reply => reply.parentId === parentId);
    }, [allReplies, parentId]);

    if (isLoading) {
        return <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto"/></div>
    }

    if (filteredReplies.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 pl-4 border-l-2 border-primary/20 space-y-3">
            {filteredReplies.map(reply => (
                <ReplyCard 
                    key={reply.uid}
                    reply={reply} 
                    postId={postId}
                    onLikeReply={onLikeReply} 
                    onAddReply={onAddReply}
                    onDeleteReply={onDeleteReply}
                    onUpdateReply={onUpdateReply}
                />
            ))}
        </div>
    );
}


// ─────────────────────────────────────────────
// POST CARD
// ─────────────────────────────────────────────
function PostCard({ post, onDelete, onUpdate, onAddReply, onLikeReply, onDeleteReply, onUpdateReply }: { 
    post: Post;
    onDelete: (id: string) => void;
    onUpdate: (id: string, content: string) => Promise<void>;
    onAddReply: (content: string, parentId?: string) => Promise<void>;
    onLikeReply: (replyId: string) => Promise<void>;
    onDeleteReply: (postId: string, reply: Reply) => Promise<void>;
    onUpdateReply: (postId: string, replyId: string, newContent: string) => Promise<void>;
}) {
  const { user } = useApp();
  const firestore = useFirestore();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.content);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const likedByMe = user ? post.likedBy.includes(user.uid) : false;
  const canManage = user?.uid === post.authorId || user?.role === 'admin';
  const topicConfig = TOPICS.find(t => t.key === post.topic);

  const handleLike = async () => {
    if (!user || !firestore) return;
    const postRef = doc(firestore, 'discussions', post.uid);
    await updateDoc(postRef, {
        likedBy: likedByMe ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
  }
  
  const handleSaveEdit = async () => {
    if (editedText.trim() && editedText !== post.content) {
        setIsSaving(true);
        await onUpdate(post.uid, editedText);
        setIsSaving(false);
    }
    setIsEditing(false);
  };
  
  const handleReplySubmit = async () => {
      if (!replyText.trim()) return;
      await onAddReply(replyText);
      setReplyText("");
      setShowReplyInput(false);
  };

  return (
    <>
      <article className="group bg-background/80 backdrop-blur-md border border-border/70 rounded-3xl p-5 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <AvatarDisplay user={{name: post.authorName, avatar: post.authorAvatar}} className="w-10 h-10 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">
                  {post.authorName}
                </span>
                {getRole(post.authorRole) === "moderador" && (
                  <BadgeCheck size={15} className="text-emerald-500" />
                )}
                <RoleBadge role={getRole(post.authorRole)} />
              </div>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {topicConfig && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {topicConfig.icon} {topicConfig.label}
              </span>
            )}
            {canManage && (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted">
                        <MoreHorizontal size={16} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4"/>
                        <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4"/>
                        <span>Eliminar</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            )}
          </div>
        </div>

          {isEditing ? (
              <div className="space-y-2 my-4">
                  <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="text-base"
                      autoFocus
                      rows={4}
                  />
                  <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Guardar'}
                      </Button>
                  </div>
              </div>
          ) : (
              <p className="text-secondary-foreground leading-relaxed text-[15px] mb-4">
                  {post.content}
              </p>
          )}

        <div className="flex items-center gap-1 border-t border-border/50 pt-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              likedByMe
                ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                : "text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            }`}
          >
            <Heart size={15} className={cn("transition-all", likedByMe && "fill-rose-500")} />
            <span>{post.likedBy.length}</span>
          </button>

          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          >
            <MessageCircle size={15} />
            <span>{post.replyCount || 0}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all">
            <Share2 size={15} />
          </button>

          {(post.replyCount || 0) > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="ml-auto flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-all"
            >
              {showReplies ? "Amaga" : `Veure ${post.replyCount} respostes`}
              <ChevronDown
                size={14}
                className={`transition-transform ${showReplies ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-3 flex gap-2 items-center animate-in slide-in-from-top-2 duration-200">
             {user && <AvatarDisplay user={user} className="w-8 h-8 flex-shrink-0"/>}
            <div className="flex-1 flex gap-2 bg-muted/50 border border-border/70 rounded-2xl px-3 py-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReplySubmit()}
                placeholder="Escriu la teva resposta..."
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder-muted-foreground"
                autoFocus
              />
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim()}
                className="text-primary hover:text-primary/80 disabled:opacity-30 transition-all"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        {showReplies && <RepliesList postId={post.uid} onAddReply={(content, parentId) => onAddReply(content, parentId)} onLikeReply={(replyId) => onLikeReply(replyId)} onDeleteReply={onDeleteReply} onUpdateReply={onUpdateReply} />}
      </article>
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Seguro que quieres eliminarlo?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer. La publicación se eliminará permanentemente.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(post.uid)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function DiscussionsPage() {
  const { user } = useApp();
  const firestore = useFirestore();
  const [newPostText, setNewPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [filter, setFilter] = useState('Tots');
  const [newPostTopic, setNewPostTopic] = useState('');

  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "discussions"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection<Post>(postsQuery);
  
  const filteredPosts = useMemo(() => {
      if (!posts) return [];
      if (filter === 'Tots') return posts;
      return posts.filter(post => post.topic === filter);
  }, [posts, filter]);

  const handleNewPost = async () => {
    if (!newPostText.trim() || !user || !firestore || !newPostTopic) return;
    setIsPosting(true);
    
    const newPost: Omit<Post, 'uid'> = {
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorRole: user.role,
        content: newPostText,
        topic: newPostTopic,
        createdAt: serverTimestamp() as Timestamp,
        likedBy: [],
        replyCount: 0,
    };

    try {
        await addDoc(collection(firestore, 'discussions'), newPost);
        setNewPostText("");
        setNewPostTopic("");
    } catch(err) {
        console.error("Error creating post:", err);
    } finally {
        setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, 'discussions', postId));
    } catch (err) {
        console.error("Error deleting post:", err);
    }
  };

  const handleUpdatePost = async (postId: string, newContent: string) => {
      if (!firestore) return;
      try {
          await updateDoc(doc(firestore, 'discussions', postId), {
              content: newContent
          });
      } catch (err) {
          console.error("Error updating post:", err);
      }
  };
  
  const handleAddReply = async (content: string, parentId?: string, postId?: string) => {
    if (!user || !firestore || !content.trim() || !postId) return;

    const newReplyData: Omit<Reply, 'uid'> = {
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        authorRole: user.role,
        content: content,
        createdAt: serverTimestamp() as Timestamp,
        likedBy: [],
        replyCount: 0,
        topic: '', // Topics are for posts, not replies
        ...(parentId && { parentId }),
    };

    const postRef = doc(firestore, 'discussions', postId);
    const repliesCollectionRef = collection(postRef, 'replies');

    try {
        await runTransaction(firestore, async (transaction) => {
            const newReplyRef = doc(repliesCollectionRef);
            transaction.set(newReplyRef, newReplyData);
            
            transaction.update(postRef, { replyCount: increment(1) });

            if (parentId) {
                const parentReplyRef = doc(repliesCollectionRef, parentId);
                transaction.update(parentReplyRef, { replyCount: increment(1) });
            }
        });
    } catch (e) {
        console.error("Error adding reply:", e);
    }
  };
  
    const handleLikeReply = async (postId: string, replyId: string) => {
        if (!user || !firestore) return;
        const replyRef = doc(firestore, `discussions/${postId}/replies`, replyId);

        await runTransaction(firestore, async (transaction) => {
            const replyDoc = await transaction.get(replyRef);
            if (!replyDoc.exists()) return;

            const currentLikedBy = replyDoc.data().likedBy || [];
            const isLiked = currentLikedBy.includes(user.uid);
            
            transaction.update(replyRef, {
                likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
            });
        });
    };

    const handleUpdateReply = async (postId: string, replyId: string, newContent: string) => {
        if (!firestore) return;
        const replyRef = doc(firestore, `discussions/${postId}/replies`, replyId);
        try {
            await updateDoc(replyRef, { content: newContent });
        } catch (e) {
            console.error("Error updating reply:", e);
        }
    };
    
    const handleDeleteReply = async (postId: string, replyToDelete: Reply) => {
        if (!firestore) return;
        const replyRef = doc(firestore, `discussions/${postId}/replies`, replyToDelete.uid);
        const postRef = doc(firestore, `discussions`, postId);
        
        try {
            await runTransaction(firestore, async (transaction) => {
            transaction.delete(replyRef);
            transaction.update(postRef, { replyCount: increment(-1) });
            
            if (replyToDelete.parentId) {
                const parentReplyRef = doc(firestore, `discussions/${postId}/replies`, replyToDelete.parentId);
                transaction.update(parentReplyRef, { replyCount: increment(-1) });
            }
            });
        } catch (e) {
            console.error("Error deleting reply:", e);
        }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20 dark:from-slate-900/50 dark:via-violet-900/20 dark:to-purple-900/20">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-1">
            Comunitat 💬
          </h1>
          <p className="text-muted-foreground text-sm">
            Comparteix, pregunta i aprèn amb la resta d'alumnes
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
            {TOPICS.map(topic => (
                <button
                    key={topic.key}
                    onClick={() => setFilter(topic.key)}
                    className={cn(
                        "flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200",
                        filter === topic.key
                            ? "bg-violet-600 text-white shadow-md"
                            : "bg-background/80 text-muted-foreground hover:bg-muted/80"
                    )}
                >
                    <span>{topic.icon}</span>
                    <span>{topic.label}</span>
                </button>
            ))}
        </div>

        <div className="mb-5 flex items-start gap-3 bg-amber-50/90 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-4 py-3 shadow-sm">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>El contingut publicat serà revisat.</strong>
          </p>
        </div>

        <div className="mb-6 bg-background/80 backdrop-blur-md border border-border/70 rounded-3xl p-4 shadow-sm">
          <div className="flex gap-3 items-start">
            {user && <AvatarDisplay user={user} className="w-10 h-10 flex-shrink-0" />}
            <Textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Inicia una nova conversa amb la comunitat..."
              rows={3}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
             <Select value={newPostTopic} onValueChange={setNewPostTopic}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                    <SelectValue placeholder="Selecciona un tòpic..." />
                </SelectTrigger>
                <SelectContent>
                    {TOPICS.filter(t => t.key !== 'Tots').map(topic => (
                        <SelectItem key={topic.key} value={topic.key} className="text-xs">
                           <span className="mr-2">{topic.icon}</span> {topic.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
              onClick={handleNewPost}
              disabled={!newPostText.trim() || !newPostTopic || isPosting}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-2xl transition-all active:scale-95 shadow-sm shadow-primary/30"
            >
              {isPosting ? (
                <Loader2 className="h-4 w-4 animate-spin"/>
              ) : (
                <Send size={13} />
              )}
              Publicar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background/70 rounded-3xl p-5 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-32" />
                    <div className="h-2 bg-muted/50 rounded w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted/50 rounded" />
                  <div className="h-3 bg-muted/50 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No hi ha publicacions en aquest tòpic.</p>
            <p className="text-xs">Sigues el primer en iniciar una conversa!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.uid}
                post={post}
                onDelete={handleDeletePost}
                onUpdate={handleUpdatePost}
                onAddReply={(content, parentId) => handleAddReply(content, parentId, post.uid)}
                onLikeReply={(replyId) => handleLikeReply(post.uid, replyId)}
                onDeleteReply={(postId, reply) => handleDeleteReply(postId, reply)}
                onUpdateReply={(postId, replyId, content) => handleUpdateReply(postId, replyId, content)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

    

    