
import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'


export default async function Page() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select();
  console.log(instruments);

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>
}