import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { subjectService, Subject, UserSubjectData } from '@/services/subject.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookOpen } from 'lucide-react';


interface UserSubjectSelection {
  subjectId: string;
  canTeach: boolean;
  canLearn: boolean;
  proficiency: string;
}

const ProfileSetup = () => {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachList, setTeachList] = useState<string[]>([]);
  const [learnList, setLearnList] = useState<string[]>([]);
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadSubjects();
  }, []);

  const checkAuth = async () => {
    const session = authService.getSession();
    
    if (!session.userId) {
      navigate('/auth');
      return;
    }

    try {
      const profile = await profileService.getProfile(session.userId);
      if (profile) {
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setMajor(profile.major || '');
        setYearOfStudy(profile.year_of_study || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  // tag helpers
  const addTeach = (name: string)=>{
    const v = name.trim(); if(!v) return; setTeachList(prev=> Array.from(new Set([...prev, v]))); setTeachInput('');
  };
  const addLearn = (name: string)=>{
    const v = name.trim(); if(!v) return; setLearnList(prev=> Array.from(new Set([...prev, v]))); setLearnInput('');
  };
  const removeTeach = (name: string)=> setTeachList(prev=> prev.filter(x=>x!==name));
  const removeLearn = (name: string)=> setLearnList(prev=> prev.filter(x=>x!==name));

  const toggleSubject = () => {};
  const updateProficiency = () => {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const session = authService.getSession();
    if (!session.userId) {
      navigate('/auth');
      return;
    }

    try {
      // Update profile
      await profileService.updateProfile(session.userId, {
        full_name: fullName,
        bio,
        major,
        year_of_study: yearOfStudy,
      });

      // Replace user subjects with teach/learn lists
      await subjectService.deleteUserSubjects(session.userId);

      const subjectsToInsert: UserSubjectData[] = [
        ...teachList.map(name => ({ user_id: session.userId!, name, can_teach: true, can_learn: false, proficiency_level: 'advanced' })),
        ...learnList.map(name => ({ user_id: session.userId!, name, can_teach: false, can_learn: true, proficiency_level: 'beginner' })),
      ];
      if (subjectsToInsert.length) {
        await subjectService.updateUserSubjects(session.userId, subjectsToInsert);
      }

      toast({
        title: 'Success!',
        description: 'Profile updated successfully',
      });

      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to update profile';
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to update profile',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <div className="container max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
          </div>
          <p className="text-muted-foreground">Tell us about yourself and your learning goals</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your academic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  placeholder="e.g., Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Freshman">Freshman</SelectItem>
                    <SelectItem value="Sophomore">Sophomore</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What I can teach</CardTitle>
              <CardDescription>Add subjects as a list (press Enter to add). Click a tag to remove.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {teachList.map(name=> (
                  <button type="button" key={name} onClick={()=>removeTeach(name)} className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary hover:bg-primary/20">{name}</button>
                ))}
              </div>
              <form onSubmit={(e)=>{e.preventDefault(); addTeach(teachInput);}} className="flex gap-2">
                <Input value={teachInput} onChange={e=>setTeachInput(e.target.value)} placeholder="e.g. React, Calculus, Physics" />
                <Button type="submit">Add</Button>
              </form>
              {subjects.length>0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {subjects.slice(0,12).map(s=> (
                    <button type="button" key={s.id} className="px-2 py-1 rounded-full text-xs bg-muted hover:bg-muted/80" onClick={()=>addTeach(s.name)}>{s.name}</button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What I want to learn</CardTitle>
              <CardDescription>Add subjects as a list (press Enter to add). Click a tag to remove.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {learnList.map(name=> (
                  <button type="button" key={name} onClick={()=>removeLearn(name)} className="px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary-foreground hover:bg-secondary/20">{name}</button>
                ))}
              </div>
              <form onSubmit={(e)=>{e.preventDefault(); addLearn(learnInput);}} className="flex gap-2">
                <Input value={learnInput} onChange={e=>setLearnInput(e.target.value)} placeholder="e.g. UI/UX, Marketing, Biology" />
                <Button type="submit">Add</Button>
              </form>
              {subjects.length>0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {subjects.slice(0,12).map(s=> (
                    <button type="button" key={s.id} className="px-2 py-1 rounded-full text-xs bg-muted hover:bg-muted/80" onClick={()=>addLearn(s.name)}>{s.name}</button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile & Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
