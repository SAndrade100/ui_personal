import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Nutrition() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/student');
  }, [router]);
  return null;
}
