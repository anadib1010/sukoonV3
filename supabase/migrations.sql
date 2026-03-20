-- Run once in Supabase Dashboard → SQL Editor → New Query

create or replace function increment_credits(uid uuid, amount int)
returns void as $$
  insert into progress_user_stats (user_id, credits, total_sessions)
  values (uid, amount, 0)
  on conflict (user_id)
  do update set credits = progress_user_stats.credits + amount;
$$ language sql security definer;

grant execute on function increment_credits(uuid, int) to authenticated;
