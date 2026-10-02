// Internal Messages Service — admin-to-admin communication with file sharing

import { createServiceClient } from '@/utils/supabase/service';

export interface InternalMessageRow {
  id: string;
  sender_id: string;
  subject: string;
  body: string;
  attachments: Attachment[];
  visibility: 'admins_only' | 'super_admins_only' | 'custom';
  allowed_user_ids: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  sender_name?: string;
  sender_email?: string;
  sender_avatar?: string;
  is_read?: boolean;
  read_at?: string | null;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;   // MIME type
  size: number;    // bytes
}

export interface CreateMessageInput {
  sender_id: string;
  subject: string;
  body: string;
  attachments?: Attachment[];
  visibility: 'admins_only' | 'super_admins_only' | 'custom';
  allowed_user_ids?: string[];
}

/**
 * List internal messages visible to a given user.
 * Handles visibility filtering and joins sender info + read status.
 */
export async function listInternalMessages(
  userId: string,
  userRole: 'admin' | 'super_admin',
  options?: { limit?: number; offset?: number; search?: string }
): Promise<{
  messages: InternalMessageRow[];
  total: number;
  error: string | null;
}> {
  try {
    const supabase = createServiceClient();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    // Build the query with sender join
    let query = supabase
      .from('internal_messages')
      .select(`
        *,
        sender:admin_users!sender_id(name, email, avatar_url)
      `, { count: 'exact' });

    // Visibility filtering:
    // - super_admins see everything
    // - regular admins see 'admins_only' + 'custom' where they're in allowed_user_ids
    if (userRole !== 'super_admin') {
      query = query.or(`visibility.eq.admins_only,and(visibility.eq.custom,allowed_user_ids.cs.{${userId}})`);
    }

    // Search
    if (options?.search) {
      query = query.or(`subject.ilike.%${options.search}%,body.ilike.%${options.search}%`);
    }

    const { data, error, count } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('listInternalMessages error:', error.message);
      return { messages: [], total: 0, error: error.message };
    }

    // Get read status for this user
    const messageIds = (data || []).map((m: any) => m.id);
    let readMap: Record<string, string> = {};

    if (messageIds.length > 0) {
      const { data: reads } = await supabase
        .from('internal_message_reads')
        .select('message_id, read_at')
        .eq('user_id', userId)
        .in('message_id', messageIds);

      if (reads) {
        readMap = Object.fromEntries(reads.map((r: any) => [r.message_id, r.read_at]));
      }
    }

    // Shape the response
    const messages: InternalMessageRow[] = (data || []).map((m: any) => ({
      id: m.id,
      sender_id: m.sender_id,
      subject: m.subject,
      body: m.body,
      attachments: m.attachments || [],
      visibility: m.visibility,
      allowed_user_ids: m.allowed_user_ids || [],
      is_pinned: m.is_pinned,
      created_at: m.created_at,
      updated_at: m.updated_at,
      sender_name: m.sender?.name || 'Unknown',
      sender_email: m.sender?.email || '',
      sender_avatar: m.sender?.avatar_url || null,
      is_read: !!readMap[m.id],
      read_at: readMap[m.id] || null,
    }));

    return { messages, total: count || 0, error: null };
  } catch (err: any) {
    return { messages: [], total: 0, error: err.message || 'Unknown error' };
  }
}

/**
 * Get a single internal message by ID.
 */
export async function getInternalMessage(
  messageId: string,
  userId: string
): Promise<{ message: InternalMessageRow | null; error: string | null }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('internal_messages')
      .select(`
        *,
        sender:admin_users!sender_id(name, email, avatar_url)
      `)
      .eq('id', messageId)
      .single();

    if (error || !data) {
      return { message: null, error: error?.message || 'Message not found' };
    }

    // Check read status
    const { data: readData } = await supabase
      .from('internal_message_reads')
      .select('read_at')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .maybeSingle();

    const message: InternalMessageRow = {
      id: data.id,
      sender_id: data.sender_id,
      subject: data.subject,
      body: data.body,
      attachments: data.attachments || [],
      visibility: data.visibility,
      allowed_user_ids: data.allowed_user_ids || [],
      is_pinned: data.is_pinned,
      created_at: data.created_at,
      updated_at: data.updated_at,
      sender_name: (data as any).sender?.name || 'Unknown',
      sender_email: (data as any).sender?.email || '',
      sender_avatar: (data as any).sender?.avatar_url || null,
      is_read: !!readData,
      read_at: readData?.read_at || null,
    };

    return { message, error: null };
  } catch (err: any) {
    return { message: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Create a new internal message.
 */
export async function createInternalMessage(
  input: CreateMessageInput
): Promise<{ message: InternalMessageRow | null; error: string | null }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('internal_messages')
      .insert({
        sender_id: input.sender_id,
        subject: input.subject,
        body: input.body,
        attachments: input.attachments || [],
        visibility: input.visibility,
        allowed_user_ids: input.allowed_user_ids || [],
      })
      .select(`
        *,
        sender:admin_users!sender_id(name, email, avatar_url)
      `)
      .single();

    if (error) {
      return { message: null, error: error.message };
    }

    const message: InternalMessageRow = {
      ...data,
      sender_name: (data as any).sender?.name || 'Unknown',
      sender_email: (data as any).sender?.email || '',
      sender_avatar: (data as any).sender?.avatar_url || null,
      is_read: true, // sender has "read" their own message
      read_at: null,
    };

    return { message, error: null };
  } catch (err: any) {
    return { message: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Mark a message as read for a specific user.
 */
export async function markMessageRead(
  messageId: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('internal_message_reads')
      .upsert(
        { message_id: messageId, user_id: userId, read_at: new Date().toISOString() },
        { onConflict: 'message_id,user_id' }
      );

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}

/**
 * Delete an internal message (sender or super_admin only).
 */
export async function deleteInternalMessage(
  messageId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('internal_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}

/**
 * Toggle pin status on a message.
 */
export async function toggleMessagePin(
  messageId: string,
  isPinned: boolean
): Promise<{ error: string | null }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('internal_messages')
      .update({ is_pinned: isPinned })
      .eq('id', messageId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Unknown error' };
  }
}

/**
 * Upload a file to Supabase Storage and return its public URL.
 */
export async function uploadAttachment(
  file: { buffer: Buffer; name: string; type: string; size: number },
  senderId: string
): Promise<{ attachment: Attachment | null; error: string | null }> {
  try {
    const supabase = createServiceClient();

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `internal/${senderId}/${timestamp}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(path, file.buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { attachment: null, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(path);

    return {
      attachment: {
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size,
      },
      error: null,
    };
  } catch (err: any) {
    return { attachment: null, error: err.message || 'Unknown error' };
  }
}
