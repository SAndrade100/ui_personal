import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TrainerChat() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/trainer');
  }, [router]);
  return null;
}
