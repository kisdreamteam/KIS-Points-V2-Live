import { createClient } from '@/lib/client';

export async function createSkill(params: {
  classId: string;
  name: string;
  points: number;
  type: 'positive' | 'negative';
  icon: string;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { error } = await supabase.from('point_categories').insert({
    name: params.name,
    points: params.points,
    type: params.type,
    class_id: params.classId,
    icon: params.icon,
  });
  if (error) throw error;
}

export async function updateSkill(params: {
  skillId: string;
  name: string;
  points: number;
  icon: string;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { error } = await supabase
    .from('point_categories')
    .update({
      name: params.name,
      points: params.points,
      icon: params.icon,
    })
    .eq('id', params.skillId);
  if (error) throw error;
}

export async function archiveSkill(params: {
  skillId: string;
  classId: string;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { data: skillData, error: fetchError } = await supabase
    .from('point_categories')
    .select('class_id')
    .eq('id', params.skillId)
    .single();
  if (fetchError || !skillData) {
    throw fetchError ?? new Error('Skill not found');
  }
  if (skillData.class_id !== params.classId) {
    throw new Error('SKILL_CLASS_MISMATCH');
  }

  const { error } = await supabase
    .from('point_categories')
    .update({ is_archived: true })
    .eq('id', params.skillId)
    .eq('class_id', params.classId);
  if (error) throw error;
}
