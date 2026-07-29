import EditPostRoot from '@/src/app/features/create-post/components/EditPostRoot';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  return <EditPostRoot postId={id} />;
}
