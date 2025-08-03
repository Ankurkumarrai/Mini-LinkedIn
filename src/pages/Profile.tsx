import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, X } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  bio: string | null;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', bio: '' });
  const { toast } = useToast();

  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [targetUserId]);

  const fetchProfile = async () => {
    if (!targetUserId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (data && !error) {
      setProfile(data);
      setEditForm({ full_name: data.full_name, bio: data.bio || '' });
    }
    setLoading(false);
  };

  const fetchUserPosts = async () => {
    if (!targetUserId) return;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        profiles!inner (
          full_name,
          email
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      const formattedPosts = data.map(post => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      }));
      setPosts(formattedPosts as Post[]);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        bio: editForm.bio,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      setProfile({ ...profile, ...editForm });
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isOwnProfile ? 'Your Profile' : `${profile.full_name}'s Profile`}
            </CardTitle>
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (editing) {
                    setEditForm({ full_name: profile.full_name, bio: profile.bio || '' });
                  }
                  setEditing(!editing);
                }}
              >
                {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSaveProfile} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-semibold">{profile.full_name}</h3>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
              {profile.bio && (
                <div>
                  <h4 className="font-medium mb-1">Bio</h4>
                  <p className="text-sm">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {isOwnProfile ? 'Your Posts' : 'Posts'}
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {isOwnProfile ? 'You haven\'t posted anything yet.' : 'No posts yet.'}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;