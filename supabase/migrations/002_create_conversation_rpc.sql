-- Migration: Add security definer RPC for creating conversations
-- Fixes RLS policy conflict where batch-inserting conversation_participants
-- for two different users fails because auth.uid() only matches one row.

create or replace function public.create_conversation_with(other_user_id uuid)
returns uuid as $$
declare
  new_conv_id uuid;
begin
  -- Create the conversation
  insert into public.conversations default values returning id into new_conv_id;
  -- Add both participants atomically
  insert into public.conversation_participants (conversation_id, user_id) values
    (new_conv_id, auth.uid()),
    (new_conv_id, other_user_id);
  return new_conv_id;
end;
$$ language plpgsql security definer;
