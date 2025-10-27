import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { profileService, Profile, UserSubject } from '@/services/profile.service';
import { subjectService } from '@/services/subject.service';
import { tutoringService } from '@/services/tutoring.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, GraduationCap, Send } from 'lucide-react';


const PeerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSubjects, setUserSubjects] = useState<UserSubject[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;

    try {
      const profileData = await profileService.getProfile(id);
      setProfile(profileData);

      const subjectsData = await subjectService.getUserSubjects(id);
      if (subjectsData) {
        setUserSubjects(subjectsData as UserSubject[]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Could not load profile',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!message.trim() || !id) return;

    setSending(true);

    const session = authService.getSession();
    if (!session.userId) {
      navigate('/auth');
      return;
    }

    try {
      const teachingSubject = userSubjects.find(us => us.can_teach);
      
      await tutoringService.createRequest({
        from_user_id: session.userId,
        to_user_id: id,
        subject_id: teachingSubject?.subjects?.id || userSubjects[0]?.subjects?.id,
        message,
        status: 'pending',
      });

      toast({
        title: 'Success!',
        description: 'Request sent successfully',
      });
      setMessage('');
    } catch (error) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to send request';
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to send request',
        variant: 'destructive',
      });
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  const teachingSubjects = userSubjects.filter(us => us.can_teach);
  const learningSubjects = userSubjects.filter(us => us.can_learn);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-4xl">
                    {profile.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <GraduationCap className="w-5 h-5" />
                    <span>{profile.major || 'No major set'}</span>
                    {profile.year_of_study && (
                      <>
                        <span>•</span>
                        <span>{profile.year_of_study}</span>
                      </>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-muted-foreground">{profile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Subjects */}
          {teachingSubjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Can Teach</CardTitle>
                <CardDescription>Subjects this peer can help you with</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {teachingSubjects.map((us) => (
                    <div key={us.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium mb-1">{us.subjects?.name}</div>
                        {us.subjects?.description && (
                          <p className="text-sm text-muted-foreground">{us.subjects.description}</p>
                        )}
                      </div>
                      {us.proficiency_level && (
                        <Badge variant="secondary" className="ml-4">
                          {us.proficiency_level}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Subjects */}
          {learningSubjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Wants to Learn</CardTitle>
                <CardDescription>Subjects this peer is interested in learning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {learningSubjects.map((us) => (
                    <Badge key={us.id} variant="outline">
                      {us.subjects?.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Send Request */}
          <Card>
            <CardHeader>
              <CardTitle>Send a Request</CardTitle>
              <CardDescription>Reach out to connect and learn together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Hi! I'd love to learn [subject] from you. Are you available this week?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleSendRequest}
                disabled={!message.trim() || sending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send Request'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PeerProfile;
