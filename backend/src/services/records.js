import createError from "http-errors";
import { supabaseAdmin } from "../lib/supabase.js";
import { hashPayload } from "../utils/hash.js";

export async function createRecord({ userId, label, data, metadata }) {
  const { canonical, hash } = hashPayload(data);

  const { data: inserted, error } = await supabaseAdmin
    .from("tamper_records")
    .insert({
      user_id: userId,
      label,
      data_hash: hash,
      canonical_size: canonical.length,
      metadata: metadata ?? null
    })
    .select("id, label, data_hash, canonical_size, metadata, created_at")
    .single();

  if (error) {
    throw createError(500, `Failed to store hash: ${error.message}`);
  }

  return {
    ...inserted,
    dataHash: inserted.data_hash
  };
}

export async function listRecords(userId) {
  const { data, error } = await supabaseAdmin
    .from("tamper_records")
    .select("id, label, data_hash, canonical_size, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw createError(500, `Failed to fetch records: ${error.message}`);
  }

  return (data ?? []).map((record) => ({
    ...record,
    dataHash: record.data_hash
  }));
}

export async function verifyRecord({ userId, recordId, data }) {
  const { data: record, error } = await supabaseAdmin
    .from("tamper_records")
    .select("id, label, data_hash, created_at")
    .eq("id", recordId)
    .eq("user_id", userId)
    .single();

  if (error || !record) {
    throw createError(404, "Record not found");
  }

  const { hash } = hashPayload(data);

  return {
    recordId: record.id,
    label: record.label,
    originalHash: record.data_hash,
    incomingHash: hash,
    tampered: hash !== record.data_hash,
    checkedAt: new Date().toISOString(),
    createdAt: record.created_at
  };
}
