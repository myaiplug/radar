import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmCheckout,
  createLead,
  deleteLead,
  getAccess,
  getDeskStats,
  getLead,
  inspectThread,
  listDrafts,
  listLeads,
  listServices,
  runHunt,
  saveDraft,
  setLeadStage,
  startCheckout,
  updateLead,
  updateService,
  writeOutreach,
} from "./desk";
import type { ChannelId, LeadInput, StageId } from "./types";

function useInvalidateDesk() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["leads"] });
    void qc.invalidateQueries({ queryKey: ["stats"] });
    void qc.invalidateQueries({ queryKey: ["lead"] });
    void qc.invalidateQueries({ queryKey: ["access"] });
  };
}

export function useServices() {
  return useQuery({ queryKey: ["services"], queryFn: () => listServices() });
}

export function useLeads() {
  return useQuery({ queryKey: ["leads"], queryFn: () => listLeads() });
}

export function useLead(id: number) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLead(id),
    enabled: Number.isFinite(id),
  });
}

export function useDeskStats() {
  return useQuery({ queryKey: ["stats"], queryFn: () => getDeskStats() });
}

export function useAccess() {
  return useQuery({ queryKey: ["access"], queryFn: () => getAccess() });
}

export function useDrafts(leadId: number) {
  return useQuery({
    queryKey: ["drafts", leadId],
    queryFn: () => listDrafts(leadId),
    enabled: Number.isFinite(leadId),
  });
}

export function useLeadMutations() {
  const invalidate = useInvalidateDesk();

  const create = useMutation({
    mutationFn: async (input: LeadInput) => createLead(input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async (input: LeadInput & { id: number }) => updateLead(input),
    onSuccess: invalidate,
  });
  const stage = useMutation({
    mutationFn: async (input: { id: number; stage: StageId }) => setLeadStage(input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: number) => deleteLead(id),
    onSuccess: invalidate,
  });

  return { create, update, stage, remove };
}

export function useServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: number; rateLabel?: string; active?: boolean; blurb?: string }) =>
      updateService(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useHunt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      serviceIds: number[];
      niche: string;
      geo: string;
      notes: string;
      windowHours: number;
    }) => runHunt(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["access"] });
    },
  });
}

export function useThreadPeek() {
  return useMutation({
    mutationFn: (postUrl: string) => inspectThread({ postUrl }),
  });
}

export function useOutreach() {
  const qc = useQueryClient();
  const write = useMutation({
    mutationFn: async (input: { leadId: number; channel: ChannelId; extra?: string }) =>
      writeOutreach(input),
  });
  const save = useMutation({
    mutationFn: async (input: { leadId: number; channel: ChannelId; body: string }) => saveDraft(input),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["drafts", vars.leadId] });
    },
  });
  return { write, save };
}

export function useCheckout() {
  const invalidate = useInvalidateDesk();
  return useMutation({
    mutationFn: async () => startCheckout(),
    onSuccess: (res) => {
      if (res.ok && "unlocked" in res && res.unlocked) invalidate();
    },
  });
}

export function useConfirmCheckout() {
  const invalidate = useInvalidateDesk();
  return useMutation({
    mutationFn: async (input: { sessionId: string }) => confirmCheckout(input),
    onSuccess: (res) => {
      if (res.ok) invalidate();
    },
  });
}
