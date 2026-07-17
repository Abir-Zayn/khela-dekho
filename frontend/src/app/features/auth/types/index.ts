export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  full_name: string | null;
  profile_photo_url: string | null;
  location: string | null;
  bio: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  instagram_handle: string | null;
  reading_interests: string[] | null;
  hobbies: string[] | null;
}
