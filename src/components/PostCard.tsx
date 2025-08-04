import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  profiles: {
    full_name: string;
    email: string;
    user_id?: string;
  };
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleProfileClick = () => {
    if (post.user_id) {
      navigate(`/profile/${post.user_id}`);
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar 
            className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
            onClick={handleProfileClick}
          >
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(post.profiles.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 
              className="font-semibold hover:text-primary cursor-pointer transition-colors"
              onClick={handleProfileClick}
            >
              {post.profiles.full_name}
            </h3>
            <p className="text-sm text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </CardContent>
    </Card>
  );
};

export default PostCard;