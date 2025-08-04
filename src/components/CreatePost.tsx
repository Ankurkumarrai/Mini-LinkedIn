import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user.id,
          content: content.trim(),
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } else {
      setContent('');
      onPostCreated();
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <Card className="mb-6 border-2 border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Share an update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's happening in your professional world?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {content.length}/500 characters
            </p>
            <Button 
              type="submit" 
              disabled={loading || !content.trim() || content.length > 500}
              className="px-8"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;